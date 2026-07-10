// ─────────────────────────────────────────────────────────────────────────────
// Scénario : Sidebar navigation — v2 QA_EXECUTOR
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
  expectScreenshot("sidebar_desktop", "Sidebar navigation desktop"),
];

export const sidebar: ScenarioDefinition = {
  scenarioId:          "SC-005",
  name:                "sidebar",
  description:         "Navigation sidebar — liens présents, responsive, sans erreurs",
  tags:                ["nav", "sidebar", "smoke"],
  requiresCredentials: "owner",
  mode:                "QA_EXECUTOR",

  run(ctx) {
    const creds    = ctx.credentials.owner!;
    const loginUrl = `${ctx.baseUrl}/login`;

    const prompt = [
      `# QA-EXECUTOR — sidebar`,
      ``,
      `## RÔLE`,
      `Tu es un exécuteur QA automatisé. Tu n'es pas un assistant. Tu n'es pas un explorateur.`,
      `Tu exécutes UNIQUEMENT les étapes listées, dans l'ordre exact.`,
      `Tu ne prends AUCUNE initiative.`,
      ``,
      `## OBJECTIF`,
      `Vérifier que la sidebar de navigation est présente, complète et sans erreur.`,
      ``,
      `## INTERDICTIONS ABSOLUES`,
      `- Ne jamais ouvrir d'autres pages que login et /dashboard.`,
      `- Ne jamais cliquer sur des liens de navigation.`,
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
      `Étape 7. Cherche un élément de type "nav" ou "aside" dans la page (la sidebar).`,
      `         Si absent : marque visible_sidebar_navigation=false.`,
      `Étape 8. Compte les liens "a" dans l'élément "nav" ou "aside".`,
      `         Note le nombre trouvé (objectif : au moins 4).`,
      `Étape 9. Cherche un lien dont le texte contient "Dashboard" dans la sidebar.`,
      `Étape 10. Prends UNE capture d'écran de la page entière. Label: "sidebar_desktop".`,
      `Étape 11. Note toute erreur console (type "error"). Ignore les warnings React/Next.js.`,
      `Étape 12. Note toute requête réseau en 4xx ou 5xx (ignore 404).`,
      ``,
      buildAssertionsBlock(ASSERTIONS),
    ].join("\n");

    return {
      prompt,
      assertionNames: assertionNames(ASSERTIONS),
      timeoutSeconds: 90,
      viewport:       VIEWPORTS.laptop,
    };
  },
};
