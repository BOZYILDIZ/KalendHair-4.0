/**
 * Scénario QA Manus — PR-06 Secondary Dashboard Widgets
 *
 * Tests de régression : vérifie que DASHBOARD_V2=false ne change rien
 * à l'interface existante après ajout des composants PR-06.
 *
 * Lancement :
 *   MANUS_API_KEY=sk-... BASE_URL=https://staging.kalendhair.fr \
 *   tsx scripts/manus/scenarios/pr-06-regression.ts
 */

import { runManusTask, type ManusTaskResult } from "../manus-client";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

// ─── Scénarios ────────────────────────────────────────────────────────────────

const SCENARIOS = [
  {
    name: "Régression dashboard — Owner Desktop",
    prompt: `
Tu es un testeur QA pour KalendHair, un SaaS de gestion de salon de coiffure.

URL de base : ${BASE_URL}

Étapes :
1. Navigue sur ${BASE_URL}/login
2. Connecte-toi avec un compte Owner valide
3. Vérifie que tu arrives sur ${BASE_URL}/dashboard
4. Prends une capture d'écran de la page complète
5. Vérifie qu'aucun nouveau composant inattendu n'apparaît (aucun widget sparkline, aucune liste d'équipe, aucun widget alerte en dehors du layout actuel)
6. Navigue sur /dashboard/agenda — prends une capture
7. Navigue sur /dashboard/kpi — prends une capture
8. Vérifie qu'il n'y a aucune erreur dans la console JavaScript
9. Vérifie qu'il n'y a aucune requête réseau en erreur (4xx/5xx)
10. Rapport : confirme que l'interface est identique à la version précédente

Résultat attendu :
- Dashboard identique à avant PR-06
- 0 erreur console
- 0 requête réseau échouée
- DASHBOARD_V2=false confirmé (pas de nouvelle sidebar visible)
    `.trim(),
  },

  {
    name: "Régression mobile — Dashboard 390px",
    prompt: `
Tu es un testeur QA pour KalendHair.

URL de base : ${BASE_URL}

Étapes :
1. Configure la fenêtre en mode mobile 390×844px
2. Navigue sur ${BASE_URL}/login et connecte-toi
3. Vérifie que /dashboard s'affiche sans scroll horizontal
4. Prends une capture d'écran de la page complète
5. Clique sur le bouton hamburger — vérifie que le menu s'ouvre correctement
6. Prends une capture du menu ouvert
7. Ferme le menu en cliquant sur le fond grisé
8. Vérifie qu'il n'y a aucune erreur console

Résultat attendu :
- Aucun scroll horizontal
- Burger menu fonctionnel
- Header mobile 56px visible
- 0 erreur console
    `.trim(),
  },

  {
    name: "Vérification CSS — aucun side-effect globals.css",
    prompt: `
Tu es un testeur QA pour KalendHair.

URL de base : ${BASE_URL}

Étapes :
1. Navigue sur ${BASE_URL}/login et connecte-toi
2. Sur /dashboard, inspecte les éléments avec la classe CSS ".kh-sidebar-item"
3. Hover sur un item de navigation — vérifie que le fond change correctement (rgba blanc 6%)
4. Vérifie qu'aucun élément ".kh-team-row" n'existe dans le DOM
5. Vérifie qu'aucun élément ".kh-shimmer" n'est visible à l'écran
6. Prends une capture de l'état hover sur la sidebar

Résultat attendu :
- Hover sidebar fonctionne normalement
- Aucun élément ".kh-team-row" dans le DOM
- Aucun skeleton visible
    `.trim(),
  },
];

// ─── Runner ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  KalendHair — Manus QA — PR-06 Régression");
  console.log(`  Base URL : ${BASE_URL}`);
  console.log("═══════════════════════════════════════════════════════\n");

  const results: Array<{ name: string; result: ManusTaskResult }> = [];

  for (const scenario of SCENARIOS) {
    console.log(`\n▶ ${scenario.name}`);
    console.log("─".repeat(50));

    const result = await runManusTask({
      prompt:         scenario.prompt,
      baseUrl:        BASE_URL,
      timeoutSeconds: 180,
    });

    results.push({ name: scenario.name, result });

    console.log(`  Statut : ${result.status}`);
    if (result.summary) console.log(`  Résumé : ${result.summary}`);
    if (result.error)   console.log(`  Erreur : ${result.error}`);
    if (result.artifacts.length > 0) {
      console.log(`  Artefacts : ${result.artifacts.map((a) => a.name).join(", ")}`);
    }
  }

  // ── Résumé final ──────────────────────────────────────────────────────────
  console.log("\n\n═══════════════════════════════════════════════════════");
  console.log("  RÉSUMÉ FINAL");
  console.log("═══════════════════════════════════════════════════════");

  let passed = 0;
  let failed = 0;

  for (const { name, result } of results) {
    const icon = result.status === "completed" ? "✅" : "❌";
    console.log(`${icon} ${name} — ${result.status}`);
    if (result.status === "completed") passed++;
    else failed++;
  }

  console.log(`\nTotal : ${passed} réussi(s), ${failed} échoué(s)`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("[Manus] Erreur critique :", err.message);
  process.exit(1);
});
