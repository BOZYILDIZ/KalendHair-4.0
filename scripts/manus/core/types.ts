// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA Framework — Types partagés
// ─────────────────────────────────────────────────────────────────────────────

// ─── Environnements ───────────────────────────────────────────────────────────

export type ManusEnvironment = "local" | "ci" | "staging" | "production";

// ─── Modes d'exécution ────────────────────────────────────────────────────────

/** QA_EXECUTOR : exécution déterministe, aucune exploration. QA_AGENT : exploration autorisée (futur). */
export type ManusMode = "QA_EXECUTOR" | "QA_AGENT";

/** Rôle de credentials requis par un scénario. */
export type RequiredCredential = "owner" | "admin" | "manager" | "employee";

// ─── Viewports ────────────────────────────────────────────────────────────────

export type Viewport = {
  label:  string;
  width:  number;
  height: number;
};

export const VIEWPORTS = {
  desktop: { label: "Desktop",  width: 1920, height: 1080 },
  laptop:  { label: "Laptop",   width: 1440, height: 900  },
  tablet:  { label: "Tablet",   width: 768,  height: 1024 },
  mobile:  { label: "Mobile",   width: 390,  height: 844  },
} satisfies Record<string, Viewport>;

export type ViewportKey = keyof typeof VIEWPORTS;

// ─── Assertions ───────────────────────────────────────────────────────────────

export type AssertionInstruction = {
  name:        string;
  instruction: string;
};

export type AssertionResult = {
  name:      string;
  passed:    boolean;
  message:   string;
  expected?: string;
  actual?:   string;
};

// ─── Artefacts ────────────────────────────────────────────────────────────────

export type ScreenshotRef = {
  label: string;
  url?:  string;
};

export type ArtifactRef = {
  type: "screenshot" | "log" | "video" | "json";
  name: string;
  url?: string;
};

// ─── Validation captures d'écran ─────────────────────────────────────────────

export type ScreenshotValidationResult = {
  label:   string;
  found:   boolean;  // URL non-nulle et non-vide retournée par Manus
  valid:   boolean;  // URL est une URL valide (commence par http)
  url?:    string;
  error?:  string;
};

// ─── Scénarios ────────────────────────────────────────────────────────────────

export type ScenarioResult = {
  name:          string;
  description:   string;
  scenarioId?:   string;  // SC-001 … SC-007 — identifiant stable
  status:        "passed" | "failed" | "error" | "timeout";
  durationMs:    number;
  taskId:        string;
  taskUrl?:      string;   // URL directe vers le task Manus (review manuelle)
  viewport:      Viewport;
  urlsVisited:   string[];
  assertions:    AssertionResult[];
  screenshots:   ScreenshotRef[];
  consoleErrors: string[];
  networkErrors: string[];
  artifacts:     ArtifactRef[];
  rawOutput?:    string;
  error?:        string;
  startedAt:     string;
  completedAt:   string;
  // ── Métriques d'exécution ──────────────────────────────────────────────────
  pollCount?:          number;  // nombre de polls effectués
  creditsConsumed?:    number;  // crédits Manus consommés
  networkDurationMs?:  number;  // durée de création du task (POST)
  pollingDurationMs?:  number;  // durée totale de polling
  parseDurationMs?:    number;  // durée de parseManusResponse
  // ── v2.1 ──────────────────────────────────────────────────────────────────
  promptHash?:          string;   // SHA-256 du prompt final envoyé à Manus
  screenshotValidation?: ScreenshotValidationResult[];
  capturesAttendues?:   number;   // assertions screenshot déclarées
  capturesProduites?:   number;   // screenshots retournés avec URL valide
  capturesInvalides?:   number;   // screenshots manquants ou URL invalide
  estimatedCostUsd?:    number;   // coût estimé en USD
  dryRun?:              boolean;  // true si mode --dry-run
};

// ─── Run complet ──────────────────────────────────────────────────────────────

export type TestRunResult = {
  runId:           string;
  environment:     ManusEnvironment;
  baseUrl:         string;
  startedAt:       string;
  completedAt:     string;
  durationMs:      number;
  totalScenarios:  number;
  passedScenarios: number;
  failedScenarios: number;
  scenarios:       ScenarioResult[];
  // ── v2.1 ──────────────────────────────────────────────────────────────────
  totalCreditsConsumed?: number;
  totalEstimatedCostUsd?: number;
  dryRun?: boolean;
};

// ─── Contexte ─────────────────────────────────────────────────────────────────

export type Credentials = {
  email:    string;
  password: string;
};

export type TestContext = {
  environment:      ManusEnvironment;
  baseUrl:          string;
  vercelBypassUrl?: string;  // URL bypass SSO — activée uniquement si !nativeVercelIntegration
  manusMode:        ManusMode;
  nativeVercelIntegration: boolean;  // true = MANUS_NATIVE_VERCEL_INTEGRATION=true → bypass désactivé
  credentials: {
    owner?:    Credentials;
    manager?:  Credentials;
    employee?: Credentials;
    admin?:    Credentials;
  };
};

// ─── Scénario (définition) ────────────────────────────────────────────────────

export type ScenarioRunSpec = {
  prompt:         string;
  assertionNames: string[];
  timeoutSeconds: number;
  viewport:       Viewport;
};

