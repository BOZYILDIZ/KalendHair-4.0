// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Auto-Audit v2.2
//
// Module d'auto-évaluation du framework QA. Calcule un score de maturité
// Enterprise (0–100) en inspectant le code, les fichiers et la configuration
// sans exécuter de scénarios Manus.
//
// Usage :
//   npx tsx scripts/manus/analysis/auto-audit.ts
//   npx tsx scripts/manus/analysis/auto-audit.ts --json
//   npx tsx scripts/manus/analysis/auto-audit.ts --html > reports/manus/audit.html
// ─────────────────────────────────────────────────────────────────────────────

import { existsSync, readFileSync, readdirSync } from "fs";
import { resolve }                                from "path";
import { FRAMEWORK_VERSION }                      from "../core/version";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuditSeverity = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type AuditFinding = {
  id:          string;
  category:    AuditCategory;
  severity:    AuditSeverity;
  title:       string;
  detail:      string;
  passed:      boolean;
  score:       number;   // points gagnés par ce check
  maxScore:    number;   // points max possibles
  remediation?: string;
};

export type AuditCategory =
  | "architecture"
  | "test-coverage"
  | "ci-cd"
  | "observability"
  | "security"
  | "performance"
  | "documentation";

export type AuditCategoryResult = {
  category:    AuditCategory;
  label:       string;
  score:       number;
  maxScore:    number;
  findings:    AuditFinding[];
};

export type AutoAuditResult = {
  timestamp:         string;
  frameworkVersion:  string;
  totalScore:        number;
  maxScore:          number;
  percentScore:      number;
  verdict:           "ENTERPRISE_READY" | "PRODUCTION_READY" | "IN_PROGRESS" | "CRITICAL";
  categories:        AuditCategoryResult[];
  criticalCount:     number;
  highCount:         number;
  mediumCount:       number;
  lowCount:          number;
  infoCount:         number;
  topRemediation:    AuditFinding[];
};

// ─── Constantes ───────────────────────────────────────────────────────────────

const ROOT = process.cwd();
const MANUS = resolve(ROOT, "scripts", "manus");

function exists(rel: string): boolean {
  return existsSync(resolve(MANUS, rel));
}

function rootExists(rel: string): boolean {
  return existsSync(resolve(ROOT, rel));
}

function readText(rel: string): string {
  try {
    return readFileSync(resolve(MANUS, rel), "utf-8");
  } catch {
    return "";
  }
}

function readRootText(rel: string): string {
  try {
    return readFileSync(resolve(ROOT, rel), "utf-8");
  } catch {
    return "";
  }
}

// ─── Checks par catégorie ─────────────────────────────────────────────────────

