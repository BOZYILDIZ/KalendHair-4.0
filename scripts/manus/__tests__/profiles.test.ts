// ─────────────────────────────────────────────────────────────────────────────
// Tests — core/profiles.ts
// Runner : node --test --import tsx/esm scripts/manus/__tests__/profiles.test.ts
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it } from "node:test";
import assert            from "node:assert/strict";
import { filterByProfile, getProfile, listProfiles, PROFILES } from "../core/profiles";
import type { ScenarioDefinition }                              from "../core/types";
import { VIEWPORTS }                                            from "../core/types";

function makeScenario(id: string, tags: string[] = []): ScenarioDefinition {
  return {
    scenarioId:  id,
    name:        `scenario-${id.toLowerCase()}`,
    description: `Test ${id}`,
    tags,
    run:         () => ({
      prompt:         "test",
      assertionNames: [],
      timeoutSeconds: 60,
      viewport:       VIEWPORTS.desktop,
    }),
  };
}

const ALL_SCENARIOS: ScenarioDefinition[] = [
  makeScenario("SC-001", ["auth", "smoke"]),
  makeScenario("SC-002", ["dashboard", "smoke"]),
  makeScenario("SC-003", ["booking", "smoke"]),
  makeScenario("SC-004", ["auth", "admin", "smoke"]),
  makeScenario("SC-005", ["nav", "smoke"]),
  makeScenario("SC-006", ["mobile", "responsive"]),
  makeScenario("SC-007", ["responsive", "visual"]),
];

describe("filterByProfile", () => {
  it("smoke — retourne SC-001 et SC-003", () => {
    const result = filterByProfile(ALL_SCENARIOS, "smoke");
    assert.deepEqual(result.map((s) => s.scenarioId), ["SC-001", "SC-003"]);
  });

  it("standard — retourne SC-001 à SC-005", () => {
    const result = filterByProfile(ALL_SCENARIOS, "standard");
    assert.deepEqual(result.map((s) => s.scenarioId), ["SC-001", "SC-002", "SC-003", "SC-004", "SC-005"]);
  });

  it("full — retourne tous les scénarios (scenarioIds vide)", () => {
    const result = filterByProfile(ALL_SCENARIOS, "full");
    assert.equal(result.length, ALL_SCENARIOS.length);
  });

  it("nightly — retourne tous les scénarios (scenarioIds vide)", () => {
    const result = filterByProfile(ALL_SCENARIOS, "nightly");
    assert.equal(result.length, ALL_SCENARIOS.length);
  });

  it("préserve l'ordre des scénarios", () => {
    const result = filterByProfile(ALL_SCENARIOS, "smoke");
    assert.equal(result[0]?.scenarioId, "SC-001");
    assert.equal(result[1]?.scenarioId, "SC-003");
  });
});

describe("getProfile", () => {
  it("retourne la config pour un profil valide", () => {
    const p = getProfile("smoke");
    assert.ok(p !== null);
    assert.equal(p!.name, "SMOKE");
    assert.equal(p!.nightly, false);
  });

  it("retourne null pour un profil inconnu", () => {
    const p = getProfile("unknown");
    assert.equal(p, null);
  });

  it("nightly a nightly=true", () => {
    const p = getProfile("nightly");
    assert.equal(p!.nightly, true);
  });
});

describe("PROFILES", () => {
  it("4 profils définis", () => {
    const keys = Object.keys(PROFILES);
    assert.equal(keys.length, 4);
    assert.deepEqual(keys.sort(), ["full", "nightly", "smoke", "standard"]);
  });

  it("chaque profil a name, description, costEst, durationEst", () => {
    for (const [key, p] of Object.entries(PROFILES)) {
      assert.ok(p.name,        `${key}: name manquant`);
      assert.ok(p.description, `${key}: description manquant`);
      assert.ok(p.costEst,     `${key}: costEst manquant`);
      assert.ok(p.durationEst, `${key}: durationEst manquant`);
    }
  });
});

describe("listProfiles", () => {
  it("retourne une chaîne contenant les 4 profils", () => {
    const list = listProfiles();
    assert.ok(list.includes("smoke"));
    assert.ok(list.includes("standard"));
    assert.ok(list.includes("full"));
    assert.ok(list.includes("nightly"));
  });
});
