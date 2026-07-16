// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Runner de scénarios
// ─────────────────────────────────────────────────────────────────────────────

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
import { Semaphore, defaultConcurrency } from "./concurrency";
import { eventLog }              from "./events";
import { reportsRoot }           from "./paths";
import { JsonlSink }             from "./sinks/jsonl-sink";
import { ConsoleSink }           from "./sinks/console-sink";
import { dashboardSink }         from "./sinks/dashboard-sink";
import { manusProvider }         from "../client/manus-provider";
import type { AgentProvider }    from "../client/provider";
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

// ─── Parsing réponse Manus — v2.2 (multi-stratégie, aucun échec silencieux) ──

interface ParsedManusResponse {
  assertions:    AssertionResult[];
  urlsVisited:   string[];
  consoleErrors: string[];
  networkErrors: string[];
  screenshots:   ScreenshotRef[];
  parseStrategy: "markdown-block" | "direct-json" | "json-extract" | "failed";
}

function extractFields(parsed: Record<string, unknown>): Omit<ParsedManusResponse, "parseStrategy"> {
  return {
    assertions:    Array.isArray(parsed["assertions"])    ? parsed["assertions"]    as AssertionResult[] : [],
    urlsVisited:   Array.isArray(parsed["urlsVisited"])   ? parsed["urlsVisited"]   as string[]          : [],
    consoleErrors: Array.isArray(parsed["consoleErrors"]) ? parsed["consoleErrors"] as string[]          : [],
    networkErrors: Array.isArray(parsed["networkErrors"]) ? parsed["networkErrors"] as string[]          : [],
    screenshots:   Array.isArray(parsed["screenshots"])   ? parsed["screenshots"]   as ScreenshotRef[]   : [],
  };
}

