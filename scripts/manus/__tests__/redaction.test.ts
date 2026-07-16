// ─────────────────────────────────────────────────────────────────────────────
// Tests — core/redaction.ts
// Runner : node --test --import tsx/esm scripts/manus/__tests__/redaction.test.ts
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { secretRedactionEngine } from "../core/redaction";

describe("SecretRedactionEngine — valeurs connues (couche 1)", () => {
  beforeEach(() => secretRedactionEngine.reset());

  it("rédige une valeur enregistrée où qu'elle apparaisse", () => {
    secretRedactionEngine.registerSecret("QA_OWNER_PASSWORD", "MonMotDePasse!42");
    const out = secretRedactionEngine.redact("Saisie du mot de passe : MonMotDePasse!42 effectuée.");
    assert.ok(!out.includes("MonMotDePasse!42"));
    assert.ok(out.includes("***REDACTED_QA_OWNER_PASSWORD***"));
  });

  it("ignore silencieusement les valeurs vides/undefined", () => {
    secretRedactionEngine.registerSecret("VIDE", "");
    secretRedactionEngine.registerSecret("ABSENT", undefined);
    assert.equal(secretRedactionEngine.registeredCount(), 0);
  });

  it("ne duplique pas un secret déjà enregistré avec la même valeur", () => {
    secretRedactionEngine.registerSecret("A", "same-value");
    secretRedactionEngine.registerSecret("B", "same-value");
    assert.equal(secretRedactionEngine.registeredCount(), 1);
  });

  it("rédige toutes les occurrences multiples de la même valeur", () => {
    secretRedactionEngine.registerSecret("TOKEN", "abc123");
    const out = secretRedactionEngine.redact("abc123 puis encore abc123 et abc123");
    assert.equal((out.match(/abc123/g) ?? []).length, 0);
    assert.equal((out.match(/REDACTED_TOKEN/g) ?? []).length, 3);
  });

  it("secret le plus long redigé en premier pour éviter les collisions de sous-chaîne", () => {
    secretRedactionEngine.registerSecret("SHORT", "abc");
    secretRedactionEngine.registerSecret("LONG", "abcdef");
    const out = secretRedactionEngine.redact("valeur: abcdef");
    assert.ok(out.includes("***REDACTED_LONG***"));
    assert.ok(!out.includes("abc"));
  });

  it("reset() vide le registre", () => {
    secretRedactionEngine.registerSecret("X", "valeur-x");
    secretRedactionEngine.reset();
    const out = secretRedactionEngine.redact("valeur-x");
    assert.equal(out, "valeur-x"); // plus rien à rédiger
  });
});

describe("SecretRedactionEngine — motifs génériques (couche 2, filet de sécurité)", () => {
  beforeEach(() => secretRedactionEngine.reset());

  it("rédige une clé API de type Manus (sk-...) même non enregistrée", () => {
    const out = secretRedactionEngine.redact("Clé utilisée : sk-mV9Vgy5BB2tyE2ckPs0nztt18QF_kbVun");
    assert.ok(!out.includes("sk-mV9Vgy5BB2tyE2ckPs0nztt18QF_kbVun"));
    assert.ok(out.includes("***REDACTED_MANUS_API_KEY***"));
  });

  it("rédige un token de bypass Vercel dans une URL — préfixe préservé", () => {
    const out = secretRedactionEngine.redact("https://app.vercel.app?_vercel_share=AbCdEf123456");
    assert.ok(!out.includes("AbCdEf123456"));
    assert.ok(out.includes("_vercel_share=***REDACTED_VERCEL_BYPASS_TOKEN***"));
  });

  it("rédige un en-tête Authorization Bearer — préfixe préservé", () => {
    const out = secretRedactionEngine.redact("Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.abc.def");
    assert.ok(!out.includes("eyJhbGciOiJIUzI1NiJ9"));
    assert.ok(out.includes("Bearer ***REDACTED_BEARER_TOKEN***"));
  });

  it("rédige un champ JSON \"password\"", () => {
    const out = secretRedactionEngine.redact('{"email":"a@b.com","password":"hunter2"}');
    assert.ok(!out.includes("hunter2"));
    assert.ok(out.includes('"password":"***REDACTED_JSON_PASSWORD_FIELD***"'));
  });

  it("rédige un champ JSON \"apiKey\"", () => {
    const out = secretRedactionEngine.redact('{"apiKey":"sk-abcdefghijklmnop"}');
    assert.ok(out.includes("REDACTED"));
  });

  it("ne touche pas un texte sans aucun secret", () => {
    const out = secretRedactionEngine.redact("Le scénario login-owner a réussi en 3200ms.");
    assert.equal(out, "Le scénario login-owner a réussi en 3200ms.");
  });
});

