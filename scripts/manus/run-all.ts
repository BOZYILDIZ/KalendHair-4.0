#!/usr/bin/env tsx
// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Point d'entrée principal
//
// Usage :
//   tsx scripts/manus/run-all.ts
//   tsx scripts/manus/run-all.ts --scenario login-owner
//   tsx scripts/manus/run-all.ts --tag smoke
//   tsx scripts/manus/run-all.ts --dry-run          ← zéro crédit, simulation complète
//   MANUS_ENV=staging tsx scripts/manus/run-all.ts
// ─────────────────────────────────────────────────────────────────────────────

import { loadEnv, getManusEnv } from "./utils/env";
import { buildTestContext }     from "./core/context";
import { ScenarioRunner }       from "./core/runner";
import { ConsoleReporter, JsonReporter, MarkdownReporter } from "./reporters/index";
import type { ScenarioDefinition } from "./core/types";

// ─── Import des scénarios ──────────────────────────────────────────────────────

import { loginOwner }        from "./scenarios/login-owner";
import { dashboardOverview } from "./scenarios/dashboard-overview";
import { bookingPublic }     from "./scenarios/booking-public";
import { adminLogin }        from "./scenarios/admin-login";
import { sidebar }           from "./scenarios/sidebar";
import { mobileNavigation }  from "./scenarios/mobile-navigation";
import { responsive }        from "./scenarios/responsive";
// ⚠️ Scénario de test contrôlé — uniquement via --scenario test-block-merge
import { testBlockMerge }    from "./scenarios/test-block-merge";

// ─── Registre de tous les scénarios ───────────────────────────────────────────

// Production scenarios (used in default runs)
const PROD_SCENARIOS: ScenarioDefinition[] = [
  loginOwner,
  dashboardOverview,
  bookingPublic,
  adminLogin,
  sidebar,
  mobileNavigation,
  responsive,
];

// Test-only scenarios (accessible via --scenario flag, not in default runs)
const TEST_SCENARIOS: ScenarioDefinition[] = [testBlockMerge];

const ALL_SCENARIOS: ScenarioDefinition[] = [...PROD_SCENARIOS, ...TEST_SCENARIOS];

// ─── Parsing des arguments CLI ─────────────────────────────────────────────────

function parseArgs(argv: string[]): {
  scenarioFilter?: string;
  tagFilter?:      string;
  dryRun:          boolean;
} {
  let scenarioFilter: string | undefined;
  let tagFilter: string | undefined;
  let dryRun = false;

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--scenario" && argv[i + 1]) {
      scenarioFilter = argv[i + 1];
      i++;
    } else if (arg === "--tag" && argv[i + 1]) {
      tagFilter = argv[i + 1];
      i++;
    } else if (arg === "--dry-run") {
      dryRun = true;
    }
  }

  return { scenarioFilter, tagFilter, dryRun };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // 1. Charger l'environnement
  loadEnv();

  const { scenarioFilter, tagFilter, dryRun } = parseArgs(process.argv);

  // 2. Filtrer les scénarios
  // Par défaut : uniquement les scénarios de production
  // --scenario : recherche dans TOUS les scénarios (prod + test)
  let scenarios: ScenarioDefinition[] = scenarioFilter ? ALL_SCENARIOS : PROD_SCENARIOS;

  if (scenarioFilter) {
    scenarios = scenarios.filter((s) => s.name === scenarioFilter);
    if (scenarios.length === 0) {
      const names = ALL_SCENARIOS.map((s) => s.name).join(", ");
      console.error(`❌ Scénario "${scenarioFilter}" introuvable. Disponibles : ${names}`);
      process.exit(1);
    }
  }

  if (tagFilter) {
    scenarios = PROD_SCENARIOS.filter((s) => s.tags.includes(tagFilter));
    if (scenarios.length === 0) {
      const tags = [...new Set(PROD_SCENARIOS.flatMap((s) => s.tags))].join(", ");
      console.error(`❌ Aucun scénario avec le tag "${tagFilter}". Tags disponibles : ${tags}`);
      process.exit(1);
    }
  }

  // 3. Construire le contexte
  const env = getManusEnv();
  const ctx = buildTestContext(env);

  // 4. Configurer les reporters
  const reporters = [
    new ConsoleReporter(),
    new JsonReporter(),
    new MarkdownReporter(),
  ];

  // 5. Lancer le runner
  const runner = new ScenarioRunner(reporters, { dryRun });
  const result = await runner.runAll(scenarios, ctx);

  // 6. Code de sortie selon résultat
  process.exit(result.run.failedScenarios > 0 ? 1 : 0);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error("\n[QA] Erreur critique :", msg);
  process.exit(1);
});
