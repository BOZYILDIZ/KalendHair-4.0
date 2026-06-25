import * as Sentry from "@sentry/nextjs";

// Initialisation uniquement si NEXT_PUBLIC_SENTRY_DSN est fourni.
// Sans DSN, Sentry est une no-op silencieuse — l'application reste fonctionnelle.
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    debug: false,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.05,
  });
}
