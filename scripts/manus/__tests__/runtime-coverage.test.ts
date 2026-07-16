// ─────────────────────────────────────────────────────────────────────────────
// Tests — Matrice de couverture runtime (v2.4 — Runtime Trust)
//
// PREUVE EXPÉRIMENTALE (pas une lecture de code) : chaque fonction du
// framework pouvant émettre un appel réseau réel est appelée ici en
// SAFE_MODE actif par défaut (aucun flag --unsafe/--i-accept-manus-cost dans
// l'invocation de ce test). On stub global.fetch pour DÉTECTER tout appel
// réseau qui échapperait au garde-fou — si SAFE_MODE était contourné par un
// futur refactor, ce test échouerait immédiatement (régression bloquée).
//
// Ce test constitue la matrice de couverture demandée : la liste des lignes
// ci-dessous EST la cartographie des chemins réseau connus du framework.
//
// v2.5.1 — préparation PR Enterprise Foundation : le chemin legacy
// (manus-client.ts + scenarios/pr-06-regression.ts) a été supprimé — zéro
// référence restante dans le framework (confirmé par audit exhaustif). Les
// tests dédiés à ce chemin ont été retirés en conséquence ; la couverture
// porte désormais exclusivement sur les chemins réseau réellement supportés.
//
// Runner : node --test --import tsx/esm scripts/manus/__tests__/runtime-coverage.test.ts
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { SafeModeViolationError } from "../core/safe-mode";
import { eventLog } from "../core/events";

let fetchCallCount = 0;
const originalFetch = global.fetch;

function stubFetch(): void {
  fetchCallCount = 0;
  global.fetch = (async (...args: unknown[]) => {
    fetchCallCount++;
    throw new Error(`fetch() a été appelé alors que SAFE_MODE aurait dû bloquer avant — args: ${JSON.stringify(args)}`);
  }) as typeof fetch;
}

function restoreFetch(): void {
  global.fetch = originalFetch;
}

describe("Matrice de couverture runtime — SAFE_MODE avant tout appel réseau", () => {
  beforeEach(() => {
    stubFetch();
    eventLog.reset();
  });
  afterEach(() => {
    restoreFetch();
  });

  it("client/index.ts::pingManus() — bloqué avant fetch", async () => {
    const { pingManus } = await import("../client/index");
    await assert.rejects(() => pingManus(), SafeModeViolationError);
    assert.equal(fetchCallCount, 0, "fetch() n'aurait jamais dû être appelé");
  });

  it("client/index.ts::createAndPollTask() — bloqué avant fetch", async () => {
    const { createAndPollTask } = await import("../client/index");
    await assert.rejects(() => createAndPollTask("prompt de test", 5), SafeModeViolationError);
    assert.equal(fetchCallCount, 0, "fetch() n'aurait jamais dû être appelé");
  });

  it("chaque blocage émet un événement SAFE_MODE_BLOCKED — traçabilité de la preuve", async () => {
    const { pingManus } = await import("../client/index");
    await assert.rejects(() => pingManus());
    const blocked = eventLog.getEventsByType("SAFE_MODE_BLOCKED");
    assert.ok(blocked.length >= 1);
    assert.equal(blocked[0]?.severity, "CRITICAL");
  });
});

// ─── Matrice documentaire (synchronisée manuellement avec les tests ci-dessus) ─
//
// | Chemin de code                                  | Gate avant fetch | Preuve       |
// |--------------------------------------------------|------------------|--------------|
// | client/index.ts::pingManus()                      | assertNotSafeMode | test ci-dessus |
// | client/index.ts::createAndPollTask() (création)   | assertNotSafeMode | test ci-dessus |
// | client/index.ts::createAndPollTask() (polling)    | gate en amont — jamais atteint si la création est bloquée | test ci-dessus (implicite) |
// | ping.ts (CLI)                                      | hérite du gate via pingManus() — pas de fetch propre | non ré-instrumenté (aucun fetch direct dans ce fichier) |
//
// Chemin legacy supprimé (préparation PR Enterprise Foundation) :
// manus-client.ts et scenarios/pr-06-regression.ts n'existent plus — leurs
// lignes de matrice sont retirées en conséquence, pas seulement laissées
// obsolètes. Zéro référence résiduelle confirmée par audit exhaustif avant
// suppression (imports, exports, CLI, package.json, workflows, docs).
//
// Toute nouvelle fonction émettant un fetch() DOIT être ajoutée à cette
// matrice ET couverte par un test ci-dessus — sinon la garantie de couverture
// n'est plus démontrée expérimentalement, seulement analysée statiquement.
