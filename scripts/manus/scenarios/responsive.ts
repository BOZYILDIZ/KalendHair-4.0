// ─────────────────────────────────────────────────────────────────────────────
// Scénario : Responsive — breakpoints critiques — v2 QA_EXECUTOR
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
  expectScreenshot("responsive_1440", "Dashboard 1440px (laptop)"),
  expectScreenshot("responsive_768",  "Dashboard 768px (tablet)"),
  expectScreenshot("responsive_390",  "Dashboard 390px (mobile)"),
];

export const responsive: ScenarioDefinition = {
  scenarioId:          "SC-007",
  name:                "responsive",
  description:         "Vérification visuelle aux 3 breakpoints critiques (1440, 768, 390px)",
  tags:                ["responsive", "visual", "regression"],
  requiresCredentials: "owner",
  mode:                "QA_EXECUTOR",

  run(ctx) {
    const creds    = ctx.credentials.owner!;
    const loginUrl = `${ctx.baseUrl}/login`;

    const prompt = [
      `# QA-EXECUTOR — responsive`,
      ``,
      `## RÔLE`,
      `Tu es un exécuteur QA automatisé. Tu n'es pas un assistant. Tu n'es pas un explorateur.`,
      `Tu exécutes UNIQUEMENT les étapes listées, dans l'ordre exact.`,
      `Tu ne prends AUCUNE initiative.`,
      ``,
      `## OBJECTIF`,
      `Vérifier visuellement le dashboard à 3 breakpoints critiques (1440, 768, 390px).`,
      ``,
      `## INTERDICTIONS ABSOLUES`,
      `- Ne jamais ouvrir d'autres pages que login et /dashboard.`,
      `- Ne jamais interagir avec des éléments UI non listés.`,
      `- Exactement 3 captures d'écran — une par breakpoint.`,
      `- Si une étape échoue : marque l'assertion failed et CONTINUE.`,
      `- Ne jamais continuer après avoir écrit le JSON final.`,
      ``,
      `## CHECKLIST — EXÉCUTE CES ÉTAPES DANS L'ORDRE`,
      ``,
      `Étape 1. Navigue vers : ${loginUrl}`,
      `Étape 2. Attends max 5s que input[type="email"] soit visible.`,
      `Étape 3. Saisis dans input[type="email"] : "${creds.email}"`,
      `Étape 4. Saisis dans input[type="password"] : "${creds.password}"`,
      `Étape 5. Clique sur button[type="submit"].`,
      `Étape 6. Attends max 8s que l'URL contienne "/dashboard".`,
      `Étape 7. Redimensionne le viewport à 1440×900px.`,
      `Étape 8. Attends 1s que la page s'adapte.`,
      `Étape 9. Prends une capture d'écran. Label: "responsive_1440".`,
      `Étape 10. Redimensionne le viewport à 768×1024px.`,
      `Étape 11. Attends 1s que la page s'adapte.`,
      `Étape 12. Prends une capture d'écran. Label: "responsive_768".`,
      `Étape 13. Redimensionne le viewport à 390×844px.`,
      `Étape 14. Attends 1s que la page s'adapte.`,
      `Étape 15. Prends une capture d'écran. Label: "responsive_390".`,
      `Étape 16. Vérifie que le contenu principal (dashboard) est visible à ce viewport.`,
      `Étape 17. Note toute erreur console (type "error"). Ignore les warnings React/Next.js.`,
      `Étape 18. Note toute requête réseau en 4xx ou 5xx (ignore 404).`,
      ``,
      buildAssertionsBlock(ASSERTIONS),
    ].join("\n");

    return {
      prompt,
      assertionNames: assertionNames(ASSERTIONS),
      timeoutSeconds: 150,
      viewport:       VIEWPORTS.desktop,
    };
  },
};