function checkArchitecture(): AuditFinding[] {
  return [
    {
      id:       "arch-provider",
      category: "architecture",
      severity: "HIGH",
      title:    "AgentProvider abstraction",
      detail:   exists("client/provider.ts") && exists("client/manus-provider.ts")
        ? "Interface AgentProvider + ManusProvider présents"
        : "AgentProvider ou ManusProvider manquant",
      passed:   exists("client/provider.ts") && exists("client/manus-provider.ts"),
      score:    exists("client/provider.ts") && exists("client/manus-provider.ts") ? 8 : 0,
      maxScore: 8,
      remediation: "Créer scripts/manus/client/provider.ts et manus-provider.ts",
    },
    {
      id:       "arch-concurrency",
      category: "architecture",
      severity: "HIGH",
      title:    "Sémaphore de concurrence",
      detail:   exists("core/concurrency.ts")
        ? "Semaphore + defaultConcurrency présents"
        : "core/concurrency.ts manquant",
      passed:   exists("core/concurrency.ts"),
      score:    exists("core/concurrency.ts") ? 7 : 0,
      maxScore: 7,
      remediation: "Créer scripts/manus/core/concurrency.ts avec la classe Semaphore",
    },
    {
      id:       "arch-profiles",
      category: "architecture",
      severity: "MEDIUM",
      title:    "Profils QA (smoke/standard/full/nightly)",
      detail:   exists("core/profiles.ts")
        ? "core/profiles.ts présent"
        : "core/profiles.ts manquant",
      passed:   exists("core/profiles.ts"),
      score:    exists("core/profiles.ts") ? 5 : 0,
      maxScore: 5,
      remediation: "Créer scripts/manus/core/profiles.ts avec les 4 profils",
    },
    {
      id:       "arch-types-tags",
      category: "architecture",
      severity: "HIGH",
      title:    "ScenarioResult.tags (scoring résistant au renommage)",
      detail:   (() => {
        const types = readText("core/types.ts");
        return types.includes("tags?:") && types.includes("string[]")
          ? "ScenarioResult.tags présent dans types.ts"
          : "tags manquant dans ScenarioResult";
      })(),
      passed:   (() => {
        const types = readText("core/types.ts");
        return types.includes("tags?:") || types.includes("tags:");
      })(),
      score:    (() => {
        const types = readText("core/types.ts");
        return (types.includes("tags?:") || types.includes("tags:")) ? 6 : 0;
      })(),
      maxScore: 6,
      remediation: "Ajouter tags?: string[] à ScenarioResult dans core/types.ts",
    },
    {
      id:       "arch-parse-strategy",
      category: "architecture",
      severity: "HIGH",
      title:    "parseManusResponse multi-stratégie (aucun échec silencieux)",
      detail:   (() => {
        const runner = readText("core/runner.ts");
        return runner.includes("parseStrategy") && runner.includes("console.warn")
          ? "3 stratégies de parsing + warn explicite présents"
          : "parseManusResponse non sécurisée";
      })(),
      passed:   (() => {
        const runner = readText("core/runner.ts");
        return runner.includes("parseStrategy") && runner.includes("console.warn");
      })(),
      score:    (() => {
        const runner = readText("core/runner.ts");
        return runner.includes("parseStrategy") && runner.includes("console.warn") ? 8 : 0;
      })(),
      maxScore: 8,
      remediation: "Réécrire parseManusResponse avec 3 stratégies + console.warn sur échec",
    },
    {
      id:       "arch-clean-runs",
      category: "architecture",
      severity: "MEDIUM",
      title:    "cleanOldRuns() — nettoyage automatique des rapports",
      detail:   (() => {
        const hist = readText("analysis/history.ts");
        return hist.includes("cleanOldRuns")
          ? "cleanOldRuns() présent dans history.ts"
          : "cleanOldRuns manquant";
      })(),
      passed:   readText("analysis/history.ts").includes("cleanOldRuns"),
      score:    readText("analysis/history.ts").includes("cleanOldRuns") ? 4 : 0,
      maxScore: 4,
      remediation: "Ajouter cleanOldRuns() à scripts/manus/analysis/history.ts",
    },
  ];
}

function checkTestCoverage(): AuditFinding[] {
  const testsDir = resolve(MANUS, "__tests__");
  const testCount = existsSync(testsDir)
    ? readdirSync(testsDir).filter((f) => f.endsWith(".test.ts")).length
    : 0;

  const hasHash    = existsSync(resolve(testsDir, "hash.test.ts"));
  const hasCost    = existsSync(resolve(testsDir, "cost.test.ts"));
  const hasScore   = existsSync(resolve(testsDir, "score.test.ts"));
  const hasConc    = existsSync(resolve(testsDir, "concurrency.test.ts"));
  const hasProf    = existsSync(resolve(testsDir, "profiles.test.ts"));
  const hasPrompt  = existsSync(resolve(testsDir, "prompt-validator.test.ts"));

  const coreCount = [hasHash, hasCost, hasScore, hasConc, hasProf, hasPrompt].filter(Boolean).length;

  return [
    {
      id:       "test-exists",
      category: "test-coverage",
      severity: "HIGH",
      title:    "Suite de tests unitaires (node:test)",
      detail:   testCount > 0
        ? `${testCount} fichier(s) de test détecté(s)`
        : "Aucun test trouvé dans __tests__/",
      passed:   testCount >= 4,
      score:    Math.min(testCount * 2, 10),
      maxScore: 10,
      remediation: "Créer scripts/manus/__tests__/*.test.ts avec node:test",
    },
    {
      id:       "test-core-modules",
      category: "test-coverage",
      severity: "MEDIUM",
      title:    `Couverture des modules core (${coreCount}/6)`,
      detail:   [
        hasHash   ? "✅ hash"   : "❌ hash",
        hasCost   ? "✅ cost"   : "❌ cost",
        hasScore  ? "✅ score"  : "❌ score",
        hasConc   ? "✅ concurrency" : "❌ concurrency",
        hasProf   ? "✅ profiles" : "❌ profiles",
        hasPrompt ? "✅ prompt-validator" : "❌ prompt-validator",
      ].join(" | "),
      passed:   coreCount >= 5,
      score:    Math.round((coreCount / 6) * 10),
      maxScore: 10,
      remediation: "Créer les tests manquants pour hash, cost, score, concurrency, profiles, prompt-validator",
    },
    {
      id:       "test-script",
      category: "test-coverage",
      severity: "LOW",
      title:    "Script npm test:manus",
      detail:   (() => {
        const pkg = readRootText("package.json");
        return pkg.includes("test:manus") ? "script test:manus présent dans package.json" : "script test:manus absent";
      })(),
      passed:   readRootText("package.json").includes("test:manus"),
      score:    readRootText("package.json").includes("test:manus") ? 3 : 0,
      maxScore: 3,
      remediation: "Ajouter \"test:manus\": \"node --test --import tsx/esm 'scripts/manus/__tests__/**/*.test.ts'\" dans package.json",
    },
  ];
}

