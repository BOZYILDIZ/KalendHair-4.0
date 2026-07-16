// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Typage des payloads par eventType (v2.5.1)
//
// Complète le schéma d'événements (core/events-schema.ts) : chaque eventType
// obtient désormais une forme de payload documentée et vérifiable au runtime.
//
// Compatibilité legacy : la signature de `eventLog.emit(eventType, severity,
// payload, opts)` N'A PAS CHANGÉ — `payload` reste `Record<string, unknown>`
// à l'émission, pour ne casser aucun des producteurs existants (runner.ts,
// client/index.ts, safe-mode.ts, permissions.ts, capabilities.ts, profiles.ts).
// Le typage s'applique à la LECTURE : un consommateur (sink, futur outil
// d'analyse) qui reçoit un RuntimeEvent peut désormais obtenir un payload
// typé via `getTypedPayload()`, avec repli explicite si la forme réelle ne
// correspond pas à celle attendue — un événement legacy (émis avant cette
// mission, ou dont le payload diverge) reste lisible, jamais rejeté.
// ─────────────────────────────────────────────────────────────────────────────

import type { EventType, RuntimeEvent } from "./events-schema";

// ─── Formes attendues par eventType ────────────────────────────────────────────

export interface SafeModeBlockedPayload   { action: string; detail: string; }
export interface SafeModeDisabledPayload  { action: string; detail: string; }
export interface PermissionDecisionPayload {
  profile?: string; level?: string; grant?: string; capability?: string;
  grantedLevels?: string[]; model?: string;
}
export interface NetworkRequestPayload  { endpoint: string; [key: string]: unknown; }
export interface NetworkResponsePayload { endpoint: string; httpStatus: number; [key: string]: unknown; }
export interface ManusTaskCreatedPayload   { taskId: string; timeoutSeconds?: number; }
export interface ManusTaskCompletedPayload { taskId: string; manusStatus?: string; pollCount?: number; creditsConsumed?: number; }
export interface ManusTaskFailedPayload    { taskId?: string; reason?: string; manusStatus?: string; pollCount?: number; timeoutSeconds?: number; }
export interface DryRunPayload  { totalScenarios: number; maxConcurrent: number; provider: string; }
export interface RealRunPayload { totalScenarios: number; maxConcurrent: number; provider: string; }
export interface ReportGeneratedPayload { runId: string; artifacts: string[]; }
export interface CostEstimatedPayload { profile: string; scenarioCount: number; costEst: string; durationEst: string; }
export interface CostActualPayload    { taskId: string; creditsConsumed: number; estimatedCostUsd: number; }
export interface RetentionPreviewPayload { runId: string; keptCount: number; purgedCount: number; }
export interface RetentionAppliedPayload { runId: string; keptCount: number; purgedCount: number; }
export interface NoScenariosSelectedPayload { reason: string; filter?: string; }

/** Table de correspondance eventType → forme de payload attendue. */
export interface EventPayloadMap {
  SAFE_MODE_BLOCKED:   SafeModeBlockedPayload;
  SAFE_MODE_DISABLED:  SafeModeDisabledPayload;
  PERMISSION_GRANTED:  PermissionDecisionPayload;
  PERMISSION_DENIED:   PermissionDecisionPayload;
  NETWORK_REQUEST:     NetworkRequestPayload;
  NETWORK_RESPONSE:    NetworkResponsePayload;
  MANUS_TASK_CREATED:   ManusTaskCreatedPayload;
  MANUS_TASK_COMPLETED: ManusTaskCompletedPayload;
  MANUS_TASK_FAILED:    ManusTaskFailedPayload;
  DRY_RUN:             DryRunPayload;
  REAL_RUN:            RealRunPayload;
  REPORT_GENERATED:    ReportGeneratedPayload;
  COST_ESTIMATED:      CostEstimatedPayload;
  COST_ACTUAL:         CostActualPayload;
  RETENTION_PREVIEW:   RetentionPreviewPayload;
  RETENTION_APPLIED:   RetentionAppliedPayload;
  NO_SCENARIOS_SELECTED: NoScenariosSelectedPayload;
}

// ─── Validateurs runtime (légers, sans dépendance externe) ────────────────────
//
// Un validateur retourne `true` seulement si les clés OBLIGATOIRES attendues
// sont présentes avec le bon type primitif. Volontairement permissif sur les
// clés additionnelles — un événement legacy avec des champs en plus reste valide.

function hasStringField(payload: Record<string, unknown>, key: string): boolean {
  return typeof payload[key] === "string";
}
function hasNumberField(payload: Record<string, unknown>, key: string): boolean {
  return typeof payload[key] === "number";
}

const VALIDATORS: Partial<Record<EventType, (p: Record<string, unknown>) => boolean>> = {
  SAFE_MODE_BLOCKED:   (p) => hasStringField(p, "action") && hasStringField(p, "detail"),
  SAFE_MODE_DISABLED:  (p) => hasStringField(p, "action") && hasStringField(p, "detail"),
  NETWORK_REQUEST:     (p) => hasStringField(p, "endpoint"),
  NETWORK_RESPONSE:    (p) => hasStringField(p, "endpoint") && hasNumberField(p, "httpStatus"),
  MANUS_TASK_CREATED:  (p) => hasStringField(p, "taskId"),
  DRY_RUN:             (p) => hasNumberField(p, "totalScenarios") && hasStringField(p, "provider"),
  REAL_RUN:            (p) => hasNumberField(p, "totalScenarios") && hasStringField(p, "provider"),
  REPORT_GENERATED:    (p) => hasStringField(p, "runId") && Array.isArray(p["artifacts"]),
  COST_ESTIMATED:      (p) => hasStringField(p, "profile") && hasStringField(p, "costEst"),
  COST_ACTUAL:         (p) => hasStringField(p, "taskId") && hasNumberField(p, "estimatedCostUsd"),
  RETENTION_PREVIEW:   (p) => hasStringField(p, "runId") && hasNumberField(p, "keptCount"),
  RETENTION_APPLIED:   (p) => hasStringField(p, "runId") && hasNumberField(p, "keptCount"),
  NO_SCENARIOS_SELECTED: (p) => hasStringField(p, "reason"),
};

/**
 * Vérifie si le payload d'un événement correspond à la forme attendue pour
 * son eventType. Retourne `true` pour tout eventType sans validateur défini
 * (ex: PERMISSION_GRANTED/DENIED, MANUS_TASK_COMPLETED/FAILED — formes
 * volontairement souples, plusieurs producteurs légitimement différents) —
 * ne bloque jamais un événement legacy, ne fait que signaler une anomalie.
 */
export function isValidPayloadForType(eventType: EventType, payload: Record<string, unknown>): boolean {
  const validator = VALIDATORS[eventType];
  if (!validator) return true; // pas de validateur strict pour ce type — toujours valide
  return validator(payload);
}

/**
 * Retourne le payload typé si sa forme correspond au eventType, sinon `null`
 * — jamais une exception. C'est la garantie de compatibilité legacy : un
 * consommateur qui appelle cette fonction doit toujours gérer le cas `null`
 * (événement plus ancien / de forme divergente) sans planter.
 */
export function getTypedPayload<T extends EventType>(
  event: RuntimeEvent & { eventType: T },
): EventPayloadMap[T] | null {
  if (!isValidPayloadForType(event.eventType, event.payload)) return null;
  return event.payload as unknown as EventPayloadMap[T];
}
