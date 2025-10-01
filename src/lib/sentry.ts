import * as Sentry from '@sentry/nextjs'

/**
 * Captures an exception to Sentry with additional context
 */
export function captureException(
  error: unknown,
  context?: {
    tags?: Record<string, string>
    extra?: Record<string, any>
    level?: Sentry.SeverityLevel
  }
) {
  Sentry.captureException(error, {
    level: context?.level || 'error',
    tags: context?.tags,
    extra: context?.extra,
  })
}

/**
 * Captures a message to Sentry
 */
export function captureMessage(
  message: string,
  context?: {
    tags?: Record<string, string>
    extra?: Record<string, any>
    level?: Sentry.SeverityLevel
  }
) {
  Sentry.captureMessage(message, {
    level: context?.level || 'info',
    tags: context?.tags,
    extra: context?.extra,
  })
}

/**
 * Sets user context for Sentry
 */
export function setUser(user: {
  id: string
  email?: string
  username?: string
} | null) {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    })
  } else {
    Sentry.setUser(null)
  }
}

/**
 * Adds breadcrumb for tracking user actions
 */
export function addBreadcrumb(
  message: string,
  data?: Record<string, any>,
  category?: string
) {
  Sentry.addBreadcrumb({
    message,
    category: category || 'action',
    level: 'info',
    data,
  })
}

/**
 * Starts a performance transaction
 */
export function startTransaction(name: string, op: string) {
  return Sentry.startInactiveSpan({
    name,
    op,
  })
}

/**
 * Wraps an async function with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: {
    name: string
    tags?: Record<string, string>
  }
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error) {
      captureException(error, {
        tags: {
          function: context?.name || fn.name,
          ...context?.tags,
        },
      })
      throw error
    }
  }) as T
}
