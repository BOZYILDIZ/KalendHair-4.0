// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Analysis Engine (point d'entrée)
//
// Prend un RunSummary partiel (sans analysis) + historique.
// Retourne AnalysisResult complet.
// ─────────────────────────────────────────────────────────────────────────────

import { detectRegressions }       from "./regressions";
import { generateInsights }        from "./insights";
import { generateRecommendations } from "./recommendations";
import { computeHistoryStats }     from "./history";
import type {
  RunSummary,
  AnalysisResult,
  AnalysisRunStats,
  QualityGate,
  QAScore,
  TestRunResult,
  HistoryEntry,
  RunComparison,
} from "../core/types";

// ─── Quality Gates ────────────────────────────────────────────────────────────

export function evaluateQualityGates(run: TestRunResult, score: QAScore): QualityGate[] {
  const consoleErrors  = run.scenarios.reduce((s, sc) => s + sc.consoleErrors.length, 0);
  const networkErrors  = run.scenarios.reduce((s, sc) => s + sc.networkErrors.length, 0);
  const failedScenarios = run.failedScenarios;

  return [
    {
      name:        "Erreurs console",
      condition:   "consoleErrors === 0",
      passed:      consoleErrors === 0,
      value:       consoleErrors,
      threshold:   0,
      consequence: "BLOCK_MERGE",
    },
    {
      name:        "Erreurs réseau",
      condition:   "networkErrors === 0",
      passed:      networkErrors === 0,
      value:       networkErrors,
      threshold:   0,
      consequence: "BLOCK_MERGE",
    },
    {
      name:        "Score QA minimum",
      condition:   `score >= ${score.threshold}`,
      passed:      score.total >= score.threshold,
      value:       score.total,
      threshold:   score.threshold,
      consequence: "BLOCK_MERGE",
    },
    {
      name:        "Scénarios sans échec",
      condition:   "failedScenarios === 0",
      passed:      failedScenarios === 0,
      value:       failedScenarios,
      threshold:   0,
      consequence: "WARNING",
    },
  ];
}

// ─── Stats du run ────────────────────────────────────────────────────────────

function computeRunStats(run: TestRunResult): AnalysisRunStats {
  const totalAssertions  = run.scenarios.reduce((s, sc) => s + sc.assertions.length, 0);
  const passedAssertions = run.scenarios.reduce(
    (s, sc) => s + sc.assertions.filter((a) => a.passed).length, 0
  );

  return {
    totalAssertions,
    passedAssertions,
    failedAssertions: totalAssertions - passedAssertions,
    consoleErrors:    run.scenarios.reduce((s, sc) => s + sc.consoleErrors.length, 0),
    networkErrors:    run.scenarios.reduce((s, sc) => s + sc.networkErrors.length, 0),
    screenshots:      run.scenarios.reduce((s, sc) => s + sc.screenshots.length, 0),
  };
}

// ─── Builder principal ────────────────────────────────────────────────────────

export function buildAnalysis(
  partial:    Omit<RunSummary, "analysis">,
  historyEntries: HistoryEntry[],
): AnalysisResult {
  const { run, score, comparison } = partial;

  const qualityGates   = evaluateQualityGates(run, score);
  const verdictFromGates: "READY_FOR_MERGE" | "BLOCK_MERGE" =
    qualityGates.some((g) => !g.passed && g.consequence === "BLOCK_MERGE")
      ? "BLOCK_MERGE"
      : "READY_FOR_MERGE";

  const regressions    = detectRegressions(partial, comparison, historyEntries);
  const insights       = generateInsights(partial, comparison, historyEntries);
  const recommendations = generateRecommendations(
    regressions, score, qualityGates, comparison ?? null
  );
  const stats          = computeRunStats(run);
  const historyStats   = computeHistoryStats(historyEntries);

  return {
    qualityGates,
    verdictFromGates,
    insights,
    regressions,
    recommendations,
    stats,
    historyStats,
  };
}

// ─── Verdict final consolidé ─────────────────────────────────────────────────

/** Retourne le verdict définitif (quality gates > score seul). */
export function finalVerdict(summary: RunSummary): "READY_FOR_MERGE" | "BLOCK_MERGE" {
  return summary.analysis?.verdictFromGates ?? summary.score.verdict;
}

// ─── Helpers affichage ────────────────────────────────────────────────────────

export function verdictBanner(verdict: "READY_FOR_MERGE" | "BLOCK_MERGE"): string {
  return verdict === "READY_FOR_MERGE"
    ? "✅  READY FOR MERGE"
    : "🚫  BLOCK MERGE";
}

// Re-export for convenience
export type { RunComparison };
