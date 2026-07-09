// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Analysis Engine exports
// ─────────────────────────────────────────────────────────────────────────────

export { buildAnalysis, evaluateQualityGates, finalVerdict, verdictBanner } from "./summary";
export { detectRegressions }       from "./regressions";
export { generateInsights }        from "./insights";
export { generateRecommendations } from "./recommendations";
export { severityOrder, sortBySeverity, severityEmoji } from "./severity";
export { readDashboard, updateDashboard, computeHistoryStats } from "./history";
