// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Politique de rétention des événements (v2.5)
//
// Module indépendant du EventBus — applique une politique de rétention à un
// ensemble d'événements déjà écrits (events.jsonl), pas au moment de
// l'émission. Peut être invoqué explicitement (ex: tâche de maintenance,
// futur cron) sans dépendre du cycle de vie d'un run QA.
//
// Ordre d'application : maxAgeDays → maxEvents → maxSizeBytes. La taille est
// vérifiée en dernier car c'est la seule contrainte qui dépend du contenu
// sérialisé des événements restants après les deux premiers filtres.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, mkdirSync, existsSync, appendFileSync } from "fs";
import { resolve } from "path";
import type { RuntimeEvent } from "./events-schema";

export interface RetentionConfig {
  /** Nombre maximal d'événements conservés (les plus récents). */
  maxEvents?:    number;
  /** Âge maximal en jours — tout événement plus vieux est purgé. */
  maxAgeDays?:   number;
  /** Taille maximale du fichier sérialisé en octets — purge les plus anciens jusqu'à respecter la limite. */
  maxSizeBytes?: number;
  /** Si fourni, les événements purgés sont archivés ici plutôt que perdus. */
  archiveDir?:   string;
}

export const DEFAULT_RETENTION_CONFIG: RetentionConfig = {
  maxEvents:  10_000,
  maxAgeDays: 90,
};

/**
 * Lit la configuration de rétention depuis l'environnement, avec repli sur
 * DEFAULT_RETENTION_CONFIG. Variables : MANUS_EVENTS_MAX_COUNT,
 * MANUS_EVENTS_MAX_AGE_DAYS, MANUS_EVENTS_MAX_SIZE_BYTES, MANUS_EVENTS_ARCHIVE_DIR.
 */
export function loadRetentionConfig(): RetentionConfig {
  const maxEvents    = parseIntEnv("MANUS_EVENTS_MAX_COUNT",     DEFAULT_RETENTION_CONFIG.maxEvents);
  const maxAgeDays   = parseIntEnv("MANUS_EVENTS_MAX_AGE_DAYS",  DEFAULT_RETENTION_CONFIG.maxAgeDays);
  const maxSizeBytes = parseIntEnv("MANUS_EVENTS_MAX_SIZE_BYTES", undefined);
  const archiveDir   = process.env["MANUS_EVENTS_ARCHIVE_DIR"] || undefined;

  return { maxEvents, maxAgeDays, maxSizeBytes, archiveDir };
}

function parseIntEnv(name: string, fallback: number | undefined): number | undefined {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = parseInt(raw, 10);
  return isNaN(n) || n < 0 ? fallback : n;
}

/**
 * Applique la politique de rétention à une liste d'événements en mémoire.
 * Fonction pure — ne touche pas au disque, testable sans fixture fichier.
 */
export function applyRetention(
  events: RuntimeEvent[],
  config: RetentionConfig,
): { kept: RuntimeEvent[]; purged: RuntimeEvent[] } {
  // Toujours travailler du plus ancien au plus récent pour purger dans le bon ordre.
  const sorted = [...events].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  let kept   = sorted;
  const purgedSet = new Set<RuntimeEvent>();

  // 1. Âge maximal
  if (config.maxAgeDays !== undefined) {
    const cutoff = Date.now() - config.maxAgeDays * 24 * 60 * 60 * 1000;
    kept = kept.filter((e) => {
      const ok = new Date(e.timestamp).getTime() >= cutoff;
      if (!ok) purgedSet.add(e);
      return ok;
    });
  }

  // 2. Nombre maximal d'événements — garde les N plus récents
  if (config.maxEvents !== undefined && kept.length > config.maxEvents) {
    const overflow = kept.length - config.maxEvents;
    for (let i = 0; i < overflow; i++) {
      const item = kept[i];
      if (item) purgedSet.add(item);
    }
    kept = kept.slice(overflow);
  }

  // 3. Taille maximale — purge les plus anciens jusqu'à respecter la limite
  if (config.maxSizeBytes !== undefined) {
    while (kept.length > 0) {
      const size = Buffer.byteLength(kept.map((e) => JSON.stringify(e)).join("\n"), "utf-8");
      if (size <= config.maxSizeBytes) break;
      const removed = kept[0];
      if (removed) purgedSet.add(removed);
      kept = kept.slice(1);
    }
  }

  // Reconstituer purged dans l'ordre chronologique d'origine.
  const purged = sorted.filter((e) => purgedSet.has(e));

  return { kept, purged };
}

