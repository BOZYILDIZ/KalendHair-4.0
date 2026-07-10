// ─────────────────────────────────────────────────────────────────────────────
// Scénario : Connexion Owner — v2 QA_EXECUTOR
// Tags     : auth, smoke, owner
// ─────────────────────────────────────────────────────────────────────────────

import {
  expectNoConsoleErrors,
  expectNoNetworkErrors,
  expectVisible,
  expectRoute,
  expectRedirect,
  expectScreenshot,
  buildAssertionsBlock,
  assertionNames,
} from "../core/assertions";
import { VIEWPORTS } from "../core/types";
import type { ScenarioDefinition } from "../core/types";

const ASSERTIONS = [
  expectNoConsoleErrors(),
  expectNoNetworkErrors(),
  expectVisible("Formulaire de connexion", "form de login"),
  expectRedirect("/login", "/dashboard"),
  expectRoute("/dashboard"),
  expectVisible("Dashboard", "titre principal"),
  expectScreenshot("dashboard_after_login", "Dashboard complet après connexion owner"),
];

export const loginOwner: ScenarioDefinition = {
  scenarioId:          "SC-001",
  name:                "login-owner",
  description:         "Connexion avec les credentials owner et redirection vers le dashboard",
  tags:                ["auth", "smoke", "owner"],
  requiresCredentials: "owner",
  mode:                "QA_EXECUTOR",

  run(ctx) {
    const creds    = ctx.credentials.owner!; // garanti présent par requiresCredentials
    const loginUrl = `${ctx.baseUrl}/login`;

    const prompt = [
      `# QA-EXECUTOR — login-owner`,
      ``,
      `## RÔLE`,
      `Tu es un exécuteur QA automatisé. Tu n'es pas un assistant. Tu n'es pas un explorateur.`,
      `Tu exécutes UNIQUEMENT les étapes listées, dans l'ordre exact.`,
      `Tu ne prends AUCUNE initiative.`,
      ``,
      `## OBJECTIF`,
      `Vérifier que la connexion owner fonctionne et redirige vers /dashboard.`,
      ``,
      `## INTERDICTIONS ABSOLUES`,
      `- Ne jamais ouvrir d'autres URLs que celles listées dans la checklist.`,
      `- Ne jamais improviser une action non listée.`,
      `- Si une étape échoue : marque l'assertion correspondante passed:false et CONTINUE.`,
      `- Ne jamais retenter une étape qui a échoué.`,
      `- Ne jamais continuer après avoir écrit le JSON final.`,
      ``,
      `## CHECKLIST — EXÉCUTE CES ÉTAPES DANS L'ORDRE`,
      ``,
      `Étape 1. Navigue vers : ${loginUrl}`,
      `Étape 2. Attends max 5s que l'élément input[type="email"] soit visible.`,
      `         Si absent après 5s : marque visible_form_de_login=false et passe à l'étape 8.`,
      `Étape 3. Saisis dans input[type="email"] la valeur exacte : "${creds.email}"`,
      `Étape 4. Saisis dans input[type="password"] la valeur exacte : "${creds.password}"`,
      `Étape 5. Clique sur button[type="submit"].`,
      `Étape 6. Attends max 8s que l'URL courante contienne "/dashboard".`,
      `         Si absent après 8s : marque redirect_to__dashboard=false et route__dashboard=false.`,
      `Étape 7. Prends UNE capture d'écran de la page complète. Label: "dashboard_after_login".`,
      `Étape 8. Note toute erreur console de type "error" (ignore les warnings React/Next.js).`,
      `Étape 9. Note toute requête réseau ayant retourné 4xx ou 5xx.`,
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