export type ScenarioDefinition = {
  scenarioId:           string;              // SC-001 … SC-007 — identifiant stable et immuable
  name:                 string;
  description:          string;
  tags:                 string[];
  requiresCredentials?: RequiredCredential;  // arrêt anticipé si credentials absents
  mode?:                ManusMode;           // défaut: QA_EXECUTOR
  run:                  (ctx: TestContext) => ScenarioRunSpec;
};

// ─── QA Score ─────────────────────────────────────────────────────────────────

export type QAScoreBreakdown = {
  assertions:    number;  // 0–30
  console:       number;  // 0–20
  network:       number;  // 0–20
  responsive:    number;  // 0–10
  accessibility: number;  // 0–10
  screenshots:   number;  // 0–5
  performance:   number;  // 0–5
};

export type QAScore = {
  total:           number;
  verdict:         "READY_FOR_MERGE" | "BLOCK_MERGE";
  threshold:       number;
  breakdown:       QAScoreBreakdown;
  qaInfraBlocked?: boolean;
};

// ─── Metadata ────────────────────────────────────────────────────────────────

export type RunMetadata = {
  runId:          string;
  commitSha:      string;
  branch:         string;
  date:           string;
  environment:    ManusEnvironment;
  baseUrl:        string;
  browser:        string;
  manusVersion:   string;
  durationMs:     number;
  totalScenarios: number;
  // ── v2.1 ──────────────────────────────────────────────────────────────────
  frameworkVersion: string;  // "2.1.0"
  schemaVersion:    string;  // "2"
  promptVersion:    string;  // "qa-executor-v2"
  dryRun?:          boolean;
};

// ─── Qualité du framework ─────────────────────────────────────────────────────

export type FrameworkQuality = {
  promptVersion:        boolean;
  frameworkVersion:     boolean;
  scenarioVersion:      boolean;
  promptHash:           boolean;
  dryRunCompatible:     boolean;
  screenshotValidation: boolean;
  credentialValidation: boolean;
  qaExecutor:           boolean;
  pollingStrategy:      string;
  nativeVercel:         boolean;
};

// ─── Comparaison ─────────────────────────────────────────────────────────────

export type RunComparison = {
  previousRunId:      string | null;
  consoleErrorsDelta: number;
  networkErrorsDelta: number;
  assertionPassDelta: number;
  scoreDelta:         number;
  durationDelta:      number;
  trend:              "improved" | "degraded" | "stable" | "no_previous";
};

// ─── Analysis Engine ──────────────────────────────────────────────────────────

export type SeverityLevel = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type QualityGateConsequence = "BLOCK_MERGE" | "WARNING";

export type QualityGate = {
  name:        string;
  condition:   string;
  passed:      boolean;
  value:       number | string;
  threshold:   number | string;
  consequence: QualityGateConsequence;
};

export type Regression = {
  type:              "console_error" | "network_error" | "assertion_failure" | "performance" | "score_drop";
  severity:          SeverityLevel;
  title:             string;
  description:       string;
  affectedScenario?: string;
  affectedPage?:     string;
  delta?:            number;
  isNew:             boolean;
  impact:            "faible" | "modéré" | "élevé";
};

export type InsightCategory = "performance" | "responsive" | "accessibility" | "stability" | "trend" | "coverage";

export type Insight = {
  category: InsightCategory;
  message:  string;
  positive: boolean;
};

export type RecommendationPriority = "HAUTE" | "MOYENNE" | "FAIBLE";

export type Recommendation = {
  priority:       RecommendationPriority;
  title:          string;
  description:    string;
  relatedIssues?: string[];
};

export type HistoryEntry = {
  runId:           string;
  date:            string;
  score:           number;
  verdict:         "READY_FOR_MERGE" | "BLOCK_MERGE";
  passedScenarios: number;
  failedScenarios: number;
  totalScenarios:  number;
  consoleErrors:   number;
  networkErrors:   number;
  durationMs:      number;
};

export type HistoryStats = {
  totalRuns:    number;
  averageScore: number;
  bestScore:    number;
  worstScore:   number;
  avgDurationMs: number;
  trend:        "improving" | "stable" | "degrading" | "insufficient_data";
  trendLabel:   string;
};

export type AnalysisRunStats = {
  totalAssertions:  number;
  passedAssertions: number;
  failedAssertions: number;
  consoleErrors:    number;
  networkErrors:    number;
  screenshots:      number;
};

export type AnalysisResult = {
  qualityGates:     QualityGate[];
  verdictFromGates: "READY_FOR_MERGE" | "BLOCK_MERGE";
  insights:         Insight[];
  regressions:      Regression[];
  recommendations:  Recommendation[];
  stats:            AnalysisRunStats;
  historyStats:     HistoryStats | null;
};

export type Dashboard = {
  lastUpdated:   string;
  latestRunId:   string;
  latestScore:   number;
  latestVerdict: "READY_FOR_MERGE" | "BLOCK_MERGE";
  history:       HistoryEntry[];
  stats:         HistoryStats | null;
};

// ─── Résumé de run ────────────────────────────────────────────────────────────

export type RunSummary = {
  run:        TestRunResult;
  score:      QAScore;
  metadata:   RunMetadata;
  comparison: RunComparison | null;
  analysis?:  AnalysisResult;
};

// ─── Reporter ─────────────────────────────────────────────────────────────────

export interface Reporter {
  onRunStart(meta: {
    runId:       string;
    environment: ManusEnvironment;
    baseUrl:     string;
    total:       number;
  }): void;
  onScenarioEnd(result: ScenarioResult): void;
  onRunEnd(summary: RunSummary): Promise<void>;
}
