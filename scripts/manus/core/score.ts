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

export const MERGE_THRESHOLD = 80;

/** Breakdown neutre (tout à zéro) — utilisé quand aucun score réel n'est calculable. */
const ZERO_BREAKDOWN: QAScoreBreakdown = {
  assertions: 0, console: 0, network: 0,
  responsive: 0, accessibility: 0, screenshots: 0, performance: 0,
};

export function computeQAScore(run: TestRunResult): QAScore {
  // ── Garde P0 (mission corrective Devil's Advocate) ─────────────────────────
  // Un run à 0 scénario ne doit JAMAIS produire un score "par défaut" élevé.
  // Avant ce correctif : totalAssert===0 → assertRatio=1 (30/30), console/
  // network/responsive/accessibility neutres faute de "qaInfraBlocked" (qui
  // exigeait scenarios.length>0), performance basée sur une durée nulle
  // (<30s → 5/5) → total = 90/100, verdict READY_FOR_MERGE. Ce chemin est
  // désormais coupé à la racine, indépendamment de tout garde-fou CLI en amont.
  if (run.scenarios.length === 0) {
    return {
      total:      0,
      verdict:    "NO_SCENARIOS_SELECTED",
      threshold:  MERGE_THRESHOLD,
      breakdown:  ZERO_BREAKDOWN,
      qaInfraBlocked: false, // sémantiquement distinct : rien n'a été tenté, pas "tout a échoué"
    };
  }

  // Detect infrastructure block: all scenarios timed out or errored (no real data)
  const qaInfraBlocked =
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
  // Correctif Devil's Advocate : totalAssert===0 ne signifie PAS toujours
  // "rien à vérifier, donc tout est ok" (ratio=1). Si l'infra est bloquée
  // (ex: tous les scénarios en erreur faute de credentials — assertions:[]
  // pour chacun), totalAssert vaut 0 alors que RIEN n'a été vérifié : le
  // ratio par défaut doit être 0, pas 1, sous peine d'attribuer 30/30 à un
  // run où aucune assertion n'a jamais pu s'exécuter.
  const totalAssert  = scenarios.reduce((s, sc) => s + sc.assertions.length, 0);
  const passedAssert = scenarios.reduce(
    (s, sc) => s + sc.assertions.filter((a) => a.passed).length, 0
  );
  const assertRatio  = totalAssert > 0 ? passedAssert / totalAssert : (qaInfraBlocked ? 0 : 1);
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

  // ── Responsive (10 pts) — scénarios tagués "responsive" ou "mobile"
  // Utilise sc.tags (hérité de ScenarioDefinition.tags) — résistant aux renames.
  const respScenarios = scenarios.filter(
    (sc) => sc.tags?.some((t) => t === "responsive" || t === "mobile") ?? false
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

  // Correctif Devil's Advocate : une infra bloquée (tous les scénarios en
  // timeout/erreur) ne doit jamais marquer de points de performance, même si
  // l'échec a été rapide (ex: erreur immédiate faute de credentials en <1s).
  // Une réponse rapide à "rien n'a pu être vérifié" n'est pas une bonne
  // performance — c'est une infrastructure qui n'a jamais démarré.
  const performance = qaInfraBlocked ? 0 :
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
  if (score.verdict === "NO_SCENARIOS_SELECTED") return "🚫 NO SCENARIOS SELECTED";
  return score.verdict === "READY_FOR_MERGE"
    ? "✅ READY FOR MERGE"
    : "🚫 BLOCK MERGE";
}
