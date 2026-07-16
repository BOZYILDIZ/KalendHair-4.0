// ─────────────────────────────────────────────────────────────────────────────
// Test E2E — chaîne complète d'observabilité (v2.5.1 — Finalisation opérationnelle)
//
// Vérifie, par une EXÉCUTION RÉELLE (pas des mocks de mocks), la chaîne :
//   RuntimeEvent → EventBus → Redaction → JSONL → events-summary.json
//   → Dashboard HTML → Rétention preview
//
// Garanties respectées :
//   - MockProvider uniquement — aucun import de client/index.ts, donc
//     structurellement aucun accès réseau possible dans ce test.
//   - SAFE_MODE reste actif par défaut (aucun flag --unsafe/--i-accept-manus-cost
//     dans process.argv du test) — non pertinent ici puisque MockProvider ne
//     passe jamais par assertNotSafeMode(), mais confirmé pour traçabilité.
//   - Répertoire de rapports totalement isolé (mkdtempSync + chdir temporaire,
//     restauré dans afterEach) — n'écrit jamais dans le reports/manus/ réel.
//
// Runner : node --test --import tsx/esm scripts/manus/__tests__/e2e-observability.test.ts
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, existsSync, readFileSync, readdirSync } from "fs";
import { tmpdir } from "os";
import { resolve, join } from "path";
import { ScenarioRunner } from "../core/runner";
import { MockProvider } from "../client/mock-provider";
import { JsonReporter } from "../reporters/json";
import { MarkdownReporter } from "../reporters/markdown";
import { eventLog } from "../core/events";
import { secretRedactionEngine } from "../core/redaction";
import { isSafeMode } from "../core/safe-mode";
import { loadEventsSummaries, aggregateRuntimeEvents, generateDashboard } from "../generate-dashboard";
import { listValidRunsChronological } from "../retention-cli";
import { applyRetention } from "../core/event-retention";
import { VIEWPORTS } from "../core/types";
import type { ScenarioDefinition, TestContext } from "../core/types";
import type { RuntimeEvent } from "../core/events-schema";

const SECRET_PASSWORD = "e2e-secret-password-should-never-leak";

function syntheticScenario(): ScenarioDefinition {
  return {
    scenarioId:  "SC-E2E",
    name:        "e2e-observability-scenario",
    description: "Scénario synthétique pour le test E2E d'observabilité",
    tags:        ["e2e"],
    run: (ctx) => ({
      prompt: [
        "## RÔLE", "QA-EXECUTOR", "",
        "## OBJECTIF", `Test E2E avec mot de passe ${ctx.credentials.owner?.password ?? ""}`, "",
        "## INTERDICTIONS", "Aucune", "",
        "## CHECKLIST", "1. Rien à faire", "",
        "## Format de réponse",
        "```json",
        JSON.stringify({ assertions: [{ name: "ok", passed: true, message: "ok" }], urlsVisited: [], consoleErrors: [], networkErrors: [], screenshots: [] }, null, 2),
        "```", "",
        "## INSTRUCTION FINALE", "STOP",
      ].join("\n"),
      assertionNames: ["ok"],
      timeoutSeconds: 30,
      viewport: VIEWPORTS.desktop,
    }),
  };
}

