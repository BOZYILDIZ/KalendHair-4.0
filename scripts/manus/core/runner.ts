// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Runner de scénarios
// ─────────────────────────────────────────────────────────────────────────────

import { createAndPollTask }     from "../client/index";
import { nowIso, runId, formatDuration } from "../utils/date";
import { computeQAScore }        from "./score";
import { buildRunMetadata }      from "./metadata";
import { compareWithPrevious }   from "./compare";
import { buildAnalysis }         from "../analysis/index";
import { readDashboard, updateDashboard } from "../analysis/history";
import { computePromptHash }     from "../utils/hash";
import { assertPromptValid }     from "../utils/prompt-validator";
import { estimateCost, estimateTotalCost } from "../utils/cost";
import { FRAMEWORK_VERSION, SCHEMA_VERSION, PROMPT_VERSION } from "./version";
import type {
  ScenarioDefinition,
  ScenarioResult,
  TestRunResult,
  TestContext,
  Reporter,
  RunSummary,
  AssertionResult,
  ScreenshotRef,
  ScreenshotValidationResult,
} from "./types";
import { VIEWPORTS } from "./types";

// ─── Parsing réponse Manus ────────────────────────────────────────────────────

interface ParsedManusResponse {
  assertions:    AssertionResult[];
  urlsVisited:   string[];
  consoleErrors: string[];
  networkErrors: string[];
  screenshots:   ScreenshotRef[];
}

function parseManusResponse(rawOutput: string): ParsedManusResponse {
  const empty: ParsedManusResponse = {
    assertions:    [],
    urlsVisited:   [],
    consoleErrors: [],
    networkErrors: [],
    screenshots:   [],
  };

  const jsonMatch = rawOutput.match(/```json\s*([\s\S]*?)```/);
  if (!jsonMatch || !jsonMatch[1]) return empty;

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonMatch[1].trim()) as Record<string, unknown>;
  } catch {
    return empty;
  }

  const assertions    = Array.isArray(parsed["assertions"])    ? parsed["assertions"]    as AssertionResult[]  : [];
  const urlsVisited   = Array.isArray(parsed["urlsVisited"])   ? parsed["urlsVisited"]   as string[]           : [];
  const consoleErrors = Array.isArray(parsed["consoleErrors"]) ? parsed["consoleErrors"] as string[]           : [];
  const networkErrors = Array.isArray(parsed["networkErrors"]) ? parsed["networkErrors"] as string[]           : [];
  const screenshots   = Array.isArray(parsed["screenshots"])   ? parsed["screenshots"]   as ScreenshotRef[]    : [];

  return { assertions, urlsVisited, consoleErrors, networkErrors, screenshots };
}

// ─── Validation des captures d'écran ─────────────────────────────────────────

function validateScreenshots(
  assertionNames:  string[],
  screenshots:     ScreenshotRef[],
): {
  validation:         ScreenshotValidationResult[];
  capturesAttendues:  number;
  capturesProduites:  number;
  capturesInvalides:  number;
} {
  // Les assertions screenshot sont celles dont le nom commence par "screenshot_"
  const expectedLabels = assertionNames
    .filter((n) => n.startsWith("screenshot_"))
    .map((n) => n.replace(/^screenshot_/, ""));

  const capturesAttendues = expectedLabels.length;
  const screenshotMap     = new Map(screenshots.map((s) => [s.label, s]));

  const validation: ScreenshotValidationResult[] = expectedLabels.map((label) => {
    const shot = screenshotMap.get(label);
    if (!shot) {
      return { label, found: false, valid: false, error: "Screenshot absent de la réponse Manus" };
    }
    if (!shot.url) {
      return { label, found: false, valid: false, url: shot.url, error: "URL nulle ou vide" };
    }
    const isValidUrl = /^https?:\/\/.+/.test(shot.url);
    return {
      label,
      found: true,
      valid: isValidUrl,
      url:   shot.url,
      error: isValidUrl ? undefined : "URL invalide (ne commence pas par http)",
    };
  });

  // Captures supplémentaires retournées par Manus (non attendues) — on les accepte
  for (const shot of screenshots) {
    const label = shot.label;
    if (!expectedLabels.includes(label)) {
      const isValidUrl = !!shot.url && /^https?:\/\/.+/.test(shot.url);
      validation.push({ label, found: true, valid: isValidUrl, url: shot.url ?? undefined });
    }
  }

  const capturesProduites = validation.filter((v) => v.valid).length;
  const capturesInvalides = validation.filter((v) => !v.valid).length;

  return { validation, capturesAttendues, capturesProduites, capturesInvalides };
}

