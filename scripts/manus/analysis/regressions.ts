// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Détection automatique de régressions
// ─────────────────────────────────────────────────────────────────────────────

import {
  classifyConsoleErrorSeverity,
  classifyNetworkErrorSeverity,
  classifyScoreDropSeverity,
  classifyPerformanceSeverity,
  classifyAssertionFailureSeverity,
  sortBySeverity,
} from "./severity";
import type {
  RunComparison,
  RunSummary,
  Regression,
  SeverityLevel,
  HistoryEntry,
} from "../core/types";

// ─── Impact ───────────────────────────────────────────────────────────────────

function impactFromSeverity(s: SeverityLevel): Regression["impact"] {
  if (s === "CRITICAL" || s === "HIGH") return "élevé";
  if (s === "MEDIUM") return "modéré";
  return "faible";
}

// ─── Détection ────────────────────────────────────────────────────────────────

export function detectRegressions(
  partial:    Omit<RunSummary, "analysis">,
  comparison: RunComparison | null,
  _history:   HistoryEntry[],
): Regression[] {
  const { run, score } = partial;
  const regressions: Regression[] = [];

  const hasNoPrev = !comparison || comparison.trend === "no_previous";

  // ── Erreurs console ───────────────────────────────────────────────────────
  for (const scenario of run.scenarios) {
    for (const errorMsg of scenario.consoleErrors) {
      const severity = classifyConsoleErrorSeverity(scenario.consoleErrors.length);
      const isNew    = hasNoPrev || comparison!.consoleErrorsDelta > 0;

      regressions.push({
        type:              "console_error",
        severity,
        title:             "Erreur console détectée",
        description:       errorMsg,
        affectedScenario:  scenario.name,
        affectedPage:      scenario.urlsVisited[0],
        isNew,
        impact:            impactFromSeverity(severity),
      });
    }
  }

  // ── Erreurs réseau ────────────────────────────────────────────────────────
  for (const scenario of run.scenarios) {
    for (const errorMsg of scenario.networkErrors) {
      const severity = classifyNetworkErrorSeverity(scenario.networkErrors.length);
      const isNew    = hasNoPrev || comparison!.networkErrorsDelta > 0;

      regressions.push({
        type:             "network_error",
        severity,
        title:            "Erreur réseau détectée",
        description:      errorMsg,
        affectedScenario: scenario.name,
        affectedPage:     scenario.urlsVisited[0],
        isNew,
        impact:           impactFromSeverity(severity),
      });
    }
  }

  // ── Assertions en échec ───────────────────────────────────────────────────
  for (const scenario of run.scenarios) {
    for (const assertion of scenario.assertions.filter((a) => !a.passed)) {
      const severity = classifyAssertionFailureSeverity(assertion.name);

      regressions.push({
        type:             "assertion_failure",
        severity,
        title:            `Assertion échouée : ${assertion.name}`,
        description:      assertion.message,
        affectedScenario: scenario.name,
        affectedPage:     scenario.urlsVisited[0],
        isNew:            true,
        impact:           impactFromSeverity(severity),
      });
    }
  }

  // ── Chute de score ────────────────────────────────────────────────────────
  if (comparison && comparison.scoreDelta < -2) {
    const drop     = Math.abs(comparison.scoreDelta);
    const severity = classifyScoreDropSeverity(drop);

    regressions.push({
      type:        "score_drop",
      severity,
      title:       "Baisse du score QA",
      description: `Le score QA a baissé de ${drop} points (${score.total}/100 vs ${score.total + comparison.scoreDelta}/100 précédemment).`,
      delta:       comparison.scoreDelta,
      isNew:       true,
      impact:      impactFromSeverity(severity),
    });
  }

  // ── Dégradation des performances ─────────────────────────────────────────
  if (comparison && comparison.durationDelta > 10_000) {
    const severity = classifyPerformanceSeverity(comparison.durationDelta);

    regressions.push({
      type:        "performance",
      severity,
      title:       "Dégradation des performances",
      description: `Le temps total a augmenté de ${Math.round(comparison.durationDelta / 1000)}s par rapport au run précédent.`,
      delta:       comparison.durationDelta,
      isNew:       false,
      impact:      impactFromSeverity(severity),
    });
  }

  return sortBySeverity(regressions);
}
