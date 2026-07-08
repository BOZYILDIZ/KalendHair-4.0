/**
 * KalendHair — Client Manus QA
 *
 * Ce module encapsule les appels à l'API Manus pour les tests navigateur
 * automatisés. Il ne doit jamais exposer la clé API en clair.
 *
 * Utilisation :
 *   MANUS_API_KEY=sk-... tsx scripts/manus/run-qa.ts
 *
 * Stockage de la clé :
 *   - Développement : .env.local (ignoré par git)
 *   - CI            : GitHub Secret MANUS_API_KEY
 *   - Vercel        : Environment Variable MANUS_API_KEY
 *
 * ⚠️ Ne jamais afficher process.env.MANUS_API_KEY dans les logs.
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
  const apiUrl = process.env.MANUS_API_URL ?? "https://api.manus.im";

  if (!apiKey) {
    throw new Error(
      "MANUS_API_KEY est absent. " +
      "Ajouter la clé dans .env.local ou dans les secrets CI."
    );
  }

  return { apiKey, apiUrl };
}

// ─── Client ──────────────────────────────────────────────────────────────────

/**
 * Lance une tâche Manus et attend le résultat.
 *
 * NOTE : Les endpoints exacts (/tasks, /tasks/:id) seront confirmés
 * lors de la lecture de la documentation publique Manus.
 * La structure ci-dessous suit les conventions REST standard des agents AI.
 */
export async function runManusTask(input: ManusTaskInput): Promise<ManusTaskResult> {
  const { apiKey, apiUrl } = getConfig();

  // ── 1. Créer la tâche ──────────────────────────────────────────────────────
  const createRes = await fetch(`${apiUrl}/tasks`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify({
      prompt:  input.prompt,
      timeout: input.timeoutSeconds ?? 120,
    }),
  });

  if (!createRes.ok) {
    const body = await createRes.text();
    throw new Error(`Manus API — création tâche échouée (${createRes.status}): ${body}`);
  }

  const task = (await createRes.json()) as { id: string };
  console.log(`[Manus] Tâche créée : ${task.id}`);

  // ── 2. Polling du résultat ─────────────────────────────────────────────────
  const maxAttempts    = 60;  // 60 × 5s = 5 minutes max
  const pollIntervalMs = 5_000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await sleep(pollIntervalMs);

    const pollRes = await fetch(`${apiUrl}/tasks/${task.id}`, {
      headers: { "Authorization": `Bearer ${apiKey}` },
    });

    if (!pollRes.ok) {
      throw new Error(`Manus API — polling échoué (${pollRes.status})`);
    }

    const result = (await pollRes.json()) as {
      status:    string;
      summary?:  string;
      artifacts?: ManusArtifact[];
      error?:    string;
    };

    if (result.status === "running" || result.status === "pending") {
      process.stdout.write(".");
      continue;
    }

    console.log(`\n[Manus] Tâche terminée — statut : ${result.status}`);

    return {
      taskId:    task.id,
      status:    result.status as ManusTaskResult["status"],
      summary:   result.summary ?? "",
      artifacts: result.artifacts ?? [],
      error:     result.error,
    };
  }

  return {
    taskId:    task.id,
    status:    "timeout",
    summary:   "Tâche expirée — dépasse le timeout de 5 minutes.",
    artifacts: [],
  };
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
