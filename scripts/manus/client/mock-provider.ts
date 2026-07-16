// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — MockProvider (v2.2.1 ; configurable depuis la mission
// corrective Devil's Advocate)
//
// Preuve que ScenarioRunner ne dépend pas de l'API Manus. Aucune requête
// réseau, aucun crédit consommé. Utilisé pour valider :
//   1. L'abstraction AgentProvider (mission 3, validation v2.2.1)
//   2. Le comportement du sémaphore de concurrence sans coût Manus (mission 2)
//
// Fidélité au contrat réel (client/index.ts::createAndPollTask()) — constat de
// l'audit Devil's Advocate : la version précédente ne simulait QUE le chemin
// heureux ("completed") et l'échec applicatif ("failed"), jamais les autres
// issues pourtant prévues par l'interface AgentProvider et effectivement
// produites par le vrai client Manus :
//   - une exception levée (échec HTTP à la création, task_id absent, échec
//     HTTP de polling) — le bloc try/catch de core/runner.ts::runOne() n'était
//     donc jamais exercé par aucun test automatisé ;
//   - un statut "timeout" (jamais produit par l'ancien MockProvider) ;
//   - une réponse malformée (JSON invalide, ou JSON valide mais sans les
//     assertions attendues).
//
// `mode` couvre désormais ces cas. Le runner ne sait toujours pas — et ne
// doit jamais savoir — s'il parle à ManusProvider ou MockProvider : les deux
// implémentent strictement la même interface AgentProvider, et MockProvider
// ne modifie ni n'exporte rien qui permettrait à core/runner.ts de le
// détecter par un autre moyen que `this.provider.name`.
// ─────────────────────────────────────────────────────────────────────────────

import { registerProvider }             from "./provider";
import type { AgentProvider, AgentTaskOutput } from "./provider";

/**
 * Modes simulables. "success" et "failure" couvrent le comportement
 * historique (forceFail). Les autres modes couvrent des chemins réels du
 * vrai provider jamais exercés par les tests avant ce correctif.
 */
export type MockProviderMode =
  | "success"
  | "failure"
  | "timeout"
  | "exception"
  | "network-error"
  | "malformed"
  | "no-assertions";

export interface MockProviderOptions {
  /** Délai simulé (ms) avant de retourner le résultat — pour tester la concurrence. */
  delayMs?:   number;
  /** @deprecated Conservé pour compatibilité — équivalent à `mode: "failure"`. */
  forceFail?: boolean;
  /** Comportement à simuler. Défaut : "success". */
  mode?:      MockProviderMode;
  /** Force la valeur de creditsConsumed retournée (y compris `undefined` en omettant l'option). */
  creditsConsumed?: number;
  /** Force le nombre de polls retourné. Défaut : 1. */
  pollCount?: number;
  /** Force l'URL de tâche retournée. Défaut : "mock://task/<taskId>". */
  taskUrl?:   string;
  /** Message d'erreur personnalisé pour les modes failure/timeout/exception/network-error. */
  errorMessage?: string;
}

let mockTaskCounter = 0;

export class MockProvider implements AgentProvider {
  readonly name = "mock";
  private readonly delayMs:         number;
  private readonly mode:            MockProviderMode;
  private readonly creditsOverride: number | undefined;
  private readonly pollCountOverride: number;
  private readonly taskUrlOverride: string | undefined;
  private readonly errorMessage:    string | undefined;

  constructor(options: MockProviderOptions = {}) {
    this.delayMs           = options.delayMs ?? 0;
    this.mode               = options.forceFail ? "failure" : (options.mode ?? "success");
    this.creditsOverride    = options.creditsConsumed;
    this.pollCountOverride  = options.pollCount ?? 1;
    this.taskUrlOverride    = options.taskUrl;
    this.errorMessage       = options.errorMessage;
  }

