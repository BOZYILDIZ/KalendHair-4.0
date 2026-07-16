// ─────────────────────────────────────────────────────────────────────────────
// Tests — generate-dashboard.ts (agrégation Runtime Events, v2.5.1)
// Runner : node --test --import tsx/esm scripts/manus/__tests__/generate-dashboard.test.ts
//
// L'import de generate-dashboard.ts est sûr (aucun effet de bord) grâce à la
// garde import.meta.url ajoutée pour cette mission — un simple import ne lit
// ni n'écrit jamais dashboard.json/index.html réels.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { resolve, join } from "path";
import { loadEventsSummaries, aggregateRuntimeEvents, generateDashboard } from "../generate-dashboard";
import type { EventsSummary } from "../core/sinks/dashboard-sink";

function makeSummary(overrides: Partial<EventsSummary> = {}): EventsSummary {
  return {
    runId: "run-1",
    totalEvents: 0,
    countsByType: {},
    countsBySeverity: {},
    totalActualCostUsd: 0,
    estimatedCostRanges: [],
    lastUpdated: new Date().toISOString(),
    ...overrides,
  };
}

describe("loadEventsSummaries — gestion des anciens runs", () => {
  let tmp: string;
  beforeEach(() => { tmp = mkdtempSync(join(tmpdir(), "manus-dash-summaries-")); });
  afterEach(() => rmSync(tmp, { recursive: true, force: true }));

  it("ignore proprement un run sans events-summary.json (pas une erreur)", () => {
    mkdirSync(resolve(tmp, "2026-01-01_00-00-00"), { recursive: true });
    const summaries = loadEventsSummaries(["2026-01-01_00-00-00"], tmp);
    assert.equal(summaries.length, 0);
  });

  it("charge un events-summary.json présent", () => {
    const dir = resolve(tmp, "2026-01-01_00-00-00");
    mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, "events-summary.json"), JSON.stringify(makeSummary({ runId: "2026-01-01_00-00-00", totalEvents: 5 })));
    const summaries = loadEventsSummaries(["2026-01-01_00-00-00"], tmp);
    assert.equal(summaries.length, 1);
    assert.equal(summaries[0]?.totalEvents, 5);
  });

  it("ignore un fichier events-summary.json corrompu sans planter", () => {
    const dir = resolve(tmp, "2026-01-01_00-00-00");
    mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, "events-summary.json"), "{ ceci n'est pas du JSON valide");
    assert.doesNotThrow(() => loadEventsSummaries(["2026-01-01_00-00-00"], tmp));
    assert.equal(loadEventsSummaries(["2026-01-01_00-00-00"], tmp).length, 0);
  });

  it("mélange runs avec et sans events-summary.json sans erreur", () => {
    mkdirSync(resolve(tmp, "run-old"), { recursive: true });
    const dirNew = resolve(tmp, "run-new");
    mkdirSync(dirNew, { recursive: true });
    writeFileSync(resolve(dirNew, "events-summary.json"), JSON.stringify(makeSummary({ runId: "run-new" })));
    const summaries = loadEventsSummaries(["run-old", "run-new"], tmp);
    assert.equal(summaries.length, 1);
  });
});

