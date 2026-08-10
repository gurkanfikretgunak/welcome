'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getGraphqlUrl } from '@/lib/mf/config'

type HealthState = {
  isOnline: boolean
  isBackendHealthy: boolean | null
  lastCheckedAt: number | null
  checking: boolean
  error?: string
}

const DEFAULT_POLL_MS = 15000

export function useNetworkHealth(pollMs: number = DEFAULT_POLL_MS) {
  const [state, setState] = useState<HealthState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isBackendHealthy: null,
    lastCheckedAt: null,
    checking: false,
  })

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const checkBackend = useCallback(async () => {
    setState(prev => ({ ...prev, checking: true, error: undefined }))
    try {
      const response = await fetch(getGraphqlUrl().replace(/\/graphql\/?$/, '/health'))
      const ok = response.ok
      setState(prev => ({
        ...prev,
        isBackendHealthy: ok,
        lastCheckedAt: Date.now(),
        checking: false,
        error: ok ? undefined : `mf-go health returned ${response.status}`,
      }))
      return ok
    } catch (e: any) {
      setState(prev => ({
        ...prev,
        isBackendHealthy: false,
        lastCheckedAt: Date.now(),
        checking: false,
        error: e?.message || 'mf-go connectivity error',
      }))
      return false
    }
  }, [])

  const schedule = useCallback(() => {
    clearTimer()
    timerRef.current = setTimeout(() => {
      void checkBackend()
    }, pollMs)
  }, [checkBackend, pollMs])

  const checkNow = useCallback(async () => {
    const okNet = typeof navigator !== 'undefined' ? navigator.onLine : true
    setState(prev => ({ ...prev, isOnline: okNet }))
    const okSb = await checkBackend()
    if (!okSb) schedule()
    return okNet && okSb
  }, [checkBackend, schedule])

  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initial check on mount
    void checkNow()

    // Re-check on window focus to quickly recover
    const onFocus = () => void checkNow()
    window.addEventListener('focus', onFocus)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('focus', onFocus)
      clearTimer()
    }
  }, [checkNow])

  useEffect(() => {
    if (state.isBackendHealthy === false) {
      schedule()
    } else {
      clearTimer()
    }
  }, [state.isBackendHealthy, schedule])

  const problem = useMemo(() => {
    if (!state.isOnline) return 'No internet connection.'
    if (state.isBackendHealthy === false) return 'Cannot reach mf-go.'
    return null
  }, [state.isOnline, state.isBackendHealthy])

  return {
    ...state,
    problem,
    checkNow,
  }
}


