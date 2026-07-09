/**
 * KalendHair — Client Manus QA (API v2)
 *
 * Auth  : header "x-manus-api-key: $MANUS_API_KEY"
 * ⛔    : Ne jamais utiliser "Authorization: Bearer" — invalide pour Manus.
 * ⛔    : Ne jamais afficher process.env.MANUS_API_KEY dans les logs.
 *
 * Stockage de la clé :
 *   - Développement : .env.local  (ignoré par git via .env* rule)
 *   - CI            : GitHub Secret  MANUS_API_KEY
 *   - Vercel        : Environment Variable  MANUS_API_KEY
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ManusTaskInput {
  /** Instruction principale pour l'agent Manus */
  prompt: string;
  /** URL de base à tester (ex. https://staging.kalendhair.fr) */
  baseUrl: string;
  /** Timeout maximum en secondes (défaut : 120) */
  timeoutSeconds?: number;
}

export interface ManusTaskResult {
  taskId:    string;
  status:    "completed" | "failed" | "timeout";
  summary:   string;
  artifacts: ManusArtifact[];
  error?:    string;
}

export interface ManusArtifact {
  type:     "screenshot" | "log" | "video";
  name:     string;
  url?:     string;
  content?: string;
}

// ─── Config ──────────────────────────────────────────────────────────────────

function getConfig(): { apiKey: string; apiUrl: string } {
  const apiKey = process.env.MANUS_API_KEY;
  const apiUrl = process.env.MANUS_API_URL ?? "https://api.manus.ai";

  if (!apiKey) {
    throw new Error(
      "MANUS_API_KEY est absent. " +
      "Ajouter la clé dans .env.local ou dans les secrets CI."
    );
  }

  return { apiKey, apiUrl };
}

/** Headers communs à toutes les requêtes Manus v2. */
function manusHeaders(apiKey: string): Record<string, string> {
  return {
    "x-manus-api-key": apiKey,
    "Content-Type":    "application/json",
  };
}

// ─── Ping ────────────────────────────────────────────────────────────────────

/**
 * Envoie une tâche minimale pour valider l'authentification.
 * Retourne { ok, status, taskId?, error }.
 */
export async function pingManus(): Promise<{
  ok:      boolean;
  status:  number;
  taskId?: string;
  error?:  string;
}> {
  const { apiKey, apiUrl } = getConfig();

  const res = await fetch(`${apiUrl}/v2/task.create`, {
    method:  "POST",
    headers: manusHeaders(apiKey),
    body:    JSON.stringify({
      message: {
        content: "Ping depuis KalendHair QA integration. Réponds uniquement OK.",
      },
    }),
  });

  const body = await res.text();

  if (!res.ok) {
    return { ok: false, status: res.status, error: body };
  }

  let parsed: Record<string, unknown> = {};
  try { parsed = JSON.parse(body) as Record<string, unknown>; } catch { /* noop */ }

  const taskId =
    typeof parsed["task_id"] === "string"  ? parsed["task_id"]  :
    typeof parsed["id"]      === "string"  ? parsed["id"]       :
    undefined;

  return { ok: true, status: res.status, taskId };
}

// ─── Client principal ─────────────────────────────────────────────────────────

/**
 * Lance une tâche Manus v2 et attend le résultat via polling.
 */
export async function runManusTask(input: ManusTaskInput): Promise<ManusTaskResult> {
  const { apiKey, apiUrl } = getConfig();
  const headers = manusHeaders(apiKey);

  // ── 1. Créer la tâche ──────────────────────────────────────────────────────
  const createRes = await fetch(`${apiUrl}/v2/task.create`, {
    method:  "POST",
    headers,
    body:    JSON.stringify({
      message: { content: input.prompt },
      timeout: input.timeoutSeconds ?? 120,
    }),
  });

  if (!createRes.ok) {
    const body = await createRes.text();
    throw new Error(`Manus — création tâche échouée (${createRes.status}): ${body}`);
  }

  const created = (await createRes.json()) as Record<string, unknown>;
  const taskId  =
    typeof created["task_id"] === "string" ? created["task_id"] :
    typeof created["id"]      === "string" ? created["id"]      : "";

  if (!taskId) throw new Error("Manus — task_id absent dans la réponse de création.");
  console.log(`[Manus] Tâche créée : ${taskId}`);

  // ── 2. Polling ─────────────────────────────────────────────────────────────
  const maxAttempts    = 60;   // 60 × 5s = 5 minutes max
  const pollIntervalMs = 5_000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await sleep(pollIntervalMs);

    const pollRes = await fetch(`${apiUrl}/v2/task.detail?task_id=${taskId}`, {
      headers,
    });

    if (!pollRes.ok) {
      throw new Error(`Manus — polling échoué (${pollRes.status})`);
    }

    const result = (await pollRes.json()) as {
      status?:    string;
      summary?:   string;
      artifacts?: ManusArtifact[];
      error?:     string;
    };

    const s = result.status ?? "";
    if (s === "running" || s === "pending" || s === "queued") {
      process.stdout.write(".");
      continue;
    }

    console.log(`\n[Manus] Tâche terminée — statut : ${s}`);

    return {
      taskId,
      status:    (s === "completed" || s === "failed") ? s : "failed",
      summary:   result.summary   ?? "",
      artifacts: result.artifacts ?? [],
      error:     result.error,
    };
  }

  return {
    taskId,
    status:    "timeout",
    summary:   "Tâche expirée après 5 minutes de polling.",
    artifacts: [],
  };
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
