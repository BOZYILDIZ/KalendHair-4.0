// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Sink mémoire (v2.5)
//
// Accumule les événements en mémoire pour ce process — remplace le tableau
// privé interne du EventLog v2.4. Toujours enregistré par défaut (aucun
// effet de bord disque/réseau), c'est ce qui permet à eventLog.getEvents()/
// getEventsByType() de continuer à fonctionner exactement comme en v2.4,
// y compris dans les tests qui n'enregistrent aucun autre sink.
// ─────────────────────────────────────────────────────────────────────────────

import type { EventSink } from "../event-bus";
import type { EventType, RuntimeEvent } from "../events-schema";

export class MemorySink implements EventSink {
  readonly name = "memory";
  private events: RuntimeEvent[] = [];

  handle(event: RuntimeEvent): void {
    this.events.push(event);
  }

  getEvents(): readonly RuntimeEvent[] {
    return this.events;
  }

  getEventsByType(eventType: EventType): RuntimeEvent[] {
    return this.events.filter((e) => e.eventType === eventType);
  }

  reset(): void {
    this.events = [];
  }
}
