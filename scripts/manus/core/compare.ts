// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Comparaison avec le run précédent
// ─────────────────────────────────────────────────────────────────────────────

import { readdirSync, readFileSync, existsSync } from "fs";
import { resolve }                                from "path";
import type { RunComparison, RunSummary, ScenarioResult } from "./types";

// ─── Lecture du run précédent ─────────────────────────────────────────────────

function reportsRoot(): string {
  return resolve(process.cwd(), "reports", "manus");
}

function loadPreviousRun(currentRunId: string): RunSummary | null {
  const root = reportsRoot();
  if (!existsSync(root)) return null;

  let dirs: string[];
  try {
    dirs = readdirSync(root, { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name !== currentRunId)
      .map((d) => d.name)
      .sort()          // alphabétique = chronologique pour le format YYYY-MM-DD_HH-mm-ss
      .reverse();      // plus récent en premier
  } catch (err) {
    // Erreur silencieuse identifiée par l'audit Devil's Advocate : un échec de
    // lecture du répertoire (permission refusée, disque défaillant) était
    // auparavant indiscernable de "aucun run précédent". Reste non-bloquant
    // (la comparaison n'est pas critique pour la suite du run) mais visible.
    console.warn(
      `[QA] Impossible de lister les runs précédents (${root}) — comparaison ignorée pour ce run. ` +
      `Erreur : ${err instanceof Error ? err.message : String(err)}`
    );
    return null;
  }

  for (const dir of dirs) {
    const jsonPath = resolve(root, dir, "report.json");
    if (!existsSync(jsonPath)) continue;
    try {
      const content = readFileSync(jsonPath, "utf-8");
      return JSON.parse(content) as RunSummary;
    } catch (err) {
      console.warn(
        `[QA] report.json illisible pour le run précédent "${dir}" — run ignoré, essai du run antérieur suivant. ` +
        `Erreur : ${err instanceof Error ? err.message : String(err)}`
      );
      continue;
    }
  }

  return null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function passRate(scenarios: ScenarioResult[]): number {
  const total  = scenarios.reduce((s, sc) => s + sc.assertions.length, 0);
  const passed = scenarios.reduce(
    (s, sc) => s + sc.assertions.filter((a) => a.passed).length, 0
  );
  return total > 0 ? passed / total : 1;
}

function countConsoleErrors(scenarios: ScenarioResult[]): number {
  return scenarios.reduce((s, sc) => s + sc.consoleErrors.length, 0);
}

function countNetworkErrors(scenarios: ScenarioResult[]): number {
  return scenarios.reduce((s, sc) => s + sc.networkErrors.length, 0);
}

// ─── Comparaison ─────────────────────────────────────────────────────────────

export function compareWithPrevious(
  current:      RunSummary,
  currentRunId: string,
): RunComparison {
  const prev = loadPreviousRun(currentRunId);

  if (!prev) {
    return {
      previousRunId:      null,
      consoleErrorsDelta: 0,
      networkErrorsDelta: 0,
      assertionPassDelta: 0,
      scoreDelta:         0,
      durationDelta:      0,
      trend:              "no_previous",
    };
  }

  const curScenarios  = current.run.scenarios;
  const prevScenarios = prev.run.scenarios;

  const curConsole  = countConsoleErrors(curScenarios);
  const prevConsole = countConsoleErrors(prevScenarios);
  const curNetwork  = countNetworkErrors(curScenarios);
  const prevNetwork = countNetworkErrors(prevScenarios);
  const curRate     = passRate(curScenarios);
  const prevRate    = passRate(prevScenarios);
  const scoreDelta  = current.score.total - prev.score.total;
  const durDelta    = current.run.durationMs - prev.run.durationMs;

  const improvements = [
    curConsole < prevConsole,
    curNetwork < prevNetwork,
    curRate > prevRate + 0.01,
    scoreDelta > 2,
  ].filter(Boolean).length;

  const degradations = [
    curConsole > prevConsole,
    curNetwork > prevNetwork,
    curRate < prevRate - 0.01,
    scoreDelta < -2,
  ].filter(Boolean).length;

  const trend: RunComparison["trend"] =
    improvements > degradations ? "improved" :
    degradations > improvements ? "degraded" : "stable";

  return {
    previousRunId:      prev.metadata.runId,
    consoleErrorsDelta: curConsole - prevConsole,
    networkErrorsDelta: curNetwork - prevNetwork,
    assertionPassDelta: curRate - prevRate,
    scoreDelta,
    durationDelta:      durDelta,
    trend,
  };
}