// ─── Runner ───────────────────────────────────────────────────────────────────

export class ScenarioRunner {
  private readonly reporters: Reporter[];
  private readonly dryRun:    boolean;

  constructor(reporters: Reporter[], options: { dryRun?: boolean } = {}) {
    this.reporters = reporters;
    this.dryRun    = options.dryRun ?? false;
  }

  async runAll(
    scenarios: ScenarioDefinition[],
    ctx:       TestContext,
  ): Promise<RunSummary> {
    const id        = runId();
    const startedAt = nowIso();
    const startMs   = Date.now();

    if (this.dryRun) {
      console.log("\n🔵 DRY-RUN MODE — Aucun appel Manus. Zéro crédit consommé.\n");
    }

    for (const r of this.reporters) {
      r.onRunStart({
        runId:       id,
        environment: ctx.environment,
        baseUrl:     ctx.baseUrl,
        total:       scenarios.length,
      });
    }

    const results: ScenarioResult[] = [];

    for (const scenario of scenarios) {
      const result = await this.runOne(scenario, ctx);
      results.push(result);
      for (const r of this.reporters) r.onScenarioEnd(result);
    }

    const completedAt = nowIso();
    const durationMs  = Date.now() - startMs;

    const totalCredits     = results.reduce((s, r) => s + (r.creditsConsumed ?? 0), 0);
    const totalCostEst     = estimateTotalCost(results.map((r) => r.creditsConsumed));
    const totalEstimatedCostUsd = totalCostEst.estimatedCostUsd;

    const run: TestRunResult = {
      runId:           id,
      environment:     ctx.environment,
      baseUrl:         ctx.baseUrl,
      startedAt,
      completedAt,
      durationMs,
      totalScenarios:  results.length,
      passedScenarios: results.filter((r) => r.status === "passed").length,
      failedScenarios: results.filter((r) => r.status !== "passed").length,
      scenarios:       results,
      totalCreditsConsumed:   totalCredits,
      totalEstimatedCostUsd,
      dryRun: this.dryRun || undefined,
    };

    // ── Score + metadata + comparaison ───────────────────────────────────────
    const score    = computeQAScore(run);
    const metadata = buildRunMetadata({
      runId:          id,
      environment:    ctx.environment,
      baseUrl:        ctx.baseUrl,
      date:           startedAt,
      durationMs,
      totalScenarios: results.length,
    });

    // Inject v2.1 versioning into metadata
    metadata.frameworkVersion = FRAMEWORK_VERSION;
    metadata.schemaVersion    = SCHEMA_VERSION;
    metadata.promptVersion    = PROMPT_VERSION;
    if (this.dryRun) metadata.dryRun = true;

    const partial    = { run, score, metadata, comparison: null };
    const comparison = compareWithPrevious(partial, id);

    // ── Analysis Engine ───────────────────────────────────────────────────────
    const { entries: historyEntries } = readDashboard();
    const analysis = buildAnalysis({ run, score, metadata, comparison }, historyEntries);

    const finalSummary: RunSummary = { run, score, metadata, comparison, analysis };

    // ── Mise à jour dashboard.json ────────────────────────────────────────────
    if (!this.dryRun) {
      updateDashboard(finalSummary);
    }

    for (const r of this.reporters) {
      await r.onRunEnd(finalSummary);
    }

    return finalSummary;
  }

