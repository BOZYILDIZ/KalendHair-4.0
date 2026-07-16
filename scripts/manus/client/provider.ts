// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — AgentProvider abstraction (v2.2)
//
// Permet de remplacer Manus par n'importe quel autre agent (Browser Use,
// OpenAI Operator, Playwright AI…) sans toucher au runner.
//
// Pour ajouter un nouveau provider :
//   1. Créer client/<name>-provider.ts
//   2. Implémenter AgentProvider
//   3. Passer le provider au ScenarioRunner
// ─────────────────────────────────────────────────────────────────────────────

// ─── Output standardisé ───────────────────────────────────────────────────────

export interface AgentTaskOutput {
  taskId:          string;
  taskUrl:         string;   // URL pour review manuelle dans l'UI du provider
  status:          "completed" | "failed" | "timeout";
  rawOutput:       string;   // réponse brute du provider (doit contenir le JSON)
  lastStatus?:     string;   // dernier statut interne du provider
  pollCount:       number;   // nombre de polls effectués
  creditsConsumed?: number;  // crédits ou tokens consommés (provider-specific)
  error?:          string;
}

// ─── Interface AgentProvider ──────────────────────────────────────────────────

export interface AgentProvider {
  /** Identifiant lisible du provider (ex: "manus", "browser-use", "operator"). */
  readonly name: string;

  /** Crée une tâche et attend son résultat. Lance une erreur si la création échoue. */
  createAndRunTask(
    prompt:          string,
    timeoutSeconds?: number,
  ): Promise<AgentTaskOutput>;

  /** Optionnel : vérifier la disponibilité du provider avant un run. */
  ping?(): Promise<{ ok: boolean; error?: string }>;
}

// ─── Registry (futur) ─────────────────────────────────────────────────────────

const _registry = new Map<string, AgentProvider>();

export function registerProvider(provider: AgentProvider): void {
  _registry.set(provider.name, provider);
}

export function getProvider(name: string): AgentProvider | undefined {
  return _registry.get(name);
}

export function listProviders(): string[] {
  return [..._registry.keys()];
}
