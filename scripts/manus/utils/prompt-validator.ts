// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Validation structurelle du prompt
//
// Un prompt valide doit contenir ces 6 sections avant envoi à Manus.
// Toute section manquante est une erreur bloquante (fail-fast).
// ─────────────────────────────────────────────────────────────────────────────

const REQUIRED_SECTIONS: Array<{ key: string; patterns: RegExp[] }> = [
  {
    key: "ROLE",
    patterns: [/##\s*R[ÔO]LE/i, /QA-EXECUTOR/i],
  },
  {
    key: "OBJECTIF",
    patterns: [/##\s*OBJECTIF/i],
  },
  {
    key: "INTERDICTIONS",
    patterns: [/##\s*INTERDICTIONS/i],
  },
  {
    key: "CHECKLIST",
    patterns: [/##\s*CHECKLIST/i],
  },
  {
    key: "FORMAT JSON",
    patterns: [/##\s*Format de r[eé]ponse/i, /FORMAT\s+JSON/i, /bloc JSON/i],
  },
  {
    key: "INSTRUCTION FINALE",
    patterns: [/##\s*INSTRUCTION\s+FINALE/i],
  },
];

export type PromptValidationResult = {
  valid:    boolean;
  missing:  string[];
  checked:  string[];
};

/**
 * Vérifie que le prompt contient toutes les sections obligatoires.
 * Retourne le détail des sections présentes et manquantes.
 */
export function validatePrompt(prompt: string): PromptValidationResult {
  const missing: string[] = [];
  const checked: string[] = [];

  for (const section of REQUIRED_SECTIONS) {
    const found = section.patterns.some((re) => re.test(prompt));
    if (found) {
      checked.push(section.key);
    } else {
      missing.push(section.key);
    }
  }

  return { valid: missing.length === 0, missing, checked };
}

/**
 * Lance une erreur immédiate si une section obligatoire est absente du prompt.
 * Appeler avant createAndPollTask() dans le runner.
 */
export function assertPromptValid(prompt: string, scenarioName: string): void {
  const result = validatePrompt(prompt);
  if (!result.valid) {
    throw new Error(
      `[PromptValidation] Scénario "${scenarioName}" — sections manquantes : ${result.missing.join(", ")}. ` +
      `Un prompt valide doit contenir : ROLE, OBJECTIF, INTERDICTIONS, CHECKLIST, FORMAT JSON, INSTRUCTION FINALE.`
    );
  }
}
