// ─────────────────────────────────────────────────────────────────────────────
// Scénario : Connexion Admin (back-office)
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
  name:        "admin-login",
  description: "Connexion au back-office admin et vérification de l'accès",
  tags:        ["auth", "admin", "smoke"],

  run(ctx) {
    const adminLoginUrl = `${ctx.baseUrl}/admin/login`;
    const creds         = ctx.credentials.admin;

    const credBlock = creds
      ? `Utilise les credentials admin suivants :\n- Email : ${creds.email}\n- Mot de passe : ${creds.password}`
      : "⚠️ Aucun credential admin configuré (QA_ADMIN_EMAIL / QA_ADMIN_PASSWORD). " +
        "Vérifie simplement que la page de connexion admin est accessible.";

    const prompt = [
      `# Mission QA — Scénario : Admin Login`,
      ``,
      `## Contexte`,
      `Application : KalendHair — Back-office administration`,
      `URL de départ : ${adminLoginUrl}`,
      ``,
      `## Règle de sécurité importante`,
      `⚠️ Le back-office admin est réservé à l'équipe interne KalendHair.`,
      `Il ne doit PAS être accessible depuis un compte owner/manager normal.`,
      ``,
      `## Parcours utilisateur`,
      `1. Navigue vers : ${adminLoginUrl}`,
      `2. Vérifie que la page de connexion admin est affichée.`,
      `3. ${credBlock}`,
      `4. Soumets le formulaire.`,
      `5. Vérifie la redirection vers /admin.`,
      `6. Vérifie que le dashboard admin est affiché.`,
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
