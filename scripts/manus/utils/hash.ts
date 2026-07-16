// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Utilitaire de hachage SHA-256
// ─────────────────────────────────────────────────────────────────────────────

import { createHash } from "crypto";

/**
 * Calcule le SHA-256 hex du prompt final envoyé à Manus.
 * Permet de vérifier qu'un run donné a utilisé exactement ce prompt.
 */
export function computePromptHash(prompt: string): string {
  return createHash("sha256").update(prompt, "utf8").digest("hex");
}
