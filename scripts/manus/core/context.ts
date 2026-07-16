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
import { secretRedactionEngine } from "./redaction";

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

  const owner = getOwnerCredentials();
  const admin = getAdminCredentials();

  // ── Enregistrement dans le moteur de redaction (v2.4) ────────────────────
  // Dès que ces valeurs existent en mémoire, elles sont enregistrées comme
  // secrets — toute occurrence future dans un texte/objet écrit sur disque
  // (rawOutput, dashboard, événements) sera automatiquement masquée.
  // Lecture directe de process.env pour MANUS_API_KEY : getManusApiKey()
  // lève une exception si absente, ce qui casserait le dry-run sans clé.
  secretRedactionEngine.registerSecret("MANUS_API_KEY", process.env["MANUS_API_KEY"]);
  secretRedactionEngine.registerSecret("VERCEL_BYPASS_TOKEN", bypassToken);
  secretRedactionEngine.registerSecret("QA_OWNER_PASSWORD", owner?.password);
  secretRedactionEngine.registerSecret("QA_ADMIN_PASSWORD", admin?.password);

  return {
    environment,
    baseUrl,
    vercelBypassUrl,
    manusMode,
    nativeVercelIntegration,
    credentials: {
      owner,
      admin,
    },
  };
}
