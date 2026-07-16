// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — ManusProvider (implémentation AgentProvider)
//
// Wrapper autour du client Manus v2 existant.
// ─────────────────────────────────────────────────────────────────────────────

import { createAndPollTask, pingManus } from "./index";
import { registerProvider }             from "./provider";
import type { AgentProvider, AgentTaskOutput } from "./provider";

export class ManusProvider implements AgentProvider {
  readonly name = "manus";

  async createAndRunTask(
    prompt:          string,
    timeoutSeconds = 120,
  ): Promise<AgentTaskOutput> {
    const result = await createAndPollTask(prompt, timeoutSeconds);
    return {
      taskId:          result.taskId,
      taskUrl:         result.taskUrl,
      status:          result.status,
      rawOutput:       result.rawOutput,
      lastStatus:      result.lastManusStatus,
      pollCount:       result.pollCount,
      creditsConsumed: result.creditsConsumed,
      error:           result.error,
    };
  }

  async ping(): Promise<{ ok: boolean; error?: string }> {
    const result = await pingManus();
    return { ok: result.ok, error: result.error };
  }
}

// Auto-enregistrement
export const manusProvider = new ManusProvider();
registerProvider(manusProvider);
