// ─────────────────────────────────────────────────────────────────────────────
// Tests — client/mock-provider.ts (configurable, mission corrective Devil's
// Advocate — P1 : "MockProvider plus fidèle")
//
// Avant ce correctif, MockProvider ne simulait que le chemin heureux
// ("completed") et l'échec applicatif ("failed") — jamais une exception, un
// timeout, une réponse malformée ou une erreur réseau, alors que le vrai
// provider (client/index.ts::createAndPollTask()) produit réellement ces
// issues. Ces tests prouvent que chaque mode reproduit fidèlement la FORME
// exacte que le vrai client produirait dans le même cas.
//
// Runner : node --test --import tsx/esm scripts/manus/__tests__/mock-provider.test.ts
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it } from "node:test";
import assert            from "node:assert/strict";
import { MockProvider }  from "../client/mock-provider";
import { manusProvider } from "../client/manus-provider";
import type { AgentProvider } from "../client/provider";

const SAMPLE_PROMPT = [
  "Instructions...",
  "Réponds entre ```json et ``` :",
  "```json",
  JSON.stringify({ assertions: [{ name: "a1", passed: true, message: "ok" }] }),
  "```",
].join("\n");

describe("MockProvider — mode success (comportement historique)", () => {
  it("extrait le gabarit JSON du prompt et retourne 'completed'", async () => {
    const provider = new MockProvider({ mode: "success" });
    const out = await provider.createAndRunTask(SAMPLE_PROMPT);
    assert.equal(out.status, "completed");
    const parsed = JSON.parse(out.rawOutput);
    assert.equal(parsed.assertions[0].passed, true);
    assert.equal(out.creditsConsumed, 0);
    assert.equal(out.pollCount, 1);
  });

  it("mode par défaut (aucune option) équivaut à success", async () => {
    const provider = new MockProvider();
    const out = await provider.createAndRunTask(SAMPLE_PROMPT);
    assert.equal(out.status, "completed");
  });
});

describe("MockProvider — mode failure (legacy forceFail préservé)", () => {
  it("forceFail (legacy) retourne un statut failed", async () => {
    const provider = new MockProvider({ forceFail: true });
    const out = await provider.createAndRunTask(SAMPLE_PROMPT);
    assert.equal(out.status, "failed");
    assert.ok(out.error);
  });

  it("mode:'failure' équivaut à forceFail", async () => {
    const provider = new MockProvider({ mode: "failure" });
    const out = await provider.createAndRunTask(SAMPLE_PROMPT);
    assert.equal(out.status, "failed");
  });
});

describe("MockProvider — mode timeout (jamais simulé avant ce correctif)", () => {
  it("retourne un statut 'timeout', forme identique au vrai client en cas de timeout réel", async () => {
    const provider = new MockProvider({ mode: "timeout" });
    const out = await provider.createAndRunTask(SAMPLE_PROMPT, 5);
    assert.equal(out.status, "timeout");
    assert.ok(out.error?.includes("Timeout"));
    assert.equal(out.lastStatus, "unknown (no poll completed)");
  });

  it("timeout avec message d'erreur personnalisé", async () => {
    const provider = new MockProvider({ mode: "timeout", errorMessage: "Timeout custom" });
    const out = await provider.createAndRunTask(SAMPLE_PROMPT);
    assert.equal(out.error, "Timeout custom");
  });
});

describe("MockProvider — mode exception (jamais simulé avant ce correctif)", () => {
  it("lève une exception — exerce le try/catch de core/runner.ts::runOne()", async () => {
    const provider = new MockProvider({ mode: "exception" });
    await assert.rejects(() => provider.createAndRunTask(SAMPLE_PROMPT));
  });

  it("le message d'exception est personnalisable", async () => {
    const provider = new MockProvider({ mode: "exception", errorMessage: "Panne simulée précise" });
    await assert.rejects(
      () => provider.createAndRunTask(SAMPLE_PROMPT),
      (err: unknown) => err instanceof Error && err.message === "Panne simulée précise"
    );
  });
});

describe("MockProvider — mode network-error (jamais simulé avant ce correctif)", () => {
  it("lève une exception au message réaliste de panne réseau", async () => {
    const provider = new MockProvider({ mode: "network-error" });
    await assert.rejects(
      () => provider.createAndRunTask(SAMPLE_PROMPT),
      (err: unknown) => err instanceof Error && /réseau|ECONNREFUSED|fetch/.test(err.message)
    );
  });

  it("ping() retourne ok:false en mode network-error", async () => {
    const provider = new MockProvider({ mode: "network-error" });
    const result = await provider.ping();
    assert.equal(result.ok, false);
  });
});

