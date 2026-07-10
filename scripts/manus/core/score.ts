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
  // Detect infrastructure block: all scenarios timed out or errored (no real data)
  const qaInfraBlocked =
    run.scenarios.length > 0 &&
    run.scenarios.every((sc) => sc.status === "timeout" || sc.status === "error");

  const bd    = breakdown(run.scenarios, qaInfraBlocked);
  const total = Math.min(
    100,
    Math.round(
      bd.assertions + bd.console + bd.network +
      bd.responsive + bd.accessibility + bd.screenshots + bd.performance
    )
  );

  return {
    total,
    verdict:         total >= MERGE_THRESHOLD ? "READY_FOR_MERGE" : "BLOCK_MERGE",
    threshold:       MERGE_THRESHOLD,
    breakdown:       bd,
    qaInfraBlocked,
  };
}

// ─── Sous-scores ─────────────────────────────────────────────────────────────

function breakdown(scenarios: ScenarioResult[], qaInfraBlocked = false): QAScoreBreakdown {
  // ── Assertions (30 pts) ──────────────────────────────────────────────────
  const totalAssert  = scenarios.reduce((s, sc) => s + sc.assertions.length, 0);
  const passedAssert = scenarios.reduce(
    (s, sc) => s + sc.assertions.filter((a) => a.passed).length, 0
  );
  const assertRatio  = totalAssert > 0 ? passedAssert / totalAssert : 1;
  const assertions   = Math.round(assertRatio * 30);

  // ── Console (20 pts) ─────────────────────────────────────────────────────
  // IMPORTANT: When infra is blocked (all timeout), consoleErrors is empty by
  // default — not because the app is clean, but because Manus returned no data.
  // Do NOT give 20/20 in this case; set to 0 (indeterminate).
  const totalConsole = scenarios.reduce((s, sc) => s + sc.consoleErrors.length, 0);
  const consoleScore = qaInfraBlocked ? 0 : Math.max(0, 20 - totalConsole * 5);

  // ── Réseau (20 pts) ──────────────────────────────────────────────────────
  // Same rationale: empty networkErrors on timeout ≠ clean network.
  const totalNetwork = scenarios.reduce((s, sc) => s + sc.networkErrors.length, 0);
  const networkScore = qaInfraBlocked ? 0 : Math.max(0, 20 - totalNetwork * 5);

  // ── Responsive (10 pts) — scénarios dont le nom contient responsive/mobile
  const respScenarios = scenarios.filter(
    (sc) => sc.name.includes("responsive") || sc.name.includes("mobile")
  );
  const respPassed = respScenarios.filter((sc) => sc.status === "passed").length;
  const responsive =
    qaInfraBlocked
      ? 0  // indeterminate when infra blocked
      : respScenarios.length === 0
        ? 5  // pas de scénario dédié → score neutre 5/10
        : Math.round((respPassed / respScenarios.length) * 10);

  // ── Accessibilité (10 pts) — absence d'erreurs ARIA/a11y dans la console
  // Empty a11y errors on timeout ≠ accessible app; set to 0 when infra blocked.
  const a11yErrors = scenarios.flatMap((sc) =>
    sc.consoleErrors.filter(
      (e) =>
        e.toLowerCase().includes("aria") ||
        e.toLowerCase().includes("a11y") ||
        e.toLowerCase().includes("accessibility") ||
        e.toLowerCase().includes("contrast")
    )
  );
  const accessibility = qaInfraBlocked ? 0 : Math.max(0, 10 - a11yErrors.length * 3);

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
