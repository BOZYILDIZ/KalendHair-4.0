// ─────────────────────────────────────────────────────────────────────────────
// Tests — core/event-retention.ts
// Runner : node --test --import tsx/esm scripts/manus/__tests__/event-retention.test.ts
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, writeFileSync, existsSync } from "fs";
import { tmpdir } from "os";
import { resolve, join } from "path";
import {
  applyRetention, archiveEvents, compressArchive, applyRetentionToFile,
  loadRetentionConfig, DEFAULT_RETENTION_CONFIG, parseEventsJsonl,
} from "../core/event-retention";
import type { RuntimeEvent } from "../core/events-schema";

function makeEvent(daysAgo: number, overrides: Partial<RuntimeEvent> = {}): RuntimeEvent {
  const ts = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
  return {
    eventSchemaVersion: "1",
    timestamp: ts,
    runId: "run-1",
    frameworkVersion: "2.5.0",
    severity: "INFO",
    eventType: "DRY_RUN",
    payload: {},
    ...overrides,
  };
}

describe("applyRetention — maxAgeDays", () => {
  it("purge les événements plus vieux que maxAgeDays", () => {
    const events = [makeEvent(100), makeEvent(1)];
    const { kept, purged } = applyRetention(events, { maxAgeDays: 90 });
    assert.equal(kept.length, 1);
    assert.equal(purged.length, 1);
    assert.equal(purged[0]?.timestamp, events[0]?.timestamp);
  });

  it("ne purge rien si tous les événements sont dans la fenêtre", () => {
    const events = [makeEvent(1), makeEvent(2)];
    const { kept, purged } = applyRetention(events, { maxAgeDays: 90 });
    assert.equal(kept.length, 2);
    assert.equal(purged.length, 0);
  });
});

describe("applyRetention — maxEvents", () => {
  it("garde les N événements les plus récents", () => {
    const events = [makeEvent(3), makeEvent(2), makeEvent(1)];
    const { kept, purged } = applyRetention(events, { maxEvents: 2 });
    assert.equal(kept.length, 2);
    assert.equal(purged.length, 1);
    // Le plus ancien (3 jours) doit être purgé.
    assert.equal(purged[0]?.timestamp, events[0]?.timestamp);
  });

  it("ne purge rien si sous la limite", () => {
    const events = [makeEvent(1)];
    const { kept, purged } = applyRetention(events, { maxEvents: 10 });
    assert.equal(kept.length, 1);
    assert.equal(purged.length, 0);
  });
});

describe("applyRetention — maxSizeBytes", () => {
  it("purge les plus anciens jusqu'à respecter la taille maximale", () => {
    const events = [makeEvent(3), makeEvent(2), makeEvent(1)];
    const fullSize = Buffer.byteLength(events.map((e) => JSON.stringify(e)).join("\n"), "utf-8");
    // Impose une limite qui ne peut contenir qu'un seul événement.
    const oneEventSize = Buffer.byteLength(JSON.stringify(events[2]), "utf-8");
    const { kept } = applyRetention(events, { maxSizeBytes: oneEventSize + 5 });
    assert.ok(kept.length < events.length);
    assert.ok(fullSize > oneEventSize);
  });
});

describe("applyRetention — combinaison de règles", () => {
  it("applique maxAgeDays PUIS maxEvents", () => {
    const events = [makeEvent(200), makeEvent(50), makeEvent(40), makeEvent(1)];
    const { kept } = applyRetention(events, { maxAgeDays: 90, maxEvents: 2 });
    // maxAgeDays élimine le premier (200j) ; maxEvents=2 garde les 2 plus récents parmi les 3 restants.
    assert.equal(kept.length, 2);
  });
});

describe("archiveEvents", () => {
  let tmp: string;
  beforeEach(() => { tmp = mkdtempSync(join(tmpdir(), "manus-archive-")); });
  afterEach(() => rmSync(tmp, { recursive: true, force: true }));

  it("archive les événements purgés dans un fichier JSONL par runId", () => {
    const purged = [makeEvent(200, { runId: "run-a" }), makeEvent(150, { runId: "run-b" })];
    archiveEvents(purged, tmp);
    assert.ok(existsSync(resolve(tmp, "run-a.jsonl")));
    assert.ok(existsSync(resolve(tmp, "run-b.jsonl")));
  });

  it("ne crée rien si la liste purgée est vide", () => {
    archiveEvents([], tmp);
    assert.equal(existsSync(resolve(tmp, "nonexistent.jsonl")), false);
  });
});

describe("compressArchive — non implémenté, échec explicite", () => {
  it("lève une erreur explicite plutôt qu'un no-op silencieux", () => {
    assert.throws(() => compressArchive("/tmp/whatever"), /pas implémentée/);
  });
});

