#!/usr/bin/env tsx
// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — CLI de rétention des événements (v2.5.1)
//
// Applique la politique de rétention (core/event-retention.ts, déjà existante
// depuis v2.5) à un flux opérationnel réel : parcourt les runs présents dans
// reports/manus/, calcule ce qui serait purgé (--preview) ou purge réellement
// (--apply).
//
// Usage :
//   npx tsx scripts/manus/retention-cli.ts --preview
//   npx tsx scripts/manus/retention-cli.ts --apply
//   npx tsx scripts/manus/retention-cli.ts --preview --max-events 500 --max-age-days 30
//   npx tsx scripts/manus/retention-cli.ts --apply --archive-dir reports/manus/_archive
//
// Sécurité :
//   - --preview est le mode par défaut si aucun flag n'est fourni — aucune
//     écriture n'a jamais lieu sans --apply explicite.
//   - Le run le PLUS RÉCENT n'est jamais candidat à la rétention, quel que
//     soit le mode — protection absolue du "run courant".
//   - Chaque runId candidat est validé par isValidRunDir() (format + non
//     traversée de chemin) avant tout accès disque.
//   - Chaque action (preview ou application réelle) émet un événement
//     RETENTION_PREVIEW / RETENTION_APPLIED — traçabilité complète.
// ─────────────────────────────────────────────────────────────────────────────

import { existsSync, readFileSync, readdirSync } from "fs";
import { resolve } from "path";
import { reportsRoot, isValidRunDir } from "./core/paths";
import { applyRetention, applyRetentionToFile, loadRetentionConfig, parseEventsJsonl } from "./core/event-retention";
import { eventLog } from "./core/events";
import type { RetentionConfig } from "./core/event-retention";

// ─── Parsing CLI ──────────────────────────────────────────────────────────────

interface CliArgs {
  mode:   "preview" | "apply";
  config: RetentionConfig;
}

function printUsage(): void {
  console.log([
    "Usage : tsx scripts/manus/retention-cli.ts [--preview|--apply] [options]",
    "",
    "  --preview               Simule la rétention, n'écrit rien (défaut)",
    "  --apply                 Applique réellement la rétention (purge/archive)",
    "  --max-events <n>        Nombre maximal d'événements conservés par run",
    "  --max-age-days <n>      Âge maximal en jours",
    "  --max-size-bytes <n>    Taille maximale du fichier events.jsonl en octets",
    "  --archive-dir <path>    Répertoire d'archivage des événements purgés",
    "  --help, -h              Affiche cette aide",
    "",
    "Le run le plus récent n'est jamais touché, dans aucun mode.",
  ].join("\n"));
}

function parseArgs(argv: string[]): CliArgs {
  let mode: "preview" | "apply" = "preview";
  const base = loadRetentionConfig();
  const config: RetentionConfig = { ...base };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i] ?? "";
    if (arg === "--preview") {
      mode = "preview";
    } else if (arg === "--apply") {
      mode = "apply";
    } else if (arg === "--max-events" && argv[i + 1]) {
      config.maxEvents = parseInt(argv[++i] ?? "", 10);
    } else if (arg === "--max-age-days" && argv[i + 1]) {
      config.maxAgeDays = parseInt(argv[++i] ?? "", 10);
    } else if (arg === "--max-size-bytes" && argv[i + 1]) {
      config.maxSizeBytes = parseInt(argv[++i] ?? "", 10);
    } else if (arg === "--archive-dir" && argv[i + 1]) {
      config.archiveDir = argv[++i];
    } else if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    } else {
      console.error(`❌ Flag inconnu : "${arg}"`);
      printUsage();
      process.exit(1);
    }
  }

  return { mode, config };
}

// ─── Découverte des runs candidats ────────────────────────────────────────────

/**
 * Liste les runs valides (format + confinement), triés chronologiquement
 * croissant. Le DERNIER élément de ce tableau est le run courant — il sera
 * systématiquement exclu par l'appelant, jamais inclus dans les candidats.
 */
export function listValidRunsChronological(root: string = reportsRoot()): string[] {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory() && isValidRunDir(d.name, root))
    .map((d) => d.name)
    .sort();
}

export { parseArgs };

// ─── Main ─────────────────────────────────────────────────────────────────────
// Gardé derrière import.meta.url — un simple import (pour les tests unitaires
// des fonctions exportées ci-dessus) ne doit jamais déclencher une exécution
// réelle, encore moins en mode --apply.

function main(): void {
  const { mode, config } = parseArgs(process.argv);
  const allRuns = listValidRunsChronological();

  if (allRuns.length === 0) {
    console.log("Aucun run trouvé dans reports/manus/ — rien à faire.");
    return;
  }

  // ── Protection absolue du run courant ────────────────────────────────────
  const currentRun     = allRuns[allRuns.length - 1] ?? "";
  const candidateRuns  = allRuns.slice(0, -1);

  console.log(`\n🗄  Rétention des événements — mode ${mode.toUpperCase()}`);
  console.log(`   Run courant protégé (jamais touché) : ${currentRun}`);
  console.log(`   Configuration : maxEvents=${config.maxEvents ?? "—"} maxAgeDays=${config.maxAgeDays ?? "—"} maxSizeBytes=${config.maxSizeBytes ?? "—"} archiveDir=${config.archiveDir ?? "—"}`);
  console.log(`   Runs candidats : ${candidateRuns.length}\n`);

  if (candidateRuns.length === 0) {
    console.log("Aucun run candidat (le seul run existant est le run courant, protégé).");
    return;
  }

  let totalKept = 0;
  let totalPurged = 0;

  for (const runId of candidateRuns) {
    // Défense en profondeur : re-valider explicitement avant tout accès —
    // même si listValidRunsChronological() a déjà filtré, un appelant futur
    // qui réutiliserait candidateRuns ailleurs doit retrouver la même garantie.
    if (!isValidRunDir(runId)) {
      console.warn(`   ⚠️  Run ignoré (validation de chemin échouée) : ${runId}`);
      continue;
    }

    const eventsPath = resolve(reportsRoot(), runId, "events.jsonl");
    if (!existsSync(eventsPath)) continue; // run sans événements (antérieur à v2.5) — rien à purger

    if (mode === "preview") {
      const raw    = readFileSync(eventsPath, "utf-8");
      const events = parseEventsJsonl(raw, eventsPath);
      const { kept, purged } = applyRetention(events, config);

      console.log(`   [preview] ${runId} : ${kept.length} conservé(s), ${purged.length} à purger (aucune écriture)`);
      eventLog.emit("RETENTION_PREVIEW", "INFO", { runId, keptCount: kept.length, purgedCount: purged.length, config });

      totalKept   += kept.length;
      totalPurged += purged.length;
    } else {
      const result = applyRetentionToFile(eventsPath, config);
      console.log(`   [apply]   ${runId} : ${result.keptCount} conservé(s), ${result.purgedCount} purgé(s)`);
      eventLog.emit("RETENTION_APPLIED", "INFO", { runId, ...result, config });

      totalKept   += result.keptCount;
      totalPurged += result.purgedCount;
    }
  }

  console.log(`\n   Total : ${totalKept} conservé(s), ${totalPurged} ${mode === "preview" ? "à purger (mode preview — aucune écriture réelle)" : "purgé(s)"}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
