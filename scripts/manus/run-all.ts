#!/usr/bin/env tsx
// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Point d'entrée principal (v2.2)
//
// Usage :
//   tsx scripts/manus/run-all.ts
//   tsx scripts/manus/run-all.ts --profile smoke
//   tsx scripts/manus/run-all.ts --profile full --concurrency 3
//   tsx scripts/manus/run-all.ts --scenario login-owner
//   tsx scripts/manus/run-all.ts --tag smoke
//   tsx scripts/manus/run-all.ts --dry-run
//   tsx scripts/manus/run-all.ts --list-profiles
//   MANUS_ENV=staging tsx scripts/manus/run-all.ts --profile standard
// ─────────────────────────────────────────────────────────────────────────────

import { loadEnv, getManusEnv } from "./utils/env";
import { buildTestContext }     from "./core/context";
import { ScenarioRunner, registerDefaultSinks } from "./core/runner";
import { ConsoleReporter, JsonReporter, MarkdownReporter } from "./reporters/index";
import { filterByProfile, printProfileSummary, listProfiles } from "./core/profiles";
import { cleanOldRuns }         from "./analysis/history";
import { isSafeMode, printSafeModeBanner, UNSAFE_FLAG, CONFIRM_FLAG } from "./core/safe-mode";
import { eventLog }             from "./core/events";
import { runId as generateRunId } from "./utils/date";
import type { ScenarioDefinition } from "./core/types";
import type { QAProfile }          from "./core/profiles";

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
//
// Politique stricte (v2.3 — durcissement sécurité) :
//   - Un flag qui attend une valeur ne l'accepte JAMAIS si elle commence par "--"
//     (sinon un flag suivant omis absorbe silencieusement le flag d'après —
//     c'est exactement le bug qui a causé l'incident du 2026-07-11).
//   - Tout flag non reconnu fait échouer le process avec un message explicite,
//     jamais un silence qui retombe sur le comportement par défaut.
// ─────────────────────────────────────────────────────────────────────────────

const VALID_PROFILES: QAProfile[] = ["smoke", "standard", "full", "nightly"];

const KNOWN_FLAGS = [
  "--scenario", "--tag", "--profile", "--concurrency",
  "--dry-run", "--list-profiles", "--help", "-h",
  UNSAFE_FLAG, CONFIRM_FLAG,
];

function printUsage(): void {
  console.log([
    "Usage : tsx scripts/manus/run-all.ts [options]",
    "",
    "  --scenario <name>       Exécute uniquement le scénario nommé",
    "  --tag <tag>             Exécute les scénarios de production portant ce tag",
    "  --profile <name>        smoke | standard | full | nightly",
    "  --concurrency <n>       Nombre d'agents Manus en parallèle (1-8)",
    "  --dry-run               Simulation complète, zéro appel Manus, zéro coût",
    "  --list-profiles         Affiche les profils disponibles et quitte",
    "  --help, -h              Affiche cette aide et quitte",
    "",
    "  Exécution réelle (hors --dry-run) — SAFE_MODE actif par défaut :",
    `    ${UNSAFE_FLAG} ${CONFIRM_FLAG}   Les DEUX flags sont requis simultanément`,
    "                                        pour désactiver SAFE_MODE. Jamais lus",
    "                                        depuis .env.local — à taper à chaque run réel.",
  ].join("\n"));
}

/** Valide qu'un flag à valeur reçoit bien une valeur, jamais un autre flag. */
function requireValue(flagName: string, value: string | undefined): string {
  if (value === undefined || value.startsWith("--")) {
    console.error(`❌ Le flag ${flagName} nécessite une valeur (reçu : ${value ?? "(rien)"}).`);
    process.exit(1);
  }
  return value;
}