describe("MockProvider — mode malformed (sortie JSON invalide, jamais simulé avant ce correctif)", () => {
  it("retourne un rawOutput qui n'est PAS du JSON valide", async () => {
    const provider = new MockProvider({ mode: "malformed" });
    const out = await provider.createAndRunTask(SAMPLE_PROMPT);
    assert.equal(out.status, "completed");
    assert.throws(() => JSON.parse(out.rawOutput));
  });
});

describe("MockProvider — mode no-assertions (JSON valide, mais assertions vides)", () => {
  it("retourne un JSON valide avec un tableau d'assertions vide", async () => {
    const provider = new MockProvider({ mode: "no-assertions" });
    const out = await provider.createAndRunTask(SAMPLE_PROMPT);
    assert.equal(out.status, "completed");
    const parsed = JSON.parse(out.rawOutput);
    assert.deepEqual(parsed.assertions, []);
  });
});

describe("MockProvider — options de configuration (crédits, polls, taskUrl)", () => {
  it("creditsConsumed est configurable, y compris undefined implicite", async () => {
    const withCredits = new MockProvider({ mode: "timeout" });
    const out1 = await withCredits.createAndRunTask(SAMPLE_PROMPT);
    assert.equal(out1.creditsConsumed, undefined, "timeout par défaut : crédits inconnus, comme le vrai client");

    const withExplicitCredits = new MockProvider({ mode: "timeout", creditsConsumed: 12 });
    const out2 = await withExplicitCredits.createAndRunTask(SAMPLE_PROMPT);
    assert.equal(out2.creditsConsumed, 12);
  });

  it("pollCount est configurable", async () => {
    const provider = new MockProvider({ pollCount: 7 });
    const out = await provider.createAndRunTask(SAMPLE_PROMPT);
    assert.equal(out.pollCount, 7);
  });

  it("taskUrl est configurable", async () => {
    const provider = new MockProvider({ taskUrl: "https://manus.im/app/custom-task" });
    const out = await provider.createAndRunTask(SAMPLE_PROMPT);
    assert.equal(out.taskUrl, "https://manus.im/app/custom-task");
  });

  it("taskUrl par défaut suit le format mock://task/<taskId>", async () => {
    const provider = new MockProvider();
    const out = await provider.createAndRunTask(SAMPLE_PROMPT);
    assert.ok(out.taskUrl?.startsWith("mock://task/"));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests de contrat — identiques (dans la mesure du possible) pour les deux
// providers. ManusProvider ne peut pas être réellement invoqué sans risquer un
// appel réseau — SAFE_MODE l'en empêche, ce qui EST le comportement de
// contrat à vérifier ici (les deux providers doivent respecter l'interface
// AgentProvider ; ManusProvider doit refuser tout appel réel sous SAFE_MODE).
// ─────────────────────────────────────────────────────────────────────────────

describe("Contrat AgentProvider — conformité structurelle des deux providers", () => {
  const providers: Array<{ label: string; provider: AgentProvider }> = [
    { label: "MockProvider", provider: new MockProvider() },
    { label: "ManusProvider", provider: manusProvider },
  ];

  for (const { label, provider } of providers) {
    it(`${label} — expose un nom non vide`, () => {
      assert.equal(typeof provider.name, "string");
      assert.ok(provider.name.length > 0);
    });

    it(`${label} — createAndRunTask est une fonction`, () => {
      assert.equal(typeof provider.createAndRunTask, "function");
    });

    it(`${label} — ping (si présent) est une fonction`, () => {
      if (provider.ping) assert.equal(typeof provider.ping, "function");
    });
  }

  it("ManusProvider.createAndRunTask() est bloqué par SAFE_MODE — comportement de contrat attendu, pas un bug", async () => {
    // Preuve que le "vrai" provider ne peut jamais être exercé par erreur
    // dans la suite de tests — SAFE_MODE actif par défaut (aucun flag dans
    // process.argv du test).
    await assert.rejects(() => manusProvider.createAndRunTask("prompt de test", 5));
  });

  it("MockProvider.createAndRunTask() n'est PAS bloqué par SAFE_MODE — c'est tout l'intérêt du mock", async () => {
    const out = await new MockProvider().createAndRunTask(SAMPLE_PROMPT);
    assert.equal(out.status, "completed");
  });
});
