/**
 * Rate limiter en mémoire — best-effort sur Vercel serverless.
 *
 * Limitation connue : chaque instance de fonction a son propre Map.
 * Sur Vercel Hobby sans Redis/KV, cette protection reste efficace contre
 * les attaques ciblant une seule instance (les bots rapides) mais ne
 * protège pas contre les attaques distribuées. Acceptable pour MVP.
 * Migrer vers Vercel KV ou Redis pour une protection cross-instance.
 */

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 10; // 10 tentatives par fenêtre

type Entry = { count: number; resetAt: number };

// Map globale par process — persiste le temps que la fonction est chaude
const store = new Map<string, Entry>();

export type RateLimitResult =
  | { limited: false; remaining: number }
  | { limited: true; retryAfterSeconds: number };

export function checkRateLimit(
  endpoint: string,
  ip: string,
  max = MAX_ATTEMPTS,
  windowMs = WINDOW_MS,
): RateLimitResult {
  const key = `${endpoint}:${ip}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, remaining: max - 1 };
  }

  if (entry.count >= max) {
    return {
      limited: true,
      retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count++;
  return { limited: false, remaining: max - entry.count };
}
