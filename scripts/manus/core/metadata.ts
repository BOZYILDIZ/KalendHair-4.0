// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Collecte de metadata de run
// ─────────────────────────────────────────────────────────────────────────────

import { execSync } from "child_process";
import { FRAMEWORK_VERSION, SCHEMA_VERSION, PROMPT_VERSION } from "./version";
import type { ManusEnvironment, RunMetadata } from "./types";

// ─── Git ─────────────────────────────────────────────────────────────────────

function gitSafe(cmd: string, fallback = "unknown"): string {
  try {
    return execSync(cmd, {
      encoding: "utf-8",
      stdio:    ["pipe", "pipe", "pipe"],
    }).trim();
  } catch {
    return fallback;
  }
}

function getCommitSha(): string {
  const sha = gitSafe("git rev-parse HEAD");
  return sha !== "unknown" ? sha.slice(0, 8) : "unknown";
}

function getBranch(): string {
  return gitSafe("git rev-parse --abbrev-ref HEAD");
}

// ─── Builder ─────────────────────────────────────────────────────────────────

export function buildRunMetadata(params: {
  runId:          string;
  environment:    ManusEnvironment;
  baseUrl:        string;
  date:           string;
  durationMs:     number;
  totalScenarios: number;
}): RunMetadata {
  return {
    runId:            params.runId,
    commitSha:        getCommitSha(),
    branch:           getBranch(),
    date:             params.date,
    environment:      params.environment,
    baseUrl:          params.baseUrl,
    browser:          "Manus Agent",
    manusVersion:     "v2",
    durationMs:       params.durationMs,
    totalScenarios:   params.totalScenarios,
    frameworkVersion: FRAMEWORK_VERSION,
    schemaVersion:    SCHEMA_VERSION,
    promptVersion:    PROMPT_VERSION,
  };
}
