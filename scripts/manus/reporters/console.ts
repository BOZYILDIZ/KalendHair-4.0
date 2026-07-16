// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Reporter Console
// ─────────────────────────────────────────────────────────────────────────────

import { formatDuration, formatDurationDelta } from "../utils/date";
import { scoreBar }                            from "../core/score";
import { severityEmoji }                       from "../analysis/severity";
import { finalVerdict }                        from "../analysis/summary";
import { FRAMEWORK_VERSION, PROMPT_VERSION }   from "../core/version";
import type {
  ManusEnvironment,
  Reporter,
  RunSummary,
  ScenarioResult,
} from "../core/types";

const W = 64;
const LINE = "═".repeat(W);
const DASH = "─".repeat(W);

export class ConsoleReporter implements Reporter {
  onRunStart(meta: {
    runId:       string;
    environment: ManusEnvironment;
    baseUrl:     string;
    total:       number;
  }): void {
    console.log("\n" + LINE);
    console.log(`  KalendHair QA — Manus Framework v${FRAMEWORK_VERSION}`);
    console.log(LINE);
    console.log(`  Run ID      : ${meta.runId}`);
    console.log(`  Env         : ${meta.environment}`);
    console.log(`  Base URL    : ${meta.baseUrl}`);
    console.log(`  Scénarios   : ${meta.total}`);
    console.log(`  Prompt Ver  : ${PROMPT_VERSION}`);
    console.log(LINE + "\n");
  }

  onScenarioEnd(result: ScenarioResult): void {
    const icon   = result.status === "passed" ? "✅" : result.status === "timeout" ? "⏱️ " : "❌";
    const vp     = `${result.viewport.label} ${result.viewport.width}×${result.viewport.height}`;
    const passed = result.assertions.filter((a) => a.passed).length;
    const idTag  = result.scenarioId ? `[${result.scenarioId}] ` : "";

    console.log(`${icon} ${idTag}${result.name}${result.dryRun ? " (DRY-RUN)" : ""}`);
    console.log(`   Viewport   : ${vp}`);
    console.log(`   Durée      : ${formatDuration(result.durationMs)}`);
    console.log(`   Assertions : ${passed}/${result.assertions.length}`);

    // Métriques d'exécution Manus
    if (result.pollCount !== undefined) {
      const credits = result.creditsConsumed !== undefined ? ` | crédits: ${result.creditsConsumed}` : "";
      const cost    = result.estimatedCostUsd !== undefined ? ` | coût: $${result.estimatedCostUsd}` : "";
      console.log(`   Polls      : ${result.pollCount}${credits}${cost}`);
    }
    if (result.taskUrl) {
      console.log(`   Task URL   : ${result.taskUrl}`);
    }
    if (result.pollingDurationMs !== undefined) {
      console.log(`   Polling    : ${formatDuration(result.pollingDurationMs)}`);
    }
    if (result.promptHash) {
      console.log(`   Hash       : ${result.promptHash.slice(0, 16)}…`);
    }
    if (result.capturesAttendues !== undefined) {
      console.log(`   Captures   : ${result.capturesProduites}/${result.capturesAttendues} valides${result.capturesInvalides ? ` | ${result.capturesInvalides} invalides` : ""}`);
    }

    for (const f of result.assertions.filter((a) => !a.passed)) {
      console.log(`     ✗ ${f.name} — ${f.message}`);
    }
    for (const e of result.consoleErrors.slice(0, 3)) {
      console.log(`     🔴 Console: ${e}`);
    }
    for (const e of result.networkErrors.slice(0, 3)) {
      console.log(`     🟠 Réseau: ${e}`);
    }
    if (result.error) console.log(`     ⚠️  Erreur: ${result.error}`);
    console.log();
  }