export function parseArgs(argv: string[]): {
  scenarioFilter?: string;
  tagFilter?:      string;
  profile?:        QAProfile;
  concurrency?:    number;
  dryRun:          boolean;
  listProfiles:    boolean;
} {
  let scenarioFilter: string | undefined;
  let tagFilter: string | undefined;
  let profile: QAProfile | undefined;
  let concurrency: number | undefined;
  let dryRun      = false;
  let listProfilesFlag = false;

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i] ?? "";

    if (!KNOWN_FLAGS.includes(arg)) {
      console.error(`❌ Flag inconnu : "${arg}"`);
      printUsage();
      process.exit(1);
    }

    if (arg === "--scenario") {
      scenarioFilter = requireValue("--scenario", argv[i + 1]);
      i++;
    } else if (arg === "--tag") {
      tagFilter = requireValue("--tag", argv[i + 1]);
      i++;
    } else if (arg === "--profile") {
      const p = requireValue("--profile", argv[i + 1]) as QAProfile;
      if (!VALID_PROFILES.includes(p)) {
        console.error(`❌ Profil "${p}" invalide. Profils disponibles :\n${listProfiles()}`);
        process.exit(1);
      }
      profile = p;
      i++;
    } else if (arg === "--concurrency") {
      const raw = requireValue("--concurrency", argv[i + 1]);
      const n = parseInt(raw, 10);
      if (isNaN(n) || n < 1) {
        console.error(`❌ --concurrency doit être un entier ≥ 1 (reçu : "${raw}").`);
        process.exit(1);
      }
      concurrency = Math.min(n, 8);
      i++;
    } else if (arg === "--dry-run") {
      dryRun = true;
    } else if (arg === "--list-profiles") {
      listProfilesFlag = true;
    } else if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    }
    // UNSAFE_FLAG / CONFIRM_FLAG : reconnus (KNOWN_FLAGS) mais lus directement
    // par core/safe-mode.ts depuis process.argv — aucune action ici.
  }

  return { scenarioFilter, tagFilter, profile, concurrency, dryRun, listProfiles: listProfilesFlag };
}

// ─── Sélection des scénarios ────────────────────────────────────────────────
//
// Extraite en fonction pure (mission corrective Devil's Advocate) pour être
// testable unitairement sans invoquer le CLI complet — c'est ce qui permet de
// couvrir par test : profil vide, tag inexistant, scénario inexistant, filtre
// produisant 0 scénario, sans jamais construire de contexte/credentials réels.

export interface ScenarioSelectionResult {
  scenarios:      ScenarioDefinition[];
  /** Message d'erreur spécifique quand la cause est identifiable (nom/tag introuvable). */
  specificError?: string;
}