describe("SecretRedactionEngine — redactObject (aller-retour JSON)", () => {
  beforeEach(() => secretRedactionEngine.reset());

  it("rédige récursivement un objet imbriqué", () => {
    secretRedactionEngine.registerSecret("PWD", "secretpass");
    const obj = { user: { email: "a@b.com", password: "secretpass" }, meta: { note: "ok" } };
    const redacted = secretRedactionEngine.redactObject(obj);
    assert.equal(redacted.user.password, "***REDACTED_PWD***");
    assert.equal(redacted.meta.note, "ok");
  });

  it("préserve la structure et les champs non sensibles", () => {
    const obj = { runId: "run-1", score: 95, scenarios: ["a", "b"] };
    const redacted = secretRedactionEngine.redactObject(obj);
    assert.deepEqual(redacted, obj);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests adversariaux — mission corrective Devil's Advocate (P0)
//
// Faille identifiée par l'audit : redactObject() fait JSON.stringify(obj) AVANT
// redact() — un secret contenant un caractère que JSON.stringify échappe
// (guillemet, antislash, saut de ligne...) ne correspondait plus, caractère
// pour caractère, à la valeur brute enregistrée. Ces tests reproduisent
// exactement les formats listés par la mission corrective et prouvent la
// correction (recherche de la forme brute ET de ses variantes échappées).
// ─────────────────────────────────────────────────────────────────────────────

describe("SecretRedactionEngine — cas adversariaux (P0)", () => {
  beforeEach(() => secretRedactionEngine.reset());

  it('secret contenant des guillemets doubles — texte brut : "secret"', () => {
    secretRedactionEngine.registerSecret("PWD", 'il a dit "secret"');
    const out = secretRedactionEngine.redact('Le mot de passe est : il a dit "secret" — fin.');
    assert.ok(!out.includes('il a dit "secret"'));
    assert.ok(out.includes("***REDACTED_PWD***"));
  });

  it('secret contenant des guillemets échappés JSON — \\"secret\\" (faille originale reproduite)', () => {
    // Reproduction exacte de la faille : le secret brut contient un guillemet,
    // le texte à rédiger contient sa forme ÉCHAPPÉE (telle que produite par
    // JSON.stringify), pas la forme brute.
    const rawSecret = 'il a dit "secret"';
    secretRedactionEngine.registerSecret("PWD", rawSecret);
    const jsonLike = JSON.stringify({ password: rawSecret }); // {"password":"il a dit \"secret\""}
    const out = secretRedactionEngine.redact(jsonLike);
    assert.ok(!out.includes(rawSecret), "la forme brute ne doit plus apparaître");
    assert.ok(!out.includes('il a dit \\"secret\\"'), "la forme échappée ne doit plus apparaître non plus");
    assert.ok(out.includes("REDACTED_PWD"));
  });

  it("secret contenant un antislash — secret\\\\value", () => {
    const rawSecret = "secret\\value";
    secretRedactionEngine.registerSecret("PWD", rawSecret);
    const out = secretRedactionEngine.redact(`mot de passe: ${rawSecret}`);
    assert.ok(!out.includes(rawSecret));
    assert.ok(out.includes("REDACTED_PWD"));
  });

  it("secret contenant un antislash, recherché sous sa forme JSON-échappée", () => {
    const rawSecret = "secret\\value";
    secretRedactionEngine.registerSecret("PWD", rawSecret);
    const jsonLike = JSON.stringify({ password: rawSecret });
    const out = secretRedactionEngine.redact(jsonLike);
    assert.ok(!out.includes(rawSecret));
    assert.ok(out.includes("REDACTED_PWD"));
  });

  it("secret multi-lignes — saut de ligne réel", () => {
    const rawSecret = "ligne1\nligne2-secret";
    secretRedactionEngine.registerSecret("PWD", rawSecret);
    const out = secretRedactionEngine.redact(`Valeur :\n${rawSecret}\nFin.`);
    assert.ok(!out.includes(rawSecret));
    assert.ok(out.includes("REDACTED_PWD"));
  });

  it("secret multi-lignes, recherché sous sa forme JSON échappée (\\\\n)", () => {
    const rawSecret = "ligne1\nligne2-secret";
    secretRedactionEngine.registerSecret("PWD", rawSecret);
    const jsonLike = JSON.stringify({ note: rawSecret }); // contient littéralement \n, pas un vrai saut de ligne
    assert.ok(jsonLike.includes("\\n"));
    const out = secretRedactionEngine.redact(jsonLike);
    assert.ok(!out.includes("ligne2-secret"));
    assert.ok(out.includes("REDACTED_PWD"));
  });

  it("secret contenant des caractères Unicode accentués", () => {
    const rawSecret = "mötdepassé-café-42";
    secretRedactionEngine.registerSecret("PWD", rawSecret);
    const out = secretRedactionEngine.redact(`Connexion avec ${rawSecret} réussie.`);
    assert.ok(!out.includes(rawSecret));
    assert.ok(out.includes("REDACTED_PWD"));
  });

  it("secret présent dans une URL encodée (query param)", () => {
    const rawSecret = 'p@ss"word!';
    secretRedactionEngine.registerSecret("PWD", rawSecret);
    const url = `https://api.example.com/login?password=${encodeURIComponent(rawSecret)}`;
    const out = secretRedactionEngine.redact(url);
    assert.ok(!out.includes(encodeURIComponent(rawSecret)));
    assert.ok(out.includes("REDACTED_PWD"));
  });

  it("secret présent dans un header sérialisé (JSON imbriqué)", () => {
    const rawSecret = "sk-headerlikevalue123456";
    secretRedactionEngine.registerSecret("APIKEY", rawSecret);
    const serialized = JSON.stringify({ headers: { "x-manus-api-key": rawSecret, "content-type": "application/json" } });
    const out = secretRedactionEngine.redact(serialized);
    assert.ok(!out.includes(rawSecret));
  });

  it("limite explicite et documentée : un secret encodé en base64 N'EST PAS détecté (non résolu, par conception)", () => {
    // Ce test ne prouve PAS une correction — il DOCUMENTE une limite connue et
    // assumée. Une redaction par correspondance de sous-chaîne ne peut pas,
    // par construction, retrouver un secret dont la représentation dans le
    // texte n'est pas dérivée de façon prévisible de sa valeur brute (base64,
    // hash, chiffrement). La seule protection réelle contre ce cas est la
    // redaction à la SOURCE, avant tout encodage — hors périmètre de ce module.
    const rawSecret = "hunter2";
    secretRedactionEngine.registerSecret("PWD", rawSecret);
    const base64Encoded = Buffer.from(rawSecret, "utf-8").toString("base64");
    const out = secretRedactionEngine.redact(`credentials=${base64Encoded}`);
    assert.ok(out.includes(base64Encoded), "limite connue : le secret encodé en base64 traverse la redaction intact");
  });

  it("déterminisme : deux appels sur le même texte produisent exactement le même résultat", () => {
    secretRedactionEngine.registerSecret("PWD", 'valeur "complexe"\navec\\antislash');
    const text = 'test valeur "complexe"\navec\\antislash fin';
    const out1 = secretRedactionEngine.redact(text);
    const out2 = secretRedactionEngine.redact(text);
    assert.equal(out1, out2);
  });

  it("pas de double-redaction : une valeur déjà rédigée n'est pas re-rédigée par une variante du même secret", () => {
    const rawSecret = 'sec"ret';
    secretRedactionEngine.registerSecret("PWD", rawSecret);
    const out = secretRedactionEngine.redact(`brut: ${rawSecret} et échappé: ${JSON.stringify(rawSecret).slice(1, -1)}`);
    // Les deux occurrences (brute et échappée) doivent être rédigées, mais
    // chacune une seule fois — jamais "***REDACTED_PWD***REDACTED_PWD***".
    assert.equal((out.match(/REDACTED_PWD/g) ?? []).length, 2);
    assert.ok(!out.includes("REDACTED_PWDREDACTED"));
  });

  it("la redaction ne détruit pas la lisibilité du reste du rapport", () => {
    secretRedactionEngine.registerSecret("PWD", "secretpass123");
    const report = "## Rapport QA\n\nScénario login-owner : PASSED\nDurée : 3200ms\nCredentials utilisés : secretpass123\nStatut final : OK";
    const out = secretRedactionEngine.redact(report);
    assert.ok(out.includes("## Rapport QA"));
    assert.ok(out.includes("Scénario login-owner : PASSED"));
    assert.ok(out.includes("Durée : 3200ms"));
    assert.ok(out.includes("Statut final : OK"));
    assert.ok(!out.includes("secretpass123"));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests de non-régression — un secret ne doit fuiter dans AUCUN artefact réel
// ─────────────────────────────────────────────────────────────────────────────

describe("SecretRedactionEngine — non-régression sur la forme des artefacts réels", () => {
  beforeEach(() => secretRedactionEngine.reset());

  it("report.json (RunSummary sérialisé) — secret avec guillemet absent après redactObject", () => {
    secretRedactionEngine.registerSecret("QA_OWNER_PASSWORD", 'p@ss"word');
    const fakeReport = {
      run: { runId: "r1", scenarios: [{ name: "login", rawOutput: 'connecté avec p@ss"word' }] },
      metadata: { commitSha: "abc123" },
    };
    const redacted = secretRedactionEngine.redactObject(fakeReport);
    const serialized = JSON.stringify(redacted);
    assert.ok(!serialized.includes('p@ss"word'));
    assert.ok(!serialized.includes('p@ss\\"word'));
  });

  it("events.jsonl (une ligne d'événement) — secret absent après redaction", () => {
    secretRedactionEngine.registerSecret("TOKEN", 'tok\\en"value');
    const eventLine = JSON.stringify({ eventType: "NETWORK_REQUEST", payload: { detail: 'utilise tok\\en"value' } });
    const redacted = secretRedactionEngine.redact(eventLine);
    assert.ok(!redacted.includes('tok\\en"value'));
  });

  it("console.log (texte brut multi-lignes) — secret absent", () => {
    secretRedactionEngine.registerSecret("PWD", "line1\nsecretvalue\nline3");
    const consoleOutput = "Étape 1: init\nline1\nsecretvalue\nline3\nÉtape 2: fin";
    const redacted = secretRedactionEngine.redact(consoleOutput);
    assert.ok(!redacted.includes("secretvalue"));
  });

  it("network.json — token dans une URL encodée absent après redaction", () => {
    secretRedactionEngine.registerSecret("BYPASS", "tok en=spécial");
    const networkJson = JSON.stringify({ url: `https://x.com?_vercel_share=${encodeURIComponent("tok en=spécial")}` });
    const redacted = secretRedactionEngine.redact(networkJson);
    assert.ok(!redacted.includes(encodeURIComponent("tok en=spécial")));
  });

  it("dashboard.json (objet imbriqué avec historique) — secret absent après redactObject", () => {
    secretRedactionEngine.registerSecret("PWD", 'histo"rique');
    const dashboard = { history: [{ runId: "r1", note: 'session avec histo"rique' }] };
    const redacted = secretRedactionEngine.redactObject(dashboard);
    assert.ok(!JSON.stringify(redacted).includes('histo"rique'));
    assert.ok(!JSON.stringify(redacted).includes('histo\\"rique'));
  });

  it("HTML généré (dashboard) — secret absent d'un fragment de gabarit HTML", () => {
    secretRedactionEngine.registerSecret("PWD", "html<secret>value");
    const htmlFragment = `<div class="note">Détail: html<secret>value</div>`;
    const redacted = secretRedactionEngine.redact(htmlFragment);
    assert.ok(!redacted.includes("html<secret>value"));
  });
});
