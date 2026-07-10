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
  getManusMode,
  hasNativeVercelIntegration,
} from "../utils/env";

// ─── Builder ──────────────────────────────────────────────────────────────────

/**
 * Construit le TestContext depuis les variables d'environnement.
 * Doit être appelé au démarrage de chaque run.
 */
export function buildTestContext(envOverride?: ManusEnvironment): TestContext {
  loadEnv();

  const environment            = envOverride ?? getManusEnv();
  const baseUrl                = getBaseUrl(environment);
  const manusMode              = getManusMode();
  const nativeVercelIntegration = hasNativeVercelIntegration();

  // Bypass SSO : activé uniquement si token présent ET pas d'intégration native
  const bypassToken    = getVercelProtectionBypassToken();
  const vercelBypassUrl = (!nativeVercelIntegration && bypassToken)
    ? `${baseUrl}?_vercel_share=${bypassToken}`
    : undefined;

  return {
    environment,
    baseUrl,
    vercelBypassUrl,
    manusMode,
    nativeVercelIntegration,
    credentials: {
      owner:   getOwnerCredentials(),
      admin:   getAdminCredentials(),
    },
  };
}
