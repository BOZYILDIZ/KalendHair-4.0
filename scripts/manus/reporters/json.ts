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
import { FRAMEWORK_VERSION, SCHEMA_VERSION, PROMPT_VERSION } from "../core/version";
import { secretRedactionEngine }    from "../core/redaction";
import { eventLog }                 from "../core/events";
import { dashboardSink }            from "../core/sinks/dashboard-sink";
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
    // Redaction en dernier recours (couche 2) : rawOutput est déjà rédigé à la
    // source (client/index.ts), mais tout artefact écrit sur disque repasse
    // par le moteur de redaction avant sérialisation — garantie systématique,
    // pas une confiance dans l'upstream. Voir core/redaction.ts.
    const versionEnvelope = { frameworkVersion: FRAMEWORK_VERSION, schemaVersion: SCHEMA_VERSION, promptVersion: PROMPT_VERSION };
    const reportWithVersion = secretRedactionEngine.redactObject(Object.assign({}, versionEnvelope, summary));
    writeFileSync(
      resolve(dir, "report.json"),
      JSON.stringify(reportWithVersion, null, 2),
      "utf-8"
    );

    // ── metadata.json ─────────────────────────────────────────────────────────
    const metadataWithVersion = secretRedactionEngine.redactObject(Object.assign({}, versionEnvelope, summary.metadata));
    writeFileSync(
      resolve(dir, "metadata.json"),
      JSON.stringify(metadataWithVersion, null, 2),
      "utf-8"
    );

    // ── timings.json ──────────────────────────────────────────────────────────
    const timings = {
      frameworkVersion: FRAMEWORK_VERSION,
      totalMs:   summary.run.durationMs,
      formatted: formatDuration(summary.run.durationMs),
      totalCreditsConsumed:   summary.run.totalCreditsConsumed,
      totalEstimatedCostUsd:  summary.run.totalEstimatedCostUsd,
      scenarios: summary.run.scenarios.map((s) => ({
        scenarioId:        s.scenarioId,
        name:              s.name,
        status:            s.status,
        startedAt:         s.startedAt,
        completedAt:       s.completedAt,
        durationMs:        s.durationMs,
        formatted:         formatDuration(s.durationMs),
        taskId:            s.taskId,
        taskUrl:           s.taskUrl,
        viewport:          `${s.viewport.label} ${s.viewport.width}×${s.viewport.height}`,
        // ── Métriques d'exécution ──────────────────────────────────────────
        pollCount:         s.pollCount,
        creditsConsumed:   s.creditsConsumed,
        estimatedCostUsd:  s.estimatedCostUsd,
        pollingDurationMs: s.pollingDurationMs,
        parseDurationMs:   s.parseDurationMs,
        networkDurationMs: s.networkDurationMs,
        // ── Captures ──────────────────────────────────────────────────────
        capturesAttendues: s.capturesAttendues,
        capturesProduites: s.capturesProduites,
        capturesInvalides: s.capturesInvalides,
        promptHash:        s.promptHash,
      })),
    };
    writeFileSync(resolve(dir, "timings.json"), JSON.stringify(secretRedactionEngine.redactObject(timings), null, 2), "utf-8");

    // ── network.json ──────────────────────────────────────────────────────────
    const networkErrors = summary.run.scenarios.flatMap((s) =>
      s.networkErrors.map((e) => ({ scenario: s.name, error: e }))
    );
    writeFileSync(
      resolve(dir, "network.json"),
      JSON.stringify(secretRedactionEngine.redactObject({ totalErrors: networkErrors.length, errors: networkErrors }), null, 2),
      "utf-8"
    );

    // ── console.log ───────────────────────────────────────────────────────────
    const consoleLines = summary.run.scenarios.flatMap((s) =>
      s.consoleErrors.length === 0
        ? [`[${s.name}] OK — aucune erreur console`]
        : s.consoleErrors.map((e) => `[${s.name}] ERROR: ${e}`)
    );
    writeFileSync(resolve(dir, "console.log"), secretRedactionEngine.redact(consoleLines.join("\n") + "\n"), "utf-8");

    // ── events.jsonl — désormais écrit en streaming par JsonlSink (v2.5),
    // enregistré au démarrage du run (core/runner.ts). Ne plus appeler
    // eventLog.writeToFile() ici : cela dupliquerait chaque ligne déjà
    // persistée événement par événement.
    eventLog.emit("REPORT_GENERATED", "INFO", { runId: summary.run.runId, artifacts: ["report.json", "metadata.json", "timings.json", "network.json", "console.log"] });

    // ── events-summary.json — résumé agrégé (v2.5, DashboardSink) ────────────
    dashboardSink.writeSummary();

    console.log(`[JSON] Artefacts écrits → ${dir}/`);
  }
}
