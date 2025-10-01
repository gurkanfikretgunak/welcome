export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry/server');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry/edge');
  }
}

export async function onRequestError() {
  // This is intentionally empty to suppress the warning
  // Actual error handling is done in sentry/server.ts
}