  async runOne(
    scenario: ScenarioDefinition,
    ctx:      TestContext,
  ): Promise<ScenarioResult> {
    const startedAt = nowIso();
    const startMs   = Date.now();

    // ── P0 : Arrêt anticipé si credentials requis mais absents ───────────────
    // IMPORTANT : vérifier avant scenario.run(ctx) — run() accède aux credentials
    // et lèverait une exception si ceux-ci sont absents.
    if (scenario.requiresCredentials) {
      const cred    = ctx.credentials[scenario.requiresCredentials];
      const varBase = `QA_${scenario.requiresCredentials.toUpperCase()}`;
      if (!cred) {
        const msg = `Arrêt anticipé : ${varBase}_EMAIL / ${varBase}_PASSWORD absents de .env.local. ` +
                    `Ajoutez ces variables pour éviter de gaspiller des crédits Manus.`;
        console.log(`\n⛔ ${scenario.name} — credentials manquants (${varBase}_EMAIL / ${varBase}_PASSWORD)`);
        return {
          name:          scenario.name,
          description:   scenario.description,
          scenarioId:    scenario.scenarioId,
          status:        "error",
          durationMs:    Date.now() - startMs,
          taskId:        "",
          taskUrl:       undefined,
          viewport:      VIEWPORTS.desktop,
          urlsVisited:   [],
          assertions:    [],
          screenshots:   [],
          consoleErrors: [],
          networkErrors: [],
          artifacts:     [],
          error:         msg,
          startedAt,
          completedAt:   nowIso(),
          pollCount:     0,
        };
      }
    }

    const spec = scenario.run(ctx);

    // ── Bypass SSO : smart (désactivé si intégration Vercel native) ───────────
    const bypassPrologue = ctx.vercelBypassUrl
      ? [
          `## Étape préliminaire — Bypass Vercel SSO`,
          ``,
          `⚠️ Cette application est protégée par Vercel Deployment Protection.`,
          `Avant de commencer le scénario, tu DOIS :`,
          `1. Naviguer vers l'URL de bypass (elle positionne un cookie d'authentification).`,
          `2. Attendre la redirection ou le chargement complet de la page.`,
          `3. Seulement ensuite, commencer le scénario ci-dessous.`,
          ``,
          `URL de bypass : ${ctx.vercelBypassUrl}`,
          ``,
          `---`,
          ``,
        ].join("\n")
      : "";

    // ── Mode preamble (QA_EXECUTOR uniquement) ─────────────────────────────────
    const mode = scenario.mode ?? ctx.manusMode;
    const modePreamble = mode === "QA_EXECUTOR"
      ? `⚡ MODE: QA_EXECUTOR — Exécuteur QA déterministe. Suis les étapes exactement. Aucune initiative. STOP après le JSON.\n\n`
      : `🔍 MODE: QA_AGENT — Exploration autorisée.\n\n`;

    const finalPrompt = modePreamble + bypassPrologue + spec.prompt;

    // ── Validation structurelle du prompt ─────────────────────────────────────
    assertPromptValid(finalPrompt, scenario.name);

    // ── Hash SHA-256 du prompt final ──────────────────────────────────────────
    const promptHash = computePromptHash(finalPrompt);

    console.log(`\n▶  [${scenario.scenarioId}] ${scenario.name}`);
    console.log(`   ${spec.viewport.label} ${spec.viewport.width}×${spec.viewport.height}`);
    console.log(`   Mode : ${mode} | promptHash: ${promptHash.slice(0, 12)}…`);
    if (ctx.nativeVercelIntegration) {
      console.log(`   🔗 Intégration Vercel native active — bypass SSO désactivé`);
    } else if (ctx.vercelBypassUrl) {
      console.log(`   🔓 Bypass SSO actif`);
    }

    // ── DRY-RUN : ne pas appeler Manus ────────────────────────────────────────
    if (this.dryRun) {
      const dryAssertions: AssertionResult[] = spec.assertionNames.map((n) => ({
        name:    n,
        passed:  true,
        message: "[DRY-RUN] Assertion non exécutée — simulation uniquement.",
      }));
      console.log(`   ✅ DRY-RUN — prompt généré, hash calculé, credentials vérifiés.`);
      console.log(`   promptHash: ${promptHash}`);

      // Screenshot validation dans dry-run (tous déclarés, aucun produit)
      const expectedLabels = spec.assertionNames
        .filter((n) => n.startsWith("screenshot_"))
        .map((n) => n.replace(/^screenshot_/, ""));
      const dryValidation: ScreenshotValidationResult[] = expectedLabels.map((label) => ({
        label, found: false, valid: false, error: "DRY-RUN — non exécuté",
      }));

      return {
        name:          scenario.name,
        description:   scenario.description,
        scenarioId:    scenario.scenarioId,
        status:        "passed",
        durationMs:    Date.now() - startMs,
        taskId:        "dry-run",
        taskUrl:       undefined,
        viewport:      spec.viewport,
        urlsVisited:   [],
        assertions:    dryAssertions,
        screenshots:   [],
        consoleErrors: [],
        networkErrors: [],
        artifacts:     [],
        startedAt,
        completedAt:   nowIso(),
        pollCount:     0,
        promptHash,
        dryRun:        true,
        screenshotValidation: dryValidation,
        capturesAttendues:    expectedLabels.length,
        capturesProduites:    0,
        capturesInvalides:    expectedLabels.length,
      };
    }

    // ── Création du task + polling ─────────────────────────────────────────────
    const networkStart = Date.now();
    let taskOutput: Awaited<ReturnType<typeof createAndPollTask>>;

    try {
      taskOutput = await createAndPollTask(finalPrompt, spec.timeoutSeconds);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        name:          scenario.name,
        description:   scenario.description,
        scenarioId:    scenario.scenarioId,
        status:        "error",
        durationMs:    Date.now() - startMs,
        taskId:        "",
        taskUrl:       undefined,
        viewport:      spec.viewport,
        urlsVisited:   [],
        assertions:    [],
        screenshots:   [],
        consoleErrors: [],
        networkErrors: [],
        artifacts:     [],
        error:         msg,
        startedAt,
        completedAt:   nowIso(),
        pollCount:     0,
        promptHash,
      };
    }

