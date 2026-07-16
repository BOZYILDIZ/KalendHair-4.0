// ─────────────────────────────────────────────────────────────────────────────
// Tests — core/events-payloads.ts (v2.5.1)
// Runner : node --test --import tsx/esm scripts/manus/__tests__/events-payloads.test.ts
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isValidPayloadForType, getTypedPayload } from "../core/events-payloads";
import type { RuntimeEvent } from "../core/events-schema";

function makeEvent<T extends RuntimeEvent["eventType"]>(
  eventType: T,
  payload: Record<string, unknown>,
): RuntimeEvent & { eventType: T } {
  return {
    eventSchemaVersion: "1",
    timestamp: new Date().toISOString(),
    runId: "run-1",
    frameworkVersion: "2.5.1",
    severity: "INFO",
    eventType,
    payload,
  };
}

describe("isValidPayloadForType — formes valides", () => {
  it("DRY_RUN valide avec les champs attendus", () => {
    assert.ok(isValidPayloadForType("DRY_RUN", { totalScenarios: 7, maxConcurrent: 2, provider: "manus" }));
  });

  it("NETWORK_REQUEST valide avec endpoint", () => {
    assert.ok(isValidPayloadForType("NETWORK_REQUEST", { endpoint: "/v2/task.create" }));
  });

  it("COST_ACTUAL valide avec taskId + estimatedCostUsd numérique", () => {
    assert.ok(isValidPayloadForType("COST_ACTUAL", { taskId: "t-1", creditsConsumed: 5, estimatedCostUsd: 0.05 }));
  });

  it("RETENTION_PREVIEW valide avec runId + keptCount", () => {
    assert.ok(isValidPayloadForType("RETENTION_PREVIEW", { runId: "run-x", keptCount: 3, purgedCount: 1 }));
  });
});

describe("isValidPayloadForType — formes invalides détectées", () => {
  it("DRY_RUN invalide si totalScenarios manque", () => {
    assert.ok(!isValidPayloadForType("DRY_RUN", { maxConcurrent: 2, provider: "manus" }));
  });

  it("NETWORK_RESPONSE invalide si httpStatus n'est pas numérique", () => {
    assert.ok(!isValidPayloadForType("NETWORK_RESPONSE", { endpoint: "/x", httpStatus: "200" }));
  });

  it("COST_ACTUAL invalide si estimatedCostUsd est une chaîne", () => {
    assert.ok(!isValidPayloadForType("COST_ACTUAL", { taskId: "t-1", estimatedCostUsd: "0.05" }));
  });
});

describe("isValidPayloadForType — compatibilité legacy", () => {
  it("un eventType sans validateur strict (PERMISSION_GRANTED) est toujours valide", () => {
    assert.ok(isValidPayloadForType("PERMISSION_GRANTED", {}));
    assert.ok(isValidPayloadForType("PERMISSION_GRANTED", { anything: "goes" }));
  });

  it("un payload avec des champs additionnels non prévus reste valide (tolérance en lecture)", () => {
    assert.ok(isValidPayloadForType("DRY_RUN", {
      totalScenarios: 1, maxConcurrent: 1, provider: "manus", champFutur: "valeur inconnue",
    }));
  });
});

describe("getTypedPayload", () => {
  it("retourne le payload typé si la forme est valide", () => {
    const event = makeEvent("DRY_RUN", { totalScenarios: 3, maxConcurrent: 2, provider: "manus" });
    const typed = getTypedPayload(event);
    assert.notEqual(typed, null);
    assert.equal(typed?.totalScenarios, 3);
  });

  it("retourne null (jamais une exception) si la forme est invalide — événement legacy simulé", () => {
    const legacyEvent = makeEvent("DRY_RUN", { oldFieldName: 3 }); // forme d'une version antérieure hypothétique
    assert.doesNotThrow(() => getTypedPayload(legacyEvent));
    assert.equal(getTypedPayload(legacyEvent), null);
  });

  it("ne modifie jamais le RuntimeEvent original", () => {
    const event = makeEvent("COST_ACTUAL", { taskId: "t-1", creditsConsumed: 2, estimatedCostUsd: 0.02 });
    const before = JSON.stringify(event);
    getTypedPayload(event);
    assert.equal(JSON.stringify(event), before);
  });
});