  async createAndRunTask(prompt: string, timeoutSeconds = 120): Promise<AgentTaskOutput> {
    if (this.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    }

    const taskId  = `mock-task-${++mockTaskCounter}`;
    const taskUrl = this.taskUrlOverride ?? `mock://task/${taskId}`;
    const pollCount = this.pollCountOverride;

    switch (this.mode) {
      case "exception":
        // Exerce le bloc try/catch de core/runner.ts::runOne() — jamais
        // atteint par aucun test avant ce correctif, puisque l'ancien
        // MockProvider ne levait jamais d'exception.
        throw new Error(this.errorMessage ?? "MockProvider: exception simulée (mode=exception)");

      case "network-error":
        // Même chemin de code que "exception", message réaliste pour les
        // tests qui veulent distinguer une panne réseau d'un bug applicatif.
        throw new Error(this.errorMessage ?? "MockProvider: fetch failed, ECONNREFUSED (simulation réseau)");

      case "timeout":
        // Reproduit la forme exacte retournée par client/index.ts en cas de
        // timeout réel (voir createAndPollTask(), branche de fin de boucle).
        return {
          taskId, taskUrl,
          status:          "timeout",
          rawOutput:       "",
          lastStatus:      "unknown (no poll completed)",
          pollCount,
          creditsConsumed: this.creditsOverride,
          error:           this.errorMessage ?? `Timeout after ${timeoutSeconds}s — last Manus status: unknown (simulation)`,
        };

      case "failure":
        return {
          taskId, taskUrl,
          status:          "failed",
          rawOutput:       "",
          lastStatus:      "failed",
          pollCount,
          creditsConsumed: this.creditsOverride ?? 0,
          error:           this.errorMessage ?? "MockProvider: échec simulé (forceFail)",
        };

      case "malformed":
        // JSON invalide — exerce les stratégies 2/3 et la voie "failed" de
        // parseManusResponse(), jamais exercées par l'ancien MockProvider
        // (qui ne renvoyait toujours qu'un bloc ```json``` bien formé).
        return {
          taskId, taskUrl,
          status:          "completed",
          rawOutput:       "Ceci n'est pas du JSON — réponse malformée simulée par MockProvider.",
          lastStatus:      "completed",
          pollCount,
          creditsConsumed: this.creditsOverride ?? 0,
        };

      case "no-assertions":
        // JSON valide, format attendu, mais aucune assertion retournée —
        // distinct de "malformed" : le parsing réussit, mais le runner doit
        // détecter que toutes les assertions attendues sont "manquantes".
        return {
          taskId, taskUrl,
          status:          "completed",
          rawOutput:       JSON.stringify({ assertions: [] }),
          lastStatus:      "completed",
          pollCount,
          creditsConsumed: this.creditsOverride ?? 0,
        };

      case "success":
      default: {
        // Comportement historique : extrait le gabarit JSON déjà présent
        // dans le prompt (```json ... ```). Ancré en début/fin de ligne
        // (^...$/m) pour ignorer la phrase d'instruction "entre ```json et
        // ```" qui mentionne les fences en ligne, sans les ouvrir.
        const match = prompt.match(/^```json\n([\s\S]*?)\n```$/m);
        const rawOutput = match?.[1]?.trim() ?? JSON.stringify({ assertions: [] });
        return {
          taskId, taskUrl,
          status:          "completed",
          rawOutput,
          lastStatus:      "completed",
          pollCount,
          creditsConsumed: this.creditsOverride ?? 0,
        };
      }
    }
  }

  async ping(): Promise<{ ok: boolean; error?: string }> {
    if (this.mode === "exception" || this.mode === "network-error") {
      return { ok: false, error: this.errorMessage ?? "MockProvider: ping simulé en échec" };
    }
    return { ok: true };
  }
}

// Auto-enregistrement — voir client/provider.ts pour le constat (Devil's
// Advocate) que ce registre n'est jamais interrogé par aucun code de
// production ; conservé tel quel, non modifié par cette mission corrective.
export const mockProvider = new MockProvider();
registerProvider(mockProvider);
