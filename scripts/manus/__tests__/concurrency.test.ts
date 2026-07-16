// ─────────────────────────────────────────────────────────────────────────────
// Tests — core/concurrency.ts
// Runner : node --test --import tsx/esm scripts/manus/__tests__/concurrency.test.ts
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { Semaphore, defaultConcurrency } from "../core/concurrency";

describe("Semaphore", () => {
  it("permet jusqu'à maxConcurrent acquisitions simultanées", async () => {
    const sem = new Semaphore(3);
    assert.equal(sem.available, 3);
    await sem.acquire();
    assert.equal(sem.available, 2);
    await sem.acquire();
    assert.equal(sem.available, 1);
    await sem.acquire();
    assert.equal(sem.available, 0);
    sem.release();
    assert.equal(sem.available, 1);
  });

  it("met en file d'attente les acquisitions excédentaires", async () => {
    const sem = new Semaphore(1);
    await sem.acquire();  // slot pris
    assert.equal(sem.available, 0);

    let resolved = false;
    const waiting = sem.acquire().then(() => { resolved = true; sem.release(); });

    assert.equal(sem.pending, 1);
    assert.equal(resolved, false);

    sem.release();  // libère le slot → waiting peut avancer
    await waiting;
    assert.equal(resolved, true);
  });

  it("run() exécute la fonction et libère automatiquement le slot", async () => {
    const sem = new Semaphore(1);
    const result = await sem.run(async () => 42);
    assert.equal(result, 42);
    assert.equal(sem.available, 1);  // slot restitué
  });

  it("run() libère le slot même en cas d'erreur", async () => {
    const sem = new Semaphore(1);
    await assert.rejects(
      sem.run(async () => { throw new Error("boom"); }),
      /boom/
    );
    assert.equal(sem.available, 1);  // slot toujours restitué
  });

  it("lève une erreur si maxConcurrent < 1", () => {
    assert.throws(() => new Semaphore(0), /maxConcurrent/);
    assert.throws(() => new Semaphore(-1), /maxConcurrent/);
  });

  it("exécute N tâches en parallèle avec respect du slot", async () => {
    const sem = new Semaphore(2);
    let concurrent = 0;
    let maxConcurrent = 0;

    const task = () => sem.run(async () => {
      concurrent++;
      maxConcurrent = Math.max(maxConcurrent, concurrent);
      await new Promise<void>((resolve) => setImmediate(resolve));
      concurrent--;
    });

    await Promise.all([task(), task(), task(), task()]);
    assert.ok(maxConcurrent <= 2, `Max concurrent atteint: ${maxConcurrent}`);
  });
});

describe("defaultConcurrency", () => {
  beforeEach(() => { delete process.env["MANUS_MAX_CONCURRENT"]; });
  afterEach(() => { delete process.env["MANUS_MAX_CONCURRENT"]; });

  it("retourne 2 par défaut", () => {
    assert.equal(defaultConcurrency(), 2);
  });

  it("lit MANUS_MAX_CONCURRENT", () => {
    process.env["MANUS_MAX_CONCURRENT"] = "4";
    assert.equal(defaultConcurrency(), 4);
  });

  it("cap à 8", () => {
    process.env["MANUS_MAX_CONCURRENT"] = "20";
    assert.equal(defaultConcurrency(), 8);
  });

  it("valeur invalide → défaut 2", () => {
    process.env["MANUS_MAX_CONCURRENT"] = "abc";
    assert.equal(defaultConcurrency(), 2);
  });

  it("valeur < 1 → défaut 2", () => {
    process.env["MANUS_MAX_CONCURRENT"] = "0";
    assert.equal(defaultConcurrency(), 2);
  });
});
