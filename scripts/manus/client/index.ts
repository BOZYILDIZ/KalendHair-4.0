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

interface ManusDetailResponse {
  status?:    string;
  output?:    string;
  result?:    string;
  summary?:   string;
  error?:     string;
  artifacts?: Array<{ type?: string; name?: string; url?: string }>;
}

export interface ManusTaskOutput {
  taskId:    string;
  status:    "completed" | "failed" | "timeout";
  rawOutput: string;
  error?:    string;
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

const POLL_INTERVAL_MS = 5_000;
const TERMINAL_STATUSES = new Set(["completed", "failed", "error", "cancelled"]);

/**
 * Crée une tâche Manus et attend son résultat via polling.
 * @param prompt           Instruction complète pour l'agent Manus.
 * @param timeoutSeconds   Timeout max (défaut 120s).
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

  // ── 2. Polling ────────────────────────────────────────────────────────────
  const maxMs      = timeoutSeconds * 1000;
  const startedAt  = Date.now();

  while (Date.now() - startedAt < maxMs) {
    await sleep(POLL_INTERVAL_MS);

    const pollRes = await fetch(`${apiUrl}/v2/task.detail?task_id=${taskId}`, {
      headers: hdrs,
    });

    if (!pollRes.ok) {
      throw new Error(`Manus /v2/task.detail → HTTP ${pollRes.status}`);
    }

    const detail = (await pollRes.json()) as ManusDetailResponse;
    const status = (detail.status ?? "").toLowerCase();

    process.stdout.write(".");

    if (!TERMINAL_STATUSES.has(status)) continue;

    process.stdout.write("\n");

    const rawOutput = detail.output ?? detail.result ?? detail.summary ?? "";
    return {
      taskId,
      status: status === "completed" ? "completed" : "failed",
      rawOutput,
      error:  detail.error,
    };
  }

  process.stdout.write("\n");
  return {
    taskId,
    status:    "timeout",
    rawOutput: "",
    error:     `Timeout after ${timeoutSeconds}s`,
  };
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}
