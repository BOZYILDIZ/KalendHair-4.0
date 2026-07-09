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
import type {
  ScenarioDefinition,
  ScenarioResult,
  TestRunResult,
  TestContext,
  Reporter,
  RunSummary,
  AssertionResult,
  ScreenshotRef,
} from "./types";

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

// ─── Runner ───────────────────────────────────────────────────────────────────

export class ScenarioRunner {
  private readonly reporters: Reporter[];

  constructor(reporters: Reporter[]) {
    this.reporters = reporters;
  }

  async runAll(
    scenarios: ScenarioDefinition[],
    ctx:       TestContext,
  ): Promise<RunSummary> {
    const id        = runId();
    const startedAt = nowIso();
    const startMs   = Date.now();

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

    const partial = { run, score, metadata, comparison: null };
    const comparison = compareWithPrevious(partial, id);

    // ── Analysis Engine ───────────────────────────────────────────────────────
    const { entries: historyEntries } = readDashboard();
    const analysis = buildAnalysis({ run, score, metadata, comparison }, historyEntries);

    const finalSummary: RunSummary = { run, score, metadata, comparison, analysis };

    // ── Mise à jour dashboard.json ────────────────────────────────────────────
    updateDashboard(finalSummary);

    for (const r of this.reporters) {
      await r.onRunEnd(finalSummary);
    }

    return finalSummary;
  }

  async runOne(
    scenario: ScenarioDefinition,
    ctx:      TestContext,
  ): Promise<ScenarioResult> {
    const spec      = scenario.run(ctx);
    const startedAt = nowIso();
    const startMs   = Date.now();

    console.log(`\n▶  ${scenario.name}`);
    console.log(`   ${spec.viewport.label} ${spec.viewport.width}×${spec.viewport.height}`);

    let taskOutput: Awaited<ReturnType<typeof createAndPollTask>>;

    try {
      taskOutput = await createAndPollTask(spec.prompt, spec.timeoutSeconds);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        name:          scenario.name,
        description:   scenario.description,
        status:        "error",
        durationMs:    Date.now() - startMs,
        taskId:        "",
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
      };
    }

    const completedAt = nowIso();
    const durationMs  = Date.now() - startMs;

    if (taskOutput.status === "timeout") {
      // Timeout = assertions non vérifiées → toutes marquées échouées
      const timedOutAssertions: AssertionResult[] = spec.assertionNames.map((n) => ({
        name:    n,
        passed:  false,
        message: "Timeout — assertion non vérifiée par Manus.",
      }));
      return {
        name:          scenario.name,
        description:   scenario.description,
        status:        "timeout",
        durationMs,
        taskId:        taskOutput.taskId,
        viewport:      spec.viewport,
        urlsVisited:   [],
        assertions:    timedOutAssertions,
        screenshots:   [],
        consoleErrors: [],
        networkErrors: [],
        artifacts:     [],
        error:         taskOutput.error,
        rawOutput:     taskOutput.rawOutput,
        startedAt,
        completedAt,
      };
    }

    const parsed = parseManusResponse(taskOutput.rawOutput);

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

    console.log(
      `   ${status === "passed" ? "✅" : "❌"} ${status.toUpperCase()} (${formatDuration(durationMs)})`
    );

    return {
      name:          scenario.name,
      description:   scenario.description,
      status,
      durationMs,
      taskId:        taskOutput.taskId,
      viewport:      spec.viewport,
      urlsVisited:   parsed.urlsVisited,
      assertions:    allAssertions,
      screenshots:   parsed.screenshots,
      consoleErrors: parsed.consoleErrors,
      networkErrors: parsed.networkErrors,
      artifacts:     [],
      rawOutput:     taskOutput.rawOutput,
      error:         taskOutput.error,
      startedAt,
      completedAt,
    };
  }
}
