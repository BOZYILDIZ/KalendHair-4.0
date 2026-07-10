// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA Framework — Types partagés
// ─────────────────────────────────────────────────────────────────────────────

// ─── Environnements ───────────────────────────────────────────────────────────

export type ManusEnvironment = "local" | "ci" | "staging" | "production";

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

// ─── Scénarios ────────────────────────────────────────────────────────────────

export type ScenarioResult = {
  name:          string;
  description:   string;
  status:        "passed" | "failed" | "error" | "timeout";
  durationMs:    number;
  taskId:        string;
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
};

// ─── Contexte ─────────────────────────────────────────────────────────────────

export type Credentials = {
  email:    string;
  password: string;
};

export type TestContext = {
  environment:      ManusEnvironment;
  baseUrl:          string;
  vercelBypassUrl?: string;  // URL à visiter en premier pour bypasser Vercel SSO
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
  name:        string;
  description: string;
  tags:        string[];
  run:         (ctx: TestContext) => ScenarioRunSpec;
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
