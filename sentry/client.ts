import * as Sentry from "@sentry/nextjs";

const integrations = [] as any[];
// Guard Replay integration; some versions don't export replayIntegration
// or it may be unavailable in this environment.
// @ts-ignore
if (typeof (Sentry as any).replayIntegration === 'function') {
  // @ts-ignore
  integrations.push((Sentry as any).replayIntegration({
    maskAllText: true,
    blockAllMedia: true,
  }));
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  replaysOnErrorSampleRate: 1.0,
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,
  // Use guarded integrations array (might be empty if replayIntegration is unavailable)
  integrations,

  environment: process.env.NODE_ENV,
});


