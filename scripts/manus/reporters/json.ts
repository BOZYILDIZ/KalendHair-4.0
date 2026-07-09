// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Reporter JSON + Artefacts complémentaires
//
// Écrit dans reports/manus/<runId>/ :
//   report.json     — RunSummary complète (run + score + metadata + comparison)
//   metadata.json   — métadonnées seules
//   timings.json    — durées par scénario
//   network.json    — erreurs réseau agrégées
//   console.log     — erreurs console par scénario
// ─────────────────────────────────────────────────────────────────────────────

import { writeFileSync, mkdirSync } from "fs";
import { resolve }                  from "path";
import { formatDuration }           from "../utils/date";
import type { ManusEnvironment, Reporter, RunSummary, ScenarioResult } from "../core/types";

function runDir(runId: string): string {
  return resolve(process.cwd(), "reports", "manus", runId);
}

function ensureDir(dir: string): void {
  mkdirSync(dir, { recursive: true });
  mkdirSync(resolve(dir, "screenshots"), { recursive: true });
}

export class JsonReporter implements Reporter {
  private currentRunId = "";

  onRunStart(meta: {
    runId:       string;
    environment: ManusEnvironment;
    baseUrl:     string;
    total:       number;
  }): void {
    this.currentRunId = meta.runId;
  }

  onScenarioEnd(_result: ScenarioResult): void { /* writes at run end */ }

  async onRunEnd(summary: RunSummary): Promise<void> {
    const dir = runDir(summary.run.runId);
    ensureDir(dir);

    // ── report.json — RunSummary complète ────────────────────────────────────
    writeFileSync(
      resolve(dir, "report.json"),
      JSON.stringify(summary, null, 2),
      "utf-8"
    );

    // ── metadata.json ─────────────────────────────────────────────────────────
    writeFileSync(
      resolve(dir, "metadata.json"),
      JSON.stringify(summary.metadata, null, 2),
      "utf-8"
    );

    // ── timings.json ──────────────────────────────────────────────────────────
    const timings = {
      totalMs:   summary.run.durationMs,
      formatted: formatDuration(summary.run.durationMs),
      scenarios: summary.run.scenarios.map((s) => ({
        name:        s.name,
        status:      s.status,
        startedAt:   s.startedAt,
        completedAt: s.completedAt,
        durationMs:  s.durationMs,
        formatted:   formatDuration(s.durationMs),
        taskId:      s.taskId,
        viewport:    `${s.viewport.label} ${s.viewport.width}×${s.viewport.height}`,
      })),
    };
    writeFileSync(resolve(dir, "timings.json"), JSON.stringify(timings, null, 2), "utf-8");

    // ── network.json ──────────────────────────────────────────────────────────
    const networkErrors = summary.run.scenarios.flatMap((s) =>
      s.networkErrors.map((e) => ({ scenario: s.name, error: e }))
    );
    writeFileSync(
      resolve(dir, "network.json"),
      JSON.stringify({ totalErrors: networkErrors.length, errors: networkErrors }, null, 2),
      "utf-8"
    );

    // ── console.log ───────────────────────────────────────────────────────────
    const consoleLines = summary.run.scenarios.flatMap((s) =>
      s.consoleErrors.length === 0
        ? [`[${s.name}] OK — aucune erreur console`]
        : s.consoleErrors.map((e) => `[${s.name}] ERROR: ${e}`)
    );
    writeFileSync(resolve(dir, "console.log"), consoleLines.join("\n") + "\n", "utf-8");

    console.log(`[JSON] Artefacts écrits → ${dir}/`);
  }
}
