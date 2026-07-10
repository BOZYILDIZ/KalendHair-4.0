// ─────────────────────────────────────────────────────────────────────────────
// Scénario : Responsive — breakpoints critiques
// Tags     : responsive, visual, regression
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
  expectVisible("Dashboard", "contenu principal"),
  expectScreenshot("responsive_1920", "Dashboard 1920px (desktop large)"),
  expectScreenshot("responsive_1440", "Dashboard 1440px (laptop)"),
  expectScreenshot("responsive_768",  "Dashboard 768px (tablet)"),
  expectScreenshot("responsive_390",  "Dashboard 390px (mobile)"),
];

export const responsive: ScenarioDefinition = {
  name:        "responsive",
  description: "Vérification visuelle aux 4 breakpoints critiques (1920, 1440, 768, 390px)",
  tags:        ["responsive", "visual", "regression"],

  run(ctx) {
    const dashUrl = `${ctx.baseUrl}/dashboard`;
    const creds   = ctx.credentials.owner;

    const authBlock = creds
      ? `Si une page de connexion s'affiche, connecte-toi avec : ${creds.email} / ${creds.password}`
      : "Si une page de connexion s'affiche, note que les credentials ne sont pas configurés.";

    const prompt = [
      `# Mission QA — Scénario : Responsive`,
      ``,
      `## Contexte`,
      `Application : KalendHair Dashboard`,
      `URL : ${dashUrl}`,
      ``,
      `## Breakpoints à tester`,
      `| Viewport   | Largeur | Description         |`,
      `|------------|---------|---------------------|`,
      `| Desktop XL | 1920px  | Grand écran         |`,
      `| Laptop     | 1440px  | Laptop standard     |`,
      `| Tablet     | 768px   | iPad portrait       |`,
      `| Mobile     | 390px   | iPhone 14           |`,
      ``,
      `## Vérifications à chaque breakpoint`,
      `- Aucun scroll horizontal`,
      `- Les KPI Cards s'adaptent (auto-fill grid)`,
      `- La sidebar est visible sur desktop, masquée sur mobile`,
      `- Les textes restent lisibles`,
      `- Aucun élément ne dépasse les bords de la fenêtre`,
      ``,
      `## Parcours utilisateur`,
      `1. Navigue vers : ${dashUrl}`,
      `2. ${authBlock}`,
      `3. Pour chaque breakpoint listé, redimensionne le viewport et prends une capture.`,
      `4. Note tout problème de mise en page à chaque taille.`,
      ``,
      buildAssertionsBlock(ASSERTIONS),
    ].join("\n");

    return {
      prompt,
      assertionNames: assertionNames(ASSERTIONS),
      timeoutSeconds: 300,
      viewport:       VIEWPORTS.desktop,
    };
  },
};
