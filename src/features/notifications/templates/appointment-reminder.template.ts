// Sprint 13 — rappel automatique (squelette, aucun envoi Sprint 12)
import type { NotificationContext } from "../types";

export function renderReminderEmail(ctx: NotificationContext): {
  subject: string;
  html: string;
} {
  // TODO Sprint 13 : implémenter le rendu complet du rappel de rendez-vous.
  // Le champ ctx est reçu mais non utilisé intentionnellement dans ce squelette.
  void ctx;

  return {
    subject: "Rappel de rendez-vous — à implémenter Sprint 13",
    html: "<p>Rappel à implémenter Sprint 13.</p>",
  };
}
