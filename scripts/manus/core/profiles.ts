// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Profils QA (v2.2)
//
// Usage :
//   npx tsx scripts/manus/run-all.ts --profile smoke
//   npx tsx scripts/manus/run-all.ts --profile full
//
// Profils disponibles :
//   SMOKE    — 2 scénarios essentiels (~3 min, ~$0.08)
//   STANDARD — 5 scénarios non-responsive (~7 min, ~$0.35)
//   FULL     — 7 scénarios complets (~10 min, ~$0.50)
//   NIGHTLY  — 7 scénarios + analyse de régression (~12 min)
// ─────────────────────────────────────────────────────────────────────────────

import type { ScenarioDefinition } from "./types";
import { eventLog }                from "./events";

// ─── Types ────────────────────────────────────────────────────────────────────

export type QAProfile = "smoke" | "standard" | "full" | "nightly";

export interface ProfileConfig {
  name:        string;
  description: string;
  scenarioIds: string[];        // liste explicite d'IDs, vide = tous
  tags?:       string[];        // filtre alternatif par tags (OR)
  costEst:     string;          // estimation coût USD
  durationEst: string;          // estimation durée
  nightly:     boolean;         // active l'analyse de régression visuelle
}

// ─── Définitions des profils ──────────────────────────────────────────────────

export const PROFILES: Record<QAProfile, ProfileConfig> = {
  smoke: {
    name:        "SMOKE",
    description: "Tests minimaux : connexion owner + réservation publique",
    scenarioIds: ["SC-001", "SC-003"],
    costEst:     "~$0.05–$0.14",
    durationEst: "~3 min",
    nightly:     false,
  },
  standard: {
    name:        "STANDARD",
    description: "Run standard : auth + dashboard + navigation (sans responsive)",
    scenarioIds: ["SC-001", "SC-002", "SC-003", "SC-004", "SC-005"],
    costEst:     "~$0.15–$0.43",
    durationEst: "~7 min",
    nightly:     false,
  },
  full: {
    name:        "FULL",
    description: "Run complet : tous les scénarios incluant mobile et responsive",
    scenarioIds: [],  // vide = tous les scénarios prod
    costEst:     "~$0.23–$0.59",
    durationEst: "~10 min",
    nightly:     false,
  },
  nightly: {
    name:        "NIGHTLY",
    description: "Run complet + analyse régression visuelle + rapport étendu",
    scenarioIds: [],  // vide = tous
    costEst:     "~$0.25–$0.65",
    durationEst: "~12 min",
    nightly:     true,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Retourne la config d'un profil ou null si inconnu. */
export function getProfile(name: string): ProfileConfig | null {
  return PROFILES[name as QAProfile] ?? null;
}

/** Filtre les scénarios selon le profil. */
export function filterByProfile(
  scenarios:   ScenarioDefinition[],
  profileName: QAProfile,
): ScenarioDefinition[] {
  const profile = PROFILES[profileName];
  if (!profile) return scenarios;

  // Pas de filtre explicite → tous les scénarios
  if (profile.scenarioIds.length === 0) return scenarios;

  return scenarios.filter((s) => profile.scenarioIds.includes(s.scenarioId));
}

/** Affiche le résumé du profil sélectionné. */
export function printProfileSummary(profileName: QAProfile, count: number): void {
  const p = PROFILES[profileName];
  if (!p) return;
  console.log(`\n📋 Profil QA : ${p.name}`);
  console.log(`   ${p.description}`);
  console.log(`   Scénarios : ${count} | Durée estimée : ${p.durationEst} | Coût estimé : ${p.costEst}`);
  if (p.nightly) console.log(`   🔬 Régression visuelle : activée`);

  eventLog.emit("COST_ESTIMATED", "INFO", {
    profile: profileName, scenarioCount: count, costEst: p.costEst, durationEst: p.durationEst,
  });
}

/** Liste les profils disponibles pour le --help. */
export function listProfiles(): string {
  return Object.entries(PROFILES).map(([key, p]) =>
    `  --profile ${key.padEnd(10)} ${p.description} (${p.durationEst}, ${p.costEst})`
  ).join("\n");
}
