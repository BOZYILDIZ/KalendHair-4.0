// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Modèle de permissions (v2.3 — Sécurité & Gouvernance)
//
// Vocabulaire explicite des niveaux d'autorisation pour tout agent (humain,
// CI, ou agent IA) interagissant avec ce framework. Un agent d'audit/analyse/
// documentation ne doit JAMAIS recevoir un profil incluant NETWORK_EXECUTION,
// MANUS_EXECUTION ou GIT_OPERATION.
//
// v2.4 : chaque décision (accordée/refusée) est journalisée dans le event log
// — voir core/capabilities.ts pour le modèle successeur (capacités
// indépendantes) et le pont de compatibilité qui préserve ce module intact.
// ─────────────────────────────────────────────────────────────────────────────

import { eventLog } from "./events";

export const PERMISSION_LEVELS = [
  "READ_ONLY",
  "ANALYSIS",
  "DOCUMENTATION",
  "CODE_MODIFICATION",
  "LOCAL_EXECUTION",
  "NETWORK_EXECUTION",
  "MANUS_EXECUTION",
  "GIT_OPERATION",
] as const;

export type PermissionLevel = typeof PERMISSION_LEVELS[number];

export const PERMISSION_DESCRIPTIONS: Record<PermissionLevel, string> = {
  READ_ONLY:          "Lire des fichiers du dépôt. Aucun effet de bord possible.",
  ANALYSIS:           "Analyser du code/des données déjà lues (raisonnement, synthèse). Aucun effet de bord.",
  DOCUMENTATION:      "Produire des rapports, de la documentation, des recommandations écrites. Aucun effet de bord.",
  CODE_MODIFICATION:  "Modifier des fichiers locaux (Edit/Write). Aucune exécution, aucun réseau, aucun Git.",
  LOCAL_EXECUTION:    "Exécuter des commandes locales sans effet réseau : tests, lint, typecheck, build, dry-run.",
  NETWORK_EXECUTION:  "Émettre un appel réseau réel vers un service tiers (Manus, Vercel...). Nécessite SAFE_MODE désactivé.",
  MANUS_EXECUTION:    "Créer une tâche Manus réelle (dépense de crédits). Nécessite SAFE_MODE désactivé + double confirmation.",
  GIT_OPERATION:      "Commit / push / merge / création de PR. Nécessite une instruction fraîche et explicite à chaque fois.",
};

/**
 * Rang de dangerosité croissante. Sert à vérifier qu'un profil ne s'auto-
 * accorde pas une permission plus élevée que celle explicitement listée.
 */
export const PERMISSION_RANK: Record<PermissionLevel, number> = {
  READ_ONLY:         0,
  ANALYSIS:          0,
  DOCUMENTATION:     0,
  CODE_MODIFICATION: 1,
  LOCAL_EXECUTION:   2,
  NETWORK_EXECUTION: 3,
  MANUS_EXECUTION:   4,
  GIT_OPERATION:     4,
};

export interface AgentProfile {
  /** Identifiant lisible du profil (ex: "audit-readonly", "ci-full-run"). */
  name: string;
  /** Liste EXPLICITE des permissions accordées — jamais déduite implicitement. */
  grantedLevels: PermissionLevel[];
}

export function hasPermission(profile: AgentProfile, level: PermissionLevel): boolean {
  return profile.grantedLevels.includes(level);
}

/**
 * Lève une erreur si le profil ne possède pas explicitement le niveau requis.
 * Journalise systématiquement la décision (accordée ou refusée) — v2.4.
 */
export function requirePermission(profile: AgentProfile, level: PermissionLevel): void {
  const granted = hasPermission(profile, level);

  eventLog.emit(
    granted ? "PERMISSION_GRANTED" : "PERMISSION_DENIED",
    granted ? "INFO" : "WARN",
    { profile: profile.name, level, grantedLevels: profile.grantedLevels },
  );

  if (!granted) {
    throw new Error(
      `[PERMISSIONS] Le profil "${profile.name}" n'a pas la permission ${level}.\n` +
      `  Permissions accordées : ${profile.grantedLevels.join(", ") || "(aucune)"}\n` +
      `  ${PERMISSION_DESCRIPTIONS[level]}`
    );
  }
}

// ─── Profils prédéfinis ───────────────────────────────────────────────────────

/** Profil pour tout agent d'audit, de review, de benchmark ou de documentation. */
export const READ_ONLY_AUDIT_PROFILE: AgentProfile = {
  name: "audit-readonly",
  grantedLevels: ["READ_ONLY", "ANALYSIS", "DOCUMENTATION"],
};

/** Profil pour un développeur/CI qui lance des tests, du lint, du dry-run — jamais de réseau réel. */
export const LOCAL_DEV_PROFILE: AgentProfile = {
  name: "local-dev",
  grantedLevels: ["READ_ONLY", "ANALYSIS", "DOCUMENTATION", "CODE_MODIFICATION", "LOCAL_EXECUTION"],
};

/** Profil pour une campagne QA réelle, explicitement autorisée par un humain pour CETTE exécution. */
export const MANUS_CAMPAIGN_PROFILE: AgentProfile = {
  name: "manus-campaign-authorized",
  grantedLevels: [
    "READ_ONLY", "ANALYSIS", "DOCUMENTATION", "CODE_MODIFICATION",
    "LOCAL_EXECUTION", "NETWORK_EXECUTION", "MANUS_EXECUTION",
  ],
};
