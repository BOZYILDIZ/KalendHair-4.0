// ─────────────────────────────────────────────────────────────────────────────
// Tests — core/capabilities.ts
// Runner : node --test --import tsx/esm scripts/manus/__tests__/capabilities.test.ts
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  grantHas, requireCapability, fromAgentProfile, CAPABILITIES,
  type CapabilityGrant,
} from "../core/capabilities";
import { READ_ONLY_AUDIT_PROFILE, LOCAL_DEV_PROFILE, MANUS_CAMPAIGN_PROFILE } from "../core/permissions";
import { eventLog } from "../core/events";

describe("Capacités indépendantes — pas de hiérarchie implicite", () => {
  it("une capacité accordée n'implique jamais une autre capacité", () => {
    const grant: CapabilityGrant = { name: "test", capabilities: new Set(["EXECUTE_NETWORK"]) };
    assert.equal(grantHas(grant, "EXECUTE_NETWORK"), true);
    assert.equal(grantHas(grant, "SPEND_MANUS_CREDITS"), false);
    assert.equal(grantHas(grant, "EXECUTE_LOCAL"), false);
    assert.equal(grantHas(grant, "WRITE_FILES"), false);
  });

  it("un grant vide ne possède aucune capacité", () => {
    const grant: CapabilityGrant = { name: "vide", capabilities: new Set() };
    for (const cap of CAPABILITIES) {
      assert.equal(grantHas(grant, cap), false);
    }
  });

  it("requireCapability lève une erreur explicite si la capacité manque", () => {
    const grant: CapabilityGrant = { name: "readonly", capabilities: new Set(["READ_FILES"]) };
    assert.throws(
      () => requireCapability(grant, "SPEND_MANUS_CREDITS"),
      (err: unknown) => {
        assert.ok(err instanceof Error);
        assert.ok(err.message.includes("readonly"));
        assert.ok(err.message.includes("SPEND_MANUS_CREDITS"));
        return true;
      }
    );
  });

  it("requireCapability ne lève rien si la capacité est présente", () => {
    const grant: CapabilityGrant = { name: "ok", capabilities: new Set(["EXECUTE_LOCAL"]) };
    assert.doesNotThrow(() => requireCapability(grant, "EXECUTE_LOCAL"));
  });
});

describe("fromAgentProfile — pont de compatibilité v2.3 → v2.4", () => {
  it("audit-readonly n'obtient jamais EXECUTE_NETWORK ni SPEND_MANUS_CREDITS", () => {
    const grant = fromAgentProfile(READ_ONLY_AUDIT_PROFILE);
    assert.equal(grantHas(grant, "EXECUTE_NETWORK"), false);
    assert.equal(grantHas(grant, "SPEND_MANUS_CREDITS"), false);
    assert.equal(grantHas(grant, "WRITE_GIT"), false);
    assert.equal(grantHas(grant, "READ_FILES"), true);
  });

  it("local-dev obtient EXECUTE_LOCAL mais jamais EXECUTE_NETWORK", () => {
    const grant = fromAgentProfile(LOCAL_DEV_PROFILE);
    assert.equal(grantHas(grant, "EXECUTE_LOCAL"), true);
    assert.equal(grantHas(grant, "EXECUTE_NETWORK"), false);
  });

  it("manus-campaign-authorized obtient bien SPEND_MANUS_CREDITS", () => {
    const grant = fromAgentProfile(MANUS_CAMPAIGN_PROFILE);
    assert.equal(grantHas(grant, "SPEND_MANUS_CREDITS"), true);
    assert.equal(grantHas(grant, "EXECUTE_NETWORK"), true);
    assert.equal(grantHas(grant, "WRITE_GIT"), false); // jamais accordé par aucun profil prédéfini
  });

  it("le nom du profil d'origine est préservé", () => {
    const grant = fromAgentProfile(READ_ONLY_AUDIT_PROFILE);
    assert.equal(grant.name, READ_ONLY_AUDIT_PROFILE.name);
  });
});

describe("Journalisation des décisions de capacité", () => {
  beforeEach(() => eventLog.reset());

  it("émet PERMISSION_GRANTED quand la capacité est accordée", () => {
    const grant: CapabilityGrant = { name: "t", capabilities: new Set(["READ_FILES"]) };
    requireCapability(grant, "READ_FILES");
    const events = eventLog.getEventsByType("PERMISSION_GRANTED");
    assert.equal(events.length, 1);
  });

  it("émet PERMISSION_DENIED quand la capacité est refusée", () => {
    const grant: CapabilityGrant = { name: "t", capabilities: new Set() };
    assert.throws(() => requireCapability(grant, "WRITE_GIT"));
    const events = eventLog.getEventsByType("PERMISSION_DENIED");
    assert.equal(events.length, 1);
  });
});
