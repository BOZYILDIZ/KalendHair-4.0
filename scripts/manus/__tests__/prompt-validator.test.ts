// ─────────────────────────────────────────────────────────────────────────────
// Tests — utils/prompt-validator.ts
// Runner : node --test --import tsx/esm scripts/manus/__tests__/prompt-validator.test.ts
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it } from "node:test";
import assert            from "node:assert/strict";
import { validatePrompt, assertPromptValid } from "../utils/prompt-validator";

// Prompt complet valide — contient toutes les sections requises
const VALID_PROMPT = `
⚡ MODE: QA_EXECUTOR — Exécuteur QA déterministe.

## RÔLE
Tu es un QA-EXECUTOR. Suis les étapes exactement.

## OBJECTIF
Tester la connexion owner.

## INTERDICTIONS
- Ne jamais explorer.
- STOP après le JSON.

## CHECKLIST
1. Naviguer vers l'URL de connexion.
2. Entrer les credentials.

## Format de réponse
Retourne un bloc JSON.

## INSTRUCTION FINALE
Exécute maintenant. STOP.
`;

describe("validatePrompt", () => {
  it("valide un prompt complet", () => {
    const result = validatePrompt(VALID_PROMPT);
    assert.equal(result.valid, true);
    assert.deepEqual(result.missing, []);
    assert.equal(result.checked.length, 6);
  });

  it("détecte RÔLE manquant", () => {
    const prompt = VALID_PROMPT.replace(/## R[ÔO]LE[\s\S]*?(?=##)/i, "");
    const result = validatePrompt(prompt);
    assert.equal(result.valid, false);
    assert.ok(result.missing.includes("ROLE"));
  });

  it("détecte OBJECTIF manquant", () => {
    const prompt = VALID_PROMPT.replace(/## OBJECTIF[\s\S]*?(?=##)/i, "");
    const result = validatePrompt(prompt);
    assert.ok(result.missing.includes("OBJECTIF"));
  });

  it("détecte FORMAT JSON manquant", () => {
    const prompt = VALID_PROMPT.replace(/## Format de réponse[\s\S]*?(?=##)/i, "");
    const result = validatePrompt(prompt);
    assert.ok(result.missing.includes("FORMAT JSON"));
  });

  it("prompt vide — toutes les sections manquantes", () => {
    const result = validatePrompt("");
    assert.equal(result.valid, false);
    assert.equal(result.missing.length, 6);
    assert.deepEqual(result.checked, []);
  });
});

describe("assertPromptValid", () => {
  it("ne lève pas d'erreur pour un prompt valide", () => {
    assert.doesNotThrow(() => assertPromptValid(VALID_PROMPT, "test-scenario"));
  });

  it("lève une Error si le prompt est invalide", () => {
    assert.throws(
      () => assertPromptValid("prompt incomplet", "mon-scenario"),
      (err: unknown) => {
        assert.ok(err instanceof Error);
        assert.ok(err.message.includes("mon-scenario"));
        assert.ok(err.message.includes("PromptValidation"));
        return true;
      }
    );
  });

  it("message d'erreur liste les sections manquantes", () => {
    assert.throws(
      () => assertPromptValid("", "sc-test"),
      (err: unknown) => {
        assert.ok(err instanceof Error);
        assert.ok(err.message.includes("ROLE"));
        assert.ok(err.message.includes("OBJECTIF"));
        return true;
      }
    );
  });
});
