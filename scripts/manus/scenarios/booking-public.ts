// ─────────────────────────────────────────────────────────────────────────────
// Scénario : Booking public — v2 QA_EXECUTOR
// Tags     : booking, public, smoke
// ─────────────────────────────────────────────────────────────────────────────

import {
  expectNoConsoleErrors,
  expectNoNetworkErrors,
  expectVisible,
  expectScreenshot,
  buildAssertionsBlock,
  assertionNames,
} from "../core/assertions";
import { VIEWPORTS } from "../core/types";
import type { ScenarioDefinition } from "../core/types";

const ASSERTIONS = [
  expectNoConsoleErrors(),
  expectNoNetworkErrors(),
  expectVisible("Prendre un rendez-vous", "CTA principal booking"),
  expectVisible("Choisissez un service", "liste services"),
  expectScreenshot("booking_page_desktop", "Page booking publique desktop"),
];

export const bookingPublic: ScenarioDefinition = {
  scenarioId:  "SC-003",
  name:        "booking-public",
  description: "Parcours de prise de rendez-vous public (sans connexion)",
  tags:        ["booking", "public", "smoke"],
  // Pas de requiresCredentials — page publique
  mode:        "QA_EXECUTOR",

  run(ctx) {
    // Tenter les URLs dans l'ordre, s'arrêter à la première qui répond
    const candidateUrls = [
      `${ctx.baseUrl}/booking`,
      `${ctx.baseUrl}/reserver`,
      `${ctx.baseUrl}/prendre-rdv`,
    ];

    const prompt = [
      `# QA-EXECUTOR — booking-public`,
      ``,
      `## RÔLE`,
      `Tu es un exécuteur QA automatisé. Tu n'es pas un assistant. Tu n'es pas un explorateur.`,
      `Tu exécutes UNIQUEMENT les étapes listées, dans l'ordre exact.`,
      `Tu ne prends AUCUNE initiative.`,
      ``,
      `## OBJECTIF`,
      `Vérifier que la page de réservation publique est accessible et fonctionnelle.`,
      ``,
      `## INTERDICTIONS ABSOLUES`,
      `- Ne jamais s'authentifier — cette page est publique.`,
      `- Ne jamais compléter une réservation.`,
      `- Ne jamais naviguer au-delà de la sélection de service.`,
      `- Si une étape échoue : marque l'assertion failed et CONTINUE.`,
      `- Ne jamais continuer après avoir écrit le JSON final.`,
      ``,
      `## CHECKLIST — EXÉCUTE CES ÉTAPES DANS L'ORDRE`,
      ``,
      `Étape 1. Essaie les URLs suivantes dans l'ordre, jusqu'à trouver une page qui charge :`,
      ...candidateUrls.map((u, i) => `         ${i + 1}. ${u}`),
      `         Si aucune ne répond : marque toutes les assertions visible_* = false.`,
      `Étape 2. Attends max 5s que la page soit chargée.`,
      `Étape 3. Cherche un texte contenant "Prendre un rendez-vous" ou "Réserver".`,
      `Étape 4. Cherche une liste de services ou un texte contenant "service".`,
      `Étape 5. Prends UNE capture d'écran de la page. Label: "booking_page_desktop".`,
      `Étape 6. Note toute erreur console (type "error").`,
      `Étape 7. Note toute requête réseau en 4xx ou 5xx.`,
      ``,
      buildAssertionsBlock(ASSERTIONS),
    ].join("\n");

    return {
      prompt,
      assertionNames: assertionNames(ASSERTIONS),
      timeoutSeconds: 90,
      viewport:       VIEWPORTS.desktop,
    };
  },
};