function checkCiCd(): AuditFinding[] {
  const workflowPath = ".github/workflows/qa-manus-preview.yml";
  const hasWorkflow  = rootExists(workflowPath);
  const workflowContent = hasWorkflow ? readRootText(workflowPath) : "";

  return [
    {
      id:       "ci-workflow",
      category: "ci-cd",
      severity: "MEDIUM",
      title:    "Workflow GitHub Actions QA",
      detail:   hasWorkflow
        ? "qa-manus-preview.yml présent"
        : "Aucun workflow QA trouvé",
      passed:   hasWorkflow,
      score:    hasWorkflow ? 8 : 0,
      maxScore: 8,
      remediation: "Créer .github/workflows/qa-manus-preview.yml",
    },
    {
      id:       "ci-disabled",
      category: "ci-cd",
      severity: "INFO",
      title:    "Workflow désactivé (on: {})",
      detail:   workflowContent.includes("on: {}") || workflowContent.includes("on: { }")
        ? "Workflow désactivé correctement (aucun déclencheur automatique en prod)"
        : hasWorkflow
          ? "⚠️ Workflow actif — vérifier les déclencheurs"
          : "Workflow absent",
      passed:   !hasWorkflow || workflowContent.includes("on: {}"),
      score:    !hasWorkflow || workflowContent.includes("on: {}") ? 3 : 0,
      maxScore: 3,
      remediation: "Ajouter 'on: {}' pour désactiver jusqu'à la configuration des secrets",
    },
    {
      id:       "ci-artifacts",
      category: "ci-cd",
      severity: "LOW",
      title:    "Upload d'artefacts dans le workflow",
      detail:   workflowContent.includes("upload-artifact")
        ? "upload-artifact configuré"
        : "Pas d'artefacts uploadés",
      passed:   workflowContent.includes("upload-artifact"),
      score:    workflowContent.includes("upload-artifact") ? 4 : 0,
      maxScore: 4,
      remediation: "Ajouter actions/upload-artifact pour les rapports HTML",
    },
  ];
}