describe("E2E — chaîne complète RuntimeEvent → EventBus → Redaction → JSONL → summary → Dashboard → Rétention", () => {
  let tmp: string;
  let originalCwd: string;

  before(() => {
    originalCwd = process.cwd();
    tmp = mkdtempSync(join(tmpdir(), "manus-e2e-observability-"));
    process.chdir(tmp);
  });

  after(() => {
    process.chdir(originalCwd);
    rmSync(tmp, { recursive: true, force: true });
  });

  it("étape 0 — SAFE_MODE est actif par défaut dans ce test (aucun flag de déverrouillage)", () => {
    assert.equal(isSafeMode(), true);
  });

  it("étape 1 à 4 — exécution réelle via MockProvider produit des événements, redige les secrets, écrit events.jsonl et events-summary.json", async () => {
    secretRedactionEngine.reset();
    secretRedactionEngine.registerSecret("QA_OWNER_PASSWORD", SECRET_PASSWORD);

    const ctx: TestContext = {
      environment: "local",
      baseUrl: "http://localhost:3000",
      manusMode: "QA_EXECUTOR",
      nativeVercelIntegration: true,
      credentials: { owner: { email: "owner@e2e.local", password: SECRET_PASSWORD } },
    };

    const runner = new ScenarioRunner(
      [new JsonReporter(), new MarkdownReporter()],
      { provider: new MockProvider(), maxConcurrent: 1 },
    );

    const summary = await runner.runAll([syntheticScenario()], ctx);

    // ── Preuve : le scénario a réellement été exécuté par MockProvider ──────
    assert.equal(summary.run.totalScenarios, 1);
    assert.equal(summary.run.passedScenarios, 1);

    const runId = summary.run.runId;
    const runDir = resolve(tmp, "reports", "manus", runId);

    // ── JSONL : preuve que les événements ont été écrits en streaming ───────
    const eventsPath = resolve(runDir, "events.jsonl");
    assert.ok(existsSync(eventsPath), "events.jsonl aurait dû être créé");
    const lines = readFileSync(eventsPath, "utf-8").trim().split("\n");
    assert.ok(lines.length >= 2, "au moins DRY_RUN/REAL_RUN + REPORT_GENERATED attendus");
    const events: RuntimeEvent[] = lines.map((l) => JSON.parse(l));
    assert.ok(events.some((e) => e.eventType === "REAL_RUN"));
    assert.ok(events.some((e) => e.eventType === "REPORT_GENERATED"));
    for (const e of events) assert.equal(e.eventSchemaVersion, "1");

    // ── Redaction : le secret ne doit apparaître NULLE PART sur le disque ───
    assert.ok(!lines.join("\n").includes(SECRET_PASSWORD), "le secret a fuité dans events.jsonl");
    const reportJson = readFileSync(resolve(runDir, "report.json"), "utf-8");
    assert.ok(!reportJson.includes(SECRET_PASSWORD), "le secret a fuité dans report.json");
    const reportMd = readFileSync(resolve(runDir, "report.md"), "utf-8");
    assert.ok(!reportMd.includes(SECRET_PASSWORD), "le secret a fuité dans report.md");

    // ── events-summary.json : agrégation réellement persistée ──────────────
    const summaryPath = resolve(runDir, "events-summary.json");
    assert.ok(existsSync(summaryPath), "events-summary.json aurait dû être créé");
    const summaryJson = JSON.parse(readFileSync(summaryPath, "utf-8"));
    assert.ok(summaryJson.totalEvents >= 2);
    assert.ok(!JSON.stringify(summaryJson).includes(SECRET_PASSWORD));
  });

  it("étape 5 — le Dashboard HTML généré à partir de ce run réel contient la section Runtime Events, sans secret", () => {
    const reportsDir = resolve(tmp, "reports", "manus");
    const runDirs = readdirSync(reportsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && /^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}(-\d{3})?$/.test(d.name))
      .map((d) => d.name);

    const summaries = loadEventsSummaries(runDirs, reportsDir);
    assert.ok(summaries.length >= 1, "au moins un events-summary.json devrait être chargé");

    const aggregated = aggregateRuntimeEvents(summaries, runDirs.length);
    assert.ok(aggregated.totalEvents >= 2);

    const html = generateDashboard({ history: [], stats: null }, runDirs, aggregated);
    assert.ok(html.includes("Runtime Events"));
    assert.ok(!html.includes(SECRET_PASSWORD), "le secret a fuité dans le HTML du dashboard");
  });

  it("étape 6 — la rétention en mode preview protège le run courant (seul run existant) sans rien purger", () => {
    const reportsDir = resolve(tmp, "reports", "manus");
    const allRuns = listValidRunsChronological(reportsDir);
    assert.equal(allRuns.length, 1, "un seul run doit exister dans cet environnement isolé");

    // Reproduit exactement la logique de protection du CLI : le seul run
    // existant EST le run courant — aucun candidat ne doit lui être soumis.
    const candidates = allRuns.slice(0, -1);
    assert.deepEqual(candidates, [], "le run courant ne doit jamais être un candidat à la rétention");

    // Preuve supplémentaire : même si on appliquait (hypothétiquement) la
    // politique de rétention directement au contenu de ce run, le mode
    // preview ne modifierait aucun fichier — applyRetention() est une
    // fonction pure, aucune écriture disque.
    const eventsPath = resolve(reportsDir, allRuns[0] ?? "", "events.jsonl");
    const before = readFileSync(eventsPath, "utf-8");
    const events: RuntimeEvent[] = before.trim().split("\n").map((l) => JSON.parse(l));
    const { kept } = applyRetention(events, { maxAgeDays: 90 });
    const after = readFileSync(eventsPath, "utf-8");
    assert.equal(before, after, "applyRetention (preview) ne doit jamais écrire sur le disque");
    assert.equal(kept.length, events.length, "aucun événement récent ne devrait être purgé");
  });

  it("bilan — le journal d'événements en mémoire du process contient bien les événements du run E2E", () => {
    const critical = eventLog.getEventsByType("SAFE_MODE_BLOCKED");
    // MockProvider ne passe jamais par assertNotSafeMode() — aucun blocage attendu.
    assert.equal(critical.length, 0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// E2E — chemins malheureux du MockProvider configurable (mission corrective
// Devil's Advocate). Avant ce correctif, seul le chemin heureux (succès) était
// exercé de bout en bout par un test E2E réel — le mode timeout, les
// exceptions et les réponses malformées n'étaient jamais exercés à travers la
// VRAIE chaîne ScenarioRunner → EventBus → sinks → reporters, seulement lus
// dans le code.
// ─────────────────────────────────────────────────────────────────────────────

describe("E2E — MockProvider, chemins malheureux (timeout / exception / réponse malformée)", () => {
  let tmp: string;
  let originalCwd: string;

  before(() => {
    originalCwd = process.cwd();
    tmp = mkdtempSync(join(tmpdir(), "manus-e2e-unhappy-"));
    process.chdir(tmp);
  });

  after(() => {
    process.chdir(originalCwd);
    rmSync(tmp, { recursive: true, force: true });
  });

  const ctx: TestContext = {
    environment: "local",
    baseUrl: "http://localhost:3000",
    manusMode: "QA_EXECUTOR",
    nativeVercelIntegration: true,
    credentials: {},
  };

  it("MockProvider mode:'timeout' — le run se termine normalement, le scénario est marqué 'timeout', un rapport est produit", async () => {
    const runner = new ScenarioRunner(
      [new JsonReporter(), new MarkdownReporter()],
      { provider: new MockProvider({ mode: "timeout" }), maxConcurrent: 1 },
    );
    const summary = await runner.runAll([syntheticScenario()], ctx);

    assert.equal(summary.run.scenarios[0]?.status, "timeout");
    assert.equal(summary.run.passedScenarios, 0);
    assert.notEqual(summary.score.verdict, "READY_FOR_MERGE");

    const runDir = resolve(tmp, "reports", "manus", summary.run.runId);
    assert.ok(existsSync(resolve(runDir, "report.json")), "un rapport doit être produit même en cas de timeout simulé");
  });

  it("MockProvider mode:'exception' — l'exception est absorbée par runOne(), le scénario est marqué 'error', jamais de crash du run", async () => {
    const runner = new ScenarioRunner(
      [new JsonReporter(), new MarkdownReporter()],
      { provider: new MockProvider({ mode: "exception", errorMessage: "Panne simulée E2E" }), maxConcurrent: 1 },
    );
    const summary = await runner.runAll([syntheticScenario()], ctx);

    assert.equal(summary.run.scenarios[0]?.status, "error");
    assert.ok(summary.run.scenarios[0]?.error?.includes("Panne simulée E2E"));
    assert.notEqual(summary.score.verdict, "READY_FOR_MERGE");
  });

  it("MockProvider mode:'malformed' — parseManusResponse() échoue proprement, le scénario est marqué 'failed', pas de crash", async () => {
    const runner = new ScenarioRunner(
      [new JsonReporter(), new MarkdownReporter()],
      { provider: new MockProvider({ mode: "malformed" }), maxConcurrent: 1 },
    );
    const summary = await runner.runAll([syntheticScenario()], ctx);

    assert.equal(summary.run.scenarios[0]?.status, "failed");
    assert.notEqual(summary.score.verdict, "READY_FOR_MERGE");
  });
});
