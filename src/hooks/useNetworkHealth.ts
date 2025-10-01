'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

type HealthState = {
  isOnline: boolean
  isSupabaseHealthy: boolean | null
  lastCheckedAt: number | null
  checking: boolean
  error?: string
}

const DEFAULT_POLL_MS = 15000

export function useNetworkHealth(pollMs: number = DEFAULT_POLL_MS) {
  const [state, setState] = useState<HealthState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSupabaseHealthy: null,
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

  const checkSupabase = useCallback(async () => {
    setState(prev => ({ ...prev, checking: true, error: undefined }))
    try {
      // Lightweight call to validate SDK connectivity
      const { data, error } = await supabase.auth.getSession()
      const ok = !error
      setState(prev => ({
        ...prev,
        isSupabaseHealthy: ok,
        lastCheckedAt: Date.now(),
        checking: false,
        error: error ? (error.message || 'Supabase connectivity error') : undefined,
      }))
      return ok
    } catch (e: any) {
      setState(prev => ({
        ...prev,
        isSupabaseHealthy: false,
        lastCheckedAt: Date.now(),
        checking: false,
        error: e?.message || 'Supabase connectivity error',
      }))
      return false
    }
  }, [])

  const schedule = useCallback(() => {
    clearTimer()
    timerRef.current = setTimeout(() => {
      void checkSupabase()
    }, pollMs)
  }, [checkSupabase, pollMs])

  const checkNow = useCallback(async () => {
    const okNet = typeof navigator !== 'undefined' ? navigator.onLine : true
    setState(prev => ({ ...prev, isOnline: okNet }))
    const okSb = await checkSupabase()
    if (!okSb) schedule()
    return okNet && okSb
  }, [checkSupabase, schedule])

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
    if (state.isSupabaseHealthy === false) {
      schedule()
    } else {
      clearTimer()
    }
  }, [state.isSupabaseHealthy, schedule])

  const problem = useMemo(() => {
    if (!state.isOnline) return 'No internet connection.'
    if (state.isSupabaseHealthy === false) return 'Cannot reach Supabase.'
    return null
  }, [state.isOnline, state.isSupabaseHealthy])

  return {
    ...state,
    problem,
    checkNow,
  }
}


