// ─────────────────────────────────────────────────────────────────────────────
// Scénario : Connexion Admin — v2 QA_EXECUTOR
// Tags     : auth, admin, smoke
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
  expectVisible("Administration", "titre admin"),
  expectRedirect("/admin/login", "/admin"),
  expectRoute("/admin"),
  expectScreenshot("admin_dashboard", "Dashboard administration"),
];

export const adminLogin: ScenarioDefinition = {
  scenarioId:          "SC-004",
  name:                "admin-login",
  description:         "Connexion au back-office admin et vérification de l'accès",
  tags:                ["auth", "admin", "smoke"],
  requiresCredentials: "admin",
  mode:                "QA_EXECUTOR",

  run(ctx) {
    const creds        = ctx.credentials.admin!;
    const adminLoginUrl = `${ctx.baseUrl}/admin/login`;

    const prompt = [
      `# QA-EXECUTOR — admin-login`,
      ``,
      `## RÔLE`,
      `Tu es un exécuteur QA automatisé. Tu n'es pas un assistant. Tu n'es pas un explorateur.`,
      `Tu exécutes UNIQUEMENT les étapes listées, dans l'ordre exact.`,
      `Tu ne prends AUCUNE initiative.`,
      ``,
      `## OBJECTIF`,
      `Vérifier que la connexion admin fonctionne et redirige vers /admin.`,
      ``,
      `## INTERDICTIONS ABSOLUES`,
      `- Ne jamais naviguer au-delà de /admin (accueil du dashboard admin).`,
      `- Ne jamais modifier de données admin.`,
      `- Si une étape échoue : marque l'assertion failed et CONTINUE.`,
      `- Ne jamais continuer après avoir écrit le JSON final.`,
      ``,
      `## CHECKLIST — EXÉCUTE CES ÉTAPES DANS L'ORDRE`,
      ``,
      `Étape 1. Navigue vers : ${adminLoginUrl}`,
      `Étape 2. Attends max 5s que input[type="email"] soit visible.`,
      `         Si absent : marque visible_titre_admin=false et passe à l'étape 7.`,
      `Étape 3. Saisis dans input[type="email"] : "${creds.email}"`,
      `Étape 4. Saisis dans input[type="password"] : "${creds.password}"`,
      `Étape 5. Clique sur button[type="submit"].`,
      `Étape 6. Attends max 8s que l'URL contienne "/admin".`,
      `         Si absent : marque redirect_to__admin=false et route__admin=false.`,
      `Étape 7. Cherche un texte contenant "Administration" dans la page.`,
      `Étape 8. Prends UNE capture d'écran. Label: "admin_dashboard".`,
      `Étape 9. Note toute erreur console (type "error").`,
      `Étape 10. Note toute requête réseau en 4xx ou 5xx.`,
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
