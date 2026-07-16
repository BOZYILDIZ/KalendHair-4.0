// ─────────────────────────────────────────────────────────────────────────────
// Tests — core/safe-mode.ts
// Runner : node --test --import tsx/esm scripts/manus/__tests__/safe-mode.test.ts
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isSafeMode, assertNotSafeMode, SafeModeViolationError,
  UNSAFE_FLAG, CONFIRM_FLAG,
} from "../core/safe-mode";

describe("isSafeMode", () => {
  it("actif par défaut (aucun flag)", () => {
    assert.equal(isSafeMode(["node", "run-all.ts"]), true);
  });

  it("actif si seul --unsafe est présent (sans confirmation)", () => {
    assert.equal(isSafeMode(["node", "run-all.ts", UNSAFE_FLAG]), true);
  });

  it("actif si seul --i-accept-manus-cost est présent (sans --unsafe)", () => {
    assert.equal(isSafeMode(["node", "run-all.ts", CONFIRM_FLAG]), true);
  });

  it("désactivé UNIQUEMENT si les deux flags sont présents simultanément", () => {
    assert.equal(isSafeMode(["node", "run-all.ts", UNSAFE_FLAG, CONFIRM_FLAG]), false);
  });

  it("désactivé quel que soit l'ordre des deux flags", () => {
    assert.equal(isSafeMode(["node", "run-all.ts", CONFIRM_FLAG, UNSAFE_FLAG]), false);
  });

  it("ignore les variables d'environnement — ne lit que argv", () => {
    process.env["MANUS_SAFE_MODE"] = "false";
    process.env[UNSAFE_FLAG] = "true";
    try {
      assert.equal(isSafeMode(["node", "run-all.ts"]), true);
    } finally {
      delete process.env["MANUS_SAFE_MODE"];
      delete process.env[UNSAFE_FLAG];
    }
  });
});

describe("assertNotSafeMode", () => {
  it("lève SafeModeViolationError quand SAFE_MODE est actif", () => {
    assert.throws(
      () => assertNotSafeMode("MANUS_TASK_CREATION", "test", ["node", "run-all.ts"]),
      (err: unknown) => {
        assert.ok(err instanceof SafeModeViolationError);
        assert.ok(err.message.includes("MANUS_TASK_CREATION"));
        assert.ok(err.message.includes(UNSAFE_FLAG));
        assert.ok(err.message.includes(CONFIRM_FLAG));
        return true;
      }
    );
  });

  it("ne lève rien quand les deux flags de déverrouillage sont présents", () => {
    assert.doesNotThrow(() =>
      assertNotSafeMode("NETWORK_CALL", "test", ["node", "x", UNSAFE_FLAG, CONFIRM_FLAG])
    );
  });

  it("lève toujours si un seul des deux flags est présent", () => {
    assert.throws(() => assertNotSafeMode("GIT_WRITE", "test", ["node", "x", UNSAFE_FLAG]));
    assert.throws(() => assertNotSafeMode("GIT_WRITE", "test", ["node", "x", CONFIRM_FLAG]));
  });
});