  async onRunEnd(summary: RunSummary): Promise<void> {
    const { run, score, comparison, analysis } = summary;
    const verdict = finalVerdict(summary);

    // ── Executive Summary ─────────────────────────────────────────────────────
    console.log(LINE);
    console.log("  QA SCORE");
    console.log(LINE);
    console.log();
    console.log(`  ${scoreBar(score.total)}  ${score.total} / 100`);
    console.log();
    if (score.qaInfraBlocked) {
      console.log("  ⚠️   QA INFRASTRUCTURE BLOCKED");
      console.log("  (Tous les scénarios ont timeouté — score non représentatif)");
    } else {
      console.log(`  ${verdict === "READY_FOR_MERGE" ? "✅  READY FOR MERGE" : "🚫  BLOCK MERGE"}`);
    }
    console.log();

    if (analysis) {
      const s = analysis.stats;
      console.log("  Résumé");
      console.log(`  • ${s.totalAssertions} assertion${s.totalAssertions > 1 ? "s" : ""} exécutée${s.totalAssertions > 1 ? "s" : ""}`);
      console.log(`  • ${s.passedAssertions} réussie${s.passedAssertions > 1 ? "s" : ""}`);
      if (s.failedAssertions > 0) console.log(`  • ${s.failedAssertions} en échec`);
      console.log(`  • ${s.consoleErrors} erreur${s.consoleErrors !== 1 ? "s" : ""} console`);
      console.log(`  • ${s.networkErrors} erreur${s.networkErrors !== 1 ? "s" : ""} réseau`);
      console.log(`  • ${run.totalScenarios} scénario${run.totalScenarios > 1 ? "s" : ""}`);
      console.log(`  • ${s.screenshots} capture${s.screenshots > 1 ? "s" : ""}`);
      console.log(`  • Temps total : ${formatDuration(run.durationMs)}`);
      console.log();

      // Quality Gates
      console.log(DASH);
      console.log("  Quality Gates");
      console.log(DASH);
      for (const gate of analysis.qualityGates) {
        const icon = gate.passed ? "✅" : gate.consequence === "BLOCK_MERGE" ? "🚫" : "⚠️ ";
        console.log(`  ${icon} ${gate.name.padEnd(24)} ${gate.condition}`);
      }
      console.log();

      // Insights
      if (analysis.insights.length > 0) {
        console.log(DASH);
        console.log("  Insights");
        console.log(DASH);
        for (const insight of analysis.insights) {
          const icon = insight.positive ? "✓" : "✗";
          console.log(`  ${icon} ${insight.message}`);
        }
        console.log();
      }

      // Régressions
      if (analysis.regressions.length > 0) {
        console.log(DASH);
        console.log("  Régressions");
        console.log(DASH);
        for (const r of analysis.regressions) {
          console.log(`  ${severityEmoji(r.severity)} [${r.severity}] ${r.title}`);
          if (r.affectedScenario) console.log(`    Scénario : ${r.affectedScenario}`);
          if (r.isNew)            console.log(`    Première apparition.`);
          console.log(`    Impact : ${r.impact}`);
        }
        console.log();
      }

      // Recommandations
      if (analysis.recommendations.length > 0) {
        console.log(DASH);
        console.log("  Recommandations");
        console.log(DASH);
        for (const rec of analysis.recommendations) {
          const icon = rec.priority === "HAUTE" ? "🔴" : rec.priority === "MOYENNE" ? "🟡" : "🔵";
          console.log(`  ${icon} [${rec.priority}] ${rec.title}`);
        }
        console.log();
      }

      // Historique
      if (analysis.historyStats) {
        const hs = analysis.historyStats;
        console.log(DASH);
        console.log("  Historique");
        console.log(DASH);
        console.log(`  Runs          : ${hs.totalRuns}`);
        console.log(`  Score moyen   : ${hs.averageScore}/100`);
        console.log(`  Meilleur      : ${hs.bestScore}/100`);
        console.log(`  Pire          : ${hs.worstScore}/100`);
        console.log(`  Durée moyenne : ${formatDuration(hs.avgDurationMs)}`);
        console.log(`  ${hs.trendLabel}`);
        console.log();
      }
    }

    // Comparaison avec run précédent
    if (comparison && comparison.trend !== "no_previous") {
      console.log(DASH);
      const trendIcon =
        comparison.trend === "improved" ? "📈" :
        comparison.trend === "degraded" ? "📉" : "➡️ ";
      console.log(`  ${trendIcon} vs ${comparison.previousRunId ?? "—"}`);
      console.log(`  Score QA  : ${comparison.scoreDelta >= 0 ? "+" : ""}${comparison.scoreDelta}`);
      console.log(`  Durée     : ${formatDurationDelta(comparison.durationDelta)}`);
      console.log();
    }

    // Score détail
    console.log(DASH);
    console.log("  Score détail");
    console.log(DASH);
    console.log(`  Assertions    ${String(score.breakdown.assertions).padStart(3)} / 30`);
    console.log(`  Console       ${String(score.breakdown.console).padStart(3)} / 20`);
    console.log(`  Réseau        ${String(score.breakdown.network).padStart(3)} / 20`);
    console.log(`  Responsive    ${String(score.breakdown.responsive).padStart(3)} / 10`);
    console.log(`  Accessibilité ${String(score.breakdown.accessibility).padStart(3)} / 10`);
    console.log(`  Captures      ${String(score.breakdown.screenshots).padStart(3)} /  5`);
    console.log(`  Performance   ${String(score.breakdown.performance).padStart(3)} /  5`);
    console.log();
    console.log(LINE);
    console.log(`  Total   : ${run.totalScenarios} scénarios | ✅ ${run.passedScenarios} | ❌ ${run.failedScenarios} | ${formatDuration(run.durationMs)}`);
    if (run.totalCreditsConsumed !== undefined) {
      console.log(`  Crédits : ${run.totalCreditsConsumed} | Coût estimé : $${run.totalEstimatedCostUsd ?? "?"}`);
    }
    if (run.dryRun) {
      console.log(`  Mode    : DRY-RUN (zéro crédit consommé)`);
    }
    console.log(LINE + "\n");
  }
}