describe("applyRetentionToFile", () => {
  let tmp: string;
  beforeEach(() => { tmp = mkdtempSync(join(tmpdir(), "manus-retention-file-")); });
  afterEach(() => rmSync(tmp, { recursive: true, force: true }));

  it("retourne 0/0 si le fichier n'existe pas", () => {
    const result = applyRetentionToFile(resolve(tmp, "absent.jsonl"), { maxEvents: 10 });
    assert.deepEqual(result, { keptCount: 0, purgedCount: 0 });
  });

  it("réécrit le fichier avec uniquement les événements conservés", () => {
    const path = resolve(tmp, "events.jsonl");
    const events = [makeEvent(200), makeEvent(1)];
    writeFileSync(path, events.map((e) => JSON.stringify(e)).join("\n") + "\n", "utf-8");

    const result = applyRetentionToFile(path, { maxAgeDays: 90 });
    assert.equal(result.keptCount, 1);
    assert.equal(result.purgedCount, 1);

    const remaining = readFileSync(path, "utf-8").trim().split("\n");
    assert.equal(remaining.length, 1);
  });

  it("archive les événements purgés si archiveDir est configuré", () => {
    const path = resolve(tmp, "events.jsonl");
    const archiveDir = resolve(tmp, "archive");
    const events = [makeEvent(200, { runId: "old-run" }), makeEvent(1, { runId: "old-run" })];
    writeFileSync(path, events.map((e) => JSON.stringify(e)).join("\n") + "\n", "utf-8");

    applyRetentionToFile(path, { maxAgeDays: 90, archiveDir });
    assert.ok(existsSync(resolve(archiveDir, "old-run.jsonl")));
  });

  // ── Résilience au JSON corrompu (mission corrective Devil's Advocate — P0) ──
  //
  // Avant ce correctif, une ligne corrompue (crash pendant appendFileSync,
  // kill -9 mi-écriture) faisait planter applyRetentionToFile() avec un
  // SyntaxError non catché — y compris en mode preview, censé être sans
  // risque. parseEventsJsonl() ignore désormais la ligne corrompue (avec
  // avertissement) plutôt que de faire échouer tout le run de rétention.

  it("une ligne JSON corrompue au milieu du fichier n'interrompt pas le traitement des lignes valides", () => {
    const path = resolve(tmp, "events.jsonl");
    const valid1 = JSON.stringify(makeEvent(1));
    const valid2 = JSON.stringify(makeEvent(2));
    writeFileSync(path, `${valid1}\n{ ceci n'est pas du JSON valide\n${valid2}\n`, "utf-8");

    assert.doesNotThrow(() => applyRetentionToFile(path, { maxEvents: 100 }));
    const result = applyRetentionToFile(path, { maxEvents: 100 });
    assert.equal(result.keptCount, 2, "les 2 lignes valides doivent être conservées, la ligne corrompue simplement ignorée");
  });

  it("une dernière ligne tronquée (simulation d'un crash pendant l'écriture) n'interrompt pas le traitement", () => {
    const path = resolve(tmp, "events.jsonl");
    const valid = JSON.stringify(makeEvent(1));
    // Simule exactement une appendFileSync interrompue à mi-écriture.
    const truncated = JSON.stringify(makeEvent(2)).slice(0, 20);
    writeFileSync(path, `${valid}\n${truncated}`, "utf-8");

    assert.doesNotThrow(() => applyRetentionToFile(path, { maxEvents: 100 }));
  });
});

describe("parseEventsJsonl", () => {
  it("parse toutes les lignes valides et ignore les lignes corrompues avec un avertissement", () => {
    const raw = `${JSON.stringify(makeEvent(1))}\nCORROMPU\n${JSON.stringify(makeEvent(2))}\n`;
    const originalWarn = console.warn;
    let warned = false;
    console.warn = () => { warned = true; };
    try {
      const events = parseEventsJsonl(raw, "test-path.jsonl");
      assert.equal(events.length, 2);
      assert.equal(warned, true, "un avertissement doit être émis pour la ligne corrompue — pas un échec silencieux");
    } finally {
      console.warn = originalWarn;
    }
  });

  it("fichier vide → tableau vide, aucune exception", () => {
    assert.deepEqual(parseEventsJsonl("", "test-path.jsonl"), []);
  });

  it("toutes les lignes corrompues → tableau vide, aucune exception", () => {
    const events = parseEventsJsonl("pas du json\nencore pas du json", "test-path.jsonl");
    assert.deepEqual(events, []);
  });
});

describe("loadRetentionConfig", () => {
  const ENV_KEYS = ["MANUS_EVENTS_MAX_COUNT", "MANUS_EVENTS_MAX_AGE_DAYS", "MANUS_EVENTS_MAX_SIZE_BYTES", "MANUS_EVENTS_ARCHIVE_DIR"];
  afterEach(() => { for (const k of ENV_KEYS) delete process.env[k]; });

  it("retourne DEFAULT_RETENTION_CONFIG si aucune variable d'env n'est définie", () => {
    const config = loadRetentionConfig();
    assert.equal(config.maxEvents, DEFAULT_RETENTION_CONFIG.maxEvents);
    assert.equal(config.maxAgeDays, DEFAULT_RETENTION_CONFIG.maxAgeDays);
  });

  it("lit les variables d'environnement si présentes", () => {
    process.env["MANUS_EVENTS_MAX_COUNT"] = "500";
    process.env["MANUS_EVENTS_MAX_AGE_DAYS"] = "30";
    const config = loadRetentionConfig();
    assert.equal(config.maxEvents, 500);
    assert.equal(config.maxAgeDays, 30);
  });

  it("ignore une valeur invalide et retombe sur le défaut", () => {
    process.env["MANUS_EVENTS_MAX_COUNT"] = "abc";
    const config = loadRetentionConfig();
    assert.equal(config.maxEvents, DEFAULT_RETENTION_CONFIG.maxEvents);
  });
});
