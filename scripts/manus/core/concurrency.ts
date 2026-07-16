// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Sémaphore de concurrence (v2.2)
//
// Limite le nombre de scénarios Manus exécutés simultanément.
// Évite les rate-limits API et la surcharge côté Manus.
// ─────────────────────────────────────────────────────────────────────────────

export class Semaphore {
  private count: number;
  private readonly queue: Array<() => void> = [];

  constructor(maxConcurrent: number) {
    if (maxConcurrent < 1) throw new Error("Semaphore: maxConcurrent doit être ≥ 1");
    this.count = maxConcurrent;
  }

  async acquire(): Promise<void> {
    if (this.count > 0) {
      this.count--;
      return;
    }
    return new Promise<void>((resolve) => this.queue.push(resolve));
  }

  release(): void {
    const next = this.queue.shift();
    if (next) {
      next();  // slot immédiatement cédé au suivant (count reste à 0)
    } else {
      this.count++;
    }
  }

  /** Enveloppe une fonction async dans le sémaphore. */
  async run<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }

  get available(): number { return this.count; }
  get pending():   number { return this.queue.length; }
}

// ─── Concurrence par défaut ───────────────────────────────────────────────────

/** Lit MANUS_MAX_CONCURRENT depuis l'env. Défaut : 2. Min : 1. Max : 8. */
export function defaultConcurrency(): number {
  const raw = process.env["MANUS_MAX_CONCURRENT"];
  if (!raw) return 2;
  const val = parseInt(raw, 10);
  if (isNaN(val) || val < 1) return 2;
  return Math.min(val, 8);  // cap à 8 pour éviter les abus
}
