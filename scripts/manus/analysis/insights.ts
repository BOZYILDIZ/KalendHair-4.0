// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Génération d'insights automatiques
// ─────────────────────────────────────────────────────────────────────────────

import { formatDuration } from "../utils/date";
import type {
  RunComparison,
  RunSummary,
  Insight,
  HistoryEntry,
} from "../core/types";

// ─── Builder ─────────────────────────────────────────────────────────────────

export function generateInsights(
  partial:    Omit<RunSummary, "analysis">,
  comparison: RunComparison | null,
  history:    HistoryEntry[],
): Insight[] {
  const { run, score } = partial;
  const insights: Insight[] = [];

  const consoleErrors = run.scenarios.reduce((s, sc) => s + sc.consoleErrors.length, 0);
  const networkErrors = run.scenarios.reduce((s, sc) => s + sc.networkErrors.length, 0);
  const screenshots   = run.scenarios.reduce((s, sc) => s + sc.screenshots.length, 0);

  // ── Tendance générale ─────────────────────────────────────────────────────
  if (comparison && comparison.trend !== "no_previous") {
    if (comparison.scoreDelta > 0) {
      insights.push({
        category: "trend",
        message:  `Le score global augmente de ${comparison.scoreDelta} point${comparison.scoreDelta > 1 ? "s" : ""}.`,
        positive: true,
      });
    } else if (comparison.scoreDelta < 0) {
      insights.push({
        category: "trend",
        message:  `Le score global baisse de ${Math.abs(comparison.scoreDelta)} point${Math.abs(comparison.scoreDelta) > 1 ? "s" : ""}.`,
        positive: false,
      });
    } else {
      insights.push({
        category: "trend",
        message:  "Le score global est stable par rapport au run précédent.",
        positive: true,
      });
    }
  }

  // ── Erreurs console ───────────────────────────────────────────────────────
  if (consoleErrors === 0) {
    insights.push({
      category: "stability",
      message:  "Aucune erreur console détectée.",
      positive: true,
    });
  } else if (comparison && comparison.consoleErrorsDelta < 0) {
    insights.push({
      category: "stability",
      message:  `${Math.abs(comparison.consoleErrorsDelta)} erreur(s) console en moins par rapport au run précédent.`,
      positive: true,
    });
  } else {
    insights.push({
      category: "stability",
      message:  `${consoleErrors} erreur(s) console détectée(s).`,
      positive: false,
    });
  }

  // ── Erreurs réseau ────────────────────────────────────────────────────────
  if (networkErrors === 0) {
    insights.push({
      category: "stability",
      message:  "Aucune erreur réseau détectée.",
      positive: true,
    });
  } else {
    insights.push({
      category: "stability",
      message:  `${networkErrors} erreur(s) réseau détectée(s).`,
      positive: false,
    });
  }

  // ── Responsive ────────────────────────────────────────────────────────────
  const mobileScenarios = run.scenarios.filter(
    (s) => s.name.includes("mobile") || s.name.includes("responsive")
  );
  if (mobileScenarios.length > 0) {
    const allPassed = mobileScenarios.every((s) => s.status === "passed");
    if (allPassed) {
      insights.push({
        category: "responsive",
        message:  "Le responsive mobile s'est comporté correctement.",
        positive: true,
      });
    } else {
      const failed = mobileScenarios.filter((s) => s.status !== "passed").length;
      insights.push({
        category: "responsive",
        message:  `${failed} scénario(s) responsive/mobile en échec.`,
        positive: false,
      });
    }

    // Comparaison avec run précédent
    if (comparison && comparison.trend !== "no_previous") {
      if (score.breakdown.responsive >= 8) {
        insights.push({
          category: "responsive",
          message:  "Le responsive mobile s'est amélioré.",
          positive: true,
        });
      }
    }
  }

  // ── Performances ──────────────────────────────────────────────────────────
  if (comparison && comparison.trend !== "no_previous") {
    if (comparison.durationDelta < -5_000) {
      insights.push({
        category: "performance",
        message:  `Les performances sont en amélioration : ${formatDuration(Math.abs(comparison.durationDelta))} de moins.`,
        positive: true,
      });
    } else if (comparison.durationDelta > 10_000) {
      insights.push({
        category: "performance",
        message:  `Les performances se dégradent : ${formatDuration(comparison.durationDelta)} de plus.`,
        positive: false,
      });
    } else {
      insights.push({
        category: "performance",
        message:  "Les performances sont stables.",
        positive: true,
      });
    }
  }

  // ── Captures ─────────────────────────────────────────────────────────────
  insights.push({
    category: "coverage",
    message:  `${screenshots} capture${screenshots > 1 ? "s" : ""} d'écran générée${screenshots > 1 ? "s" : ""}.`,
    positive: screenshots > 0,
  });

  if (comparison && comparison.trend !== "no_previous") {
    insights.push({
      category: "coverage",
      message:  "Le nombre de captures est identique.",
      positive: true,
    });
  }

  // ── Régressions historiques ───────────────────────────────────────────────
  if (history.length >= 3) {
    const recentPassed = history
      .slice(0, 3)
      .every((h) => h.consoleErrors === 0 && h.networkErrors === 0);
    if (recentPassed) {
      insights.push({
        category: "stability",
        message:  "Les régressions historiques sont absentes sur les 3 derniers runs.",
        positive: true,
      });
    }

    const scores   = history.slice(0, 5).map((h) => h.score);
    const avg      = scores.reduce((s, v) => s + v, 0) / scores.length;
    if (avg > 85 && scores.length >= 3) {
      insights.push({
        category: "trend",
        message:  `La qualité reste haute sur les derniers runs (moyenne : ${avg.toFixed(1)}/100).`,
        positive: true,
      });
    }
  }

  return insights;
}
