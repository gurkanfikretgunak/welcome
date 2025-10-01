// Bridge console methods to Sentry and suppress direct console output
import * as Sentry from '@sentry/nextjs'

type ConsoleMethod = 'log' | 'info' | 'warn' | 'error' | 'debug' | 'trace'

const originalConsole: Partial<Record<ConsoleMethod, (...args: any[]) => void>> = {
  log: console.log.bind(console),
  info: console.info?.bind(console),
  warn: console.warn?.bind(console),
  error: console.error.bind(console),
  debug: console.debug?.bind(console),
  trace: console.trace?.bind(console),
}

function stringifyArgs(args: unknown[]): string {
  try {
    return args
      .map((a) => {
        if (a instanceof Error) return a.stack || a.message
        if (typeof a === 'string') return a
        return JSON.stringify(a, (_k, v) => (typeof v === 'bigint' ? v.toString() : v))
      })
      .join(' ')
  } catch {
    return '[unserializable console arguments]'
  }
}

function capture(method: ConsoleMethod, args: unknown[]) {
  const message = `[console.${method}] ${stringifyArgs(args)}`
  const levelMap: Record<ConsoleMethod, Sentry.SeverityLevel> = {
    log: 'info',
    info: 'info',
    warn: 'warning',
    error: 'error',
    debug: 'debug',
    trace: 'debug',
  }
  Sentry.captureMessage(message, {
    level: levelMap[method],
    tags: { console: method },
  })
}

export function installConsoleBridge() {
  const methods: ConsoleMethod[] = ['log', 'info', 'warn', 'error', 'debug', 'trace']
  methods.forEach((method) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(console as any)[method] = (...args: unknown[]) => {
      capture(method, args)
      // Do not call original console to keep output clean
      // If needed for local debugging, use Sentry breadcrumbs or devtools
      return
    }
  })
}

// Optional helper to restore original console (not used by default)
export function restoreConsole() {
  (['log', 'info', 'warn', 'error', 'debug', 'trace'] as ConsoleMethod[]).forEach((m) => {
    const fn = originalConsole[m]
    if (fn) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(console as any)[m] = fn
    }
  })
}


