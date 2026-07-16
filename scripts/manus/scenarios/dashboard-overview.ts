// ─────────────────────────────────────────────────────────────────────────────
// Scénario : Vue d'ensemble Dashboard v2 — v2 QA_EXECUTOR
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
  expectNoConsoleErrors(true),
  expectNoNetworkErrors([404]),
  expectRoute("/dashboard"),
  expectVisible("KPI Cards", "cartes KPI"),
  expectElementCount(".kh-kpi-card, [class*='kpi-card']", 4, "kpi_cards"),
  expectVisible("Agenda du jour", "widget agenda"),
  expectVisible("Alertes", "widget alertes"),
  expectScreenshot("dashboard_overview_desktop", "Dashboard complet vue desktop"),
];

export const dashboardOverview: ScenarioDefinition = {
  scenarioId:          "SC-002",
  name:                "dashboard-overview",
  description:         "Vue d'ensemble du dashboard v2 — KPI, Agenda, Alertes, Sparkline semaine",
  tags:                ["dashboard", "smoke", "owner", "dashboard-v2"],
  requiresCredentials: "owner",
  mode:                "QA_EXECUTOR",

  run(ctx) {
    const creds    = ctx.credentials.owner!;
    const loginUrl = `${ctx.baseUrl}/login`;

    const prompt = [
      `# QA-EXECUTOR — dashboard-overview`,
      ``,
      `## RÔLE`,
      `Tu es un exécuteur QA automatisé. Tu n'es pas un assistant. Tu n'es pas un explorateur.`,
      `Tu exécutes UNIQUEMENT les étapes listées, dans l'ordre exact.`,
      `Tu ne prends AUCUNE initiative.`,
      ``,
      `## OBJECTIF`,
      `Vérifier que le dashboard v2 (KPI Cards, Agenda, Alertes) est complet et sans erreur.`,
      ``,
      `## INTERDICTIONS ABSOLUES`,
      `- Ne jamais ouvrir d'autres pages que login et /dashboard.`,
      `- Ne jamais cliquer sur des éléments non listés.`,
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
      `Étape 7. Attends max 3s supplémentaires que la page soit chargée.`,
      `Étape 8. Vérifie que l'URL contient bien "/dashboard".`,
      `Étape 9. Cherche les éléments avec sélecteur ".kh-kpi-card" ou "[class*='kpi-card']".`,
      `         Note combien tu en trouves (objectif : 4).`,
      `Étape 10. Cherche un texte contenant "Agenda" dans la page.`,
      `Étape 11. Cherche un texte contenant "Alerte" dans la page.`,
      `Étape 12. Prends UNE capture d'écran de la page complète. Label: "dashboard_overview_desktop".`,
      `Étape 13. Note toute erreur console (type "error"). Ignore les warnings React/Next.js.`,
      `Étape 14. Note toute requête réseau en 4xx ou 5xx (ignore 404).`,
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
