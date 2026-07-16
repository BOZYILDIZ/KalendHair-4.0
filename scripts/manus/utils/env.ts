// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Chargement des variables d'environnement
// ─────────────────────────────────────────────────────────────────────────────

import { config } from "dotenv";
import { resolve } from "path";
import type { ManusEnvironment, ManusMode } from "../core/types";

// ─── Chargement ───────────────────────────────────────────────────────────────

/** Charge .env.local depuis la racine du projet. Idempotent. */
export function loadEnv(): void {
  config({ path: resolve(process.cwd(), ".env.local") });
}

// ─── Accesseurs ───────────────────────────────────────────────────────────────

/**
 * Retourne la clé API Manus depuis process.env.
 * Lance une erreur si absente — jamais de valeur par défaut.
 * ⛔ Ne jamais logguer cette valeur.
 */
export function getManusApiKey(): string {
  const key = process.env["MANUS_API_KEY"];
  if (!key) {
    throw new Error(
      "MANUS_API_KEY est absent. Ajouter la clé dans .env.local ou dans les secrets CI."
    );
  }
  return key;
}

/** Retourne l'URL de base de l'API Manus (défaut : https://api.manus.ai). */
export function getManusApiUrl(): string {
  return process.env["MANUS_API_URL"] ?? "https://api.manus.ai";
}

/**
 * Retourne l'URL de l'application à tester.
 * - LOCAL      : http://localhost:3000
 * - CI/STAGING : depuis BASE_URL
 * - PRODUCTION : depuis BASE_URL ou NEXT_PUBLIC_SITE_URL
 */
export function getBaseUrl(env: ManusEnvironment): string {
  const explicit = process.env["BASE_URL"];
  if (explicit) return explicit.replace(/\/$/, "");

  if (env === "local") return "http://localhost:3000";
  if (env === "production") {
    const prod = process.env["NEXT_PUBLIC_SITE_URL"];
    if (prod) return prod.replace(/\/$/, "");
  }

  throw new Error(
    `BASE_URL est requis pour l'environnement "${env}". ` +
    "Définir la variable dans .env.local ou en préfixe de commande."
  );
}

/** Détermine l'environnement actuel depuis MANUS_ENV (défaut : local). */
export function getManusEnv(): ManusEnvironment {
  const e = process.env["MANUS_ENV"] ?? "local";
  const valid: ManusEnvironment[] = ["local", "ci", "staging", "production"];
  if (!(valid as string[]).includes(e)) {
    throw new Error(
      `MANUS_ENV invalide : "${e}". Valeurs acceptées : ${valid.join(", ")}`
    );
  }
  return e as ManusEnvironment;
}

/** Retourne les credentials QA pour le rôle owner (optionnels). */
export function getOwnerCredentials(): { email: string; password: string } | undefined {
  const email    = process.env["QA_OWNER_EMAIL"];
  const password = process.env["QA_OWNER_PASSWORD"];
  if (!email || !password) return undefined;
  return { email, password };
}

/** Retourne les credentials QA pour le rôle admin (optionnels). */
export function getAdminCredentials(): { email: string; password: string } | undefined {
  const email    = process.env["QA_ADMIN_EMAIL"];
  const password = process.env["QA_ADMIN_PASSWORD"];
  if (!email || !password) return undefined;
  return { email, password };
}

/**
 * Retourne le token _vercel_share pour bypasser Vercel Deployment Protection.
 * Undefined si absent — Manus fonctionnera sans bypass (peut timeout sur SSO).
 * ⛔ Ne jamais logguer cette valeur.
 */
export function getVercelProtectionBypassToken(): string | undefined {
  return process.env["VERCEL_PROTECTION_BYPASS"] || undefined;
}

/**
 * Retourne le mode d'exécution Manus (défaut : QA_EXECUTOR).
 * QA_EXECUTOR : déterministe, aucune exploration.
 * QA_AGENT    : exploration autorisée (futur).
 */
export function getManusMode(): ManusMode {
  const mode = process.env["MANUS_MODE"] ?? "QA_EXECUTOR";
  if (mode !== "QA_EXECUTOR" && mode !== "QA_AGENT") {
    throw new Error(
      `MANUS_MODE invalide : "${mode}". Valeurs acceptées : QA_EXECUTOR, QA_AGENT`
    );
  }
  return mode as ManusMode;
}

/**
 * Retourne true si Manus dispose d'une intégration Vercel native (OAuth).
 * Quand true : le bypass _vercel_share est désactivé — inutile et coûteux.
 * Configurer via MANUS_NATIVE_VERCEL_INTEGRATION=true dans .env.local.
 */
export function hasNativeVercelIntegration(): boolean {
  return process.env["MANUS_NATIVE_VERCEL_INTEGRATION"] === "true";
}
