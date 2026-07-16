// ─────────────────────────────────────────────────────────────────────────────
// Tests — core/paths.ts (RUN_ID_PATTERN, isValidRunDir — v2.5.1)
// Runner : node --test --import tsx/esm scripts/manus/__tests__/paths.test.ts
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { RUN_ID_PATTERN, isValidRunDir, reportsRoot } from "../core/paths";

describe("RUN_ID_PATTERN", () => {
  it("accepte un runId valide", () => {
    assert.ok(RUN_ID_PATTERN.test("2026-07-11_08-20-52"));
  });

  it("rejette une tentative de traversée de chemin", () => {
    assert.ok(!RUN_ID_PATTERN.test("../../etc/passwd"));
    assert.ok(!RUN_ID_PATTERN.test("2026-07-11_08-20-52/../../etc"));
  });

  it("rejette un format partiel ou incorrect", () => {
    assert.ok(!RUN_ID_PATTERN.test("2026-07-11"));
    assert.ok(!RUN_ID_PATTERN.test("baseline"));
    assert.ok(!RUN_ID_PATTERN.test(""));
  });
});

describe("isValidRunDir", () => {
  it("accepte un runId valide dans la racine attendue", () => {
    assert.ok(isValidRunDir("2026-07-11_08-20-52", "/tmp/reports/manus"));
  });

  it("rejette un runId qui ne correspond pas au format", () => {
    assert.ok(!isValidRunDir("baseline", "/tmp/reports/manus"));
    assert.ok(!isValidRunDir("_archive", "/tmp/reports/manus"));
  });

  it("rejette une tentative de traversée de chemin même formée comme un runId partiellement valide", () => {
    assert.ok(!isValidRunDir("../2026-07-11_08-20-52", "/tmp/reports/manus"));
  });

  it("utilise reportsRoot() par défaut si aucune racine n'est fournie", () => {
    assert.equal(typeof reportsRoot(), "string");
    assert.ok(reportsRoot().endsWith("reports/manus") || reportsRoot().includes("reports"));
  });
});
