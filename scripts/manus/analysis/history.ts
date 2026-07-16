// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Historique des runs (dashboard.json)
//
// Fichier : reports/manus/dashboard.json
// Conserve les 20 derniers runs.
// Jamais commité (.gitignore → reports/).
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from "fs";
import { resolve, join }                                       from "path";
import { secretRedactionEngine }                                from "../core/redaction";
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
  } catch (err) {
    // Erreur silencieuse identifiée par l'audit Devil's Advocate : un
    // dashboard.json corrompu était auparavant indiscernable d'un premier
    // run (les deux retournaient {entries: [], dashboard: null}), au risque
    // de perdre l'historique réel sans que personne ne s'en aperçoive avant
    // que updateDashboard() n'écrase le fichier corrompu par un historique
    // vide. Reste non-bloquant par choix (un run QA ne doit pas échouer à
    // cause d'un fichier d'historique illisible) mais devient VISIBLE.
    console.warn(
      `[QA] dashboard.json illisible ou corrompu (${path}) — historique traité comme vide pour ce run. ` +
      `Erreur : ${err instanceof Error ? err.message : String(err)}`
    );
    return { entries: [], dashboard: null };
  }
}

// ─── Mise à jour ──────────────────────────────────────────────────────────────

export function updateDashboard(summary: RunSummary): Dashboard {
  const { entries } = readDashboard();

  // Narrowing explicite : HistoryEntry/Dashboard n'ont que 2 verdicts
  // possibles (READY_FOR_MERGE/BLOCK_MERGE) — NO_SCENARIOS_SELECTED n'atteint
  // jamais ce code en pratique (core/runner.ts::runAll() retourne avant
  // d'appeler updateDashboard() dans ce cas), mais si un futur appelant
  // invoquait cette fonction directement avec un tel score, on refuse
  // explicitement de le classer READY_FOR_MERGE — repli sûr sur BLOCK_MERGE.
  const verdict =
    summary.analysis?.verdictFromGates ??
    (summary.score.verdict === "NO_SCENARIOS_SELECTED" ? "BLOCK_MERGE" : summary.score.verdict);

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
  writeFileSync(dashboardPath(), JSON.stringify(secretRedactionEngine.redactObject(dashboard), null, 2), "utf-8");

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

// ─── Nettoyage des anciens runs ───────────────────────────────────────────────

// Les répertoires de run sont écrits directement sous reports/manus/<runId>/
// (cf. reporters/json.ts) — PAS sous reports/manus/runs/. Un runId a le format
// YYYY-MM-DD_HH-mm-ss, suffixe milliseconde optionnel (voir core/paths.ts) ;
// ce filtre évite de toucher dashboard.json / *.html.
const RUN_ID_PATTERN = /^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}(-\d{3})?$/;

/**
 * Supprime les sous-dossiers de run les plus anciens dans reports/manus/
 * en gardant au plus `maxRuns` runs récents.
 * Lit MANUS_MAX_RUNS depuis l'env si `maxRuns` n'est pas fourni (défaut: 20).
 */
export function cleanOldRuns(maxRuns?: number): { removed: string[]; kept: number } {
  const envMax = process.env["MANUS_MAX_RUNS"];
  const limit  = maxRuns ?? (envMax ? parseInt(envMax, 10) : 20);
  const safeLimit = isNaN(limit) || limit < 1 ? 20 : limit;

  const runsDir = resolve(process.cwd(), "reports", "manus");
  if (!existsSync(runsDir)) return { removed: [], kept: 0 };

  const entries = readdirSync(runsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && RUN_ID_PATTERN.test(d.name))
    .map((d) => ({
      name: d.name,
      path: join(runsDir, d.name),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));  // alphabetical = chronological for runId format

  if (entries.length <= safeLimit) return { removed: [], kept: entries.length };

  const toRemove = entries.slice(0, entries.length - safeLimit);
  const removed: string[] = [];

  for (const entry of toRemove) {
    try {
      rmSync(entry.path, { recursive: true, force: true });
      removed.push(entry.name);
    } catch (err) {
      console.warn(`[QA] cleanOldRuns: impossible de supprimer ${entry.name}:`, err);
    }
  }

  return { removed, kept: safeLimit };
}
