// ─────────────────────────────────────────────────────────────────────────────
// Tests — core/event-bus.ts
// Runner : node --test --import tsx/esm scripts/manus/__tests__/event-bus.test.ts
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { EventBus } from "../core/event-bus";
import { secretRedactionEngine } from "../core/redaction";
import type { EventSink } from "../core/event-bus";
import type { RuntimeEvent } from "../core/events-schema";

function fakeSink(name: string): EventSink & { received: RuntimeEvent[]; resetCalled: boolean } {
  return {
    name,
    received: [],
    resetCalled: false,
    handle(event: RuntimeEvent) { this.received.push(event); },
    reset() { this.received = []; this.resetCalled = true; },
  };
}

describe("EventBus — distribution aux sinks", () => {
  beforeEach(() => secretRedactionEngine.reset());

  it("un événement émis est distribué à tous les sinks enregistrés", () => {
    const bus = new EventBus();
    const a = fakeSink("a");
    const b = fakeSink("b");
    bus.registerSink(a);
    bus.registerSink(b);
    bus.emit("DRY_RUN", "INFO", {});
    assert.equal(a.received.length, 1);
    assert.equal(b.received.length, 1);
  });

  it("le producteur ne connaît jamais les sinks — emit() ne prend aucun paramètre de destination", () => {
    const bus = new EventBus();
    // Signature de emit() : (eventType, severity, payload, opts) — aucune notion de sink.
    const event = bus.emit("REAL_RUN", "INFO", { note: "test" });
    assert.equal(event.eventType, "REAL_RUN");
  });

  it("refuse d'enregistrer deux sinks avec le même nom", () => {
    const bus = new EventBus();
    bus.registerSink(fakeSink("dup"));
    assert.throws(() => bus.registerSink(fakeSink("dup")));
  });

  it("unregisterSink retire un sink — il ne reçoit plus d'événements", () => {
    const bus = new EventBus();
    const a = fakeSink("a");
    bus.registerSink(a);
    bus.unregisterSink("a");
    bus.emit("DRY_RUN", "INFO", {});
    assert.equal(a.received.length, 0);
  });

  it("listSinks() retourne les noms des sinks actuellement enregistrés", () => {
    const bus = new EventBus();
    bus.registerSink(fakeSink("x"));
    bus.registerSink(fakeSink("y"));
    assert.deepEqual(bus.listSinks().sort(), ["x", "y"]);
  });

  it("un sink qui lève une exception n'empêche pas les autres sinks de recevoir l'événement", () => {
    const bus = new EventBus();
    const broken: EventSink = { name: "broken", handle: () => { throw new Error("boom"); } };
    const ok = fakeSink("ok");
    bus.registerSink(broken);
    bus.registerSink(ok);
    assert.doesNotThrow(() => bus.emit("DRY_RUN", "INFO", {}));
    assert.equal(ok.received.length, 1);
  });

  it("un sink asynchrone qui rejette n'empêche pas l'émission ni les autres sinks", async () => {
    const bus = new EventBus();
    const asyncBroken: EventSink = { name: "async-broken", handle: async () => { throw new Error("async boom"); } };
    const ok = fakeSink("ok2");
    bus.registerSink(asyncBroken);
    bus.registerSink(ok);
    bus.emit("DRY_RUN", "INFO", {});
    assert.equal(ok.received.length, 1);
    // Laisse la microtask du rejet se résoudre avant la fin du test.
    await new Promise((r) => setTimeout(r, 10));
  });

  it("reset() réinitialise runId et appelle reset() sur chaque sink", () => {
    const bus = new EventBus();
    const a = fakeSink("a");
    bus.registerSink(a);
    bus.setRunId("run-x");
    bus.reset();
    assert.equal(bus.getRunId(), "adhoc");
    assert.equal(a.resetCalled, true);
  });

  it("setRunId/getRunId fonctionnent indépendamment des sinks", () => {
    const bus = new EventBus();
    bus.setRunId("run-abc");
    assert.equal(bus.getRunId(), "run-abc");
  });

  // ── Observabilité des échecs de sink (mission corrective Devil's Advocate) ──
  //
  // Avant ce correctif, un échec de sink n'était visible que via console.warn
  // — indistinguable, pour un test ou un opérateur, d'un run parfaitement
  // sain. getSinkFailures() rend ce compteur observable sans risque de
  // récursion (pas d'émission d'événement depuis le gestionnaire d'échec).

  it("getSinkFailures() compte un échec synchrone", () => {
    const bus = new EventBus();
    const broken: EventSink = { name: "broken-sync", handle: () => { throw new Error("boom"); } };
    bus.registerSink(broken);
    bus.emit("DRY_RUN", "INFO", {});
    assert.equal(bus.getSinkFailures()["broken-sync"], 1);
  });

  it("getSinkFailures() compte un échec asynchrone", async () => {
    const bus = new EventBus();
    const asyncBroken: EventSink = { name: "broken-async", handle: async () => { throw new Error("boom async"); } };
    bus.registerSink(asyncBroken);
    bus.emit("DRY_RUN", "INFO", {});
    await new Promise((r) => setTimeout(r, 10));
    assert.equal(bus.getSinkFailures()["broken-async"], 1);
  });

  it("getSinkFailures() accumule sur plusieurs émissions", () => {
    const bus = new EventBus();
    const broken: EventSink = { name: "broken", handle: () => { throw new Error("boom"); } };
    bus.registerSink(broken);
    bus.emit("DRY_RUN", "INFO", {});
    bus.emit("DRY_RUN", "INFO", {});
    bus.emit("DRY_RUN", "INFO", {});
    assert.equal(bus.getSinkFailures()["broken"], 3);
  });

  it("un sink qui ne lève jamais n'apparaît pas dans getSinkFailures()", () => {
    const bus = new EventBus();
    bus.registerSink(fakeSink("healthy"));
    bus.emit("DRY_RUN", "INFO", {});
    assert.equal(bus.getSinkFailures()["healthy"], undefined);
  });

  it("reset() vide le compteur d'échecs", () => {
    const bus = new EventBus();
    const broken: EventSink = { name: "broken", handle: () => { throw new Error("boom"); } };
    bus.registerSink(broken);
    bus.emit("DRY_RUN", "INFO", {});
    assert.equal(bus.getSinkFailures()["broken"], 1);
    bus.reset();
    assert.deepEqual(bus.getSinkFailures(), {});
  });
});
