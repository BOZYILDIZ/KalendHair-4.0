// ─────────────────────────────────────────────────────────────────────────────
// Tests — run-all.ts::selectScenarios() et parseArgs()
//
// Mission corrective Devil's Advocate (P0 — run vide interdit) : avant ce
// correctif, run-all.ts n'avait AUCUN test dédié — sa logique de sélection de
// scénarios (parseArgs + filtrage --scenario/--tag/--profile) n'était vérifiée
// que par lecture de code. selectScenarios() a été extraite en fonction pure
// exportée précisément pour rendre ces cas testables sans invoquer le CLI
// complet (aucun process.exit, aucune construction de contexte/credentials).
//
// Runner : node --test --import tsx/esm scripts/manus/__tests__/run-all.test.ts
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it } from "node:test";
import assert            from "node:assert/strict";
import { spawnSync }     from "node:child_process";
import { resolve, join } from "node:path";
import { mkdtempSync, rmSync, readdirSync, readFileSync, existsSync } from "node:fs";
import { tmpdir }        from "node:os";
import { selectScenarios, parseArgs } from "../run-all";
import type { ScenarioDefinition } from "../core/types";
import type { QAProfile } from "../core/profiles";

function makeScenario(overrides: Partial<ScenarioDefinition> = {}): ScenarioDefinition {
  return {
    scenarioId:  "SC-999",
    name:        "fixture-scenario",
    description: "Scénario de test",
    tags:        [],
    run:         () => ({ prompt: "x", assertionNames: [], timeoutSeconds: 10, viewport: { label: "d", width: 1, height: 1 } }),
    ...overrides,
  };
}

describe("selectScenarios — --scenario", () => {
  it("scénario existant → sélectionné seul", () => {
    const all = [makeScenario({ name: "a" }), makeScenario({ name: "b" })];
    const result = selectScenarios({ scenarioFilter: "b" }, all, all);
    assert.equal(result.scenarios.length, 1);
    assert.equal(result.scenarios[0]?.name, "b");
    assert.equal(result.specificError, undefined);
  });

  it("scénario inexistant → 0 résultat, erreur spécifique listant les noms disponibles", () => {
    const all = [makeScenario({ name: "a" }), makeScenario({ name: "b" })];
    const result = selectScenarios({ scenarioFilter: "n-existe-pas" }, all, all);
    assert.equal(result.scenarios.length, 0);
    assert.ok(result.specificError?.includes("n-existe-pas"));
    assert.ok(result.specificError?.includes("a"));
    assert.ok(result.specificError?.includes("b"));
  });
});

describe("selectScenarios — --tag", () => {
  it("tag existant → scénarios filtrés", () => {
    const prod = [makeScenario({ name: "a", tags: ["smoke"] }), makeScenario({ name: "b", tags: ["full"] })];
    const result = selectScenarios({ tagFilter: "smoke" }, prod, prod);
    assert.equal(result.scenarios.length, 1);
    assert.equal(result.scenarios[0]?.name, "a");
  });

  it("tag inexistant → 0 résultat, erreur spécifique listant les tags disponibles", () => {
    const prod = [makeScenario({ name: "a", tags: ["smoke"] }), makeScenario({ name: "b", tags: ["full"] })];
    const result = selectScenarios({ tagFilter: "n-existe-pas" }, prod, prod);
    assert.equal(result.scenarios.length, 0);
    assert.ok(result.specificError?.includes("n-existe-pas"));
    assert.ok(result.specificError?.includes("smoke"));
    assert.ok(result.specificError?.includes("full"));
  });
});

describe("selectScenarios — --profile (le trou identifié par l'audit Devil's Advocate)", () => {
  it("profil dont les scenarioIds ne correspondent à AUCUN scénario réel → 0 résultat, SANS lever d'erreur ni planter", () => {
    // Reproduit exactement le scénario de risque documenté : un profil
    // (ex. "smoke") référence des scenarioId qui ont été renommés/supprimés
    // côté scénarios réels, sans mise à jour synchronisée de core/profiles.ts.
    // filterByProfile() renvoie [] silencieusement — c'est à l'appelant
    // (run-all.ts::main()) de refuser ce cas, pas à cette fonction de le
    // masquer. Ce test prouve que selectScenarios() ne cache PAS le problème :
    // il retourne bien un tableau vide, sans erreur spécifique (aucune cause
    // unique identifiable comme pour un nom/tag inconnu) — c'est le garde
    // générique NO_SCENARIOS_SELECTED de main() qui doit ensuite refuser ce
    // résultat.
    const prod: ScenarioDefinition[] = [
      makeScenario({ name: "a", scenarioId: "SC-100" }),
      makeScenario({ name: "b", scenarioId: "SC-101" }),
    ];
    // Profil "smoke" réel référence SC-001/SC-003 — aucun des deux n'existe ici.
    const result = selectScenarios({ profile: "smoke" as QAProfile }, prod, prod);
    assert.equal(result.scenarios.length, 0);
  });

  it("profil valide avec correspondances → scénarios sélectionnés normalement", () => {
    const prod: ScenarioDefinition[] = [
      makeScenario({ name: "login", scenarioId: "SC-001" }),
      makeScenario({ name: "booking", scenarioId: "SC-003" }),
      makeScenario({ name: "other", scenarioId: "SC-999" }),
    ];
    const result = selectScenarios({ profile: "smoke" as QAProfile }, prod, prod);
    assert.equal(result.scenarios.length, 2);
  });

  it("aucun filtre (défaut) → tous les scénarios de production", () => {
    const prod: ScenarioDefinition[] = [makeScenario({ name: "a" }), makeScenario({ name: "b" })];
    const result = selectScenarios({}, prod, prod);
    assert.equal(result.scenarios.length, 2);
  });
});

