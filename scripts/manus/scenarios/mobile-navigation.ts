// ─────────────────────────────────────────────────────────────────────────────
// Scénario : Navigation mobile (390px)
// Tags     : mobile, nav, responsive
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
  expectNoConsoleErrors(true),
  expectNoNetworkErrors([404]),
  expectVisible("Menu mobile", "bouton hamburger ou navigation mobile"),
  expectScreenshot("mobile_dashboard", "Dashboard sur mobile 390px"),
  expectScreenshot("mobile_menu_open", "Menu mobile ouvert"),
  expectScreenshot("mobile_kpi_cards", "KPI Cards sur mobile"),
];

export const mobileNavigation: ScenarioDefinition = {
  name:        "mobile-navigation",
  description: "Navigation sur mobile 390px — menu, KPI Cards, lisibilité",
  tags:        ["mobile", "nav", "responsive"],

  run(ctx) {
    const dashUrl = `${ctx.baseUrl}/dashboard`;
    const creds   = ctx.credentials.owner;

    const authBlock = creds
      ? `Si une page de connexion s'affiche, connecte-toi avec : ${creds.email} / ${creds.password}`
      : "Si une page de connexion s'affiche, note que les credentials ne sont pas configurés.";

    const prompt = [
      `# Mission QA — Scénario : Mobile Navigation`,
      ``,
      `## Contexte`,
      `Application : KalendHair — vue mobile`,
      `Viewport : 390×844px (iPhone 14)`,
      `URL : ${dashUrl}`,
      ``,
      `## Points de vigilance mobile`,
      `- La sidebar desktop (240px) doit être remplacée par un menu mobile`,
      `- Les KPI Cards doivent passer en colonne (1 par ligne)`,
      `- Aucun scroll horizontal ne doit apparaître`,
      `- Les textes doivent rester lisibles (taille min 14px)`,
      `- Les boutons doivent avoir une zone tactile ≥ 44px`,
      ``,
      `## Parcours utilisateur`,
      `1. Configure le viewport à 390×844px.`,
      `2. Navigue vers : ${dashUrl}`,
      `3. ${authBlock}`,
      `4. Vérifie que la navigation mobile est présente (hamburger, bottom nav, ou similaire).`,
      `5. Ouvre le menu mobile si applicable.`,
      `6. Vérifie que les KPI Cards sont empilées verticalement.`,
      `7. Vérifie l'absence de scroll horizontal.`,
      `8. Prends des captures d'écran des zones clés.`,
      ``,
      buildAssertionsBlock(ASSERTIONS),
    ].join("\n");

    return {
      prompt,
      assertionNames: assertionNames(ASSERTIONS),
      timeoutSeconds: 120,
      viewport:       VIEWPORTS.mobile,
    };
  },
};
