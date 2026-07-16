// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — EventBus (v2.5 — Observability & Certification)
//
// Un événement ÉMIS ne connaît plus ses destinations. Le producteur (runner,
// client Manus, safe-mode, permissions...) appelle toujours `emit(...)` de la
// même façon qu'en v2.4 — c'est l'EventBus qui distribue l'événement à
// N adaptateurs (sinks) enregistrés, chacun responsable d'UNE destination
// (fichier JSONL, console, dashboard, futur webhook, future télémétrie).
//
// Garantie de sécurité : la redaction (core/redaction.ts) s'applique UNE
// SEULE FOIS, dans le bus, avant toute distribution — aucun sink ne reçoit
// jamais un événement non rédigé, donc aucun sink futur ne peut réintroduire
// une fuite de secret par oubli.
//
// Défaillance d'un sink : un sink qui lève une exception ne doit jamais
// interrompre l'émission ni les autres sinks — l'observabilité ne doit
// jamais devenir un point de défaillance du framework QA lui-même.
// ─────────────────────────────────────────────────────────────────────────────

import { secretRedactionEngine } from "./redaction";
import { FRAMEWORK_VERSION } from "./version";
import type { EventSeverity, EventType, RuntimeEvent } from "./events-schema";
import { EVENT_SCHEMA_VERSION } from "./events-schema";

export interface EmitOptions {
  scenarioId?: string;
  provider?:   string;
}

/**
 * Contrat que doit implémenter tout adaptateur de destination.
 * `handle` peut être synchrone ou asynchrone — le bus n'attend PAS la
 * résolution des sinks asynchrones avant de retourner (émission "fire and
 * forget" côté producteur), afin qu'un sink lent (ex. futur webhook réseau)
 * ne ralentisse jamais le chemin critique d'exécution des scénarios QA.
 */
export interface EventSink {
  readonly name: string;
  handle(event: RuntimeEvent): void | Promise<void>;
  /** Réinitialise l'état interne du sink — utilisé entre deux runs (tests). */
  reset?(): void;
}

export class EventBus {
  private sinks: EventSink[] = [];
  private runId = "adhoc";
  // Compteur d'échecs par sink — rend observable ce qui était auparavant
  // uniquement un `console.warn` (audit Devil's Advocate, "erreurs
  // silencieuses"). Volontairement un compteur en mémoire et non un nouvel
  // événement émis via `this.emit()` : émettre depuis le gestionnaire
  // d'échec d'un sink créerait un risque de récursion si le sink qui vient
  // d'échouer est justement re-sollicité par cette émission (ex. ConsoleSink
  // qui échouerait sur un flux stdout fermé, puis serait rappelé pour
  // notifier son propre échec).
  private sinkFailures: Record<string, number> = {};

  registerSink(sink: EventSink): void {
    if (this.sinks.some((s) => s.name === sink.name)) {
      throw new Error(`[EventBus] Un sink nommé "${sink.name}" est déjà enregistré.`);
    }
    this.sinks.push(sink);
  }

  unregisterSink(name: string): void {
    this.sinks = this.sinks.filter((s) => s.name !== name);
  }

  listSinks(): string[] {
    return this.sinks.map((s) => s.name);
  }

  setRunId(runId: string): void {
    this.runId = runId;
  }

  getRunId(): string {
    return this.runId;
  }

  /**
   * Construit l'événement (schéma versionné, redaction appliquée UNE fois)
   * puis le distribue à tous les sinks enregistrés. Le producteur ne connaît
   * jamais la liste des sinks — c'est tout l'objet de cette abstraction.
   */
  emit(
    eventType: EventType,
    severity:  EventSeverity,
    payload:   Record<string, unknown> = {},
    opts:      EmitOptions = {},
  ): RuntimeEvent {
    const event: RuntimeEvent = {
      eventSchemaVersion: EVENT_SCHEMA_VERSION,
      timestamp:          new Date().toISOString(),
      runId:              this.runId,
      scenarioId:         opts.scenarioId,
      frameworkVersion:   FRAMEWORK_VERSION,
      provider:           opts.provider,
      severity,
      eventType,
      payload:            secretRedactionEngine.redactObject(payload),
    };

    for (const sink of this.sinks) {
      try {
        const result = sink.handle(event);
        // Sink asynchrone : on capture un rejet éventuel sans jamais bloquer
        // ni faire remonter l'erreur au producteur de l'événement.
        if (result instanceof Promise) {
          result.catch((err: unknown) => {
            this.recordSinkFailure(sink.name, err, "async");
          });
        }
      } catch (err) {
        this.recordSinkFailure(sink.name, err, "sync");
      }
    }

    return event;
  }

  private recordSinkFailure(sinkName: string, err: unknown, mode: "sync" | "async"): void {
    this.sinkFailures[sinkName] = (this.sinkFailures[sinkName] ?? 0) + 1;
    console.warn(`[EventBus] Le sink "${sinkName}" a échoué (${mode}) :`, err);
  }

  /**
   * Nombre d'échecs observés par sink depuis le dernier reset() — permet à un
   * opérateur ou à un test de détecter qu'un événement a été perdu, sans
   * dépendre uniquement de la lecture de la console.
   */
  getSinkFailures(): Record<string, number> {
    return { ...this.sinkFailures };
  }

  /** Réinitialise le bus ET tous les sinks qui exposent reset() — utilisé entre deux tests. */
  reset(): void {
    this.runId = "adhoc";
    this.sinkFailures = {};
    for (const sink of this.sinks) {
      sink.reset?.();
    }
  }
}
