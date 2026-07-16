// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Architecture de régression visuelle (v2.3-preview)
//
// STATUT : BASE ARCHITECTURALE — Algorithme de comparaison non implémenté.
//          L'infrastructure est prête. Le vrai pixel-diff arrivera en v2.3.
//
// Objectif : après deux runs successifs, comparer les captures d'écran
// pour détecter les régressions visuelles.
//
// Flux :
//   Run A → captures baseline (saved in reports/manus/baseline/)
//   Run B → captures courantes (dans reports/manus/<runId>/screenshots/)
//   Comparaison → VisualRegressionReport
// ─────────────────────────────────────────────────────────────────────────────

import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { resolve }                                              from "path";

// ─── Types ────────────────────────────────────────────────────────────────────

export type VisualCaptureStatus =
  | "identical"    // Capture identique à la baseline
  | "modified"     // Capture différente de la baseline (régression potentielle)
  | "new"          // Capture présente dans le run courant, absente en baseline
  | "missing"      // Capture présente en baseline, absente dans le run courant
  | "uncompared";  // Comparaison non effectuée (algorithme non disponible)

export type VisualCapture = {
  scenarioId:   string;      // SC-001 … SC-007
  label:        string;      // label de la capture (ex: "sidebar_open")
  baselinePath: string | null;  // chemin absolu vers la baseline
  currentUrl:   string | null;  // URL de la capture courante (retournée par Manus)
  status:       VisualCaptureStatus;
  diffScore?:   number;      // 0.0 (identique) → 1.0 (complètement différent) — disponible en v2.3
  diffPath?:    string;      // chemin vers l'image de diff annotée — disponible en v2.3
  error?:       string;
};

export type VisualRegressionReport = {
  runId:          string;
  baselineRunId:  string | null;   // runId utilisé comme référence, null si pas de baseline
  generatedAt:    string;
  totalCaptures:  number;
  identical:      number;
  modified:       number;
  newCaptures:    number;
  missing:        number;
  uncompared:     number;
  captures:       VisualCapture[];
  verdict:        "no_regression" | "regression_detected" | "no_baseline" | "comparison_pending";
};

export type BaselineManifest = {
  savedAt:     string;
  runId:       string;
  commitSha?:  string;
  captures:    Array<{
    scenarioId: string;
    label:      string;
    path:       string;  // relatif à reports/manus/baseline/
  }>;
};

// ─── Chemins ─────────────────────────────────────────────────────────────────

function baselineDir(): string {
  return resolve(process.cwd(), "reports", "manus", "baseline");
}

function baselineManifestPath(): string {
  return resolve(baselineDir(), "manifest.json");
}

function regressionReportDir(runId: string): string {
  return resolve(process.cwd(), "reports", "manus", runId);
}

// ─── Lecture de la baseline ───────────────────────────────────────────────────

export function readBaseline(): BaselineManifest | null {
  const path = baselineManifestPath();
  if (!existsSync(path)) return null;

  try {
    const raw = readFileSync(path, "utf-8");
    return JSON.parse(raw) as BaselineManifest;
  } catch {
    return null;
  }
}

// ─── Sauvegarde d'une nouvelle baseline ──────────────────────────────────────
//
// En v2.3 : téléchargera les screenshots depuis les URLs Manus et les stockera localement.
// En v2.2-preview : enregistre uniquement les URLs (pas de téléchargement).

export function saveBaseline(params: {
  runId:      string;
  commitSha?: string;
  captures:   Array<{ scenarioId: string; label: string; url: string }>;
}): BaselineManifest {
  const dir = baselineDir();
  mkdirSync(dir, { recursive: true });

  const manifest: BaselineManifest = {
    savedAt:    new Date().toISOString(),
    runId:      params.runId,
    commitSha:  params.commitSha,
    captures:   params.captures.map((c) => ({
      scenarioId: c.scenarioId,
      label:      c.label,
      path:       `${c.scenarioId}/${c.label}.url`,  // v2.3: .png
    })),
  };

  // Stocker les URLs comme références (placeholder avant le vrai pixel-diff en v2.3)
  for (const capture of params.captures) {
    const captureDir = resolve(dir, capture.scenarioId);
    mkdirSync(captureDir, { recursive: true });
    writeFileSync(
      resolve(captureDir, `${capture.label}.url`),
      capture.url,
      "utf-8"
    );
  }

  writeFileSync(baselineManifestPath(), JSON.stringify(manifest, null, 2), "utf-8");
  return manifest;
}

// ─── Comparaison ─────────────────────────────────────────────────────────────
//
// v2.2-preview : compare les URLs uniquement (identique = même URL).
// v2.3        : comparaison pixel-diff avec seuil de tolérance configurable.