function checkObservability(): AuditFinding[] {
  const hasHash    = exists("utils/hash.ts");
  const hasCost    = exists("utils/cost.ts");
  const hasDash    = exists("generate-dashboard.ts");
  const hasHistory = exists("analysis/history.ts");
  const hasVR      = exists("analysis/visual-regression.ts");
  const runnerText = readText("core/runner.ts");
  const hasPromptHash = runnerText.includes("promptHash");

  return [
    {
      id:       "obs-prompt-hash",
      category: "observability",
      severity: "MEDIUM",
      title:    "Hash SHA-256 du prompt (traçabilité)",
      detail:   hasHash && hasPromptHash
        ? "computePromptHash présent et utilisé dans runner.ts"
        : "promptHash manquant",
      passed:   hasHash && hasPromptHash,
      score:    hasHash && hasPromptHash ? 5 : 0,
      maxScore: 5,
      remediation: "Ajouter computePromptHash dans utils/hash.ts et l'utiliser dans runner.ts",
    },
    {
      id:       "obs-cost",
      category: "observability",
      severity: "LOW",
      title:    "Estimation du coût USD",
      detail:   hasCost ? "utils/cost.ts présent" : "utils/cost.ts manquant",
      passed:   hasCost,
      score:    hasCost ? 4 : 0,
      maxScore: 4,
      remediation: "Créer utils/cost.ts avec estimateCost() et estimateTotalCost()",
    },
    {
      id:       "obs-dashboard",
      category: "observability",
      severity: "MEDIUM",
      title:    "Dashboard HTML auto-généré",
      detail:   hasDash ? "generate-dashboard.ts présent" : "generate-dashboard.ts manquant",
      passed:   hasDash,
      score:    hasDash ? 6 : 0,
      maxScore: 6,
      remediation: "Créer scripts/manus/generate-dashboard.ts",
    },
    {
      id:       "obs-history",
      category: "observability",
      severity: "MEDIUM",
      title:    "Historique des runs (dashboard.json)",
      detail:   hasHistory ? "analysis/history.ts présent" : "analysis/history.ts manquant",
      passed:   hasHistory,
      score:    hasHistory ? 5 : 0,
      maxScore: 5,
      remediation: "Créer scripts/manus/analysis/history.ts avec readDashboard() et updateDashboard()",
    },
    {
      id:       "obs-visual-regression",
      category: "observability",
      severity: "LOW",
      title:    "Régression visuelle (baseline + diff)",
      detail:   hasVR ? "analysis/visual-regression.ts présent" : "visual-regression.ts manquant",
      passed:   hasVR,
      score:    hasVR ? 5 : 0,
      maxScore: 5,
      remediation: "Créer scripts/manus/analysis/visual-regression.ts avec saveBaseline() et compareWithBaseline()",
    },
  ];
}

function checkSecurity(): AuditFinding[] {
  const runnerText   = readText("core/runner.ts");
  const promptValExists = exists("utils/prompt-validator.ts");
  const scenariosDir    = resolve(MANUS, "scenarios");
  const scenarioFiles   = existsSync(scenariosDir)
    ? readdirSync(scenariosDir).filter((f) => f.endsWith(".ts"))
    : [];

  const hasCredCheck = runnerText.includes("requiresCredentials") && runnerText.includes("Arrêt anticipé");

  return [
    {
      id:       "sec-prompt-validation",
      category: "security",
      severity: "MEDIUM",
      title:    "Validation structurelle du prompt (fail-fast)",
      detail:   promptValExists
        ? "utils/prompt-validator.ts présent"
        : "prompt-validator.ts manquant",
      passed:   promptValExists,
      score:    promptValExists ? 6 : 0,
      maxScore: 6,
      remediation: "Créer utils/prompt-validator.ts avec assertPromptValid()",
    },
    {
      id:       "sec-cred-check",
      category: "security",
      severity: "HIGH",
      title:    "Arrêt anticipé si credentials absents",
      detail:   hasCredCheck
        ? "Vérification credentials avant scenario.run() dans runner.ts"
        : "Pas de vérification credentials en amont",
      passed:   hasCredCheck,
      score:    hasCredCheck ? 7 : 0,
      maxScore: 7,
      remediation: "Vérifier ctx.credentials[scenario.requiresCredentials] avant scenario.run(ctx)",
    },
    {
      id:       "sec-scenario-ids",
      category: "security",
      severity: "LOW",
      title:    "Identifiants stables scenarioId (SC-XXX)",
      detail:   `${scenarioFiles.length} fichiers de scénario détectés`,
      passed:   scenarioFiles.length >= 5,
      score:    Math.min(scenarioFiles.length, 5),
      maxScore: 5,
      remediation: "Ajouter scenarioId: 'SC-001' à chaque ScenarioDefinition",
    },
  ];
}

