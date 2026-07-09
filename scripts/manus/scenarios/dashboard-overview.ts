// ─────────────────────────────────────────────────────────────────────────────
// Scénario : Vue d'ensemble Dashboard (v2)
// Tags     : dashboard, smoke, owner, dashboard-v2
// ─────────────────────────────────────────────────────────────────────────────

import {
  expectNoConsoleErrors,
  expectNoNetworkErrors,
  expectVisible,
  expectRoute,
  expectElementCount,
  expectScreenshot,
  buildAssertionsBlock,
  assertionNames,
} from "../core/assertions";
import { VIEWPORTS } from "../core/types";
import type { ScenarioDefinition } from "../core/types";

const ASSERTIONS = [
  expectNoConsoleErrors(true), // Allow React dev warnings
  expectNoNetworkErrors([404]),
  expectRoute("/dashboard"),
  expectVisible("KPI Cards", "cartes KPI"),
  expectElementCount(".kh-kpi-card, [class*='kpi-card']", 4, "kpi_cards"),
  expectVisible("Agenda du jour", "widget agenda"),
  expectVisible("Alertes", "widget alertes"),
  expectScreenshot("dashboard_overview_desktop", "Dashboard complet vue desktop"),
  expectScreenshot("dashboard_kpi_section", "Section KPI Cards"),
];

export const dashboardOverview: ScenarioDefinition = {
  name:        "dashboard-overview",
  description: "Vue d'ensemble du dashboard v2 — KPI, Agenda, Alertes, Sparkline semaine",
  tags:        ["dashboard", "smoke", "owner", "dashboard-v2"],

  run(ctx) {
    const dashUrl = `${ctx.baseUrl}/dashboard`;
    const creds   = ctx.credentials.owner;

    const authBlock = creds
      ? `Si la page de connexion s'affiche, connecte-toi avec :\n- Email : ${creds.email}\n- Mot de passe : ${creds.password}`
      : "Si une page de connexion s'affiche, note que les credentials ne sont pas configurés.";

    const prompt = [
      `# Mission QA — Scénario : Dashboard Overview`,
      ``,
      `## Contexte`,
      `Application : KalendHair Dashboard v2 (Epic 01)`,
      `URL : ${dashUrl}`,
      ``,
      `## Parcours utilisateur`,
      `1. Navigue vers : ${dashUrl}`,
      `2. ${authBlock}`,
      `3. Vérifie que le dashboard est affiché.`,
      `4. Identifie les zones suivantes :`,
      `   - Zone A : KPI Cards (revenus, RDV, clients, taux)`,
      `   - Zone B : Agenda du jour (liste des RDV)`,
      `   - Zone C : Équipe du jour (avatars employés)`,
      `   - Zone D : Alertes (stocks, paiements, essai)`,
      `   - Zone E : Sparkline semaine (graphique revenus)`,
      `5. Note si des widgets sont en état de chargement (skeleton) ou d'erreur.`,
      `6. Vérifie l'absence d'erreurs JS et réseau.`,
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
