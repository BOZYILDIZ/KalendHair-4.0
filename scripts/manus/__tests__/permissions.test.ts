// ─────────────────────────────────────────────────────────────────────────────
// Tests — core/permissions.ts
// Runner : node --test --import tsx/esm scripts/manus/__tests__/permissions.test.ts
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  hasPermission, requirePermission, PERMISSION_LEVELS, PERMISSION_DESCRIPTIONS,
  READ_ONLY_AUDIT_PROFILE, LOCAL_DEV_PROFILE, MANUS_CAMPAIGN_PROFILE,
  type AgentProfile,
} from "../core/permissions";

describe("hasPermission / requirePermission", () => {
  it("un profil audit-readonly n'a jamais MANUS_EXECUTION ni GIT_OPERATION", () => {
    assert.equal(hasPermission(READ_ONLY_AUDIT_PROFILE, "MANUS_EXECUTION"), false);
    assert.equal(hasPermission(READ_ONLY_AUDIT_PROFILE, "NETWORK_EXECUTION"), false);
    assert.equal(hasPermission(READ_ONLY_AUDIT_PROFILE, "GIT_OPERATION"), false);
    assert.equal(hasPermission(READ_ONLY_AUDIT_PROFILE, "CODE_MODIFICATION"), false);
  });

  it("un profil audit-readonly a bien READ_ONLY/ANALYSIS/DOCUMENTATION", () => {
    assert.equal(hasPermission(READ_ONLY_AUDIT_PROFILE, "READ_ONLY"), true);
    assert.equal(hasPermission(READ_ONLY_AUDIT_PROFILE, "ANALYSIS"), true);
    assert.equal(hasPermission(READ_ONLY_AUDIT_PROFILE, "DOCUMENTATION"), true);
  });

  it("requirePermission lève une erreur explicite si la permission manque", () => {
    assert.throws(
      () => requirePermission(READ_ONLY_AUDIT_PROFILE, "MANUS_EXECUTION"),
      (err: unknown) => {
        assert.ok(err instanceof Error);
        assert.ok(err.message.includes("audit-readonly"));
        assert.ok(err.message.includes("MANUS_EXECUTION"));
        return true;
      }
    );
  });

  it("requirePermission ne lève rien si la permission est accordée", () => {
    assert.doesNotThrow(() => requirePermission(LOCAL_DEV_PROFILE, "LOCAL_EXECUTION"));
  });

  it("MANUS_CAMPAIGN_PROFILE est le seul profil prédéfini avec MANUS_EXECUTION", () => {
    assert.equal(hasPermission(MANUS_CAMPAIGN_PROFILE, "MANUS_EXECUTION"), true);
    assert.equal(hasPermission(READ_ONLY_AUDIT_PROFILE, "MANUS_EXECUTION"), false);
    assert.equal(hasPermission(LOCAL_DEV_PROFILE, "MANUS_EXECUTION"), false);
  });

  it("aucun profil prédéfini n'a GIT_OPERATION (gouverné hors du code)", () => {
    for (const profile of [READ_ONLY_AUDIT_PROFILE, LOCAL_DEV_PROFILE, MANUS_CAMPAIGN_PROFILE]) {
      assert.equal(hasPermission(profile, "GIT_OPERATION"), false);
    }
  });

  it("un profil personnalisé sans permissions n'accorde rien", () => {
    const empty: AgentProfile = { name: "vide", grantedLevels: [] };
    for (const level of PERMISSION_LEVELS) {
      assert.equal(hasPermission(empty, level), false);
    }
  });
});

describe("PERMISSION_LEVELS / PERMISSION_DESCRIPTIONS", () => {
  it("8 niveaux définis, chacun avec une description", () => {
    assert.equal(PERMISSION_LEVELS.length, 8);
    for (const level of PERMISSION_LEVELS) {
      assert.ok(PERMISSION_DESCRIPTIONS[level]?.length > 0, `${level} sans description`);
    }
  });
});
