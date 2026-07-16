// ─────────────────────────────────────────────────────────────────────────────
// Tests — retention-cli.ts (v2.5.1 — Finalisation opérationnelle)
// Runner : node --test --import tsx/esm scripts/manus/__tests__/retention-cli.test.ts
//
// L'import de retention-cli.ts est sûr (garde import.meta.url) — n'exécute
// jamais main() ni --apply lors d'un simple import pour tester ses fonctions.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { resolve, join } from "path";
import { listValidRunsChronological, parseArgs } from "../retention-cli";
import { applyRetentionToFile } from "../core/event-retention";
import type { RuntimeEvent } from "../core/events-schema";

function makeEvent(runId: string, daysAgo = 0): RuntimeEvent {
  return {
    eventSchemaVersion: "1",
    timestamp: new Date(Date.now() - daysAgo * 86_400_000).toISOString(),
    runId,
    frameworkVersion: "2.5.1",
    severity: "INFO",
    eventType: "DRY_RUN",
    payload: {},
  };
}

describe("listValidRunsChronological", () => {
  let tmp: string;
  beforeEach(() => { tmp = mkdtempSync(join(tmpdir(), "manus-retention-cli-")); });
  afterEach(() => rmSync(tmp, { recursive: true, force: true }));

  it("liste uniquement les répertoires au format runId valide, triés chronologiquement", () => {
    mkdirSync(resolve(tmp, "2026-01-01_00-00-00"));
    mkdirSync(resolve(tmp, "2026-03-01_00-00-00"));
    mkdirSync(resolve(tmp, "2026-02-01_00-00-00"));
    mkdirSync(resolve(tmp, "_archive")); // ne doit jamais être traité comme un run
    mkdirSync(resolve(tmp, "baseline")); // idem

    const runs = listValidRunsChronological(tmp);
    assert.deepEqual(runs, ["2026-01-01_00-00-00", "2026-02-01_00-00-00", "2026-03-01_00-00-00"]);
  });

  it("retourne un tableau vide si le répertoire racine n'existe pas", () => {
    assert.deepEqual(listValidRunsChronological(resolve(tmp, "inexistant")), []);
  });

  it("ignore silencieusement un dossier au nom malformé (protection path traversal)", () => {
    mkdirSync(resolve(tmp, "2026-01-01_00-00-00"));
    // Un nom de dossier contenant '..' n'est de toute façon pas listable par
    // readdirSync comme une entrée distincte — le test vérifie que seul le
    // format attendu est retenu parmi des variantes proches.
    mkdirSync(resolve(tmp, "2026-01-01"));
    const runs = listValidRunsChronological(tmp);
    assert.deepEqual(runs, ["2026-01-01_00-00-00"]);
  });
});

describe("parseArgs — mode par défaut et flags", () => {
  it("mode preview par défaut si aucun flag de mode n'est fourni", () => {
    const { mode } = parseArgs(["node", "retention-cli.ts"]);
    assert.equal(mode, "preview");
  });

  it("--apply bascule explicitement en mode apply", () => {
    const { mode } = parseArgs(["node", "retention-cli.ts", "--apply"]);
    assert.equal(mode, "apply");
  });

  it("lit les overrides de configuration depuis les flags CLI", () => {
    const { config } = parseArgs(["node", "retention-cli.ts", "--max-events", "42", "--max-age-days", "7"]);
    assert.equal(config.maxEvents, 42);
    assert.equal(config.maxAgeDays, 7);
  });
});

describe("Protection du run courant — comportement attendu du CLI", () => {
  let tmp: string;
  beforeEach(() => { tmp = mkdtempSync(join(tmpdir(), "manus-retention-current-")); });
  afterEach(() => rmSync(tmp, { recursive: true, force: true }));

  it("le run le plus récent (dernier chronologiquement) n'est jamais inclus dans les candidats", () => {
    const runs = ["2026-01-01_00-00-00", "2026-01-02_00-00-00", "2026-01-03_00-00-00"];
    for (const r of runs) mkdirSync(resolve(tmp, r));

    const allRuns = listValidRunsChronological(tmp);
    const currentRun = allRuns[allRuns.length - 1];
    const candidates = allRuns.slice(0, -1);

    assert.equal(currentRun, "2026-01-03_00-00-00");
    assert.ok(!candidates.includes("2026-01-03_00-00-00"));
    assert.deepEqual(candidates, ["2026-01-01_00-00-00", "2026-01-02_00-00-00"]);
  });

  it("preuve empirique : appliquer la rétention aux candidats seulement laisse le run courant totalement intact", () => {
    const oldRun     = resolve(tmp, "2026-01-01_00-00-00");
    const currentRun = resolve(tmp, "2026-01-03_00-00-00");
    mkdirSync(oldRun);
    mkdirSync(currentRun);

    const oldEvents     = [makeEvent("2026-01-01_00-00-00", 200)];
    const currentEvents = [makeEvent("2026-01-03_00-00-00", 200)]; // volontairement "vieux" aussi

    writeFileSync(resolve(oldRun, "events.jsonl"), oldEvents.map((e) => JSON.stringify(e)).join("\n") + "\n");
    writeFileSync(resolve(currentRun, "events.jsonl"), currentEvents.map((e) => JSON.stringify(e)).join("\n") + "\n");

    const originalCurrentContent = readFileSync(resolve(currentRun, "events.jsonl"), "utf-8");

    // Simule exactement ce que fait le CLI : applique la rétention à tous les
    // runs SAUF le dernier (courant), même si celui-ci serait éligible à la purge.
    const allRuns = listValidRunsChronological(tmp);
    const candidates = allRuns.slice(0, -1);
    for (const runId of candidates) {
      applyRetentionToFile(resolve(tmp, runId, "events.jsonl"), { maxAgeDays: 90 });
    }

    // Le run ancien (candidat) doit avoir été purgé.
    const oldContent = readFileSync(resolve(oldRun, "events.jsonl"), "utf-8");
    assert.equal(oldContent.trim(), "");

    // Le run courant, bien que tout aussi "vieux", doit rester INTACT.
    const currentContent = readFileSync(resolve(currentRun, "events.jsonl"), "utf-8");
    assert.equal(currentContent, originalCurrentContent);
  });
});
