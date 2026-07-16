// ─────────────────────────────────────────────────────────────────────────────
// Scénario : Navigation mobile (390px) — v2 QA_EXECUTOR
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
  expectVisible("Dashboard", "contenu principal mobile"),
  expectScreenshot("mobile_dashboard_390", "Dashboard sur mobile 390px"),
];

export const mobileNavigation: ScenarioDefinition = {
  scenarioId:          "SC-006",
  name:                "mobile-navigation",
  description:         "Navigation sur mobile 390px — mise en page, lisibilité, absence de scroll horizontal",
  tags:                ["mobile", "nav", "responsive"],
  requiresCredentials: "owner",
  mode:                "QA_EXECUTOR",

  run(ctx) {
    const creds    = ctx.credentials.owner!;
    const loginUrl = `${ctx.baseUrl}/login`;

    const prompt = [
      `# QA-EXECUTOR — mobile-navigation`,
      ``,
      `## RÔLE`,
      `Tu es un exécuteur QA automatisé. Tu n'es pas un assistant. Tu n'es pas un explorateur.`,
      `Tu exécutes UNIQUEMENT les étapes listées, dans l'ordre exact.`,
      `Tu ne prends AUCUNE initiative.`,
      ``,
      `## OBJECTIF`,
      `Vérifier que le dashboard est utilisable sur mobile 390px sans scroll horizontal.`,
      ``,
      `## INTERDICTIONS ABSOLUES`,
      `- Ne jamais ouvrir d'autres pages que login et /dashboard.`,
      `- Ne jamais interagir avec des éléments non listés.`,
      `- Si une étape échoue : marque l'assertion failed et CONTINUE.`,
      `- Ne jamais continuer après avoir écrit le JSON final.`,
      ``,
      `## CHECKLIST — EXÉCUTE CES ÉTAPES DANS L'ORDRE`,
      ``,
      `Étape 1. Configure le viewport à 390×844px.`,
      `Étape 2. Navigue vers : ${loginUrl}`,
      `Étape 3. Attends max 5s que input[type="email"] soit visible.`,
      `Étape 4. Saisis dans input[type="email"] : "${creds.email}"`,
      `Étape 5. Saisis dans input[type="password"] : "${creds.password}"`,
      `Étape 6. Clique sur button[type="submit"].`,
      `Étape 7. Attends max 8s que l'URL contienne "/dashboard".`,
      `Étape 8. Vérifie qu'aucun scroll horizontal n'est visible (document.body.scrollWidth <= window.innerWidth).`,
      `Étape 9. Vérifie que le contenu principal (dashboard) est visible.`,
      `Étape 10. Prends UNE capture d'écran de la page complète. Label: "mobile_dashboard_390".`,
      `Étape 11. Note toute erreur console (type "error"). Ignore les warnings React/Next.js.`,
      `Étape 12. Note toute requête réseau en 4xx ou 5xx (ignore 404).`,
      ``,
      buildAssertionsBlock(ASSERTIONS),
    ].join("\n");

    return {
      prompt,
      assertionNames: assertionNames(ASSERTIONS),
      timeoutSeconds: 90,
      viewport:       VIEWPORTS.mobile,
    };
  },
};
