// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Historique des runs (dashboard.json)
//
// Fichier : reports/manus/dashboard.json
// Conserve les 20 derniers runs.
// Jamais commité (.gitignore → reports/).
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve }                                             from "path";
import type { Dashboard, HistoryEntry, HistoryStats, RunSummary } from "../core/types";

const MAX_ENTRIES = 20;

// ─── Chemin ───────────────────────────────────────────────────────────────────

function dashboardPath(): string {
  return resolve(process.cwd(), "reports", "manus", "dashboard.json");
}

// ─── Lecture ──────────────────────────────────────────────────────────────────

export function readDashboard(): { entries: HistoryEntry[]; dashboard: Dashboard | null } {
  const path = dashboardPath();
  if (!existsSync(path)) return { entries: [], dashboard: null };

  try {
    const raw       = readFileSync(path, "utf-8");
    const dashboard = JSON.parse(raw) as Dashboard;
    return { entries: dashboard.history ?? [], dashboard };
  } catch {
    return { entries: [], dashboard: null };
  }
}

// ─── Mise à jour ──────────────────────────────────────────────────────────────

export function updateDashboard(summary: RunSummary): Dashboard {
  const { entries } = readDashboard();

  const verdict =
    summary.analysis?.verdictFromGates ?? summary.score.verdict;

  const consoleErrors = summary.run.scenarios.reduce(
    (s, sc) => s + sc.consoleErrors.length, 0
  );
  const networkErrors = summary.run.scenarios.reduce(
    (s, sc) => s + sc.networkErrors.length, 0
  );

  const newEntry: HistoryEntry = {
    runId:           summary.run.runId,
    date:            summary.metadata.date,
    score:           summary.score.total,
    verdict,
    passedScenarios: summary.run.passedScenarios,
    failedScenarios: summary.run.failedScenarios,
    totalScenarios:  summary.run.totalScenarios,
    consoleErrors,
    networkErrors,
    durationMs:      summary.run.durationMs,
  };

  // Newest first, max 20
  const updated = [newEntry, ...entries].slice(0, MAX_ENTRIES);
  const stats   = computeHistoryStats(updated);

  const dashboard: Dashboard = {
    lastUpdated:   summary.metadata.date,
    latestRunId:   summary.run.runId,
    latestScore:   summary.score.total,
    latestVerdict: verdict,
    history:       updated,
    stats,
  };

  const dir = resolve(process.cwd(), "reports", "manus");
  mkdirSync(dir, { recursive: true });
  writeFileSync(dashboardPath(), JSON.stringify(dashboard, null, 2), "utf-8");

  return dashboard;
}

// ─── Statistiques ─────────────────────────────────────────────────────────────

export function computeHistoryStats(entries: HistoryEntry[]): HistoryStats | null {
  if (entries.length === 0) return null;

  const scores    = entries.map((e) => e.score);
  const durations = entries.map((e) => e.durationMs);

  const avg    = scores.reduce((s, v) => s + v, 0) / scores.length;
  const avgDur = durations.reduce((s, v) => s + v, 0) / durations.length;
  const trend  = computeTrend(entries);

  return {
    totalRuns:    entries.length,
    averageScore: Math.round(avg * 10) / 10,
    bestScore:    Math.max(...scores),
    worstScore:   Math.min(...scores),
    avgDurationMs: Math.round(avgDur),
    trend,
    trendLabel:   trendLabel(trend),
  };
}

function computeTrend(entries: HistoryEntry[]): HistoryStats["trend"] {
  if (entries.length < 3) return "insufficient_data";

  const half   = Math.ceil(entries.length / 2);
  const recent = entries.slice(0, half);       // newer runs
  const older  = entries.slice(half);          // older runs

  if (older.length === 0) return "insufficient_data";

  const recentAvg = recent.reduce((s, e) => s + e.score, 0) / recent.length;
  const olderAvg  = older.reduce((s, e) => s + e.score, 0) / older.length;
  const delta     = recentAvg - olderAvg;

  if (delta > 2)  return "improving";
  if (delta < -2) return "degrading";
  return "stable";
}

function trendLabel(trend: HistoryStats["trend"]): string {
  const MAP: Record<HistoryStats["trend"], string> = {
    improving:         "📈 Qualité en amélioration",
    stable:            "➡️  Qualité stable",
    degrading:         "📉 Qualité en dégradation",
    insufficient_data: "⏳ Données insuffisantes",
  };
  return MAP[trend];
}
