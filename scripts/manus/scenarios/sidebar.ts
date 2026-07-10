// ─────────────────────────────────────────────────────────────────────────────
// Scénario : Sidebar navigation
// Tags     : nav, sidebar, smoke
// ─────────────────────────────────────────────────────────────────────────────

import {
  expectNoConsoleErrors,
  expectNoNetworkErrors,
  expectVisible,
  expectElementCount,
  expectScreenshot,
  buildAssertionsBlock,
  assertionNames,
} from "../core/assertions";
import { VIEWPORTS } from "../core/types";
import type { ScenarioDefinition } from "../core/types";

const ASSERTIONS = [
  expectNoConsoleErrors(true),
  expectNoNetworkErrors([404]),
  expectVisible("sidebar", "sidebar navigation"),
  expectElementCount("nav a, aside a", 4, "nav_links"),
  expectVisible("Dashboard", "lien Dashboard"),
  expectScreenshot("sidebar_expanded", "Sidebar ouverte desktop"),
  expectScreenshot("sidebar_collapsed", "Sidebar réduite (si applicable)"),
];

export const sidebar: ScenarioDefinition = {
  name:        "sidebar",
  description: "Navigation sidebar — liens présents, responsive, sans erreurs",
  tags:        ["nav", "sidebar", "smoke"],

  run(ctx) {
    const dashUrl = `${ctx.baseUrl}/dashboard`;
    const creds   = ctx.credentials.owner;

    const authBlock = creds
      ? `Si une page de connexion s'affiche, connecte-toi avec : ${creds.email} / ${creds.password}`
      : "Si une page de connexion s'affiche, note que les credentials ne sont pas configurés.";

    const prompt = [
      `# Mission QA — Scénario : Sidebar Navigation`,
      ``,
      `## Contexte`,
      `Application : KalendHair — Navigation principale`,
      `URL : ${dashUrl}`,
      ``,
      `## Spécification sidebar`,
      `- Largeur fixe : 240px sur desktop`,
      `- Liens attendus : Dashboard, Agenda, Clients, Équipe, Services, Paramètres (au minimum)`,
      `- L'item actif doit être visuellement distinct`,
      `- La sidebar doit être visible sans scroll horizontal`,
      ``,
      `## Parcours utilisateur`,
      `1. Navigue vers : ${dashUrl}`,
      `2. ${authBlock}`,
      `3. Identifie la sidebar de navigation.`,
      `4. Liste tous les liens de navigation présents.`,
      `5. Vérifie qu'au moins 4 liens sont présents.`,
      `6. Clique sur 2 liens différents et vérifie la navigation.`,
      `7. Vérifie l'absence d'erreur console et réseau.`,
      ``,
      buildAssertionsBlock(ASSERTIONS),
    ].join("\n");

    return {
      prompt,
      assertionNames: assertionNames(ASSERTIONS),
      timeoutSeconds: 300,
      viewport:       VIEWPORTS.laptop,
    };
  },
};
