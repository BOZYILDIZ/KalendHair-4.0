// ─────────────────────────────────────────────────────────────────────────────
// Tests — core/sinks/*.ts
// Runner : node --test --import tsx/esm scripts/manus/__tests__/sinks.test.ts
//
// Isolation : les sinks à écriture disque (JsonlSink, DashboardSink) sont
// testés avec un répertoire temporaire dédié (mkdtempSync) — jamais le
// reports/manus/ réel du projet.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, existsSync, writeFileSync, mkdirSync } from "fs";
import { tmpdir } from "os";
import { resolve, join } from "path";
import { JsonlSink } from "../core/sinks/jsonl-sink";
import { ConsoleSink } from "../core/sinks/console-sink";
import { DashboardSink } from "../core/sinks/dashboard-sink";
import { WebhookSink } from "../core/sinks/webhook-sink";
import { OtelSink } from "../core/sinks/otel-sink";
import type { RuntimeEvent } from "../core/events-schema";

function makeEvent(overrides: Partial<RuntimeEvent> = {}): RuntimeEvent {
  return {
    eventSchemaVersion: "1",
    timestamp: new Date().toISOString(),
    runId: "test-run",
    frameworkVersion: "2.5.0",
    severity: "INFO",
    eventType: "DRY_RUN",
    payload: {},
    ...overrides,
  };
}

describe("JsonlSink", () => {
  let tmp: string;
  beforeEach(() => { tmp = mkdtempSync(join(tmpdir(), "manus-jsonl-")); });
  afterEach(() => rmSync(tmp, { recursive: true, force: true }));

  it("écrit un événement en JSONL dans <root>/<runId>/events.jsonl", () => {
    const sink = new JsonlSink(() => tmp);
    sink.handle(makeEvent());
    const path = resolve(tmp, "test-run", "events.jsonl");
    assert.ok(existsSync(path));
    const lines = readFileSync(path, "utf-8").trim().split("\n");
    assert.equal(lines.length, 1);
    assert.equal(JSON.parse(lines[0] ?? "{}").eventType, "DRY_RUN");
  });

  it("ajoute (append) sans écraser les événements précédents", () => {
    const sink = new JsonlSink(() => tmp);
    sink.handle(makeEvent({ eventType: "DRY_RUN" }));
    sink.handle(makeEvent({ eventType: "REPORT_GENERATED" }));
    const path = resolve(tmp, "test-run", "events.jsonl");
    const lines = readFileSync(path, "utf-8").trim().split("\n");
    assert.equal(lines.length, 2);
  });
});

describe("ConsoleSink", () => {
  it("n'écrit rien pour un événement INFO", () => {
    const sink = new ConsoleSink();
    const originalWarn = console.warn;
    let called = false;
    console.warn = () => { called = true; };
    try {
      sink.handle(makeEvent({ severity: "INFO" }));
      assert.equal(called, false);
    } finally {
      console.warn = originalWarn;
    }
  });

  it("affiche un événement CRITICAL", () => {
    const sink = new ConsoleSink();
    const originalWarn = console.warn;
    let called = false;
    console.warn = () => { called = true; };
    try {
      sink.handle(makeEvent({ severity: "CRITICAL", eventType: "SAFE_MODE_BLOCKED" }));
      assert.equal(called, true);
    } finally {
      console.warn = originalWarn;
    }
  });
});