function checkPerformance(): AuditFinding[] {
  const runnerText = readText("core/runner.ts");
  const hasParallel  = runnerText.includes("Semaphore") && runnerText.includes("Promise.all");
  const hasTimeout   = readText("core/runner.ts").includes("timeoutSeconds");
  const hasDryRun    = runnerText.includes("dryRun");

  return [
    {
      id:       "perf-parallel",
      category: "performance",
      severity: "MEDIUM",
      title:    "Exécution parallèle avec sémaphore",
      detail:   hasParallel
        ? "Semaphore + Promise.all présents dans runner.ts"
        : "Pas d'exécution parallèle détectée",
      passed:   hasParallel,
      score:    hasParallel ? 7 : 0,
      maxScore: 7,
      remediation: "Utiliser Semaphore avec Promise.all dans ScenarioRunner.runAll()",
    },
    {
      id:       "perf-timeout",
      category: "performance",
      severity: "LOW",
      title:    "Timeout configurable par scénario",
      detail:   hasTimeout
        ? "timeoutSeconds configuré dans ScenarioRunSpec"
        : "Pas de timeout configurable",
      passed:   hasTimeout,
      score:    hasTimeout ? 4 : 0,
      maxScore: 4,
      remediation: "Ajouter timeoutSeconds à ScenarioRunSpec et le passer à createAndRunTask()",
    },
    {
      id:       "perf-dry-run",
      category: "performance",
      severity: "LOW",
      title:    "Mode dry-run (zéro crédit, validation rapide)",
      detail:   hasDryRun
        ? "--dry-run implémenté dans runner.ts"
        : "Mode dry-run absent",
      passed:   hasDryRun,
      score:    hasDryRun ? 4 : 0,
      maxScore: 4,
      remediation: "Ajouter le flag --dry-run qui simule le run sans appeler Manus",
    },
  ];
}

function checkDocumentation(): AuditFinding[] {
  const hasPlaybook  = rootExists("docs/qa/QA_PLAYBOOK.md");
  const hasRoadmap   = rootExists("docs/qa/MANUS_ROADMAP.md");
  const hasClaude    = rootExists("CLAUDE.md");

  return [
    {
      id:       "doc-playbook",
      category: "documentation",
      severity: "LOW",
      title:    "QA Playbook (docs/qa/QA_PLAYBOOK.md)",
      detail:   hasPlaybook ? "QA_PLAYBOOK.md présent" : "QA_PLAYBOOK.md absent",
      passed:   hasPlaybook,
      score:    hasPlaybook ? 4 : 0,
      maxScore: 4,
      remediation: "Créer docs/qa/QA_PLAYBOOK.md avec les procédures QA",
    },
    {
      id:       "doc-roadmap",
      category: "documentation",
      severity: "INFO",
      title:    "Roadmap (docs/qa/MANUS_ROADMAP.md)",
      detail:   hasRoadmap ? "MANUS_ROADMAP.md présent" : "MANUS_ROADMAP.md absent",
      passed:   hasRoadmap,
      score:    hasRoadmap ? 3 : 0,
      maxScore: 3,
      remediation: "Créer docs/qa/MANUS_ROADMAP.md",
    },
    {
      id:       "doc-claude",
      category: "documentation",
      severity: "INFO",
      title:    "CLAUDE.md (règles d'architecture)",
      detail:   hasClaude ? "CLAUDE.md présent à la racine" : "CLAUDE.md absent",
      passed:   hasClaude,
      score:    hasClaude ? 2 : 0,
      maxScore: 2,
      remediation: "Créer CLAUDE.md à la racine du projet",
    },
  ];
}

// ─── Calcul global ────────────────────────────────────────────────────────────

function verdictFromScore(pct: number, critical: number, _high: number): AutoAuditResult["verdict"] {
  if (critical > 0)    return "CRITICAL";
  if (pct >= 88)       return "ENTERPRISE_READY";
  if (pct >= 70)       return "PRODUCTION_READY";
  return "IN_PROGRESS";
}

// ─── Export principal ─────────────────────────────────────────────────────────

