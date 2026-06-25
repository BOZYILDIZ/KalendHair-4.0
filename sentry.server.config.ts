import * as Sentry from "@sentry/nextjs";

// Initialisation uniquement si SENTRY_DSN est fourni.
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    debug: false,
  });
}
