// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Sink dashboard (v2.5.1 — Finalisation opérationnelle ;
// résilience renforcée par la mission corrective Devil's Advocate)
//
// Agrège les événements en compteurs (par type, par sévérité) et en coûts
// pendant le run, et écrit un résumé exploitable (events-summary.json) à côté
// de events.jsonl. Consommé désormais par generate-dashboard.ts (section
// "Runtime Events") — voir docs/qa/ARCHITECTURE_PIPELINE.md.
//
// GARANTIE DE RÉSILIENCE (exacte, pas aspirationnelle) :
//   Avant ce correctif, writeSummary() n'était appelée qu'une seule fois, en
//   toute fin de run (reporters/json.ts::onRunEnd()) — toute interruption
//   avant cet instant (crash, Ctrl+C, kill -9, timeout CI) faisait disparaître
//   100% de l'agrégation runtime, alors que JsonlSink (le même flux
//   d'événements, en brut) survivait intact. Ce sink écrit désormais
//   `events-summary.json` de façon INCRÉMENTALE — après chaque événement
//   traité (handle()), pas seulement à la fin — et de façon ATOMIQUE (fichier
//   temporaire + rename(), jamais un writeFileSync direct sur le fichier
//   final).
//
//   Ce que ceci garantit réellement :
//     - `events-summary.json` reflète TOUJOURS l'état après le DERNIER
//       événement traité avant une interruption — au pire, il manque les
//       événements survenus après la dernière écriture réussie, jamais plus.
//     - Le fichier final n'est JAMAIS dans un état partiellement écrit /
//       JSON invalide : rename() est atomique sur un même système de
//       fichiers — soit l'ancienne version complète reste en place, soit la
//       nouvelle version complète la remplace, jamais un état intermédiaire.
//     - Un fichier `.tmp` orphelin peut subsister après un crash exactement
//       entre l'écriture et le rename (fenêtre extrêmement courte) — sans
//       impact : ce fichier n'est jamais lu par aucun consommateur, et il est
//       écrasé (pas accumulé) à la prochaine tentative d'écriture.
//   Ce que ceci NE garantit PAS : la disparition totale de la fenêtre de
//   perte (elle est réduite à "depuis le dernier événement", pas éliminée) ;
//   un disque plein ou une permission refusée pendant l'écriture du fichier
//   temporaire fait toujours échouer cet événement précis pour ce sink (géré
//   par l'isolation déjà en place dans EventBus.emit() — les autres sinks et
//   la suite du run ne sont pas affectés).
// ─────────────────────────────────────────────────────────────────────────────

import { writeFileSync, mkdirSync, renameSync } from "fs";
import { resolve } from "path";
import { reportsRoot } from "../paths";
import type { EventSink } from "../event-bus";
import type { EventSeverity, EventType, RuntimeEvent } from "../events-schema";

/**
 * Écrit un fichier de façon atomique : écrit d'abord dans un fichier
 * temporaire puis le renomme vers la destination finale. rename() est
 * atomique sur un même système de fichiers (POSIX comme NTFS) — la
 * destination ne peut jamais se retrouver dans un état partiellement écrit.
 */
function atomicWriteFileSync(path: string, content: string): void {
  const tmpPath = `${path}.tmp`;
  writeFileSync(tmpPath, content, "utf-8");
  renameSync(tmpPath, path);
}

export interface EventsSummary {
  runId:              string;
  totalEvents:        number;
  countsByType:       Partial<Record<EventType, number>>;
  countsBySeverity:   Partial<Record<EventSeverity, number>>;
  /** Somme des coûts réels connus (COST_ACTUAL.payload.estimatedCostUsd) — nombre exact, sommable. */
  totalActualCostUsd: number;
  /** Plages de coût estimé rencontrées (COST_ESTIMATED.payload.costEst) — chaînes non sommables, listées telles quelles. */
  estimatedCostRanges: string[];
  lastUpdated:        string;
}

export class DashboardSink implements EventSink {
  readonly name = "dashboard";
  private countsByType:      Partial<Record<EventType, number>> = {};
  private countsBySeverity:  Partial<Record<EventSeverity, number>> = {};
  private total = 0;
  private runId = "adhoc";
  private totalActualCostUsd = 0;
  private estimatedCostRanges: string[] = [];

  constructor(private readonly reportsRootFn: () => string) {}

  handle(event: RuntimeEvent): void {
    this.runId = event.runId;
    this.total++;
    this.countsByType[event.eventType]   = (this.countsByType[event.eventType] ?? 0) + 1;
    this.countsBySeverity[event.severity] = (this.countsBySeverity[event.severity] ?? 0) + 1;

    if (event.eventType === "COST_ACTUAL") {
      const cost = event.payload["estimatedCostUsd"];
      if (typeof cost === "number" && !isNaN(cost)) {
        this.totalActualCostUsd = Math.round((this.totalActualCostUsd + cost) * 10_000) / 10_000;
      }
    }
    if (event.eventType === "COST_ESTIMATED") {
      const range = event.payload["costEst"];
      if (typeof range === "string" && !this.estimatedCostRanges.includes(range)) {
        this.estimatedCostRanges.push(range);
      }
    }

    // Écriture incrémentale (voir garantie de résilience en tête de fichier) —
    // toute exception ici (disque plein, permission refusée) propage vers
    // EventBus.emit(), qui l'isole déjà sans affecter les autres sinks ni le
    // reste du run (comportement inchangé, déjà couvert par les tests de
    // contrat des sinks).
    this.writeSummary();
  }

  getSummary(): EventsSummary {
    return {
      runId:               this.runId,
      totalEvents:         this.total,
      countsByType:        { ...this.countsByType },
      countsBySeverity:    { ...this.countsBySeverity },
      totalActualCostUsd:  this.totalActualCostUsd,
      estimatedCostRanges: [...this.estimatedCostRanges],
      lastUpdated:         new Date().toISOString(),
    };
  }

  /**
   * Persiste le résumé accumulé, de façon atomique (voir atomicWriteFileSync).
   * Appelée incrémentalement après chaque événement (handle()) ET à la fin du
   * run (reporters/json.ts::onRunEnd(), appel désormais redondant mais
   * inoffensif — conservé pour la clarté du flux applicatif et en filet de
   * sécurité si l'appel incrémental venait à être retiré par erreur).
   */
  writeSummary(): void {
    if (this.total === 0) return;
    const dir = resolve(this.reportsRootFn(), this.runId);
    mkdirSync(dir, { recursive: true });
    atomicWriteFileSync(resolve(dir, "events-summary.json"), JSON.stringify(this.getSummary(), null, 2));
  }

  reset(): void {
    this.countsByType = {};
    this.countsBySeverity = {};
    this.total = 0;
    this.runId = "adhoc";
    this.totalActualCostUsd = 0;
    this.estimatedCostRanges = [];
  }
}

/**
 * Instance partagée — permet à core/runner.ts (enregistrement) et
 * reporters/json.ts (writeSummary() en fin de run) de référencer le même
 * sink sans passer par un registre générique non typé.
 */
export const dashboardSink = new DashboardSink(reportsRoot);
