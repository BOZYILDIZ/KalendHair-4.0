// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Système de capacités indépendantes (v2.4 — Runtime Trust)
//
// Successeur envisagé du modèle PermissionLevel (core/permissions.ts).
// Ce module NE REMPLACE PAS permissions.ts — il coexiste et fournit un pont
// de compatibilité (fromAgentProfile). Migration progressive : le code
// existant continue de fonctionner sans modification.
//
// ─── Comparaison des deux modèles ─────────────────────────────────────────────
//
// PermissionLevel (v2.3, actuel) :
//   - 8 niveaux ordonnés par un rang de dangerosité (PERMISSION_RANK).
//   - Simple à raisonner : "ce profil va jusqu'au niveau N".
//   - MAIS implique une hiérarchie qui n'est pas toujours vraie en pratique :
//     rien n'empêche d'avoir besoin de EXECUTE_NETWORK (ex: un ping de
//     diagnostic) sans jamais vouloir SPEND_MANUS_CREDITS — le modèle actuel
//     les sépare déjà en deux niveaux distincts (NETWORK_EXECUTION vs
//     MANUS_EXECUTION), ce qui fonctionne, mais uniquement parce que ces deux
//     axes ont été anticipés et ordonnés à la main. Un nouvel axe orthogonal
//     (ex: "peut lire les captures d'écran d'autrui" vs "peut en générer")
//     forcerait soit à l'insérer artificiellement dans le rang existant, soit
//     à créer un niveau de plus qui casse la linéarité.
//
// Capability (v2.4, ce module) :
//   - Un ensemble de jetons INDÉPENDANTS, sans rang implicite.
//   - Avoir une capacité n'implique JAMAIS d'en avoir une autre — chaque
//     combinaison doit être explicitement accordée.
//   - Plus verbeux (il faut lister chaque capacité, pas juste "jusqu'au
//     niveau N"), mais plus précis et plus sûr à long terme : impossible
//     d'accorder implicitement une capacité non désirée par effet de bord
//     d'un rang trop large.
//   - Mieux adapté à un futur multi-projets/multi-équipes (audit v2.2.1) où
//     deux équipes peuvent vouloir des combinaisons orthogonales
//     (ex: équipe A a EXECUTE_NETWORK sans SPEND_MANUS_CREDITS pour tester
//     un provider alternatif gratuit ; équipe B a l'inverse).
//
// ─── Recommandation (analyse d'architecture, non mesurée) ─────────────────────
// Migrer progressivement : garder PermissionLevel comme vocabulaire "humain"
// dans les messages d'erreur et la documentation (plus lisible), mais faire
// évoluer l'application technique du contrôle d'accès vers Capability à
// mesure que de nouveaux axes orthogonaux apparaissent. Le pont
// fromAgentProfile() permet cette transition sans réécriture immédiate.
// ─────────────────────────────────────────────────────────────────────────────

import { eventLog } from "./events";
import type { AgentProfile, PermissionLevel } from "./permissions";

export const CAPABILITIES = [
  "READ_FILES",
  "WRITE_FILES",
  "EXECUTE_LOCAL",
  "EXECUTE_NETWORK",
  "SPEND_MANUS_CREDITS",
  "WRITE_GIT",
  "GENERATE_REPORTS",
] as const;

export type Capability = typeof CAPABILITIES[number];

export const CAPABILITY_DESCRIPTIONS: Record<Capability, string> = {
  READ_FILES:           "Lire des fichiers du dépôt.",
  WRITE_FILES:          "Modifier des fichiers locaux.",
  EXECUTE_LOCAL:        "Exécuter des commandes locales sans effet réseau (tests, lint, dry-run).",
  EXECUTE_NETWORK:      "Émettre un appel réseau réel vers un service tiers.",
  SPEND_MANUS_CREDITS:  "Créer une tâche Manus réelle (dépense financière).",
  WRITE_GIT:            "Commit / push / merge / PR.",
  GENERATE_REPORTS:     "Produire des rapports/artefacts (report.md, dashboard...).",
};

export interface CapabilityGrant {
  /** Identifiant lisible (ex: "audit-readonly", "manus-campaign-authorized"). */
  name: string;
  /** Ensemble INDÉPENDANT de capacités — aucune hiérarchie, aucune implication. */
  capabilities: Set<Capability>;
}

export function grantHas(grant: CapabilityGrant, cap: Capability): boolean {
  return grant.capabilities.has(cap);
}

/** Lève une erreur si la capacité n'est pas explicitement accordée. Journalise la décision. */
export function requireCapability(grant: CapabilityGrant, cap: Capability): void {
  const granted = grantHas(grant, cap);

  eventLog.emit(
    granted ? "PERMISSION_GRANTED" : "PERMISSION_DENIED",
    granted ? "INFO" : "WARN",
    { grant: grant.name, capability: cap, model: "capability" },
  );

  if (!granted) {
    throw new Error(
      `[CAPABILITIES] "${grant.name}" ne possède pas la capacité ${cap}.\n` +
      `  Capacités accordées : ${[...grant.capabilities].join(", ") || "(aucune)"}\n` +
      `  ${CAPABILITY_DESCRIPTIONS[cap]}`
    );
  }
}

// ─── Pont de compatibilité avec PermissionLevel (core/permissions.ts) ─────────
//
// Traduction EXPLICITE et documentée — pas de magie. Si un niveau ne devrait
// pas impliquer une capacité donnée dans un cas précis, ce mapping doit être
// affiné, pas contourné silencieusement ailleurs.
const LEVEL_TO_CAPABILITIES: Record<PermissionLevel, Capability[]> = {
  READ_ONLY:          ["READ_FILES"],
  ANALYSIS:           ["READ_FILES"],
  DOCUMENTATION:      ["READ_FILES", "GENERATE_REPORTS"],
  CODE_MODIFICATION:  ["READ_FILES", "WRITE_FILES"],
  LOCAL_EXECUTION:    ["READ_FILES", "WRITE_FILES", "EXECUTE_LOCAL"],
  NETWORK_EXECUTION:  ["READ_FILES", "WRITE_FILES", "EXECUTE_LOCAL", "EXECUTE_NETWORK"],
  MANUS_EXECUTION:    ["READ_FILES", "WRITE_FILES", "EXECUTE_LOCAL", "EXECUTE_NETWORK", "SPEND_MANUS_CREDITS"],
  GIT_OPERATION:      ["READ_FILES", "WRITE_GIT"],
};

/**
 * Convertit un AgentProfile (modèle v2.3) en CapabilityGrant (modèle v2.4).
 * Permet au code existant basé sur AgentProfile de bénéficier du contrôle par
 * capacités sans migration immédiate — c'est le mécanisme de "migration
 * progressive sans casser la compatibilité" demandé.
 */
export function fromAgentProfile(profile: AgentProfile): CapabilityGrant {
  const capabilities = new Set<Capability>();
  for (const level of profile.grantedLevels) {
    for (const cap of LEVEL_TO_CAPABILITIES[level]) {
      capabilities.add(cap);
    }
  }
  return { name: profile.name, capabilities };
}
