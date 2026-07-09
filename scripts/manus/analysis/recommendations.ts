// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Génération automatique de recommandations
// ─────────────────────────────────────────────────────────────────────────────

import { formatDuration } from "../utils/date";
import type {
  QAScore,
  QualityGate,
  Regression,
  Recommendation,
  RecommendationPriority,
  RunComparison,
} from "../core/types";

// ─── Ordre de priorité ───────────────────────────────────────────────────────

const PRIORITY_ORDER: Record<RecommendationPriority, number> = {
  HAUTE:   3,
  MOYENNE: 2,
  FAIBLE:  1,
};

// ─── Builder ─────────────────────────────────────────────────────────────────

export function generateRecommendations(
  regressions:   Regression[],
  score:         QAScore,
  qualityGates:  QualityGate[],
  comparison:    RunComparison | null,
): Recommendation[] {
  const recs: Recommendation[] = [];

  // ── Priorité HAUTE — Quality Gates bloquantes ────────────────────────────

  const blockingGates = qualityGates.filter(
    (g) => !g.passed && g.consequence === "BLOCK_MERGE"
  );

  for (const gate of blockingGates) {
    if (gate.name.toLowerCase().includes("console")) {
      recs.push({
        priority:    "HAUTE",
        title:       "Corriger les erreurs console",
        description: "Des erreurs JavaScript bloquent le merge. Ouvrir les DevTools → Console et éliminer chaque erreur.",
      });
    } else if (
      gate.name.toLowerCase().includes("réseau") ||
      gate.name.toLowerCase().includes("network")
    ) {
      recs.push({
        priority:    "HAUTE",
        title:       "Corriger les erreurs réseau",
        description: `${gate.value} requête(s) HTTP ont retourné une erreur 4xx/5xx. Vérifier les endpoints API et les handlers serveur.`,
      });
    } else if (gate.name.toLowerCase().includes("score")) {
      recs.push({
        priority:    "HAUTE",
        title:       "Améliorer le score QA",
        description: `Le score ${score.total}/100 est inférieur au seuil requis de ${score.threshold}. Corriger les assertions en échec.`,
      });
    }
  }

  // ── Priorité HAUTE — Assertions critiques ────────────────────────────────

  const criticalRegressions = regressions.filter(
    (r) => r.severity === "CRITICAL" || r.severity === "HIGH"
  );
  if (criticalRegressions.length > 0 && blockingGates.length === 0) {
    recs.push({
      priority:    "HAUTE",
      title:       `Traiter les ${criticalRegressions.length} régression(s) critique(s)`,
      description: criticalRegressions.map((r) => `• ${r.title}`).join("\n"),
    });
  }

  // ── Priorité MOYENNE — Score breakdown ───────────────────────────────────

  if (score.breakdown.responsive < 7) {
    recs.push({
      priority:    "MOYENNE",
      title:       "Optimiser le responsive tablette",
      description: "Le score responsive est insuffisant. Vérifier les breakpoints 768px et les scénarios mobile.",
    });
  }

  if (score.breakdown.accessibility < 7) {
    recs.push({
      priority:    "MOYENNE",
      title:       "Améliorer l'accessibilité",
      description: "Des erreurs ARIA, de contraste ou d'accessibilité ont été détectées. Auditer avec axe-core ou Lighthouse.",
    });
  }

  if (score.breakdown.assertions < 20) {
    recs.push({
      priority:    "MOYENNE",
      title:       "Augmenter la couverture des assertions",
      description: `Seulement ${score.breakdown.assertions}/30 pts sur les assertions. Ajouter des assertions dans les scénarios critiques.`,
    });
  }

  // ── Priorité FAIBLE — Optimisations ──────────────────────────────────────

  if (comparison && comparison.durationDelta > 15_000) {
    recs.push({
      priority:    "FAIBLE",
      title:       "Réduire le temps de chargement",
      description: `Les scénarios sont ${formatDuration(comparison.durationDelta)} plus lents. Vérifier les requêtes bloquantes et le cache.`,
    });
  }

  if (score.breakdown.screenshots < 3) {
    recs.push({
      priority:    "FAIBLE",
      title:       "Augmenter la couverture des captures",
      description: "Peu de captures d'écran ont été générées. Ajouter expectScreenshot dans les scénarios critiques.",
    });
  }

  if (score.breakdown.performance < 4) {
    recs.push({
      priority:    "FAIBLE",
      title:       "Optimiser la durée des scénarios",
      description: "La durée moyenne des scénarios dépasse les seuils recommandés. Identifier les goulots d'étranglement.",
    });
  }

  // Supprimer les doublons (même titre)
  const seen = new Set<string>();
  const unique = recs.filter((r) => {
    if (seen.has(r.title)) return false;
    seen.add(r.title);
    return true;
  });

  return unique.sort(
    (a, b) => PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority]
  );
}
