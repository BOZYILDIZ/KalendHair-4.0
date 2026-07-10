// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Client API v2
//
// Auth  : header "x-manus-api-key: $MANUS_API_KEY"
// ⛔    : Ne jamais utiliser "Authorization: Bearer" — invalide pour Manus.
// ⛔    : Ne jamais afficher MANUS_API_KEY dans les logs.
// ─────────────────────────────────────────────────────────────────────────────

import { getManusApiKey, getManusApiUrl } from "../utils/env";

// ─── Types internes ───────────────────────────────────────────────────────────

interface ManusCreateResponse {
  task_id?: string;
  id?:      string;
}

interface ManusTaskDetail {
  status?:        string;  // "stopped" = completed, "failed" | "error" | "cancelled" = failure
  output?:        string;
  result?:        string;
  summary?:       string;
  error?:         string;
  artifacts?:     Array<{ type?: string; name?: string; url?: string }>;
  title?:         string;
  credit_usage?:  number;  // crédits Manus consommés
  task_url?:      string;  // URL directe vers le task dans l'UI Manus
}

// Vercel v2 API wraps the response: { ok: true, task: { status, output, ... } }
interface ManusDetailResponse {
  ok?:   boolean;
  task?: ManusTaskDetail;
  // legacy flat shape (kept for compatibility)
  status?:       string;
  output?:       string;
  result?:       string;
  summary?:      string;
  error?:        string;
  artifacts?:    Array<{ type?: string; name?: string; url?: string }>;
  credit_usage?: number;
  task_url?:     string;
}

export interface ManusTaskOutput {
  taskId:           string;
  taskUrl:          string;   // URL directe vers le task dans l'UI Manus (review manuelle)
  status:           "completed" | "failed" | "timeout";
  rawOutput:        string;
  lastManusStatus?: string;
  pollCount:        number;   // nombre de polls effectués
  creditsConsumed?: number;   // crédits Manus consommés
  error?:           string;
}

// ─── Headers ─────────────────────────────────────────────────────────────────

function headers(): Record<string, string> {
  return {
    "x-manus-api-key": getManusApiKey(),
    "Content-Type":    "application/json",
  };
}

// ─── Ping ─────────────────────────────────────────────────────────────────────

export async function pingManus(): Promise<{
  ok:      boolean;
  status:  number;
  taskId?: string;
  error?:  string;
}> {
  const apiUrl = getManusApiUrl();

  const res = await fetch(`${apiUrl}/v2/task.create`, {
    method:  "POST",
    headers: headers(),
    body:    JSON.stringify({
      message: {
        content: "Ping depuis KalendHair QA integration. Réponds uniquement OK.",
      },
    }),
  });

  const body = await res.text();
  if (!res.ok) return { ok: false, status: res.status, error: body };

  let parsed: ManusCreateResponse = {};
  try { parsed = JSON.parse(body) as ManusCreateResponse; } catch { /* noop */ }

  const taskId = parsed.task_id ?? parsed.id;
  return { ok: true, status: res.status, taskId };
}

// ─── Création + polling ───────────────────────────────────────────────────────

// Backoff exponentiel : 2s, 2s, 5s, 10s, 15s, puis 15s pour la suite.
const POLL_BACKOFF_MS = [2_000, 2_000, 5_000, 10_000, 15_000];
const POLL_MAX_MS     = 15_000;

// "stopped" = Manus v2 successful completion. "completed" kept for forward compat.
const TERMINAL_STATUSES = new Set(["stopped", "completed", "failed", "error", "cancelled"]);

/**
 * Crée une tâche Manus et attend son résultat via polling avec backoff exponentiel.
 * @param prompt           Instruction complète pour l'agent Manus.
 * @param timeoutSeconds   Timeout max (défaut 120s). Doit être un garde-fou, pas une attente normale.
 */
export async function createAndPollTask(
  prompt:          string,
  timeoutSeconds = 120,
): Promise<ManusTaskOutput> {
  const apiUrl  = getManusApiUrl();
  const hdrs    = headers();

  // ── 1. Créer ──────────────────────────────────────────────────────────────
  const createRes = await fetch(`${apiUrl}/v2/task.create`, {
    method:  "POST",
    headers: hdrs,
    body:    JSON.stringify({ message: { content: prompt } }),
  });

  if (!createRes.ok) {
    const body = await createRes.text();
    throw new Error(`Manus /v2/task.create → HTTP ${createRes.status}: ${body}`);
  }

  const created = (await createRes.json()) as ManusCreateResponse;
  const taskId  = created.task_id ?? created.id ?? "";
  if (!taskId) throw new Error("Manus — task_id absent dans la réponse de création.");

  // ── 2. Polling avec backoff ───────────────────────────────────────────────
  const maxMs     = timeoutSeconds * 1000;
  const startedAt = Date.now();

  let lastDetail:      ManusDetailResponse | null = null;
  let lastManusStatus  = "";
  let lastCredits:     number | undefined;
  let pollCount        = 0;

  while (Date.now() - startedAt < maxMs) {
    const intervalMs = POLL_BACKOFF_MS[Math.min(pollCount, POLL_BACKOFF_MS.length - 1)] ?? POLL_MAX_MS;
    await sleep(intervalMs);

    const pollRes = await fetch(`${apiUrl}/v2/task.detail?task_id=${taskId}`, {
      headers: hdrs,
    });

    if (!pollRes.ok) {
      throw new Error(`Manus /v2/task.detail → HTTP ${pollRes.status}`);
    }

    pollCount++;
    const detail  = (await pollRes.json()) as ManusDetailResponse;
    const inner   = detail.task ?? detail;
    const status  = (inner.status ?? "").toLowerCase();
    const credits = inner.credit_usage;

    lastDetail      = detail;
    lastManusStatus = status;
    if (credits !== undefined) lastCredits = credits;

    process.stdout.write(".");

    if (!TERMINAL_STATUSES.has(status)) continue;

    process.stdout.write("\n");

    // Résoudre la taskUrl depuis l'API ou construire par défaut
    const taskUrl = inner.task_url ?? `https://manus.im/app/${taskId}`;

    const rawOutput = inner.output ?? inner.result ?? inner.summary ?? "";
    const finalStatus = (status === "completed" || status === "stopped") ? "completed" : "failed";
    return {
      taskId,
      taskUrl,
      status:          finalStatus,
      rawOutput,
      lastManusStatus: status,
      pollCount,
      creditsConsumed: credits ?? lastCredits,
      error:           inner.error,
    };
  }

  process.stdout.write("\n");
  const lastInner  = lastDetail?.task ?? lastDetail ?? null;
  const lastOutput = lastInner
    ? (lastInner.output ?? lastInner.result ?? lastInner.summary ?? "")
    : "";
  const taskUrl = lastInner?.task_url ?? `https://manus.im/app/${taskId}`;
  return {
    taskId,
    taskUrl,
    status:          "timeout",
    rawOutput:       lastOutput,
    lastManusStatus: lastManusStatus || "unknown (no poll completed)",
    pollCount,
    creditsConsumed: lastCredits,
    error:           `Timeout after ${timeoutSeconds}s — last Manus status: ${lastManusStatus || "unknown"}`,
  };
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}
