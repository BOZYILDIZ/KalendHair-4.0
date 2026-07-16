// ─────────────────────────────────────────────────────────────────────────────
// Tests — utils/cost.ts
// Runner : node --test --import tsx/esm scripts/manus/__tests__/cost.test.ts
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { estimateCost, estimateTotalCost } from "../utils/cost";

describe("estimateCost", () => {
  beforeEach(() => {
    delete process.env["MANUS_CREDIT_COST_USD"];
    delete process.env["MANUS_CREDITS_REMAINING"];
  });

  afterEach(() => {
    delete process.env["MANUS_CREDIT_COST_USD"];
    delete process.env["MANUS_CREDITS_REMAINING"];
  });

  it("taux par défaut = 0.01 $/crédit", () => {
    const result = estimateCost(10);
    assert.equal(result.creditsConsumed, 10);
    assert.equal(result.estimatedCostUsd, 0.1);
  });

  it("taux configurable via MANUS_CREDIT_COST_USD", () => {
    process.env["MANUS_CREDIT_COST_USD"] = "0.02";
    const result = estimateCost(5);
    assert.equal(result.estimatedCostUsd, 0.1);
  });

  it("creditsRemainingEnv undefined si non défini", () => {
    const result = estimateCost(10);
    assert.equal(result.estimatedCreditsRemaining, undefined);
  });

  it("creditsRemainingEnv soustrait les crédits consommés", () => {
    process.env["MANUS_CREDITS_REMAINING"] = "100";
    const result = estimateCost(15);
    assert.equal(result.estimatedCreditsRemaining, 85);
  });

  it("creditsRemainingEnv ne descend pas en dessous de 0", () => {
    process.env["MANUS_CREDITS_REMAINING"] = "5";
    const result = estimateCost(100);
    assert.equal(result.estimatedCreditsRemaining, 0);
  });

  it("0 crédit → 0 USD", () => {
    const result = estimateCost(0);
    assert.equal(result.estimatedCostUsd, 0);
  });
});

describe("estimateTotalCost", () => {
  beforeEach(() => {
    delete process.env["MANUS_CREDIT_COST_USD"];
    delete process.env["MANUS_CREDITS_REMAINING"];
  });

  it("somme les crédits de tous les scénarios", () => {
    const result = estimateTotalCost([10, 20, 30]);
    assert.equal(result.creditsConsumed, 60);
    assert.equal(result.estimatedCostUsd, 0.6);
  });

  it("ignore les valeurs undefined", () => {
    const result = estimateTotalCost([10, undefined, 20]);
    assert.equal(result.creditsConsumed, 30);
  });

  it("liste vide → 0", () => {
    const result = estimateTotalCost([]);
    assert.equal(result.creditsConsumed, 0);
    assert.equal(result.estimatedCostUsd, 0);
  });
});
