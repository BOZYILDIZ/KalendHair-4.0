// ─────────────────────────────────────────────────────────────────────────────
// Tests — core/score.ts
// Runner : node --test --import tsx/esm scripts/manus/__tests__/score.test.ts
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it } from "node:test";
import assert            from "node:assert/strict";
import { computeQAScore, scoreBar, verdictLabel } from "../core/score";
import type { TestRunResult, ScenarioResult }      from "../core/types";
import { VIEWPORTS }                               from "../core/types";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeScenario(overrides: Partial<ScenarioResult> = {}): ScenarioResult {
  return {
    name:          "test-scenario",
    description:   "Test",
    scenarioId:    "SC-000",
    tags:          [],
    status:        "passed",
    durationMs:    5000,
    taskId:        "task-1",
    viewport:      VIEWPORTS.desktop,
    urlsVisited:   [],
    assertions:    [{ name: "assert-1", passed: true,  message: "ok" }],
    screenshots:   [],
    consoleErrors: [],
    networkErrors: [],
    artifacts:     [],
    startedAt:     "2026-01-01T00:00:00.000Z",
    completedAt:   "2026-01-01T00:00:05.000Z",
    ...overrides,
  };
}

function makeRun(scenarios: ScenarioResult[]): TestRunResult {
  return {
    runId:           "run-test",
    environment:     "local",
    baseUrl:         "http://localhost:3000",
    startedAt:       "2026-01-01T00:00:00.000Z",
    completedAt:     "2026-01-01T00:01:00.000Z",
    durationMs:      60000,
    totalScenarios:  scenarios.length,
    passedScenarios: scenarios.filter((s) => s.status === "passed").length,
    failedScenarios: scenarios.filter((s) => s.status !== "passed").length,
    scenarios,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("computeQAScore", () => {
  it("score maximal : run parfait", () => {
    const sc = makeScenario({
      assertions:    [
        { name: "a1", passed: true, message: "ok" },
        { name: "a2", passed: true, message: "ok" },
      ],
      consoleErrors: [],
      networkErrors: [],
      screenshots:   [{ label: "home" }],
      durationMs:    10000,
    });
    const run = makeRun([sc]);
    const score = computeQAScore(run);

    assert.ok(score.total >= 80, `Score attendu ≥ 80, obtenu ${score.total}`);
    assert.equal(score.verdict, "READY_FOR_MERGE");
    assert.equal(score.breakdown.assertions, 30);
    assert.equal(score.breakdown.console, 20);
    assert.equal(score.breakdown.network, 20);
  });

  it("score minimal : run entièrement en erreur", () => {
    const sc = makeScenario({
      status:        "error",
      assertions:    [{ name: "a1", passed: false, message: "fail" }],
      consoleErrors: ["err1", "err2", "err3", "err4", "err5"],
      networkErrors: ["net1", "net2", "net3", "net4", "net5"],
      durationMs:    200000,
    });
    const run = makeRun([sc]);
    const score = computeQAScore(run);

    assert.ok(score.total < 80, `Score attendu < 80, obtenu ${score.total}`);
    assert.equal(score.verdict, "BLOCK_MERGE");
  });

  it("qaInfraBlocked détecté quand tous les scénarios sont en timeout", () => {
    const sc1 = makeScenario({ status: "timeout", assertions: [], consoleErrors: [], networkErrors: [] });
    const sc2 = makeScenario({ status: "timeout", assertions: [], consoleErrors: [], networkErrors: [] });
    const run = makeRun([sc1, sc2]);
    const score = computeQAScore(run);

    assert.equal(score.qaInfraBlocked, true);
    assert.equal(score.breakdown.console, 0);
    assert.equal(score.breakdown.network, 0);
  });

  it("scoring responsive via tags — tag 'responsive'", () => {
    const passed = makeScenario({ tags: ["responsive"], status: "passed" });
    const failed = makeScenario({ tags: ["responsive"], status: "failed", assertions: [{ name: "a1", passed: false, message: "fail" }] });
    const run = makeRun([passed, failed]);
    const score = computeQAScore(run);

    // 1 passed / 2 total → 5/10
    assert.equal(score.breakdown.responsive, 5);
  });

  it("scoring responsive via tags — tag 'mobile'", () => {
    const sc = makeScenario({ tags: ["mobile"], status: "passed" });
    const run = makeRun([sc]);
    const score = computeQAScore(run);
    assert.equal(score.breakdown.responsive, 10);
  });

  it("scoring responsive neutre (5/10) quand aucun scénario responsive", () => {
    const sc = makeScenario({ tags: ["auth"], status: "passed" });
    const run = makeRun([sc]);
    const score = computeQAScore(run);
    assert.equal(score.breakdown.responsive, 5);
  });

  it("performance : scénario rapide (<30s) → 5 pts", () => {
    const sc = makeScenario({ durationMs: 10000 });
    const run = makeRun([sc]);
    const score = computeQAScore(run);
    assert.equal(score.breakdown.performance, 5);
  });

  it("performance : scénario lent (>120s) → 0 pts", () => {
    const sc = makeScenario({ durationMs: 150000 });
    const run = makeRun([sc]);
    const score = computeQAScore(run);
    assert.equal(score.breakdown.performance, 0);
  });

  it("run vide → NO_SCENARIOS_SELECTED, score 0, jamais READY_FOR_MERGE (correctif Devil's Advocate)", () => {
    // Ce test documentait auparavant le BUG lui-même (score 90/100 sur un run
    // à 0 scénario, verdict READY_FOR_MERGE) — corrigé pour affirmer le
    // comportement désormais correct, pas supprimé (le bug était réel et ce
    // test en est la preuve de non-régression).
    const run = makeRun([]);
    const score = computeQAScore(run);
    assert.equal(score.total, 0);
    assert.equal(score.verdict, "NO_SCENARIOS_SELECTED");
    assert.notEqual(score.verdict, "READY_FOR_MERGE");
    assert.deepEqual(score.breakdown, {
      assertions: 0, console: 0, network: 0,
      responsive: 0, accessibility: 0, screenshots: 0, performance: 0,
    });
  });

  it("infra bloquée (tous en erreur, ex: credentials manquants) → assertions et performance à 0, jamais READY_FOR_MERGE", () => {
    // Correctif Devil's Advocate : avant ce correctif, totalAssert===0
    // (assertions:[] pour un scénario en erreur credentials-manquants)
    // retombait sur un ratio de 1 (30/30) au lieu de 0, et "performance" (5 pts)
    // n'était jamais neutralisée par qaInfraBlocked — un run où RIEN n'a été
    // vérifié pouvait cumuler jusqu'à 35/100 au lieu de 0.
    const sc1 = makeScenario({ status: "error", assertions: [], consoleErrors: [], networkErrors: [], durationMs: 1 });
    const sc2 = makeScenario({ status: "error", assertions: [], consoleErrors: [], networkErrors: [], durationMs: 1 });
    const run = makeRun([sc1, sc2]);
    const score = computeQAScore(run);

    assert.equal(score.qaInfraBlocked, true);
    assert.equal(score.breakdown.assertions, 0, "assertions doit être 0 quand aucune assertion n'a jamais pu s'exécuter");
    assert.equal(score.breakdown.performance, 0, "performance doit être 0 sur une infra bloquée, même en cas d'échec rapide");
    assert.equal(score.total, 0);
    assert.notEqual(score.verdict, "READY_FOR_MERGE");
  });

  it("scénarios non-vides mais tous en timeout avec assertions renseignées : ratio réel utilisé, pas le repli qaInfraBlocked", () => {
    // Garde-fou de non-régression : le correctif ne doit pas neutraliser le
    // calcul du ratio réel quand des assertions existent effectivement.
    const sc = makeScenario({
      status: "timeout",
      assertions: [
        { name: "a1", passed: false, message: "timeout" },
        { name: "a2", passed: false, message: "timeout" },
      ],
    });
    const run = makeRun([sc]);
    const score = computeQAScore(run);
    assert.equal(score.qaInfraBlocked, true);
    assert.equal(score.breakdown.assertions, 0); // 0/2 passées
  });
});

describe("scoreBar", () => {
  it("100 → 20 blocs pleins", () => {
    const bar = scoreBar(100);
    assert.equal(bar, "█".repeat(20));
  });

  it("0 → 20 blocs vides", () => {
    const bar = scoreBar(0);
    assert.equal(bar, "░".repeat(20));
  });

  it("longueur toujours 20", () => {
    for (const n of [0, 25, 50, 75, 100]) {
      const bar = scoreBar(n);
      assert.equal(bar.length, 20, `scoreBar(${n}).length !== 20`);
    }
  });
});

describe("verdictLabel", () => {
  it("READY_FOR_MERGE → label positif", () => {
    const label = verdictLabel({ total: 85, verdict: "READY_FOR_MERGE", threshold: 80, breakdown: {} as never });
    assert.ok(label.includes("READY"));
  });

  it("BLOCK_MERGE → label bloquant", () => {
    const label = verdictLabel({ total: 60, verdict: "BLOCK_MERGE", threshold: 80, breakdown: {} as never });
    assert.ok(label.includes("BLOCK"));
  });

  it("NO_SCENARIOS_SELECTED → label distinct, jamais confondu avec READY", () => {
    const label = verdictLabel({ total: 0, verdict: "NO_SCENARIOS_SELECTED", threshold: 80, breakdown: {} as never });
    assert.ok(label.includes("NO SCENARIOS SELECTED"));
    assert.ok(!label.includes("READY"));
  });
});
