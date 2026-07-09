// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Utilitaires date/heure
// ─────────────────────────────────────────────────────────────────────────────

/** ISO 8601 au moment de l'appel. */
export function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Identifiant de run unique basé sur la date.
 * Format : "2026-07-08_14-30-00" (compatible nom de dossier sur tous les OS)
 */
export function runId(): string {
  return new Date()
    .toISOString()
    .slice(0, 19)
    .replace("T", "_")
    .replace(/:/g, "-");
}

/** Formate une durée en ms en chaîne lisible. */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const totalSec = ms / 1000;
  if (totalSec < 60) return `${totalSec.toFixed(1)}s`;
  const m = Math.floor(totalSec / 60);
  const s = Math.round(totalSec % 60);
  return `${m}m ${s}s`;
}

/** Extrait "HH:MM:SS" depuis une chaîne ISO 8601. */
export function toTimeLabel(isoString: string): string {
  return isoString.slice(11, 19);
}

/** Formate un delta de ms en chaîne signée : "+12.3s", "-5s", "0s". */
export function formatDurationDelta(deltaMs: number): string {
  const sign  = deltaMs > 0 ? "+" : deltaMs < 0 ? "" : "";
  const abs   = Math.abs(deltaMs);
  if (abs < 1000) return `${sign}${deltaMs}ms`;
  const sec   = abs / 1000;
  if (sec < 60)   return `${sign}${(deltaMs / 1000).toFixed(1)}s`;
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  const prefix = deltaMs < 0 ? "-" : "+";
  return `${prefix}${m}m ${s}s`;
}