/** Archive les événements purgés — un fichier JSONL par runId d'origine, en ajout. */
export function archiveEvents(purged: RuntimeEvent[], archiveDir: string): void {
  if (purged.length === 0) return;
  mkdirSync(archiveDir, { recursive: true });
  const byRun = new Map<string, RuntimeEvent[]>();
  for (const e of purged) {
    const list = byRun.get(e.runId) ?? [];
    list.push(e);
    byRun.set(e.runId, list);
  }
  for (const [runId, list] of byRun) {
    const path  = resolve(archiveDir, `${runId}.jsonl`);
    const lines = list.map((e) => JSON.stringify(e)).join("\n") + "\n";
    appendFileSync(path, lines, "utf-8");
  }
}

/**
 * Compression d'archive — NON IMPLÉMENTÉE. Point d'extension documenté pour
 * une future v2.6 (ex: gzip des fichiers archivés au-delà d'une certaine
 * ancienneté). Lève une erreur explicite plutôt qu'un no-op silencieux, pour
 * qu'un appel accidentel soit immédiatement visible plutôt que de laisser
 * croire à une compression qui n'a pas lieu.
 */
export function compressArchive(_archiveDir: string): never {
  throw new Error(
    "[EventRetention] compressArchive() n'est pas implémentée (préparation v2.5, " +
    "voir docs/qa/ARCHITECTURE_PIPELINE.md — section Rétention). " +
    "Prévu : compression gzip des fichiers d'archive au-delà d'un seuil d'ancienneté."
  );
}

/**
 * Parse un fichier events.jsonl ligne par ligne, en ignorant explicitement
 * (avec avertissement) toute ligne corrompue plutôt que de faire planter
 * l'appelant — un crash (kill, coupure disque) en cours d'écriture peut
 * laisser une dernière ligne tronquée ; ce n'est pas une raison pour perdre
 * l'accès à TOUTES les lignes valides qui la précèdent.
 */
export function parseEventsJsonl(raw: string, sourcePath: string): RuntimeEvent[] {
  const events: RuntimeEvent[] = [];
  const lines = raw.split("\n").filter((line) => line.trim().length > 0);
  for (let i = 0; i < lines.length; i++) {
    try {
      events.push(JSON.parse(lines[i] as string) as RuntimeEvent);
    } catch (err) {
      console.warn(
        `[EventRetention] Ligne ${i + 1} de "${sourcePath}" illisible (JSON corrompu) — ignorée. ` +
        `Erreur : ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }
  return events;
}

/**
 * Applique la rétention directement à un fichier events.jsonl sur disque :
 * lit, filtre, réécrit (ou supprime si vide), archive si configuré.
 */
export function applyRetentionToFile(
  eventsJsonlPath: string,
  config: RetentionConfig = loadRetentionConfig(),
): { keptCount: number; purgedCount: number } {
  if (!existsSync(eventsJsonlPath)) return { keptCount: 0, purgedCount: 0 };

  const raw    = readFileSync(eventsJsonlPath, "utf-8");
  const events = parseEventsJsonl(raw, eventsJsonlPath);

  const { kept, purged } = applyRetention(events, config);

  if (purged.length > 0 && config.archiveDir) {
    archiveEvents(purged, config.archiveDir);
  }

  const lines = kept.map((e) => JSON.stringify(e)).join("\n") + (kept.length > 0 ? "\n" : "");
  writeFileSync(eventsJsonlPath, lines, "utf-8");

  return { keptCount: kept.length, purgedCount: purged.length };
}