describe("aggregateRuntimeEvents", () => {
  it("agrège les compteurs par type sur plusieurs runs", () => {
    const summaries = [
      makeSummary({ totalEvents: 3, countsByType: { DRY_RUN: 2, REPORT_GENERATED: 1 } }),
      makeSummary({ totalEvents: 2, countsByType: { DRY_RUN: 1, SAFE_MODE_BLOCKED: 1 } }),
    ];
    const agg = aggregateRuntimeEvents(summaries, 2);
    assert.equal(agg.totalEvents, 5);
    assert.equal(agg.countsByType["DRY_RUN"], 3);
    assert.equal(agg.countsByType["SAFE_MODE_BLOCKED"], 1);
    assert.equal(agg.runsWithEvents, 2);
    assert.equal(agg.runsWithoutEvents, 0);
  });

  it("calcule runsWithoutEvents correctement", () => {
    const summaries = [makeSummary({ totalEvents: 1 })];
    const agg = aggregateRuntimeEvents(summaries, 5); // 5 runs au total, 1 seul avec données
    assert.equal(agg.runsWithEvents, 1);
    assert.equal(agg.runsWithoutEvents, 4);
  });

  it("somme les coûts réels et déduplique les plages estimées", () => {
    const summaries = [
      makeSummary({ totalActualCostUsd: 0.05, estimatedCostRanges: ["~$0.05–$0.14"] }),
      makeSummary({ totalActualCostUsd: 0.03, estimatedCostRanges: ["~$0.05–$0.14", "~$0.15–$0.43"] }),
    ];
    const agg = aggregateRuntimeEvents(summaries, 2);
    assert.equal(agg.totalActualCostUsd, 0.08);
    assert.deepEqual(agg.estimatedCostRanges.sort(), ["~$0.05–$0.14", "~$0.15–$0.43"]);
  });

  it("retourne un agrégat vide sans erreur si aucun résumé", () => {
    const agg = aggregateRuntimeEvents([], 3);
    assert.equal(agg.totalEvents, 0);
    assert.equal(agg.runsWithEvents, 0);
    assert.equal(agg.runsWithoutEvents, 3);
  });
});

describe("generateDashboard — section Runtime Events dans le HTML", () => {
  it("inclut la section Runtime Events et les compteurs demandés", () => {
    const agg = aggregateRuntimeEvents(
      [makeSummary({
        totalEvents: 10,
        countsByType: { SAFE_MODE_BLOCKED: 2, PERMISSION_DENIED: 1, NETWORK_REQUEST: 4, NETWORK_RESPONSE: 3 },
        countsBySeverity: { INFO: 7, CRITICAL: 2, WARN: 1 },
        totalActualCostUsd: 0.12,
      })],
      1
    );
    const html = generateDashboard({ history: [], stats: null }, [], agg);
    assert.ok(html.includes("Runtime Events"));
    assert.ok(html.includes("SAFE_MODE_BLOCKED"));
    assert.ok(html.includes("PERMISSION_DENIED"));
    assert.ok(html.includes("NETWORK_REQUEST"));
    assert.ok(html.includes("NETWORK_RESPONSE"));
    assert.ok(html.includes('"totalActualCostUsd":0.12'));
  });

  it("gère proprement l'absence totale de données (runs antérieurs à v2.5)", () => {
    const agg = aggregateRuntimeEvents([], 3);
    const html = generateDashboard({ history: [], stats: null }, [], agg);
    assert.ok(html.includes("Runtime Events"));
    // Le HTML doit rester valide même à zéro événement — vérifié par la présence du panneau vide géré côté JS.
    assert.ok(html.includes("runtime-events-panel"));
  });

  it("garantie de bout en bout : un secret injecté dans une plage de coût estimé est rédigé avant embarquement HTML", async () => {
    const { secretRedactionEngine } = await import("../core/redaction");
    secretRedactionEngine.reset();
    secretRedactionEngine.registerSecret("TEST_SECRET_IN_DASHBOARD", "s3cr3t-should-not-appear");
    // Simule un cas anormal où une chaîne libre (estimatedCostRanges, en théorie
    // jamais du texte arbitraire, mais le moteur de redaction ne doit PAS
    // dépendre de cette hypothèse) contiendrait un secret connu.
    const agg = aggregateRuntimeEvents(
      [makeSummary({ totalEvents: 1, estimatedCostRanges: ["s3cr3t-should-not-appear"] })],
      1
    );
    const html = generateDashboard({ history: [], stats: null }, [], agg);
    assert.ok(!html.includes("s3cr3t-should-not-appear"));
    assert.ok(html.includes("REDACTED_TEST_SECRET_IN_DASHBOARD"));
    secretRedactionEngine.reset();
  });
});
