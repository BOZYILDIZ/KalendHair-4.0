// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Sink console (v2.5)
//
// Affiche en temps réel les événements ERROR/CRITICAL — les décisions de
// sécurité qui méritent une visibilité immédiate (ex: SAFE_MODE_BLOCKED,
// MANUS_TASK_FAILED), sans noyer la sortie standard avec les événements INFO
// déjà couverts par les reporters existants (ConsoleReporter).
// ─────────────────────────────────────────────────────────────────────────────

import type { EventSink } from "../event-bus";
import type { EventSeverity, RuntimeEvent } from "../events-schema";

const NOTABLE_SEVERITIES: EventSeverity[] = ["ERROR", "CRITICAL"];

export class ConsoleSink implements EventSink {
  readonly name = "console";

  handle(event: RuntimeEvent): void {
    if (!NOTABLE_SEVERITIES.includes(event.severity)) return;
    const icon = event.severity === "CRITICAL" ? "🛑" : "⚠️";
    console.warn(`${icon} [event] ${event.eventType} (${event.severity})`, event.payload);
  }

  reset(): void {
    // Sans état interne.
  }
}