export function compareWithBaseline(params: {
  runId:    string;
  captures: Array<{ scenarioId: string; label: string; url: string | null }>;
}): VisualRegressionReport {
  const baseline = readBaseline();
  const now      = new Date().toISOString();

  if (!baseline) {
    return {
      runId:         params.runId,
      baselineRunId: null,
      generatedAt:   now,
      totalCaptures: params.captures.length,
      identical:     0,
      modified:      0,
      newCaptures:   params.captures.length,
      missing:       0,
      uncompared:    0,
      captures:      params.captures.map((c) => ({
        scenarioId:   c.scenarioId,
        label:        c.label,
        baselinePath: null,
        currentUrl:   c.url,
        status:       "new" as VisualCaptureStatus,
      })),
      verdict: "no_baseline",
    };
  }

  const baselineMap = new Map(
    baseline.captures.map((c) => [`${c.scenarioId}/${c.label}`, c])
  );

  const currentMap = new Map(
    params.captures.map((c) => [`${c.scenarioId}/${c.label}`, c])
  );

  const results: VisualCapture[] = [];

  // Captures courantes vs baseline
  for (const [key, current] of currentMap) {
    const baselineEntry = baselineMap.get(key);
    if (!baselineEntry) {
      results.push({
        scenarioId:   current.scenarioId,
        label:        current.label,
        baselinePath: null,
        currentUrl:   current.url,
        status:       "new",
      });
      continue;
    }

    // En v2.3 : comparaison pixel-diff ici.
    // En v2.2-preview : comparaison URL (approximation grossière).
    const baselineUrlPath = resolve(baselineDir(), baselineEntry.path);
    const baselineUrl = existsSync(baselineUrlPath)
      ? readFileSync(baselineUrlPath, "utf-8").trim()
      : null;

    if (!current.url) {
      results.push({
        scenarioId:   current.scenarioId,
        label:        current.label,
        baselinePath: baselineUrlPath,
        currentUrl:   null,
        status:       "missing",
        error:        "URL de capture absente dans le run courant",
      });
    } else if (baselineUrl === current.url) {
      // Même URL = même image (approximation — en v2.3, comparer les pixels)
      results.push({
        scenarioId:   current.scenarioId,
        label:        current.label,
        baselinePath: baselineUrlPath,
        currentUrl:   current.url,
        status:       "uncompared",  // v2.3 dira "identical" ou "modified"
        error:        "Comparaison pixel-diff non disponible en v2.2 — implémentée en v2.3",
      });
    } else {
      // URL différente — la capture a probablement changé
      results.push({
        scenarioId:   current.scenarioId,
        label:        current.label,
        baselinePath: baselineUrlPath,
        currentUrl:   current.url,
        status:       "uncompared",
        error:        "URL différente de la baseline — pixel-diff requis pour confirmer (v2.3)",
      });
    }
  }

  // Captures de baseline absentes du run courant
  for (const [key, baselineEntry] of baselineMap) {
    if (!currentMap.has(key)) {
      const [scenarioId, label] = key.split("/");
      results.push({
        scenarioId:   scenarioId ?? "",
        label:        label ?? "",
        baselinePath: resolve(baselineDir(), baselineEntry.path),
        currentUrl:   null,
        status:       "missing",
        error:        "Capture présente en baseline mais absente du run courant",
      });
    }
  }

  const counts = {
    identical:   results.filter((r) => r.status === "identical").length,
    modified:    results.filter((r) => r.status === "modified").length,
    newCaptures: results.filter((r) => r.status === "new").length,
    missing:     results.filter((r) => r.status === "missing").length,
    uncompared:  results.filter((r) => r.status === "uncompared").length,
  };

  const verdict: VisualRegressionReport["verdict"] =
    counts.modified > 0 || counts.missing > 0
      ? "regression_detected"
      : counts.uncompared > 0
        ? "comparison_pending"
        : "no_regression";

  const report: VisualRegressionReport = {
    runId:         params.runId,
    baselineRunId: baseline.runId,
    generatedAt:   now,
    totalCaptures: results.length,
    ...counts,
    captures:      results,
    verdict,
  };

  // Sauvegarder le rapport dans le dossier du run
  const dir = regressionReportDir(params.runId);
  if (existsSync(dir)) {
    writeFileSync(
      resolve(dir, "visual-regression.json"),
      JSON.stringify(report, null, 2),
      "utf-8"
    );
  }

  return report;
}

// ─── Résumé console ───────────────────────────────────────────────────────────

export function printVisualRegressionSummary(report: VisualRegressionReport): void {
  console.log("\n📸 Régression visuelle");
  console.log(`   Baseline  : ${report.baselineRunId ?? "aucune"}`);
  console.log(`   Verdict   : ${report.verdict}`);
  console.log(`   Identiques: ${report.identical}`);
  console.log(`   Modifiées : ${report.modified}`);
  console.log(`   Nouvelles : ${report.newCaptures}`);
  console.log(`   Absentes  : ${report.missing}`);
  console.log(`   En attente: ${report.uncompared} (pixel-diff disponible en v2.3)`);
}
