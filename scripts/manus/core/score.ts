// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Calcul du QA Score
//
// Score / 100, seuil de merge : 80
//   Assertions    30 pts  — ratio passed/total
//   Console       20 pts  — -5 par erreur
//   Réseau        20 pts  — -5 par erreur
//   Responsive    10 pts  — scénarios mobile/responsive
//   Accessibilité 10 pts  — absence d'erreurs ARIA / a11y
//   Captures       5 pts  — screenshots présents
//   Performance    5 pts  — durée moyenne des scénarios
// ─────────────────────────────────────────────────────────────────────────────

import type { TestRunResult, QAScore, QAScoreBreakdown, ScenarioResult } from "./types";

const MERGE_THRESHOLD = 80;

export function computeQAScore(run: TestRunResult): QAScore {
  const bd    = breakdown(run.scenarios);
  const total = Math.min(
    100,
    Math.round(
      bd.assertions + bd.console + bd.network +
      bd.responsive + bd.accessibility + bd.screenshots + bd.performance
    )
  );

  return {
    total,
    verdict:   total >= MERGE_THRESHOLD ? "READY_FOR_MERGE" : "BLOCK_MERGE",
    threshold: MERGE_THRESHOLD,
    breakdown: bd,
  };
}

// ─── Sous-scores ─────────────────────────────────────────────────────────────

function breakdown(scenarios: ScenarioResult[]): QAScoreBreakdown {
  // ── Assertions (30 pts) ──────────────────────────────────────────────────
  const totalAssert  = scenarios.reduce((s, sc) => s + sc.assertions.length, 0);
  const passedAssert = scenarios.reduce(
    (s, sc) => s + sc.assertions.filter((a) => a.passed).length, 0
  );
  const assertRatio  = totalAssert > 0 ? passedAssert / totalAssert : 1;
  const assertions   = Math.round(assertRatio * 30);

  // ── Console (20 pts) ─────────────────────────────────────────────────────
  const totalConsole = scenarios.reduce((s, sc) => s + sc.consoleErrors.length, 0);
  const consoleScore = Math.max(0, 20 - totalConsole * 5);

  // ── Réseau (20 pts) ──────────────────────────────────────────────────────
  const totalNetwork = scenarios.reduce((s, sc) => s + sc.networkErrors.length, 0);
  const networkScore = Math.max(0, 20 - totalNetwork * 5);

  // ── Responsive (10 pts) — scénarios dont le nom contient responsive/mobile
  const respScenarios = scenarios.filter(
    (sc) => sc.name.includes("responsive") || sc.name.includes("mobile")
  );
  const respPassed = respScenarios.filter((sc) => sc.status === "passed").length;
  const responsive =
    respScenarios.length === 0
      ? 5  // pas de scénario dédié → score neutre 5/10
      : Math.round((respPassed / respScenarios.length) * 10);

  // ── Accessibilité (10 pts) — absence d'erreurs ARIA/a11y dans la console
  const a11yErrors = scenarios.flatMap((sc) =>
    sc.consoleErrors.filter(
      (e) =>
        e.toLowerCase().includes("aria") ||
        e.toLowerCase().includes("a11y") ||
        e.toLowerCase().includes("accessibility") ||
        e.toLowerCase().includes("contrast")
    )
  );
  const accessibility = Math.max(0, 10 - a11yErrors.length * 3);

  // ── Captures (5 pts) — au moins une screenshot par scénario réussi
  const totalScreenshots = scenarios.reduce((s, sc) => s + sc.screenshots.length, 0);
  const screenshots =
    scenarios.length === 0
      ? 0
      : Math.min(5, Math.round((totalScreenshots / scenarios.length) * 5));

  // ── Performance (5 pts) — durée moyenne des scénarios
  const avgMs =
    scenarios.length === 0
      ? 0
      : scenarios.reduce((s, sc) => s + sc.durationMs, 0) / scenarios.length;

  const performance =
    avgMs < 30_000  ? 5 :
    avgMs < 60_000  ? 4 :
    avgMs < 90_000  ? 3 :
    avgMs < 120_000 ? 1 : 0;

  return {
    assertions,
    console:       consoleScore,
    network:       networkScore,
    responsive,
    accessibility,
    screenshots,
    performance,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Retourne la barre de progression ASCII du score (20 chars). */
export function scoreBar(total: number): string {
  const filled = Math.round(total / 5);  // 20 segments
  return "█".repeat(filled) + "░".repeat(20 - filled);
}

/** Label couleur ASCII pour le verdict. */
export function verdictLabel(score: QAScore): string {
  return score.verdict === "READY_FOR_MERGE"
    ? "✅ READY FOR MERGE"
    : "🚫 BLOCK MERGE";
}