describe("DashboardSink", () => {
  let tmp: string;
  beforeEach(() => { tmp = mkdtempSync(join(tmpdir(), "manus-dash-")); });
  afterEach(() => rmSync(tmp, { recursive: true, force: true }));

  it("agrège les compteurs par type et par sévérité", () => {
    const sink = new DashboardSink(() => tmp);
    sink.handle(makeEvent({ eventType: "DRY_RUN", severity: "INFO" }));
    sink.handle(makeEvent({ eventType: "DRY_RUN", severity: "INFO" }));
    sink.handle(makeEvent({ eventType: "SAFE_MODE_BLOCKED", severity: "CRITICAL" }));
    const summary = sink.getSummary();
    assert.equal(summary.totalEvents, 3);
    assert.equal(summary.countsByType["DRY_RUN"], 2);
    assert.equal(summary.countsBySeverity["CRITICAL"], 1);
  });

  it("cumule le coût réel depuis les événements COST_ACTUAL (v2.5.1)", () => {
    const sink = new DashboardSink(() => tmp);
    sink.handle(makeEvent({ eventType: "COST_ACTUAL", payload: { estimatedCostUsd: 0.05 } }));
    sink.handle(makeEvent({ eventType: "COST_ACTUAL", payload: { estimatedCostUsd: 0.03 } }));
    assert.equal(sink.getSummary().totalActualCostUsd, 0.08);
  });

  it("ignore une valeur de coût non numérique sans planter", () => {
    const sink = new DashboardSink(() => tmp);
    sink.handle(makeEvent({ eventType: "COST_ACTUAL", payload: { estimatedCostUsd: "invalide" } }));
    assert.equal(sink.getSummary().totalActualCostUsd, 0);
  });

  it("collecte les plages de coût estimé sans doublon", () => {
    const sink = new DashboardSink(() => tmp);
    sink.handle(makeEvent({ eventType: "COST_ESTIMATED", payload: { costEst: "~$0.05–$0.14" } }));
    sink.handle(makeEvent({ eventType: "COST_ESTIMATED", payload: { costEst: "~$0.05–$0.14" } }));
    sink.handle(makeEvent({ eventType: "COST_ESTIMATED", payload: { costEst: "~$0.15–$0.43" } }));
    assert.deepEqual(sink.getSummary().estimatedCostRanges, ["~$0.05–$0.14", "~$0.15–$0.43"]);
  });

  it("reset() vide aussi les compteurs de coûts", () => {
    const sink = new DashboardSink(() => tmp);
    sink.handle(makeEvent({ eventType: "COST_ACTUAL", payload: { estimatedCostUsd: 1 } }));
    sink.reset();
    const summary = sink.getSummary();
    assert.equal(summary.totalActualCostUsd, 0);
    assert.deepEqual(summary.estimatedCostRanges, []);
  });

  it("writeSummary() persiste events-summary.json", () => {
    const sink = new DashboardSink(() => tmp);
    sink.handle(makeEvent());
    sink.writeSummary();
    const path = resolve(tmp, "test-run", "events-summary.json");
    assert.ok(existsSync(path));
    const summary = JSON.parse(readFileSync(path, "utf-8"));
    assert.equal(summary.totalEvents, 1);
  });

  it("reset() vide les compteurs", () => {
    const sink = new DashboardSink(() => tmp);
    sink.handle(makeEvent());
    sink.reset();
    assert.equal(sink.getSummary().totalEvents, 0);
  });

  // ── Résilience (mission corrective Devil's Advocate — P1) ───────────────────
  //
  // Avant ce correctif, events-summary.json n'était écrit qu'une seule fois,
  // en fin de run (writeSummary() appelée explicitement) — toute interruption
  // avant cet instant faisait disparaître 100% de l'agrégation. Ces tests
  // prouvent : (1) l'écriture incrémentale (le fichier existe et est à jour
  // après CHAQUE handle(), sans appel explicite à writeSummary()), (2)
  // l'écriture atomique (aucun fichier .tmp résiduel, un .tmp existant est
  // écrasé proprement).

  it("écriture incrémentale : events-summary.json existe et reflète l'état après CHAQUE handle(), sans appel explicite à writeSummary()", () => {
    const sink = new DashboardSink(() => tmp);
    const path = resolve(tmp, "test-run", "events-summary.json");

    sink.handle(makeEvent({ eventType: "DRY_RUN" }));
    assert.ok(existsSync(path), "le fichier doit exister après le premier événement, sans writeSummary() explicite");
    let summary = JSON.parse(readFileSync(path, "utf-8"));
    assert.equal(summary.totalEvents, 1);

    sink.handle(makeEvent({ eventType: "REPORT_GENERATED" }));
    summary = JSON.parse(readFileSync(path, "utf-8"));
    assert.equal(summary.totalEvents, 2, "le fichier doit refléter le 2e événement immédiatement, pas seulement en fin de run");
  });

  it("écriture atomique : aucun fichier .tmp résiduel après un handle() réussi", () => {
    const sink = new DashboardSink(() => tmp);
    sink.handle(makeEvent());
    const tmpPath = resolve(tmp, "test-run", "events-summary.json.tmp");
    assert.ok(!existsSync(tmpPath), "le fichier temporaire doit avoir été renommé, jamais laissé en place");
  });

  it("récupération : un fichier .tmp orphelin préexistant (crash antérieur simulé) est écrasé proprement, jamais lu", () => {
    mkdirSync(resolve(tmp, "test-run"), { recursive: true });
    // Simule un .tmp laissé par un crash exactement entre l'écriture et le
    // rename() d'un run précédent — contenu volontairement invalide.
    writeFileSync(resolve(tmp, "test-run", "events-summary.json.tmp"), "{ ceci n'est pas du JSON valide", "utf-8");

    const sink = new DashboardSink(() => tmp);
    sink.handle(makeEvent());

    const finalPath = resolve(tmp, "test-run", "events-summary.json");
    const summary = JSON.parse(readFileSync(finalPath, "utf-8"));
    assert.equal(summary.totalEvents, 1, "le fichier final doit être valide et à jour, le .tmp orphelin n'a jamais été lu");
  });

  it("un events-summary.json existant et valide est intégralement remplacé (jamais fusionné ni corrompu) par la prochaine écriture", () => {
    const sink1 = new DashboardSink(() => tmp);
    sink1.handle(makeEvent({ eventType: "DRY_RUN" }));
    const path = resolve(tmp, "test-run", "events-summary.json");
    const firstWrite = readFileSync(path, "utf-8");
    assert.ok(JSON.parse(firstWrite)); // valide

    const sink2 = new DashboardSink(() => tmp);
    sink2.handle(makeEvent({ eventType: "SAFE_MODE_BLOCKED", severity: "CRITICAL" }));
    const secondWrite = JSON.parse(readFileSync(path, "utf-8"));
    assert.equal(secondWrite.totalEvents, 1);
    assert.equal(secondWrite.countsByType["SAFE_MODE_BLOCKED"], 1);
    assert.equal(secondWrite.countsByType["DRY_RUN"], undefined, "le nouvel état ne doit pas contenir de résidu de l'ancien fichier");
  });
});

describe("WebhookSink — préparation, non implémenté", () => {
  it("accumule les événements sans jamais émettre d'appel réseau réel", () => {
    const sink = new WebhookSink({ url: "https://example.invalid/webhook" });
    sink.handle(makeEvent());
    sink.handle(makeEvent());
    assert.equal(sink.getPendingCount(), 2);
  });

  it("reset() vide la file d'attente", () => {
    const sink = new WebhookSink({ url: "https://example.invalid/webhook" });
    sink.handle(makeEvent());
    sink.reset();
    assert.equal(sink.getPendingCount(), 0);
  });
});

describe("OtelSink — préparation, non implémenté", () => {
  it("handle() est un no-op sûr (ne lève jamais)", () => {
    const sink = new OtelSink();
    assert.doesNotThrow(() => sink.handle(makeEvent()));
  });
});
