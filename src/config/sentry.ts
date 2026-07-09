import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { env } from "./env.js";

/**
 * Initialize Sentry as early as possible — must run before any module that
 * could throw is imported. The function no-ops when SENTRY_DSN is unset so
 * local dev (and PRs without secrets) continues to work.
 */
export const initSentry = () => {
  if (!env.SENTRY_DSN) {
    console.log("ℹ️  Sentry disabled (no DSN set)");
    return;
  }
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.SENTRY_TRACES_SAMPLE_RATE,
    profilesSampleRate: env.SENTRY_PROFILES_SAMPLE_RATE,
    integrations: [nodeProfilingIntegration()],
  });
};

export { Sentry };
