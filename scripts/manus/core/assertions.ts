// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Bibliothèque d'assertions
//
// Chaque fonction produit une AssertionInstruction (instruction en langage
// naturel incluse dans le prompt Manus) et un nom d'assertion identifiant
// le résultat attendu dans le JSON retourné par Manus.
// ─────────────────────────────────────────────────────────────────────────────

import type { AssertionInstruction } from "./types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ai(name: string, instruction: string): AssertionInstruction {
  return { name, instruction };
}

// ─── Assertions disponibles ───────────────────────────────────────────────────

/**
 * Vérifie qu'aucune erreur console n'est présente dans la page.
 * Exclut les warnings de développement React si `allowReactWarnings` est true.
 */
export function expectNoConsoleErrors(allowReactWarnings = false): AssertionInstruction {
  const extra = allowReactWarnings
    ? " Les warnings React/Next.js de développement sont ignorés."
    : "";
  return ai(
    "no_console_errors",
    `Vérifie qu'il n'y a aucune erreur dans la console du navigateur (type "error").${extra} ` +
    `Si des erreurs sont présentes, liste-les dans le champ "actual".`
  );
}

/**
 * Vérifie qu'aucune requête réseau n'a échoué (4xx/5xx).
 * Optionnellement ignore certains codes.
 */
export function expectNoNetworkErrors(ignoreCodes: number[] = []): AssertionInstruction {
  const ignoreMsg = ignoreCodes.length > 0
    ? ` Ignore les codes HTTP ${ignoreCodes.join(", ")}.`
    : "";
  return ai(
    "no_network_errors",
    `Vérifie qu'aucune requête réseau n'a retourné une erreur HTTP (4xx ou 5xx).${ignoreMsg} ` +
    `Liste les URLs et codes en erreur si présents.`
  );
}

/**
 * Vérifie qu'un sélecteur CSS ou texte est visible dans la page.
 */
export function expectVisible(selector: string, label?: string): AssertionInstruction {
  const name = `visible_${(label ?? selector).replace(/[^a-z0-9]/gi, "_").toLowerCase()}`;
  return ai(
    name,
    `Vérifie que l'élément "${label ?? selector}" (sélecteur ou texte visible) ` +
    `est présent et visible dans la page.`
  );
}

/**
 * Vérifie qu'un texte exact est présent dans la page.
 */
export function expectText(text: string, context?: string): AssertionInstruction {
  const name = `text_${text.slice(0, 30).replace(/[^a-z0-9]/gi, "_").toLowerCase()}`;
  const ctx  = context ? ` dans la zone "${context}"` : "";
  return ai(name, `Vérifie que le texte "${text}"${ctx} est visible dans la page.`);
}

/**
 * Vérifie que l'URL courante correspond à la route attendue.
 */
export function expectRoute(pathOrPattern: string): AssertionInstruction {
  const name = `route_${pathOrPattern.replace(/[^a-z0-9]/gi, "_").toLowerCase()}`;
  return ai(
    name,
    `Vérifie que l'URL courante du navigateur correspond à "${pathOrPattern}". ` +
    `L'URL peut contenir un suffixe de paramètres ou de hash.`
  );
}

/**
 * Vérifie qu'une redirection a bien eu lieu.
 */
export function expectRedirect(fromPath: string, toPath: string): AssertionInstruction {
  return ai(
    `redirect_to_${toPath.replace(/[^a-z0-9]/gi, "_").toLowerCase()}`,
    `Vérifie que la navigation vers "${fromPath}" redirige automatiquement vers "${toPath}".`
  );
}

/**
 * Vérifie qu'un nombre précis d'éléments correspond au sélecteur.
 */
export function expectElementCount(
  selector: string,
  count: number,
  label?: string
): AssertionInstruction {
  const name = `count_${(label ?? selector).replace(/[^a-z0-9]/gi, "_").toLowerCase()}`;
  return ai(
    name,
    `Vérifie que le nombre d'éléments "${label ?? selector}" visibles dans la page est exactement ${count}.`
  );
}

/**
 * Demande à Manus de prendre une capture d'écran de la zone indiquée.
 */
export function expectScreenshot(label: string, description?: string): AssertionInstruction {
  const name = `screenshot_${label.replace(/[^a-z0-9]/gi, "_").toLowerCase()}`;
  const desc = description ? ` (${description})` : "";
  return ai(
    name,
    `Prends une capture d'écran de la zone "${label}"${desc} et inclus-la dans les artefacts.`
  );
}

// ─── Bloc formaté pour le prompt ─────────────────────────────────────────────

/**
 * Génère le bloc d'instructions d'assertions à inclure dans le prompt Manus.
 * Demande à Manus de retourner un JSON structuré dans sa réponse.
 */
export function buildAssertionsBlock(assertions: AssertionInstruction[]): string {
  const lines = assertions.map((a, i) =>
    `${i + 1}. [${a.name}] ${a.instruction}`
  );

  const screenshotAssertions = assertions.filter((a) => a.name.startsWith("screenshot_"));

  const jsonTemplate = {
    assertions: assertions.map((a) => ({
      name:    a.name,
      passed:  true,
      message: "Décris précisément ce que tu as observé.",
    })),
    urlsVisited:   ["https://example.com/page"],
    consoleErrors: [] as string[],
    networkErrors: [] as string[],
    screenshots:   screenshotAssertions.length > 0
      ? screenshotAssertions.map((a) => ({ label: a.name.replace(/^screenshot_/, ""), url: null }))
      : [{ label: "capture", url: null }],
  };

  return [
    "## Assertions à vérifier",
    "",
    ...lines,
    "",
    "## Format de réponse requis",
    "",
    "Génère EXACTEMENT ce bloc JSON (entre ```json et ```) :",
    "",
    "```json",
    JSON.stringify(jsonTemplate, null, 2),
    "```",
    "",
    "## INSTRUCTION FINALE — OBLIGATOIRE",
    "",
    "Dès que tu as écrit le bloc JSON ci-dessus :",
    "→ ARRÊTE IMMÉDIATEMENT.",
    "→ Ne navigue plus sur aucune URL.",
    "→ Ne prends plus aucune capture d'écran.",
    "→ Ne vérifie plus rien.",
    "→ Termine la tâche.",
  ].join("\n");
}

/** Extrait les noms d'assertions depuis une liste d'instructions. */
export function assertionNames(assertions: AssertionInstruction[]): string[] {
  return assertions.map((a) => a.name);
}
