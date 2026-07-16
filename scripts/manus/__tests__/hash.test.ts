// ─────────────────────────────────────────────────────────────────────────────
// Tests — utils/hash.ts
// Runner : node --test --import tsx/esm scripts/manus/__tests__/hash.test.ts
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it } from "node:test";
import assert            from "node:assert/strict";
import { computePromptHash } from "../utils/hash";

describe("computePromptHash", () => {
  it("retourne une chaîne hex de 64 caractères (SHA-256)", () => {
    const hash = computePromptHash("hello world");
    assert.equal(typeof hash, "string");
    assert.equal(hash.length, 64);
    assert.match(hash, /^[0-9a-f]{64}$/);
  });

  it("est déterministe — même entrée = même hash", () => {
    const a = computePromptHash("prompt de test");
    const b = computePromptHash("prompt de test");
    assert.equal(a, b);
  });

  it("deux entrées différentes = hashes différents", () => {
    const a = computePromptHash("prompt A");
    const b = computePromptHash("prompt B");
    assert.notEqual(a, b);
  });

  it("chaîne vide produit un hash valide", () => {
    const hash = computePromptHash("");
    assert.equal(hash.length, 64);
    assert.match(hash, /^[0-9a-f]{64}$/);
  });

  it("hash connu pour 'abc'", () => {
    const hash = computePromptHash("abc");
    assert.equal(hash, "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
});
