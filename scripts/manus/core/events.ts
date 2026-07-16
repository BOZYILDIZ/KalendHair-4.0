// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Point d'entrée du journal d'événements (v2.5)
//
// Compatibilité v2.4 totale : tout le code qui appelle `eventLog.emit(...)`,
// `eventLog.setRunId(...)`, `eventLog.getEvents()`, etc. continue de
// fonctionner sans aucune modification. En interne, `eventLog` délègue
// désormais à un EventBus (core/event-bus.ts) qui distribue chaque événement
// à des sinks indépendants (core/sinks/*) — le producteur d'un événement ne
// connaît plus sa destination, conformément à la mission v2.5.
//
// Un seul sink est enregistré par défaut : MemorySink (aucun effet de bord
// disque/réseau) — c'est ce qui préserve l'isolation des tests existants.
// Les sinks à effet de bord réel (JSONL, console, dashboard) sont enregistrés
// explicitement par les points d'entrée applicatifs (core/runner.ts), pas au
// chargement de ce module — voir core/sinks/README (section correspondante
// dans docs/qa/ARCHITECTURE_PIPELINE.md) pour le raisonnement complet.
// ─────────────────────────────────────────────────────────────────────────────

import { EventBus } from "./event-bus";
import { MemorySink } from "./sinks/memory-sink";
import type { EventSink } from "./event-bus";
import { appendFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import {
  EVENT_SCHEMA_VERSION,
  EVENT_TYPES,
} from "./events-schema";
import type { EventSeverity, EventType, RuntimeEvent } from "./events-schema";

// Ré-exports — compatibilité v2.4 (aucun changement de signature d'import).
export { EVENT_SCHEMA_VERSION, EVENT_TYPES };
export type { EventSeverity, EventType, RuntimeEvent };

export interface EmitOptions {
  scenarioId?: string;
  provider?:   string;
}

const bus = new EventBus();
const memorySink = new MemorySink();
bus.registerSink(memorySink);

export const eventLog = {
  setRunId(runId: string): void {
    bus.setRunId(runId);
  },

  getRunId(): string {
    return bus.getRunId();
  },

  emit(
    eventType: EventType,
    severity:  EventSeverity,
    payload:   Record<string, unknown> = {},
    opts:      EmitOptions = {},
  ): RuntimeEvent {
    return bus.emit(eventType, severity, payload, opts);
  },

  getEvents(): readonly RuntimeEvent[] {
    return memorySink.getEvents();
  },

  getEventsByType(eventType: EventType): RuntimeEvent[] {
    return memorySink.getEventsByType(eventType);
  },

  /**
   * Compatibilité v2.4 stricte : écrit en un seul lot tous les événements
   * actuellement en mémoire — comportement identique à l'ancien
   * EventLog.writeToFile(). Reste disponible pour tout code qui préfère un
   * flush explicite plutôt qu'un JsonlSink en streaming (cf. core/sinks/jsonl-sink.ts).
   */
  writeToFile(runsDir: string): void {
    const events = memorySink.getEvents();
    if (events.length === 0) return;
    const dir = resolve(runsDir, bus.getRunId());
    mkdirSync(dir, { recursive: true });
    const path  = resolve(dir, "events.jsonl");
    const lines = events.map((e) => JSON.stringify(e)).join("\n") + "\n";
    appendFileSync(path, lines, "utf-8");
  },

  /** Nouveau v2.5 — enregistre un sink supplémentaire (JSONL, console, dashboard, futur webhook/OTel). */
  registerSink(sink: EventSink): void {
    bus.registerSink(sink);
  },

  unregisterSink(name: string): void {
    bus.unregisterSink(name);
  },

  listSinks(): string[] {
    return bus.listSinks();
  },

  /** Compteur d'échecs de sink observés depuis le dernier reset() — voir EventBus.getSinkFailures(). */
  getSinkFailures(): Record<string, number> {
    return bus.getSinkFailures();
  },

  /** Réinitialise le bus, tous les sinks enregistrés, et l'accumulation mémoire — utilisé entre deux tests. */
  reset(): void {
    bus.reset();
  },
};
