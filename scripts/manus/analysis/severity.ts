// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Classification de sévérité
// ─────────────────────────────────────────────────────────────────────────────

import type { SeverityLevel } from "../core/types";

// ─── Ordre de sévérité (5 = plus grave) ──────────────────────────────────────

const SEVERITY_ORDER: Record<SeverityLevel, number> = {
  CRITICAL: 5,
  HIGH:     4,
  MEDIUM:   3,
  LOW:      2,
  INFO:     1,
};

export function severityOrder(level: SeverityLevel): number {
  return SEVERITY_ORDER[level];
}

/** Trie du plus grave au moins grave. */
export function sortBySeverity<T extends { severity: SeverityLevel }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => severityOrder(b.severity) - severityOrder(a.severity)
  );
}

// ─── Classificateurs ─────────────────────────────────────────────────────────

/** Erreurs console : 0→INFO, 1→MEDIUM, 2-4→HIGH, 5+→CRITICAL */
export function classifyConsoleErrorSeverity(count: number): SeverityLevel {
  if (count === 0)  return "INFO";
  if (count === 1)  return "MEDIUM";
  if (count < 5)   return "HIGH";
  return "CRITICAL";
}

/** Erreurs réseau : 0→INFO, 1→HIGH, 2+→CRITICAL */
export function classifyNetworkErrorSeverity(count: number): SeverityLevel {
  if (count === 0) return "INFO";
  if (count === 1) return "HIGH";
  return "CRITICAL";
}

/** Chute de score : 0-2→INFO, 3-5→LOW, 6-10→MEDIUM, 11-15→HIGH, 16+→CRITICAL */
export function classifyScoreDropSeverity(drop: number): SeverityLevel {
  if (drop <= 2)  return "INFO";
  if (drop <= 5)  return "LOW";
  if (drop <= 10) return "MEDIUM";
  if (drop <= 15) return "HIGH";
  return "CRITICAL";
}

/** Dégradation de performance en ms. */
export function classifyPerformanceSeverity(deltaMs: number): SeverityLevel {
  if (deltaMs < 5_000)  return "INFO";
  if (deltaMs < 15_000) return "LOW";
  if (deltaMs < 30_000) return "MEDIUM";
  if (deltaMs < 60_000) return "HIGH";
  return "CRITICAL";
}

/** Assertion échouée. */
export function classifyAssertionFailureSeverity(assertionName: string): SeverityLevel {
  // Quelques heuristiques sur le nom
  if (
    assertionName.includes("console") ||
    assertionName.includes("network") ||
    assertionName.includes("redirect")
  ) return "HIGH";
  if (assertionName.includes("screenshot")) return "LOW";
  return "MEDIUM";
}

// ─── Émoji ───────────────────────────────────────────────────────────────────

export function severityEmoji(level: SeverityLevel): string {
  const MAP: Record<SeverityLevel, string> = {
    CRITICAL: "🔴",
    HIGH:     "🟠",
    MEDIUM:   "🟡",
    LOW:      "🔵",
    INFO:     "⚪",
  };
  return MAP[level];
}
