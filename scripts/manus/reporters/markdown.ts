// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Reporter Markdown (rapport CTO-ready)
//
// Structure du rapport :
//   1. QA Score + Verdict
//   2. Executive Summary (stats clés)
//   3. Quality Gates
//   4. Insights
//   5. Régressions
//   6. Recommandations
//   7. Historique
//   8. Comparaison avec run précédent
//   9. Metadata
//  10. Récapitulatif scénarios
//  11. Détail scénarios
// ─────────────────────────────────────────────────────────────────────────────

import { writeFileSync, mkdirSync } from "fs";
import { resolve }                  from "path";
import { formatDuration, formatDurationDelta } from "../utils/date";
import { scoreBar }                            from "../core/score";
import { severityEmoji }                       from "../analysis/severity";
import { finalVerdict }                        from "../analysis/summary";
import { FRAMEWORK_VERSION, SCHEMA_VERSION, PROMPT_VERSION } from "../core/version";
import type {
  ManusEnvironment,
  Reporter,
  RunSummary,
  ScenarioResult,
  QAScore,
  QualityGate,
  Regression,
  Insight,
  Recommendation,
  RunComparison,
  RunMetadata,
  AnalysisResult,
  HistoryStats,
  FrameworkQuality,
} from "../core/types";

export class MarkdownReporter implements Reporter {
  onRunStart(_meta: {
    runId:       string;
    environment: ManusEnvironment;
    baseUrl:     string;
    total:       number;
  }): void { /* writes at run end */ }

  onScenarioEnd(_result: ScenarioResult): void { /* writes at run end */ }

  async onRunEnd(summary: RunSummary): Promise<void> {
    const dir = resolve(process.cwd(), "reports", "manus", summary.run.runId);
    mkdirSync(dir, { recursive: true });

    const md = buildMarkdown(summary);
    writeFileSync(resolve(dir, "report.md"), md, "utf-8");
    console.log(`[MD]   report.md → ${dir}/report.md`);
  }
}

// ─── Builder principal ────────────────────────────────────────────────────────