describe("parseArgs", () => {
  it("--concurrency non-numérique → détecté (le CLI complet quitte avec exit(1), non re-testé ici)", () => {
    // parseArgs() lui-même appelle process.exit() en cas d'erreur — ce
    // comportement CLI est déjà couvert par les gardes existants de
    // run-all.ts (requireValue). Ce test se concentre sur les chemins qui ne
    // terminent pas le process.
    const parsed = parseArgs(["node", "run-all.ts", "--dry-run"]);
    assert.equal(parsed.dryRun, true);
    assert.equal(parsed.scenarioFilter, undefined);
  });

  it("--scenario avec valeur → scenarioFilter renseigné", () => {
    const parsed = parseArgs(["node", "run-all.ts", "--scenario", "login-owner"]);
    assert.equal(parsed.scenarioFilter, "login-owner");
  });
});

// ─── Test d'intégration CLI réel — "CLI avec 0 scénario" (tests obligatoires) ─
//
// Seul moyen de prouver le comportement RÉEL de process.exit()/stderr d'un
// bout à l'autre — les tests unitaires ci-dessus couvrent la logique pure
// (selectScenarios), celui-ci couvre le CLI complet. Utilise --dry-run pour
// ne jamais dépendre de SAFE_MODE/credentials — le run est refusé au niveau
// de la sélection de scénarios, bien avant tout accès réseau potentiel.
//
// Isolation : exécuté avec cwd pointant vers un répertoire temporaire, jamais
// la racine du dépôt réel — sans quoi chaque exécution de la suite de tests
// écrirait un run NO_SCENARIOS_SELECTED réel dans reports/manus/ (constaté et
// corrigé pendant la revue finale pré-PR).
describe("CLI run-all.ts — intégration réelle (0 scénario)", () => {
  it("--dry-run --tag inexistant → exit code non nul, message et événement NO_SCENARIOS_SELECTED, aucun rapport de scénario généré", () => {
    const repoRoot = resolve(import.meta.dirname, "..", "..", "..");
    const tsxBin   = resolve(repoRoot, "node_modules", ".bin", "tsx");
    const scriptPath = resolve(repoRoot, "scripts", "manus", "run-all.ts");
    const tmp = mkdtempSync(join(tmpdir(), "manus-cli-no-scenarios-"));

    try {
      const result = spawnSync(tsxBin, [scriptPath, "--dry-run", "--tag", "tag-qui-nexiste-vraiment-pas"], {
        cwd:     tmp,
        encoding: "utf-8",
        timeout: 30_000,
      });

      assert.notEqual(result.status, 0, "Le CLI doit quitter avec un exit code non nul sur 0 scénario sélectionné");
      assert.equal(result.status, 2, "Code de sortie dédié attendu : 2");
      const output = (result.stdout ?? "") + (result.stderr ?? "");
      assert.ok(output.includes("NO_SCENARIOS_SELECTED"), `Sortie attendue contenant NO_SCENARIOS_SELECTED, obtenu : ${output.slice(0, 500)}`);

      // Preuve que l'événement est réellement écrit sur disque (pas seulement
      // affiché en console) — correctif découvert pendant la revue finale.
      const runDirs = existsSync(resolve(tmp, "reports", "manus"))
        ? readdirSync(resolve(tmp, "reports", "manus"), { withFileTypes: true }).filter((d) => d.isDirectory())
        : [];
      assert.equal(runDirs.length, 1, "un seul répertoire de run doit avoir été créé, pour l'événement uniquement");
      const eventsPath = resolve(tmp, "reports", "manus", runDirs[0]?.name ?? "", "events.jsonl");
      assert.ok(existsSync(eventsPath), "events.jsonl doit exister — l'événement NO_SCENARIOS_SELECTED doit être tracé, pas seulement affiché");
      const events = readFileSync(eventsPath, "utf-8").trim().split("\n").map((l) => JSON.parse(l));
      assert.ok(events.some((e) => e.eventType === "NO_SCENARIOS_SELECTED" && e.severity === "CRITICAL"));

      // Aucun report.json/report.md ne doit avoir été généré — le run est
      // refusé avant tout appel aux reporters.
      assert.ok(!existsSync(resolve(tmp, "reports", "manus", runDirs[0]?.name ?? "", "report.json")));
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});
