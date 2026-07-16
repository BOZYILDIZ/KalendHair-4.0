// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Sink Webhook (v2.5 — PRÉPARATION, NON IMPLÉMENTÉ)
//
// ⚠️ Ce sink ne fait AUCUN appel réseau réel. Il documente le point
// d'extension pour un futur envoi d'événements vers un endpoint HTTP
// (Slack, PagerDuty, un service de monitoring interne...).
//
// Contrainte de conception à respecter lors de l'implémentation réelle :
// un webhook EST un appel réseau (NETWORK_CALL) — son exécution devra donc
// passer par assertNotSafeMode() comme tout autre appel réseau du framework
// (cf. core/safe-mode.ts). Ne jamais implémenter l'envoi HTTP sans ce gate,
// sous peine de recréer exactement la classe de risque que SAFE_MODE existe
// pour éliminer.
//
// Pour l'activer un jour : implémenter `handle()` avec un `fetch()` gaté,
// gérer les échecs réseau sans jamais faire remonter l'erreur au producteur
// de l'événement (cf. EventBus.emit() qui absorbe déjà les erreurs de sink),
// et prévoir un throttling (ne pas envoyer un webhook par événement INFO).
// ─────────────────────────────────────────────────────────────────────────────

import type { EventSink } from "../event-bus";
import type { RuntimeEvent } from "../events-schema";

export interface WebhookSinkConfig {
  url:            string;
  minSeverity?:   "WARN" | "ERROR" | "CRITICAL";
}

export class WebhookSink implements EventSink {
  readonly name = "webhook";
  private pending: RuntimeEvent[] = [];

  constructor(private readonly config: WebhookSinkConfig) {}

  /**
   * NON IMPLÉMENTÉ — accumule les événements qui auraient été envoyés, sans
   * jamais émettre de requête réseau réelle. Permet de tester le câblage
   * (le sink reçoit bien les événements) sans risquer un appel réseau non
   * autorisé tant que l'implémentation HTTP n'existe pas.
   */
  handle(event: RuntimeEvent): void {
    this.pending.push(event);
  }

  /** Diagnostic — jamais utilisé en production tant que handle() n'envoie rien réellement. */
  getPendingCount(): number {
    return this.pending.length;
  }

  reset(): void {
    this.pending = [];
  }
}
