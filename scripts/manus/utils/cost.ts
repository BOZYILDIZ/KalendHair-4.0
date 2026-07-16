// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Estimation du coût en USD
//
// Taux : MANUS_CREDIT_COST_USD (défaut 0.01 $ par crédit).
// ─────────────────────────────────────────────────────────────────────────────

/** Coût USD par crédit Manus (configurable via MANUS_CREDIT_COST_USD). */
function creditCostUsd(): number {
  const raw = process.env["MANUS_CREDIT_COST_USD"];
  if (raw) {
    const val = parseFloat(raw);
    if (!isNaN(val) && val > 0) return val;
  }
  return 0.01;
}

/** Crédits restants sur le compte (optionnel — MANUS_CREDITS_REMAINING). */
function creditsRemainingEnv(): number | undefined {
  const raw = process.env["MANUS_CREDITS_REMAINING"];
  if (!raw) return undefined;
  const val = parseInt(raw, 10);
  return isNaN(val) ? undefined : val;
}

export type CostEstimation = {
  creditsConsumed:           number;
  estimatedCostUsd:          number;
  estimatedCreditsRemaining: number | undefined;
};

/**
 * Estime le coût USD d'un scénario depuis ses crédits consommés.
 */
export function estimateCost(creditsConsumed: number): CostEstimation {
  const rate      = creditCostUsd();
  const remaining = creditsRemainingEnv();

  return {
    creditsConsumed,
    estimatedCostUsd:          parseFloat((creditsConsumed * rate).toFixed(4)),
    estimatedCreditsRemaining: remaining !== undefined
      ? Math.max(0, remaining - creditsConsumed)
      : undefined,
  };
}

/**
 * Calcule le coût total d'un run depuis la liste de crédits consommés par scénario.
 */
export function estimateTotalCost(creditsPerScenario: (number | undefined)[]): CostEstimation {
  const total = creditsPerScenario.reduce<number>((sum, c) => sum + (c ?? 0), 0);
  return estimateCost(total);
}
