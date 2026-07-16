// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — SAFE_MODE (v2.3 — Sécurité & Gouvernance)
//
// Principe : "deny by default". Toute action à effet de bord réel (appel
// réseau, création de tâche Manus, dépense de crédits) est BLOQUÉE par défaut,
// quel que soit l'appelant (humain, CI, ou agent IA qui ignorerait ses
// instructions). Le déverrouillage nécessite DEUX flags CLI simultanés,
// jamais lus depuis .env.local — ils doivent être tapés explicitement à
// CHAQUE exécution réelle, pour qu'aucune autorisation ne puisse être
// "oubliée active" ou réutilisée automatiquement.
//
// Incident déclencheur (2026-07-11) : un agent d'audit en lecture seule a
// exécuté run-all.ts en conditions réelles suite à un bug de parsing CLI
// (--dry-run avalé par --concurrency). Ce garde-fou existe précisément pour
// que ce type d'incident soit techniquement impossible, indépendamment de
// la discipline de l'agent qui invoque le code.
//
// v2.4 : chaque décision (bloquée ou explicitement désactivée) est
// journalisée dans le event log — voir core/events.ts.
// ─────────────────────────────────────────────────────────────────────────────

import { eventLog } from "./events";

export type DangerousAction =
  | "NETWORK_CALL"          // tout fetch() vers un service tiers (Manus, Vercel...)
  | "MANUS_TASK_CREATION"   // création d'une tâche Manus — dépense réelle de crédits
  | "GIT_WRITE";            // commit / push / merge / PR (gouverné hors de ce module, cf. SECURITY_POLICY.md)

// Flags CLI requis SIMULTANÉMENT pour désactiver SAFE_MODE. Volontairement
// verbeux — un flag court/oubliable serait plus facile à taper par erreur.
export const UNSAFE_FLAG   = "--unsafe";
export const CONFIRM_FLAG  = "--i-accept-manus-cost";

/**
 * Retourne true si SAFE_MODE est actif (comportement par défaut).
 * Ne lit JAMAIS process.env / .env.local — uniquement les arguments CLI de
 * l'invocation en cours, pour empêcher toute réutilisation automatique d'une
 * autorisation passée (exigence explicite : "aucune autorisation ancienne ne
 * doit être réutilisée automatiquement").
 */
export function isSafeMode(argv: string[] = process.argv): boolean {
  const hasUnsafe  = argv.includes(UNSAFE_FLAG);
  const hasConfirm = argv.includes(CONFIRM_FLAG);
  return !(hasUnsafe && hasConfirm);
}

export class SafeModeViolationError extends Error {
  constructor(action: DangerousAction, detail: string) {
    super(
      `[SAFE_MODE] Action bloquée (${action}) : ${detail}\n` +
      `  → Pour exécuter réellement, relancez avec les DEUX flags simultanément :\n` +
      `      ${UNSAFE_FLAG} ${CONFIRM_FLAG}\n` +
      `  → Ces flags ne sont jamais lus depuis .env.local : ils doivent être tapés\n` +
      `    explicitement à chaque exécution réelle. Aucune autorisation n'est mémorisée.`
    );
    this.name = "SafeModeViolationError";
  }
}

/**
 * Lève SafeModeViolationError si SAFE_MODE est actif. À appeler immédiatement
 * avant toute action de la catégorie DangerousAction — jamais après coup.
 */
export function assertNotSafeMode(
  action: DangerousAction,
  detail: string,
  argv: string[] = process.argv,
): void {
  if (isSafeMode(argv)) {
    eventLog.emit("SAFE_MODE_BLOCKED", "CRITICAL", { action, detail });
    throw new SafeModeViolationError(action, detail);
  }
  eventLog.emit("SAFE_MODE_DISABLED", "WARN", { action, detail });
}

/** Bannière d'état affichée au démarrage de tout point d'entrée CLI sensible. */
export function printSafeModeBanner(argv: string[] = process.argv): void {
  const safe = isSafeMode(argv);
  if (safe) {
    console.log("🔒 SAFE_MODE : ACTIF — aucun appel réseau réel, aucune dépense Manus possible.");
  } else {
    console.log("🔓 SAFE_MODE : DÉSACTIVÉ pour cette exécution — appels réseau réels autorisés.");
    console.log(`   (Flags fournis : ${UNSAFE_FLAG} ${CONFIRM_FLAG})`);
  }
}