export function selectScenarios(
  opts: { scenarioFilter?: string; tagFilter?: string; profile?: QAProfile },
  allScenarios:  ScenarioDefinition[],
  prodScenarios: ScenarioDefinition[],
): ScenarioSelectionResult {
  const { scenarioFilter, tagFilter, profile } = opts;

  if (scenarioFilter) {
    const scenarios = allScenarios.filter((s) => s.name === scenarioFilter);
    if (scenarios.length === 0) {
      const names = allScenarios.map((s) => s.name).join(", ");
      return { scenarios: [], specificError: `Scénario "${scenarioFilter}" introuvable. Disponibles : ${names}` };
    }
    return { scenarios };
  }

  if (tagFilter) {
    const scenarios = prodScenarios.filter((s) => s.tags.includes(tagFilter));
    if (scenarios.length === 0) {
      const tags = [...new Set(prodScenarios.flatMap((s) => s.tags))].join(", ");
      return { scenarios: [], specificError: `Aucun scénario avec le tag "${tagFilter}". Tags disponibles : ${tags}` };
    }
    return { scenarios };
  }

  if (profile) {
    // Correctif Devil's Advocate — c'était ici le trou dans la raquette :
    // contrairement aux deux branches ci-dessus, ce chemin ne validait jamais
    // que filterByProfile() avait retourné un résultat non vide. Le garde
    // générique NO_SCENARIOS_SELECTED (appliqué par l'appelant, main()) couvre
    // désormais ce cas — pas d'erreur spécifique ici, le message générique
    // suffit (aucune cause unique identifiable comme pour un nom/tag inconnu).
    return { scenarios: filterByProfile(prodScenarios, profile) };
  }

  return { scenarios: prodScenarios };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // 1. Charger l'environnement
  loadEnv();

  const { scenarioFilter, tagFilter, profile, concurrency, dryRun, listProfiles: showProfiles } = parseArgs(process.argv);

  printSafeModeBanner(process.argv);

  // --list-profiles : afficher les profils et quitter
  if (showProfiles) {
    console.log("\nProfils QA disponibles :\n");
    console.log(listProfiles());
    process.exit(0);
  }

  // Blocage précoce : toute exécution réelle (hors --dry-run) est refusée si
  // SAFE_MODE est actif — échec rapide et explicite AVANT tout accès aux
  // credentials/contexte, plutôt qu'un échec profond dans client/index.ts.
  if (!dryRun && isSafeMode(process.argv)) {
    console.error(
      "\n❌ Exécution réelle refusée — SAFE_MODE actif (comportement par défaut).\n" +
      `   Relancez avec --dry-run pour simuler sans risque, ou avec les DEUX flags\n` +
      `   ${UNSAFE_FLAG} ${CONFIRM_FLAG} pour confirmer explicitement une dépense de crédits Manus.`
    );
    process.exit(1);
  }

  // 2. Filtrer les scénarios
  // Priorité : --scenario > --tag > --profile > défaut (tous prod)
  const selection = selectScenarios({ scenarioFilter, tagFilter, profile }, ALL_SCENARIOS, PROD_SCENARIOS);
  const scenarios = selection.scenarios;

  if (profile && scenarios.length > 0) {
    printProfileSummary(profile, scenarios.length);
  }

  // ── Garde P0 (mission corrective Devil's Advocate) ─────────────────────────
  // Un run à 0 scénario est REFUSÉ ici, avant toute construction de contexte/
  // credentials — jamais exécuté, jamais scoré, jamais un READY_FOR_MERGE
  // possible. Couvre uniformément --scenario/--tag (déjà gardés avant ce
  // correctif, message spécifique conservé) ET --profile (le trou identifié
  // par l'audit : filterByProfile() pouvait renvoyer [] sans jamais être
  // vérifié, laissant le run vide atteindre computeQAScore() qui, avant son
  // propre correctif, produisait 90/100 READY_FOR_MERGE).
  if (scenarios.length === 0) {
    const reason = selection.specificError ?? "Aucun scénario ne correspond aux critères de sélection (profil vide ou désynchronisé).";
    // Correctif découvert lors de la revue finale pré-PR : ce chemin CLI (le
    // seul réellement emprunté en usage normal — la garde symétrique de
    // core/runner.ts::runAll() n'est qu'une défense en profondeur jamais
    // atteinte ici, puisqu'on quitte avant de l'appeler) n'émettait auparavant
    // AUCUN événement runtime, malgré l'exigence explicite d'un "événement
    // runtime dédié" pour NO_SCENARIOS_SELECTED. Corrigé : les sinks par
    // défaut sont enregistrés et l'événement est émis avant la sortie du
    // process, pour que ce refus soit traçable dans events.jsonl comme
    // n'importe quel autre événement CRITICAL.
    registerDefaultSinks();
    eventLog.setRunId(generateRunId());
    eventLog.emit("NO_SCENARIOS_SELECTED", "CRITICAL", { reason });
    console.error(`\n🚫 NO_SCENARIOS_SELECTED — ${reason}\n`);
    process.exit(2);
  }

  // 3. Nettoyage automatique des anciens runs
  const cleaned = cleanOldRuns();
  if (cleaned.removed.length > 0) {
    console.log(`🗑  Nettoyage : ${cleaned.removed.length} run(s) supprimé(s) | conservés : ${cleaned.kept}`);
  }

  // 4. Construire le contexte
  const env = getManusEnv();
  const ctx = buildTestContext(env);

  // 5. Configurer les reporters
  const reporters = [
    new ConsoleReporter(),
    new JsonReporter(),
    new MarkdownReporter(),
  ];

  // 6. Lancer le runner
  const runner = new ScenarioRunner(reporters, { dryRun, maxConcurrent: concurrency });
  const result = await runner.runAll(scenarios, ctx);

  // 7. Code de sortie selon résultat
  // Défense en profondeur : ce cas ne devrait jamais se produire (le garde
  // ci-dessus a déjà refusé tout run à 0 scénario avant d'atteindre le
  // runner) — mais si un futur refactor supprimait accidentellement ce garde,
  // le garde symétrique de core/runner.ts::runAll() empêcherait quand même un
  // exit code 0 trompeur pour un run qui n'a jamais eu lieu.
  if (result.score.verdict === "NO_SCENARIOS_SELECTED") {
    process.exit(2);
  }
  process.exit(result.run.failedScenarios > 0 ? 1 : 0);
}

// Gardé derrière import.meta.url — découvert pendant l'écriture des tests de
// cette mission corrective : run-all.ts était le SEUL point d'entrée CLI du
// framework sans cette garde (déjà appliquée à generate-dashboard.ts,
// retention-cli.ts, analysis/auto-audit.ts). Sans elle, un simple
// `import { selectScenarios } from "../run-all"` dans un test unitaire
// déclenchait l'exécution réelle de main() en effet de bord — y compris son
// process.exit() — un risque resté invisible faute de tout test important
// (au sens littéral : via `import`) ce module jusqu'à cette mission.
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("\n[QA] Erreur critique :", msg);
    process.exit(1);
  });
}
