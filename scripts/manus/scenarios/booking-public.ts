// ─────────────────────────────────────────────────────────────────────────────
// Scénario : Booking public (prise de RDV client)
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
  expectScreenshot("booking_service_selection", "Sélection de service"),
];

export const bookingPublic: ScenarioDefinition = {
  name:        "booking-public",
  description: "Parcours de prise de rendez-vous public (sans connexion)",
  tags:        ["booking", "public", "smoke"],

  run(ctx) {
    const bookingUrls = [
      `${ctx.baseUrl}/booking`,
      `${ctx.baseUrl}/reserver`,
      `${ctx.baseUrl}/prendre-rdv`,
    ];

    const prompt = [
      `# Mission QA — Scénario : Booking Public`,
      ``,
      `## Contexte`,
      `Application : KalendHair — module réservation public`,
      `URLs à tester (essaie dans l'ordre jusqu'à trouver la bonne) :`,
      ...bookingUrls.map((u) => `- ${u}`),
      ``,
      `## Parcours utilisateur`,
      `1. Navigue vers la page de réservation publique.`,
      `2. Sans connexion — cette page est accessible à tout visiteur.`,
      `3. Vérifie que la liste des services est affichée.`,
      `4. Si possible, clique sur un service pour voir les créneaux disponibles.`,
      `5. Vérifie que l'interface est fonctionnelle et sans erreur.`,
      ``,
      `## Points de vigilance`,
      `- La page doit être accessible sans authentification.`,
      `- Les créneaux doivent être visibles ou une indication d'absence de créneau.`,
      `- Aucune donnée sensible ne doit être exposée.`,
      ``,
      buildAssertionsBlock(ASSERTIONS),
    ].join("\n");

    return {
      prompt,
      assertionNames: assertionNames(ASSERTIONS),
      timeoutSeconds: 120,
      viewport:       VIEWPORTS.desktop,
    };
  },
};
