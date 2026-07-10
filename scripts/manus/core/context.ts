// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Contexte de test
// ─────────────────────────────────────────────────────────────────────────────

import type { ManusEnvironment, TestContext } from "./types";
import {
  loadEnv,
  getManusEnv,
  getBaseUrl,
  getOwnerCredentials,
  getAdminCredentials,
  getVercelProtectionBypassToken,
} from "../utils/env";

// ─── Builder ──────────────────────────────────────────────────────────────────

/**
 * Construit le TestContext depuis les variables d'environnement.
 * Doit être appelé au démarrage de chaque run.
 */
export function buildTestContext(envOverride?: ManusEnvironment): TestContext {
  loadEnv();

  const environment        = envOverride ?? getManusEnv();
  const baseUrl            = getBaseUrl(environment);
  const bypassToken        = getVercelProtectionBypassToken();
  const vercelBypassUrl    = bypassToken
    ? `${baseUrl}?_vercel_share=${bypassToken}`
    : undefined;

  return {
    environment,
    baseUrl,
    vercelBypassUrl,
    credentials: {
      owner:   getOwnerCredentials(),
      admin:   getAdminCredentials(),
    },
  };
}