function parseManusResponse(rawOutput: string): ParsedManusResponse {
  const failed: ParsedManusResponse = {
    assertions: [], urlsVisited: [], consoleErrors: [], networkErrors: [],
    screenshots: [], parseStrategy: "failed",
  };

  // ── Stratégie 1 : bloc markdown ```json ... ``` (standard) ─────────────────
  const mdMatch = rawOutput.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (mdMatch?.[1]) {
    try {
      const p = JSON.parse(mdMatch[1].trim()) as Record<string, unknown>;
      if (p && typeof p === "object") {
        return { ...extractFields(p), parseStrategy: "markdown-block" };
      }
    } catch { /* fall through */ }
  }

  // ── Stratégie 2 : réponse entière comme JSON ────────────────────────────────
  try {
    const trimmed = rawOutput.trim();
    if (trimmed.startsWith("{")) {
      const p = JSON.parse(trimmed) as Record<string, unknown>;
      if (p && typeof p === "object" && "assertions" in p) {
        return { ...extractFields(p), parseStrategy: "direct-json" };
      }
    }
  } catch { /* fall through */ }

  // ── Stratégie 3 : extraction de l'objet JSON dans la réponse ───────────────
  const jsonExtract = rawOutput.match(/\{[\s\S]*?"assertions"[\s\S]*?\}/);
  if (jsonExtract) {
    try {
      const p = JSON.parse(jsonExtract[0]) as Record<string, unknown>;
      if (p && typeof p === "object") {
        return { ...extractFields(p), parseStrategy: "json-extract" };
      }
    } catch { /* fall through */ }
  }

  // ── Toutes les stratégies ont échoué — diagnostic explicite ────────────────
  const preview = rawOutput.length > 300 ? rawOutput.slice(0, 300) + "…" : rawOutput;
  console.warn(
    `[QA] parseManusResponse: aucun JSON trouvé dans la réponse Manus.\n` +
    `     Longueur: ${rawOutput.length} chars | Début: ${preview}`
  );
  return failed;
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

// ─── Sinks par défaut ─────────────────────────────────────────────────────────

/**
 * Enregistrement idempotent des sinks à effet de bord réel (JSONL, console,
 * dashboard) — jamais au chargement du module (core/events.ts), toujours à un
 * point d'entrée applicatif réel (ScenarioRunner.runAll(), ou tout code qui a
 * besoin d'émettre un événement traçable AVANT de lancer un run, comme le
 * garde-fou NO_SCENARIOS_SELECTED de run-all.ts). C'est ce qui garantit qu'un
 * simple import de core/events.ts (par les tests unitaires, ou par un futur
 * module) ne déclenche jamais d'écriture disque ou de sortie console.
 */
export function registerDefaultSinks(): void {
  const registeredSinks = eventLog.listSinks();
  if (!registeredSinks.includes("jsonl"))     eventLog.registerSink(new JsonlSink(reportsRoot));
  if (!registeredSinks.includes("console"))   eventLog.registerSink(new ConsoleSink());
  if (!registeredSinks.includes("dashboard")) eventLog.registerSink(dashboardSink);
}

// ─── Runner ───────────────────────────────────────────────────────────────────

export class ScenarioRunner {
  private readonly reporters:   Reporter[];
  private readonly dryRun:      boolean;
  private readonly provider:    AgentProvider;
  private readonly maxConcurrent: number;

  constructor(reporters: Reporter[], options: {
    dryRun?:        boolean;
    provider?:      AgentProvider;
    maxConcurrent?: number;
  } = {}) {
    this.reporters      = reporters;
    this.dryRun         = options.dryRun ?? false;
    this.provider       = options.provider ?? manusProvider;
    this.maxConcurrent  = options.maxConcurrent ?? defaultConcurrency();
  }

  async runAll(
    scenarios: ScenarioDefinition[],
    ctx:       TestContext,
  ): Promise<RunSummary> {
    const id        = runId();
    const startedAt = nowIso();
    const startMs   = Date.now();

    registerDefaultSinks();
    eventLog.setRunId(id);

    // ── Garde P0 (mission corrective Devil's Advocate) ───────────────────────
    // Défense en profondeur : même si run-all.ts a déjà refusé un CLI à 0
    // scénario avant d'arriver ici, tout appelant programmatique de
    // ScenarioRunner.runAll() (test, future intégration) doit obtenir la même
    // garantie — jamais de score, jamais de READY_FOR_MERGE, jamais de
    // reporters invoqués sur un run vide. Retour immédiat, avant même
    // d'émettre DRY_RUN/REAL_RUN (ce run n'a jamais commencé).
    if (scenarios.length === 0) {
      eventLog.emit(
        "NO_SCENARIOS_SELECTED",
        "CRITICAL",
        { reason: "Aucun scénario sélectionné après filtrage — run refusé, aucun score calculé." },
      );
      console.error(
        "\n🚫 NO_SCENARIOS_SELECTED — Aucun scénario à exécuter. " +
        "Le run est refusé : aucun score, aucun rapport, aucun verdict READY_FOR_MERGE possible.\n"
      );
      const emptyRun: TestRunResult = {
        runId: id, environment: ctx.environment, baseUrl: ctx.baseUrl,
        startedAt, completedAt: nowIso(), durationMs: Date.now() - startMs,
        totalScenarios: 0, passedScenarios: 0, failedScenarios: 0, scenarios: [],
      };
      const score = computeQAScore(emptyRun);
      const metadata = buildRunMetadata({
        runId: id, environment: ctx.environment, baseUrl: ctx.baseUrl,
        date: startedAt, durationMs: emptyRun.durationMs, totalScenarios: 0,
      });
      metadata.frameworkVersion = FRAMEWORK_VERSION;
      metadata.schemaVersion    = SCHEMA_VERSION;
      metadata.promptVersion    = PROMPT_VERSION;
      if (this.dryRun) metadata.dryRun = true;
      // Aucun appel aux reporters : pas de report.json/report.md/dashboard
      // pour un run qui n'a jamais eu lieu — rien qui puisse être
      // interprété, même par erreur, comme un succès.
      return { run: emptyRun, score, metadata, comparison: null };
    }

    eventLog.emit(
      this.dryRun ? "DRY_RUN" : "REAL_RUN",
      "INFO",
      { totalScenarios: scenarios.length, maxConcurrent: this.maxConcurrent, provider: this.provider.name },
    );

    const isParallel = this.maxConcurrent > 1 && !this.dryRun;

    if (this.dryRun) {
      console.log("\n🔵 DRY-RUN MODE — Aucun appel Manus. Zéro crédit consommé.\n");
    } else if (isParallel) {
      console.log(`\n⚡ MODE PARALLÈLE — concurrence max: ${this.maxConcurrent} agents simultanés.\n`);
    }

    for (const r of this.reporters) {
      r.onRunStart({
        runId:       id,
        environment: ctx.environment,
        baseUrl:     ctx.baseUrl,
        total:       scenarios.length,
      });
    }

    let results: ScenarioResult[];

    if (isParallel) {
      // ── Exécution parallèle avec sémaphore ──────────────────────────────────
      // Correctif Devil's Advocate (SPOF) : Promise.all() faisait échouer
      // l'INTÉGRALITÉ du run (perte des résultats déjà obtenus, y compris
      // ceux de scénarios déjà terminés avec succès) si un seul scénario
      // levait une exception non gérée par runOne() lui-même (ex. un bug
      // dans assertPromptValid() ou dans scenario.run(ctx)). Promise.allSettled
      // garantit que chaque scénario obtient un résultat — un rejet devient
      // un ScenarioResult de statut "error", jamais une perte totale du run.
      const sem = new Semaphore(this.maxConcurrent);
      const settled = await Promise.allSettled(
        scenarios.map((scenario) =>
          sem.run(async () => {
            const result = await this.runOne(scenario, ctx);
            for (const r of this.reporters) r.onScenarioEnd(result);
            return result;
          })
        )
      );
      results = settled.map((outcome, i) => {
        if (outcome.status === "fulfilled") return outcome.value;
        const scenario = scenarios[i] as ScenarioDefinition;
        const msg = outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason);
        const nowStr = nowIso();
        const errorResult: ScenarioResult = {
          name: scenario.name, description: scenario.description, scenarioId: scenario.scenarioId,
          tags: scenario.tags, status: "error", durationMs: 0, taskId: "", taskUrl: undefined,
          viewport: VIEWPORTS.desktop, urlsVisited: [], assertions: [], screenshots: [],
          consoleErrors: [], networkErrors: [], artifacts: [],
          error: `Exception non gérée pendant l'exécution parallèle : ${msg}`,
          startedAt: nowStr, completedAt: nowStr, pollCount: 0,
        };
        for (const r of this.reporters) r.onScenarioEnd(errorResult);
        return errorResult;
      });
    } else {
      // ── Exécution séquentielle (dry-run ou maxConcurrent=1) ─────────────────
      results = [];
      for (const scenario of scenarios) {
        const result = await this.runOne(scenario, ctx);
        results.push(result);
        for (const r of this.reporters) r.onScenarioEnd(result);
      }
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

    // Correctif Devil's Advocate (SPOF) : chaque reporter est désormais isolé
    // — un échec de JsonReporter (ex. disque plein) n'empêche plus
    // ConsoleReporter/MarkdownReporter de s'exécuter. Avant ce correctif, les
    // reporters n'avaient aucune isolation contrairement aux sinks d'EventBus
    // (qui l'ont depuis v2.5) : une boucle for...await sans try/catch stoppait
    // net au premier reporter en échec, perdant tous les rapports suivants
    // alors même que toutes les données du run étaient déjà disponibles.
    for (const r of this.reporters) {
      try {
        await r.onRunEnd(finalSummary);
      } catch (err) {
        console.warn(
          `[QA] Un reporter a échoué pendant onRunEnd() — les autres reporters s'exécutent normalement. ` +
          `Erreur : ${err instanceof Error ? err.message : String(err)}`
        );
      }
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
          tags:          scenario.tags,
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
        tags:          scenario.tags,
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
    let taskOutput: Awaited<ReturnType<typeof this.provider.createAndRunTask>>;

    try {
      taskOutput = await this.provider.createAndRunTask(finalPrompt, spec.timeoutSeconds);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        name:          scenario.name,
        description:   scenario.description,
        scenarioId:    scenario.scenarioId,
        tags:          scenario.tags,
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
      const lastStatus = taskOutput.lastStatus ?? "unknown";
      const timedOutAssertions: AssertionResult[] = spec.assertionNames.map((n) => ({
        name:    n,
        passed:  false,
        message: `Timeout — assertion non vérifiée par Manus. Dernier statut Manus: ${lastStatus}`,
      }));
      return {
        name:             scenario.name,
        description:      scenario.description,
        scenarioId:       scenario.scenarioId,
        tags:             scenario.tags,
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
    if (parsed.parseStrategy !== "failed") {
      console.log(`   📦 Parsing: ${parsed.parseStrategy} (${parseDurationMs}ms)`);
    }

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
      tags:             scenario.tags,
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
