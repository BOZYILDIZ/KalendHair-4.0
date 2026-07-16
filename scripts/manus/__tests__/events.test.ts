// ─────────────────────────────────────────────────────────────────────────────
// Tests — core/events.ts
// Runner : node --test --import tsx/esm scripts/manus/__tests__/events.test.ts
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { eventLog, EVENT_TYPES, EVENT_SCHEMA_VERSION } from "../core/events";
import { secretRedactionEngine } from "../core/redaction";

describe("EventLog", () => {
  beforeEach(() => {
    eventLog.reset();
    secretRedactionEngine.reset();
  });

  it("runId par défaut = 'adhoc' avant setRunId", () => {
    assert.equal(eventLog.getRunId(), "adhoc");
  });

  it("setRunId lie tous les événements suivants à ce runId", () => {
    eventLog.setRunId("2026-07-11_10-00-00");
    const e = eventLog.emit("DRY_RUN", "INFO", {});
    assert.equal(e.runId, "2026-07-11_10-00-00");
  });

  it("chaque événement a les 8 champs du schéma requis + eventSchemaVersion", () => {
    eventLog.setRunId("run-x");
    const e = eventLog.emit("NETWORK_REQUEST", "INFO", { endpoint: "/v2/task.create" }, { scenarioId: "SC-001", provider: "manus" });
    assert.equal(e.eventSchemaVersion, EVENT_SCHEMA_VERSION);
    assert.ok(typeof e.timestamp === "string" && e.timestamp.length > 0);
    assert.equal(e.runId, "run-x");
    assert.equal(e.scenarioId, "SC-001");
    assert.ok(typeof e.frameworkVersion === "string" && e.frameworkVersion.length > 0);
    assert.equal(e.provider, "manus");
    assert.equal(e.severity, "INFO");
    assert.equal(e.eventType, "NETWORK_REQUEST");
    assert.deepEqual(e.payload, { endpoint: "/v2/task.create" });
  });

  it("EVENT_SCHEMA_VERSION est une chaîne non vide", () => {
    assert.ok(typeof EVENT_SCHEMA_VERSION === "string" && EVENT_SCHEMA_VERSION.length > 0);
  });

  it("les 12 types d'événements minimum sont bien définis", () => {
    const required = [
      "SAFE_MODE_BLOCKED", "SAFE_MODE_DISABLED",
      "PERMISSION_GRANTED", "PERMISSION_DENIED",
      "NETWORK_REQUEST", "NETWORK_RESPONSE",
      "MANUS_TASK_CREATED", "MANUS_TASK_COMPLETED", "MANUS_TASK_FAILED",
      "DRY_RUN", "REAL_RUN", "REPORT_GENERATED",
    ];
    for (const t of required) {
      assert.ok((EVENT_TYPES as readonly string[]).includes(t), `${t} manquant`);
    }
  });

  it("getEvents accumule dans l'ordre d'émission", () => {
    eventLog.emit("DRY_RUN", "INFO", {});
    eventLog.emit("REPORT_GENERATED", "INFO", {});
    const events = eventLog.getEvents();
    assert.equal(events.length, 2);
    assert.equal(events[0]?.eventType, "DRY_RUN");
    assert.equal(events[1]?.eventType, "REPORT_GENERATED");
  });

  it("getEventsByType filtre correctement", () => {
    eventLog.emit("NETWORK_REQUEST", "INFO", {});
    eventLog.emit("NETWORK_RESPONSE", "INFO", {});
    eventLog.emit("NETWORK_REQUEST", "INFO", {});
    assert.equal(eventLog.getEventsByType("NETWORK_REQUEST").length, 2);
    assert.equal(eventLog.getEventsByType("NETWORK_RESPONSE").length, 1);
  });

  it("reset() vide le journal et réinitialise runId", () => {
    eventLog.setRunId("run-y");
    eventLog.emit("DRY_RUN", "INFO", {});
    eventLog.reset();
    assert.equal(eventLog.getEvents().length, 0);
    assert.equal(eventLog.getRunId(), "adhoc");
  });

  it("le payload passe par le moteur de redaction avant stockage", () => {
    secretRedactionEngine.registerSecret("TEST_SECRET", "s3cr3t-value-123");
    const e = eventLog.emit("MANUS_TASK_CREATED", "INFO", { note: "token=s3cr3t-value-123" });
    assert.ok(!JSON.stringify(e.payload).includes("s3cr3t-value-123"));
    assert.ok(JSON.stringify(e.payload).includes("REDACTED_TEST_SECRET"));
  });

  it("registerSink/unregisterSink/listSinks — nouveau v2.5, le producteur ne connaît pas la destination", () => {
    const received: string[] = [];
    eventLog.registerSink({ name: "test-sink", handle: (e) => { received.push(e.eventType); } });
    assert.ok(eventLog.listSinks().includes("test-sink"));
    eventLog.emit("DRY_RUN", "INFO", {});
    assert.deepEqual(received, ["DRY_RUN"]);
    eventLog.unregisterSink("test-sink");
    assert.ok(!eventLog.listSinks().includes("test-sink"));
  });

  it("le sink 'memory' par défaut est toujours présent (compatibilité getEvents/getEventsByType)", () => {
    assert.ok(eventLog.listSinks().includes("memory"));
  });
});
