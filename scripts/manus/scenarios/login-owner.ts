// ─────────────────────────────────────────────────────────────────────────────
// Scénario : Connexion Owner
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
  name:        "login-owner",
  description: "Connexion avec les credentials owner et redirection vers le dashboard",
  tags:        ["auth", "smoke", "owner"],

  run(ctx) {
    const creds = ctx.credentials.owner;
    const loginUrl = `${ctx.baseUrl}/login`;

    const credBlock = creds
      ? `Utilise les credentials suivants :\n- Email : ${creds.email}\n- Mot de passe : ${creds.password}`
      : "⚠️ Aucun credential owner configuré (QA_OWNER_EMAIL / QA_OWNER_PASSWORD). " +
        "Si une page de connexion est visible, note que les credentials sont absents.";

    const prompt = [
      `# Mission QA — Scénario : Connexion Owner`,
      ``,
      `## Contexte`,
      `Application : KalendHair (SaaS coiffure multi-tenant)`,
      `URL de départ : ${loginUrl}`,
      ``,
      `## Parcours utilisateur`,
      `1. Ouvre l'URL : ${loginUrl}`,
      `2. Vérifie que la page de connexion est affichée.`,
      `3. ${credBlock}`,
      `4. Soumets le formulaire de connexion.`,
      `5. Vérifie que tu es redirigé vers le dashboard (/dashboard ou similaire).`,
      `6. Vérifie que le dashboard affiche les informations du salon.`,
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