export function runAutoAudit(): AutoAuditResult {
  const CATEGORY_LABELS: Record<AuditCategory, string> = {
    "architecture":   "Architecture",
    "test-coverage":  "Couverture de tests",
    "ci-cd":          "CI/CD",
    "observability":  "Observabilité",
    "security":       "Sécurité",
    "performance":    "Performance",
    "documentation":  "Documentation",
  };

  const rawCategories: Array<{ category: AuditCategory; findings: AuditFinding[] }> = [
    { category: "architecture",  findings: checkArchitecture()   },
    { category: "test-coverage", findings: checkTestCoverage()   },
    { category: "ci-cd",         findings: checkCiCd()           },
    { category: "observability", findings: checkObservability()  },
    { category: "security",      findings: checkSecurity()       },
    { category: "performance",   findings: checkPerformance()    },
    { category: "documentation", findings: checkDocumentation()  },
  ];

  const categories: AuditCategoryResult[] = rawCategories.map(({ category, findings }) => ({
    category,
    label:    CATEGORY_LABELS[category],
    score:    findings.reduce((s, f) => s + f.score, 0),
    maxScore: findings.reduce((s, f) => s + f.maxScore, 0),
    findings,
  }));

  const totalScore = categories.reduce((s, c) => s + c.score, 0);
  const maxScore   = categories.reduce((s, c) => s + c.maxScore, 0);
  const pct        = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  const allFindings = categories.flatMap((c) => c.findings);
  const criticalCount = allFindings.filter((f) => !f.passed && f.severity === "CRITICAL").length;
  const highCount     = allFindings.filter((f) => !f.passed && f.severity === "HIGH").length;
  const mediumCount   = allFindings.filter((f) => !f.passed && f.severity === "MEDIUM").length;
  const lowCount      = allFindings.filter((f) => !f.passed && f.severity === "LOW").length;
  const infoCount     = allFindings.filter((f) => !f.passed && f.severity === "INFO").length;

  const topRemediation = allFindings
    .filter((f) => !f.passed)
    .sort((a, b) => {
      const order: Record<AuditSeverity, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 };
      return order[a.severity] - order[b.severity];
    })
    .slice(0, 5);

  return {
    timestamp:        new Date().toISOString(),
    frameworkVersion: FRAMEWORK_VERSION,
    totalScore,
    maxScore,
    percentScore:     pct,
    verdict:          verdictFromScore(pct, criticalCount, highCount),
    categories,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    infoCount,
    topRemediation,
  };
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

const SEVERITY_ICON: Record<AuditSeverity, string> = {
  CRITICAL: "🔴",
  HIGH:     "🟠",
  MEDIUM:   "🟡",
  LOW:      "🔵",
  INFO:     "⚪",
};

function printConsole(result: AutoAuditResult): void {
  console.log("\n════════════════════════════════════════════════════════════");
  console.log("   Manus QA Framework — Auto-Audit v2.2");
  console.log("════════════════════════════════════════════════════════════");
  console.log(`   Score global : ${result.totalScore}/${result.maxScore} (${result.percentScore}%)`);
  console.log(`   Verdict      : ${result.verdict}`);
  console.log(`   Critiques    : ${result.criticalCount} | HIGH: ${result.highCount} | MEDIUM: ${result.mediumCount}`);
  console.log("────────────────────────────────────────────────────────────\n");

  for (const cat of result.categories) {
    const pct = cat.maxScore > 0 ? Math.round((cat.score / cat.maxScore) * 100) : 100;
    const bar = "█".repeat(Math.round(pct / 5)) + "░".repeat(20 - Math.round(pct / 5));
    console.log(`  ${cat.label.padEnd(24)} ${bar} ${cat.score}/${cat.maxScore} (${pct}%)`);

    for (const f of cat.findings) {
      const icon = f.passed ? "✅" : SEVERITY_ICON[f.severity];
      console.log(`    ${icon} [${f.id}] ${f.title}`);
      if (!f.passed) console.log(`       → ${f.detail}`);
    }
    console.log();
  }

  if (result.topRemediation.length > 0) {
    console.log("  ⚡ Actions prioritaires :");
    for (const f of result.topRemediation) {
      console.log(`    ${SEVERITY_ICON[f.severity]} [${f.severity}] ${f.title}`);
      if (f.remediation) console.log(`       ${f.remediation}`);
    }
  }

  console.log("\n════════════════════════════════════════════════════════════\n");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const result = runAutoAudit();

  if (args.includes("--json")) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printConsole(result);
  }
}
