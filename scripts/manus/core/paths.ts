// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Chemins partagés (v2.5)
//
// Source unique pour la racine des rapports. Introduit pour les sinks v2.5
// (JsonlSink, DashboardSink) qui ont besoin de connaître ce chemin sans le
// redéfinir localement — un audit antérieur avait signalé la reconstruction
// indépendante de "reports/manus" dans 13 endroits du framework comme une
// dette technique ; ce module ne l'élimine pas entièrement (hors périmètre
// de cette mission) mais évite d'en ajouter une 14ᵉ occurrence.
// ─────────────────────────────────────────────────────────────────────────────

import { resolve, sep } from "path";

export function reportsRoot(): string {
  return resolve(process.cwd(), "reports", "manus");
}

/**
 * Format d'un identifiant de run : YYYY-MM-DD_HH-mm-ss, avec suffixe
 * milliseconde optionnel (YYYY-MM-DD_HH-mm-ss-SSS) depuis le correctif
 * Devil's Advocate sur les collisions de runId (utils/date.ts::runId()).
 * Le suffixe est optionnel pour rester rétrocompatible avec les répertoires
 * de runs historiques déjà sur disque (précision seconde uniquement) — un
 * run_id ancien reste valide et reconnu par isValidRunDir()/rétention/nettoyage.
 * Centralisé ici (v2.5.1) — dupliqué historiquement dans analysis/history.ts
 * et generate-dashboard.ts ; consolidé pour la CLI de rétention plutôt que
 * d'ajouter une 3ᵉ copie indépendante susceptible de diverger. Les deux
 * copies restantes ont été synchronisées avec ce même motif lors de la
 * correction des collisions de runId — une consolidation complète (import
 * unique partagé) reste une dette non traitée ici (hors périmètre de cette
 * mission corrective).
 */
export const RUN_ID_PATTERN = /^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}(-\d{3})?$/;

/**
 * Valide qu'un runId correspond au format attendu ET que le chemin résolu
 * reste strictement à l'intérieur de `root` (défense en profondeur contre
 * une traversée de chemin via un runId malformé, ex. "../../etc" — le motif
 * RUN_ID_PATTERN seul suffit déjà à l'exclure, ceci est une seconde barrière
 * indépendante, pas une confiance aveugle dans la regex).
 */
export function isValidRunDir(runId: string, root: string = reportsRoot()): boolean {
  if (!RUN_ID_PATTERN.test(runId)) return false;
  const normalizedRoot = resolve(root) + sep;
  const resolved       = resolve(root, runId);
  return resolved.startsWith(normalizedRoot);
}