    const pollingDurationMs = Date.now() - networkStart;
    const completedAt       = nowIso();
    const durationMs        = Date.now() - startMs;

    if (taskOutput.status === "timeout") {
      const lastStatus = taskOutput.lastManusStatus ?? "unknown";
      const timedOutAssertions: AssertionResult[] = spec.assertionNames.map((n) => ({
        name:    n,
        passed:  false,
        message: `Timeout — assertion non vérifiée par Manus. Dernier statut Manus: ${lastStatus}`,
      }));
      return {
        name:             scenario.name,
        description:      scenario.description,
        scenarioId:       scenario.scenarioId,
        status:           "timeout",
        durationMs,
        taskId:           taskOutput.taskId,
        taskUrl:          taskOutput.taskUrl,
        viewport:         spec.viewport,
        urlsVisited:      [],
        assertions:       timedOutAssertions,
        screenshots:      [],
        consoleErrors:    [],
        networkErrors:    [],
        artifacts:        [],
        error:            taskOutput.error,
        rawOutput:        taskOutput.rawOutput,
        startedAt,
        completedAt,
        pollCount:        taskOutput.pollCount,
        creditsConsumed:  taskOutput.creditsConsumed,
        pollingDurationMs,
        promptHash,
      };
    }

    // ── Parsing de la réponse Manus ────────────────────────────────────────────
    const parseStart = Date.now();
    const parsed     = parseManusResponse(taskOutput.rawOutput);
    const parseDurationMs = Date.now() - parseStart;

    const returnedNames = new Set(parsed.assertions.map((a) => a.name));
    const missing: AssertionResult[] = spec.assertionNames
      .filter((n) => !returnedNames.has(n))
      .map((n) => ({
        name:    n,
        passed:  false,
        message: "Assertion non retournée par Manus.",
      }));

    const allAssertions = [...parsed.assertions, ...missing];
    const allPassed     = allAssertions.every((a) => a.passed);
    const status        = (taskOutput.status === "failed" || !allPassed) ? "failed" : "passed";

    // ── Validation des captures d'écran ────────────────────────────────────────
    const screenshotStats = validateScreenshots(spec.assertionNames, parsed.screenshots);

    // ── Estimation du coût ─────────────────────────────────────────────────────
    const costEst = taskOutput.creditsConsumed !== undefined
      ? estimateCost(taskOutput.creditsConsumed)
      : undefined;

    console.log(
      `   ${status === "passed" ? "✅" : "❌"} ${status.toUpperCase()} (${formatDuration(durationMs)}) ` +
      `| polls: ${taskOutput.pollCount} | crédits: ${taskOutput.creditsConsumed ?? "?"} ` +
      `| coût: $${costEst?.estimatedCostUsd ?? "?"}`
    );

    return {
      name:             scenario.name,
      description:      scenario.description,
      scenarioId:       scenario.scenarioId,
      status,
      durationMs,
      taskId:           taskOutput.taskId,
      taskUrl:          taskOutput.taskUrl,
      viewport:         spec.viewport,
      urlsVisited:      parsed.urlsVisited,
      assertions:       allAssertions,
      screenshots:      parsed.screenshots,
      consoleErrors:    parsed.consoleErrors,
      networkErrors:    parsed.networkErrors,
      artifacts:        [],
      rawOutput:        taskOutput.rawOutput,
      error:            taskOutput.error,
      startedAt,
      completedAt,
      pollCount:        taskOutput.pollCount,
      creditsConsumed:  taskOutput.creditsConsumed,
      pollingDurationMs,
      parseDurationMs,
      promptHash,
      screenshotValidation: screenshotStats.validation,
      capturesAttendues:    screenshotStats.capturesAttendues,
      capturesProduites:    screenshotStats.capturesProduites,
      capturesInvalides:    screenshotStats.capturesInvalides,
      estimatedCostUsd:     costEst?.estimatedCostUsd,
    };
  }
}
