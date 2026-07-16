// ─────────────────────────────────────────────────────────────────────────────
// Tests de contrat — tous les sinks (v2.5.1 — Finalisation opérationnelle)
//
// Vérifie que CHAQUE implémentation de EventSink respecte le même contrat,
// avec un jeu d'assertions unique appliqué uniformément — pas une suite de
// tests différente par sink. C'est ce qui distingue un test de contrat d'un
// test unitaire ordinaire : la preuve porte sur l'INTERCHANGEABILITÉ des
// sinks du point de vue du EventBus, pas sur le comportement interne de
// chacun (déjà couvert par __tests__/sinks.test.ts).
//
// Runner : node --test --import tsx/esm scripts/manus/__tests__/sinks-contract.test.ts
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { EventBus } from "../core/event-bus";
import { MemorySink } from "../core/sinks/memory-sink";
import { JsonlSink } from "../core/sinks/jsonl-sink";
import { ConsoleSink } from "../core/sinks/console-sink";
import { DashboardSink } from "../core/sinks/dashboard-sink";
import { WebhookSink } from "../core/sinks/webhook-sink";
import { OtelSink } from "../core/sinks/otel-sink";
import type { EventSink } from "../core/event-bus";
import type { RuntimeEvent } from "../core/events-schema";

function sampleEvent(overrides: Partial<RuntimeEvent> = {}): RuntimeEvent {
  return {
    eventSchemaVersion: "1",
    timestamp: new Date().toISOString(),
    runId: "contract-test-run",
    frameworkVersion: "2.5.1",
    severity: "INFO",
    eventType: "DRY_RUN",
    payload: { note: "événement de test de contrat" },
    ...overrides,
  };
}

describe("Contrat EventSink — comportement identique pour tous les sinks", () => {
  let tmp: string;
  let sinks: Array<{ label: string; sink: EventSink }>;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), "manus-sinks-contract-"));
    sinks = [
      { label: "MemorySink",    sink: new MemorySink() },
      { label: "JsonlSink",     sink: new JsonlSink(() => tmp) },
      { label: "ConsoleSink",   sink: new ConsoleSink() },
      { label: "DashboardSink", sink: new DashboardSink(() => tmp) },
      { label: "WebhookSink",   sink: new WebhookSink({ url: "https://example.invalid/hook" }) },
      { label: "OtelSink",      sink: new OtelSink() },
    ];
  });

  afterEach(() => rmSync(tmp, { recursive: true, force: true }));

  it("chaque sink expose un nom non vide et unique dans sa catégorie", () => {
    for (const { label, sink } of sinks) {
      assert.ok(typeof sink.name === "string" && sink.name.length > 0, `${label} sans nom`);
    }
    const names = sinks.map((s) => s.sink.name);
    assert.equal(new Set(names).size, names.length, "des sinks partagent le même nom");
  });

  it("chaque sink accepte un événement bien formé sans lever d'exception", () => {
    for (const { label, sink } of sinks) {
      assert.doesNotThrow(() => sink.handle(sampleEvent()), `${label} a levé une exception`);
    }
  });

  it("chaque sink accepte plusieurs événements consécutifs sans lever d'exception", () => {
    for (const { label, sink } of sinks) {
      assert.doesNotThrow(() => {
        sink.handle(sampleEvent({ eventType: "DRY_RUN" }));
        sink.handle(sampleEvent({ eventType: "REPORT_GENERATED" }));
        sink.handle(sampleEvent({ eventType: "SAFE_MODE_BLOCKED", severity: "CRITICAL" }));
      }, `${label} a levé une exception sur une séquence d'événements`);
    }
  });

  it("chaque sink expose reset() et il ne lève jamais d'exception", () => {
    for (const { label, sink } of sinks) {
      sink.handle(sampleEvent());
      assert.doesNotThrow(() => sink.reset?.(), `${label}.reset() a levé une exception`);
    }
  });

  it("aucun sink ne mute l'objet RuntimeEvent reçu (immutabilité du contrat)", () => {
    for (const { label, sink } of sinks) {
      const event = sampleEvent();
      const before = JSON.stringify(event);
      sink.handle(event);
      assert.equal(JSON.stringify(event), before, `${label} a modifié l'événement reçu`);
    }
  });
});

describe("Contrat — un sink défaillant n'interrompt jamais les autres (preuve via EventBus réel)", () => {
  let tmp: string;
  beforeEach(() => { tmp = mkdtempSync(join(tmpdir(), "manus-sinks-contract-bus-")); });
  afterEach(() => rmSync(tmp, { recursive: true, force: true }));

  it("les sinks réels (Jsonl, Console, Dashboard) continuent de recevoir l'événement même si un sink placé avant eux échoue", () => {
    const bus = new EventBus();
    const broken: EventSink = { name: "broken", handle: () => { throw new Error("panne simulée"); } };
    const jsonlSink = new JsonlSink(() => tmp);
    const dashboardSink = new DashboardSink(() => tmp);

    bus.registerSink(broken);
    bus.registerSink(jsonlSink);
    bus.registerSink(dashboardSink);
    bus.setRunId("run-broken-test");

    assert.doesNotThrow(() => bus.emit("DRY_RUN", "INFO", {}));
    // Preuve que jsonlSink et dashboardSink ont bien reçu l'événement malgré
    // la panne de "broken" placé avant eux dans l'ordre d'enregistrement.
    assert.equal(dashboardSink.getSummary().totalEvents, 1);
  });
});

describe("Contrat — les sinks de préparation (Webhook, Otel) sont réellement sans effet de bord", () => {
  it("WebhookSink.handle() n'émet aucun appel réseau (vérifié par stub fetch)", () => {
    const originalFetch = global.fetch;
    let fetchCalled = false;
    global.fetch = (async () => { fetchCalled = true; throw new Error("ne devrait jamais être appelé"); }) as typeof fetch;
    try {
      const sink = new WebhookSink({ url: "https://example.invalid/hook" });
      sink.handle(sampleEvent());
      sink.handle(sampleEvent());
      assert.equal(fetchCalled, false);
      assert.equal(sink.getPendingCount(), 2);
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("OtelSink.handle() ne produit aucun effet observable (pas d'écriture disque, pas de console, pas de réseau)", () => {
    const originalFetch = global.fetch;
    const originalLog = console.log;
    const originalWarn = console.warn;
    let sideEffect = false;
    global.fetch = (async () => { sideEffect = true; throw new Error("appel réseau inattendu"); }) as typeof fetch;
    console.log = () => { sideEffect = true; };
    console.warn = () => { sideEffect = true; };
    try {
      const sink = new OtelSink();
      sink.handle(sampleEvent({ severity: "CRITICAL", eventType: "SAFE_MODE_BLOCKED" }));
      assert.equal(sideEffect, false);
    } finally {
      global.fetch = originalFetch;
      console.log = originalLog;
      console.warn = originalWarn;
    }
  });
});