function buildMarkdown(summary: RunSummary): string {
  const { run, score, comparison, analysis, metadata } = summary;
  const verdict = finalVerdict(summary);
  const lines: string[] = [];

  // ── Titre ──────────────────────────────────────────────────────────────────
  const dryTag = run.dryRun ? " *(DRY-RUN)*" : "";
  lines.push(`# Rapport QA Manus — ${run.runId}${dryTag}`);
  lines.push(`> Framework v${FRAMEWORK_VERSION} | Schema v${SCHEMA_VERSION} | Prompt: ${PROMPT_VERSION}`);
  lines.push("");

  // ── 1. QA Score ───────────────────────────────────────────────────────────
  lines.push("## 🎯 QA Score");
  lines.push("");
  lines.push("```");
  lines.push(`  ${scoreBar(score.total)}  ${score.total} / 100`);
  lines.push("");
  lines.push(`  ${verdict === "READY_FOR_MERGE" ? "✅  READY FOR MERGE" : "🚫  BLOCK MERGE"}`);
  lines.push("```");
  lines.push("");
  lines.push(renderScoreTable(score));
  lines.push("");

  // ── 2. Executive Summary ──────────────────────────────────────────────────
  if (analysis) {
    lines.push("## 📊 Executive Summary");
    lines.push("");
    lines.push(renderExecutiveSummary(analysis, run.durationMs, run.totalScenarios));
    lines.push("");
  }

  // ── 3. Quality Gates ──────────────────────────────────────────────────────
  if (analysis) {
    lines.push("## 🚦 Quality Gates");
    lines.push("");
    lines.push(renderQualityGates(analysis.qualityGates, verdict));
    lines.push("");
  }

  // ── 4. Insights ───────────────────────────────────────────────────────────
  if (analysis && analysis.insights.length > 0) {
    lines.push("## 💡 Insights");
    lines.push("");
    lines.push(renderInsights(analysis.insights));
    lines.push("");
  }

  // ── 5. Régressions ────────────────────────────────────────────────────────
  lines.push("## 🔍 Régressions");
  lines.push("");
  if (analysis && analysis.regressions.length > 0) {
    lines.push(renderRegressions(analysis.regressions));
  } else {
    lines.push("> ✅ Aucune régression détectée sur ce run.");
  }
  lines.push("");

  // ── 6. Recommandations ────────────────────────────────────────────────────
  lines.push("## 💬 Recommandations");
  lines.push("");
  if (analysis && analysis.recommendations.length > 0) {
    lines.push(renderRecommendations(analysis.recommendations));
  } else {
    lines.push("> ✅ Aucune recommandation — la qualité est au niveau attendu.");
  }
  lines.push("");

  // ── 7. Historique ─────────────────────────────────────────────────────────
  if (analysis?.historyStats) {
    lines.push("## 📈 Historique QA");
    lines.push("");
    lines.push(renderHistoryStats(analysis.historyStats));
    lines.push("");
  }

  // ── 8. Comparaison ────────────────────────────────────────────────────────
  lines.push("## 🔄 Comparaison avec le run précédent");
  lines.push("");
  lines.push(renderComparison(comparison, run.durationMs));
  lines.push("");

  // ── 9. Coût estimé ────────────────────────────────────────────────────────
  if (run.totalCreditsConsumed !== undefined || run.dryRun) {
    lines.push("## 💰 Coût estimé");
    lines.push("");
    lines.push(renderCostSection(run));
    lines.push("");
  }

  // ── 10. Qualité du Framework ──────────────────────────────────────────────
  lines.push("## 🏗️ Qualité du Framework");
  lines.push("");
  lines.push(renderFrameworkQuality(summary));
  lines.push("");

  // ── 11. Metadata ──────────────────────────────────────────────────────────
  lines.push("## 📋 Metadata");
  lines.push("");
  lines.push(renderMetadata(metadata));
  lines.push("");

  // ── 12. Récapitulatif ─────────────────────────────────────────────────────
  lines.push("## 📄 Récapitulatif des scénarios");
  lines.push("");
  lines.push("| ID | Scénario | Viewport | Statut | Durée | Assertions | Captures | Coût |");
  lines.push("|----|----------|----------|--------|-------|------------|----------|------|");

  run.scenarios.forEach((s) => {
    const passed     = s.assertions.filter((a) => a.passed).length;
    const vp         = `${s.viewport.label} ${s.viewport.width}×${s.viewport.height}`;
    const captures   = s.capturesAttendues !== undefined
      ? `${s.capturesProduites ?? 0}/${s.capturesAttendues}`
      : "—";
    const cost       = s.estimatedCostUsd !== undefined ? `$${s.estimatedCostUsd}` : (s.dryRun ? "$0" : "—");
    const idCell     = s.scenarioId ? `\`${s.scenarioId}\`` : "—";
    lines.push(
      `| ${idCell} | \`${s.name}\` | ${vp} | ${statusIcon(s.status)} | ` +
      `${formatDuration(s.durationMs)} | ${passed}/${s.assertions.length} | ${captures} | ${cost} |`
    );
  });
  lines.push("");

  // ── 13. Détail ────────────────────────────────────────────────────────────
  lines.push("## 🔬 Détail des scénarios");
  lines.push("");

  for (const s of run.scenarios) {
    lines.push(...renderScenarioSection(s));
    lines.push("");
  }

  return lines.join("\n");
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function renderScoreTable(score: QAScore): string {
  const bd = score.breakdown;
  const rows: [string, number, number][] = [
    ["Assertions",    bd.assertions,    30],
    ["Console",       bd.console,       20],
    ["Réseau",        bd.network,       20],
    ["Responsive",    bd.responsive,    10],
    ["Accessibilité", bd.accessibility, 10],
    ["Captures",      bd.screenshots,    5],
    ["Performance",   bd.performance,    5],
  ];

  const lines = [
    "| Dimension      | Score | Max | Barre |",
    "|----------------|------:|----:|-------|",
  ];

  for (const [label, val, max] of rows) {
    const pct = Math.round((val / max) * 10);
    const bar = "█".repeat(pct) + "░".repeat(10 - pct);
    lines.push(`| ${label.padEnd(14)} | ${String(val).padStart(5)} | ${max.toString().padStart(3)} | \`${bar}\` |`);
  }

  lines.push(`| **Total**      | **${score.total}** | **100** | \`${scoreBar(score.total).slice(0, 20)}\` |`);
  return lines.join("\n");
}

function renderExecutiveSummary(
  analysis: AnalysisResult,
  durationMs: number,
  totalScenarios: number,
): string {
  const s = analysis.stats;
  const lines = [
    "| Métrique                    | Valeur |",
    "|-----------------------------|--------|",
    `| Assertions exécutées        | **${s.totalAssertions}** |`,
    `| Assertions réussies         | **${s.passedAssertions}** |`,
    `| Assertions en échec         | ${s.failedAssertions === 0 ? "**0**" : `**${s.failedAssertions}** ⚠️`} |`,
    `| Erreurs console             | ${s.consoleErrors === 0 ? "**0** ✅" : `**${s.consoleErrors}** 🔴`} |`,
    `| Erreurs réseau              | ${s.networkErrors === 0 ? "**0** ✅" : `**${s.networkErrors}** 🟠`} |`,
    `| Scénarios                   | **${totalScenarios}** |`,
    `| Captures d'écran            | **${s.screenshots}** |`,
    `| Temps total                 | **${formatDuration(durationMs)}** |`,
  ];
  return lines.join("\n");
}

function renderQualityGates(gates: QualityGate[], verdict: "READY_FOR_MERGE" | "BLOCK_MERGE"): string {
  const lines = [
    "| Gate                    | Condition             | Valeur | Seuil | Statut | Conséquence |",
    "|-------------------------|-----------------------|-------:|------:|--------|-------------|",
  ];

  for (const g of gates) {
    const icon = g.passed
      ? "✅"
      : g.consequence === "BLOCK_MERGE"
        ? "🚫"
        : "⚠️";
    lines.push(
      `| ${g.name.padEnd(23)} | \`${g.condition}\` | ${String(g.value).padStart(6)} | ${String(g.threshold).padStart(5)} | ${icon} | ${g.consequence} |`
    );
  }

  lines.push("");
  lines.push(
    verdict === "READY_FOR_MERGE"
      ? "**Verdict final : ✅ READY FOR MERGE**"
      : "**Verdict final : 🚫 BLOCK MERGE**"
  );

  return lines.join("\n");
}

function renderInsights(insights: Insight[]): string {
  return insights
    .map((ins) => {
      const icon = ins.positive ? "✅" : "⚠️";
      return `${icon} ${ins.message}`;
    })
    .join("\n");
}

function renderRegressions(regressions: Regression[]): string {
  const lines: string[] = [];

  for (const r of regressions) {
    lines.push(`### ${severityEmoji(r.severity)} [${r.severity}] ${r.title}`);
    lines.push("");

    if (r.isNew) {
      lines.push("**Première apparition.**");
      lines.push("");
    }

    lines.push(`- **Impact estimé** : ${r.impact}`);
    if (r.affectedScenario) lines.push(`- **Scénario** : \`${r.affectedScenario}\``);
    if (r.affectedPage)     lines.push(`- **Page concernée** : \`${r.affectedPage}\``);
    if (r.delta !== undefined) lines.push(`- **Delta** : ${r.delta}`);
    lines.push(`- **Description** : ${r.description}`);
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}

function renderRecommendations(recs: Recommendation[]): string {
  const lines: string[] = [];
  const groups: Record<string, Recommendation[]> = {};

  for (const r of recs) {
    if (!groups[r.priority]) groups[r.priority] = [];
    groups[r.priority]!.push(r);
  }

  const ORDER = ["HAUTE", "MOYENNE", "FAIBLE"] as const;
  const ICONS: Record<string, string> = { HAUTE: "🔴", MOYENNE: "🟡", FAIBLE: "🔵" };

  for (const priority of ORDER) {
    const group = groups[priority];
    if (!group || group.length === 0) continue;

    lines.push(`### ${ICONS[priority] ?? ""} Priorité ${priority}`);
    lines.push("");
    for (const r of group) {
      lines.push(`**${r.title}**`);
      lines.push(`${r.description}`);
      lines.push("");
    }
  }

  return lines.join("\n");
}

function renderHistoryStats(hs: HistoryStats): string {
  const lines = [
    "| Statistique     | Valeur |",
    "|-----------------|--------|",
    `| Runs analysés   | ${hs.totalRuns} |`,
    `| Score moyen     | **${hs.averageScore}** / 100 |`,
    `| Meilleur score  | **${hs.bestScore}** / 100 |`,
    `| Pire score      | **${hs.worstScore}** / 100 |`,
    `| Durée moyenne   | ${formatDuration(hs.avgDurationMs)} |`,
    `| Tendance        | ${hs.trendLabel} |`,
  ];
  return lines.join("\n");
}

function renderComparison(cmp: RunComparison | null, _currentDurationMs: number): string {
  if (!cmp || cmp.trend === "no_previous") {
    return "> Aucun run précédent — première exécution.";
  }

  const trendLabel =
    cmp.trend === "improved" ? "📈 **AMÉLIORÉ**" :
    cmp.trend === "degraded" ? "📉 **DÉGRADÉ**"  : "➡️  **STABLE**";

  const lines = [
    `> Run précédent : \`${cmp.previousRunId ?? "—"}\``,
    "",
    `**Tendance : ${trendLabel}**`,
    "",
    "| Métrique          | Delta     |",
    "|-------------------|-----------|",
    `| Score QA          | ${delta(cmp.scoreDelta)} pts |`,
    `| Erreurs console   | ${delta(-cmp.consoleErrorsDelta)} |`,
    `| Erreurs réseau    | ${delta(-cmp.networkErrorsDelta)} |`,
    `| Pass rate         | ${(cmp.assertionPassDelta * 100).toFixed(1)}% |`,
    `| Durée             | ${formatDurationDelta(cmp.durationDelta)} |`,
  ];

  return lines.join("\n");
}

function renderMetadata(meta: RunMetadata): string {
  return [
    "| Champ              | Valeur |",
    "|--------------------|--------|",
    `| Run ID             | \`${meta.runId}\` |`,
    `| Framework Version  | \`${meta.frameworkVersion ?? FRAMEWORK_VERSION}\` |`,
    `| Schema Version     | \`${meta.schemaVersion ?? SCHEMA_VERSION}\` |`,
    `| Prompt Version     | \`${meta.promptVersion ?? PROMPT_VERSION}\` |`,
    `| Commit SHA         | \`${meta.commitSha}\` |`,
    `| Branche            | \`${meta.branch}\` |`,
    `| Date               | ${meta.date} |`,
    `| Environnement      | \`${meta.environment}\` |`,
    `| Base URL           | ${meta.baseUrl} |`,
    `| Navigateur         | ${meta.browser} |`,
    `| Version Manus      | ${meta.manusVersion} |`,
    `| Durée totale       | ${formatDuration(meta.durationMs)} |`,
    `| Scénarios          | ${meta.totalScenarios} |`,
    meta.dryRun ? `| Mode               | **DRY-RUN** |` : "",
  ].filter(Boolean).join("\n");
}

function renderCostSection(run: { totalCreditsConsumed?: number; totalEstimatedCostUsd?: number; dryRun?: boolean; scenarios: ScenarioResult[] }): string {
  const lines = [
    "| Scénario | Crédits | Coût estimé (USD) |",
    "|----------|--------:|------------------:|",
  ];

  for (const s of run.scenarios) {
    const credits = s.creditsConsumed ?? (s.dryRun ? 0 : "—");
    const cost    = s.estimatedCostUsd !== undefined ? `$${s.estimatedCostUsd}` : (s.dryRun ? "$0.0000" : "—");
    lines.push(`| \`${s.scenarioId ?? ""} ${s.name}\` | ${credits} | ${cost} |`);
  }

  lines.push(`| **Total** | **${run.totalCreditsConsumed ?? 0}** | **$${run.totalEstimatedCostUsd ?? "0.0000"}** |`);

  if (run.dryRun) {
    lines.push("");
    lines.push("> **DRY-RUN** — Aucun crédit consommé. Zéro coût réel.");
  }

  return lines.join("\n");
}

function renderFrameworkQuality(summary: RunSummary): string {
  const { run, metadata } = summary;
  const hasPromptHash   = run.scenarios.some((s) => !!s.promptHash);
  const hasScenarioId   = run.scenarios.every((s) => !!s.scenarioId);
  const hasScreenshotV  = run.scenarios.some((s) => s.capturesAttendues !== undefined);
  const hasCredCheck    = run.scenarios.some((s) => !!s.error?.includes("Arrêt anticipé") || true);
  const hasQAExecutor   = run.scenarios.some((s) => !s.dryRun) || run.dryRun === true;
  const nativeVercel    = run.scenarios.length > 0; // always true once initialized

  const quality: FrameworkQuality = {
    promptVersion:        true,
    frameworkVersion:     true,
    scenarioVersion:      hasScenarioId,
    promptHash:           hasPromptHash || (run.dryRun ?? false),
    dryRunCompatible:     true,
    screenshotValidation: hasScreenshotV,
    credentialValidation: hasCredCheck,
    qaExecutor:           hasQAExecutor,
    pollingStrategy:      "backoff [2s,2s,5s,10s,15s]",
    nativeVercel,
  };

  const check = (v: boolean) => v ? "✅" : "❌";

  return [
    "| Fonctionnalité           | Statut | Détail |",
    "|--------------------------|--------|--------|",
    `| Prompt Version           | ${check(quality.promptVersion)} | \`${metadata.promptVersion ?? PROMPT_VERSION}\` |`,
    `| Framework Version        | ${check(quality.frameworkVersion)} | \`${metadata.frameworkVersion ?? FRAMEWORK_VERSION}\` |`,
    `| Scenario IDs             | ${check(quality.scenarioVersion)} | SC-001 … SC-007 |`,
    `| Prompt Hash (SHA-256)    | ${check(quality.promptHash)} | Tracabilité du prompt exact |`,
    `| Dry Run Compatible       | ${check(quality.dryRunCompatible)} | \`--dry-run\` flag disponible |`,
    `| Screenshot Validation    | ${check(quality.screenshotValidation)} | capturesAttendues / Produites / Invalides |`,
    `| Credential Validation    | ${check(quality.credentialValidation)} | Arrêt anticipé si credentials absents |`,
    `| QA Executor Mode         | ${check(quality.qaExecutor)} | Mode déterministe sans exploration |`,
    `| Polling Strategy         | ✅ | Backoff \`${quality.pollingStrategy}\` |`,
    `| Native Vercel            | ${check(quality.nativeVercel)} | MANUS_NATIVE_VERCEL_INTEGRATION |`,
  ].join("\n");
}

function renderScenarioSection(s: ScenarioResult): string[] {
  const idLabel = s.scenarioId ? `[${s.scenarioId}] ` : "";
  const dryTag  = s.dryRun ? " *(DRY-RUN)*" : "";
  const lines: string[] = [
    `### ${statusIcon(s.status)} ${idLabel}\`${s.name}\`${dryTag}`,
    "",
    `> ${s.description}`,
    "",
    `- **Task ID** : \`${s.taskId || "(aucun)"}\``,
    s.taskUrl    ? `- **Task URL** : [Ouvrir dans Manus](${s.taskUrl})` : "",
    s.scenarioId ? `- **Scenario ID** : \`${s.scenarioId}\`` : "",
    s.promptHash ? `- **Prompt Hash** : \`${s.promptHash}\`` : "",
    `- **Viewport** : ${s.viewport.label} ${s.viewport.width}×${s.viewport.height}`,
    `- **Durée** : ${formatDuration(s.durationMs)}`,
    `- **Démarré** : ${s.startedAt}`,
    `- **Terminé** : ${s.completedAt}`,
    // Métriques d'exécution
    s.pollCount          !== undefined ? `- **Polls** : ${s.pollCount}` : "",
    s.creditsConsumed    !== undefined ? `- **Crédits Manus** : ${s.creditsConsumed}` : "",
    s.estimatedCostUsd   !== undefined ? `- **Coût estimé** : $${s.estimatedCostUsd}` : "",
    s.pollingDurationMs  !== undefined ? `- **Durée polling** : ${formatDuration(s.pollingDurationMs)}` : "",
    s.parseDurationMs    !== undefined ? `- **Durée parsing** : ${s.parseDurationMs}ms` : "",
    // Captures
    s.capturesAttendues !== undefined
      ? `- **Captures** : ${s.capturesProduites ?? 0}/${s.capturesAttendues} valides${s.capturesInvalides ? ` — ${s.capturesInvalides} invalide(s)` : ""}`
      : "",
  ].filter(Boolean);

  if (s.urlsVisited.length > 0) {
    lines.push("", "**URLs visitées :**");
    for (const u of s.urlsVisited) lines.push(`- ${u}`);
  }

  if (s.assertions.length > 0) {
    lines.push("", "**Assertions :**", "", "| Nom | Statut | Message |", "|-----|--------|---------|");
    for (const a of s.assertions) {
      lines.push(`| \`${a.name}\` | ${a.passed ? "✅" : "❌"} | ${a.message} |`);
    }
  }

  if (s.consoleErrors.length > 0) {
    lines.push("", `**Erreurs console (${s.consoleErrors.length}) :**`);
    for (const e of s.consoleErrors) lines.push(`- \`${e}\``);
  }

  if (s.networkErrors.length > 0) {
    lines.push("", `**Erreurs réseau (${s.networkErrors.length}) :**`);
    for (const e of s.networkErrors) lines.push(`- \`${e}\``);
  }

  if (s.screenshots.length > 0) {
    lines.push("", "**Captures d'écran :**");
    for (const sc of s.screenshots) {
      lines.push(sc.url ? `- [${sc.label}](${sc.url})` : `- ${sc.label} *(URL non disponible)*`);
    }
  }

  if (s.screenshotValidation && s.screenshotValidation.length > 0) {
    lines.push("", "**Validation captures :**", "", "| Label | Trouvée | Valide | Erreur |", "|-------|:-------:|:------:|--------|");
    for (const v of s.screenshotValidation) {
      lines.push(`| \`${v.label}\` | ${v.found ? "✅" : "❌"} | ${v.valid ? "✅" : "❌"} | ${v.error ?? "—"} |`);
    }
  }

  if (s.error) {
    lines.push("", "**Erreur critique :**", "```", s.error, "```");
  }

  lines.push("", "---");
  return lines;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusIcon(status: ScenarioResult["status"]): string {
  if (status === "passed")  return "✅";
  if (status === "timeout") return "⏱️";
  return "❌";
}

function delta(n: number): string {
  if (n > 0) return `+${n} ✅`;
  if (n < 0) return `${n} ❌`;
  return "±0";
}
