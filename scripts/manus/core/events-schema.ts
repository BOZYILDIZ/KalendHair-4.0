// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Schéma des événements (v2.5 — Observability & Certification)
//
// Séparé du mécanisme de distribution (core/event-bus.ts) : ce fichier ne
// contient QUE la forme des données, pour que le versionnement de schéma
// reste indépendant de l'implémentation du bus.
//
// ─── Règles d'évolution du schéma (eventSchemaVersion) ────────────────────────
//
// 1. Champ ajouté, optionnel, ne change le sens d'aucun champ existant
//    → NON-BREAKING. Ne PAS incrémenter EVENT_SCHEMA_VERSION. Les sinks
//    existants doivent ignorer silencieusement les champs qu'ils ne
//    connaissent pas (tolérance en lecture — "be liberal in what you accept").
//
// 2. Nouveau eventType ajouté à EVENT_TYPES
//    → NON-BREAKING pour les sinks génériques (JsonlSink, ConsoleSink) qui
//    traitent tout événement indifféremment de son type. BREAKING pour un
//    sink qui fait un `switch` exhaustif sur eventType sans cas `default` —
//    règle : tout sink DOIT avoir un comportement par défaut pour un
//    eventType inconnu (jamais un throw).
//
// 3. Champ existant renommé, retiré, ou dont la signification change
//    → BREAKING. Incrémenter EVENT_SCHEMA_VERSION. Les événements historiques
//    déjà écrits sur disque (events.jsonl) restent au format de leur propre
//    eventSchemaVersion — un lecteur doit vérifier ce champ avant de faire
//    des hypothèses sur la forme des champs restants (cf. compare.ts qui a
//    le même défaut documenté pour schemaVersion — ne pas le reproduire ici).
//
// 4. Compatibilité multi-versions : un sink qui lit des événements
//    historiques (ex. reconstruction d'un dashboard depuis plusieurs runs
//    passés) DOIT faire un aiguillage explicite sur `eventSchemaVersion`
//    plutôt que de supposer la version courante. Voir docs/qa/EVENT_SCHEMA_VERSIONING.md
//    pour la table de compatibilité complète et l'exemple de code.
// ─────────────────────────────────────────────────────────────────────────────

/** Version du SCHÉMA d'événement — distincte de FRAMEWORK_VERSION (core/version.ts). */
export const EVENT_SCHEMA_VERSION = "1";

export type EventSeverity = "INFO" | "WARN" | "ERROR" | "CRITICAL";

export const EVENT_TYPES = [
  // Sécurité
  "SAFE_MODE_BLOCKED",
  "SAFE_MODE_DISABLED",
  "PERMISSION_GRANTED",
  "PERMISSION_DENIED",
  // Réseau / Manus
  "NETWORK_REQUEST",
  "NETWORK_RESPONSE",
  "MANUS_TASK_CREATED",
  "MANUS_TASK_COMPLETED",
  "MANUS_TASK_FAILED",
  // Exécution
  "DRY_RUN",
  "REAL_RUN",
  "REPORT_GENERATED",
  // Coûts (au-delà du minimum demandé — traçabilité explicite estimé vs réel)
  "COST_ESTIMATED",
  "COST_ACTUAL",
  // Rétention (v2.5.1 — finalisation opérationnelle)
  "RETENTION_PREVIEW",
  "RETENTION_APPLIED",
  // Intégrité du run (mission corrective Devil's Advocate — P0)
  "NO_SCENARIOS_SELECTED",
] as const;

export type EventType = typeof EVENT_TYPES[number];

export interface RuntimeEvent {
  /** Version du schéma de CET événement — jamais absente, permet la lecture rétrocompatible. */
  eventSchemaVersion: string;
  timestamp:          string;
  runId:              string;
  scenarioId?:        string;
  frameworkVersion:   string;
  provider?:          string;
  severity:           EventSeverity;
  eventType:          EventType;
  payload:            Record<string, unknown>;
}
