// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Sink OpenTelemetry (v2.5 — PRÉPARATION, NON IMPLÉMENTÉ)
//
// ⚠️ Aucune dépendance @opentelemetry/* n'est ajoutée par ce fichier — c'est
// un point d'extension documenté, pas une intégration.
//
// Objectif de cette mission : prouver que l'ajout futur d'OpenTelemetry ne
// nécessitera JAMAIS de modifier un seul producteur d'événement
// (core/runner.ts, client/index.ts, core/safe-mode.ts...). Ces producteurs
// appellent tous eventLog.emit(...) sans savoir qu'un OtelSink existe — le
// jour où ce sink sera implémenté pour de vrai, il suffira de l'enregistrer
// via eventLog.registerSink(new OtelSink(...)) dans le point d'entrée
// applicatif (run-all.ts), exactement comme JsonlSink/ConsoleSink/
// DashboardSink aujourd'hui. Zéro changement ailleurs dans le framework.
//
// ─── Mapping prévu RuntimeEvent → concepts OpenTelemetry ──────────────────────
//
// | RuntimeEvent          | Concept OTel visé                                |
// |-----------------------|---------------------------------------------------|
// | eventType             | Nom du span (ex: "manus.task.created") ou du log  |
// | severity              | SeverityNumber (INFO→9, WARN→13, ERROR→17,        |
// |                       |  CRITICAL→21 — échelle OTel Logs Data Model)      |
// | runId                 | Attribut de span/log "manus.run_id"               |
// | scenarioId            | Attribut de span/log "manus.scenario_id"          |
// | frameworkVersion      | Attribut de resource "service.version"            |
// | provider              | Attribut de span "manus.provider"                 |
// | payload (déjà rédigé) | Attributs de span additionnels (aplatis)          |
// | timestamp             | Horodatage natif du span/log OTel                 |
//
// MANUS_TASK_CREATED/COMPLETED/FAILED formeraient naturellement un span
// unique (durée de la tâche) plutôt que 3 logs séparés — point de conception
// à trancher lors de l'implémentation réelle, pas dans cette préparation.
// ─────────────────────────────────────────────────────────────────────────────

import type { EventSink } from "../event-bus";
import type { RuntimeEvent } from "../events-schema";

export class OtelSink implements EventSink {
  readonly name = "otel";

  /** NON IMPLÉMENTÉ — no-op tant qu'aucun SDK OpenTelemetry n'est intégré. */
  handle(_event: RuntimeEvent): void {
    // Point d'extension : instancier un tracer/logger OTel ici et traduire
    // _event selon le mapping documenté ci-dessus.
  }

  reset(): void {
    // Sans état interne.
  }
}
