'use client'

import { useEffect, useRef, useState } from 'react'

// API-less update detection using Next.js buildId.
// Strategy: read current buildId from window.__NEXT_DATA__.buildId, then poll
// /_next/static/{buildId}/_buildManifest.js with cache: 'no-store'.
// If it returns 404, a new build is active → show snackbar.

function getCurrentBuildId(): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (window as any).__NEXT_DATA__
  return data?.buildId || ''
}

async function isBuildStillActive(buildId: string): Promise<boolean> {
  try {
    const res = await fetch(`/_next/static/${buildId}/_buildManifest.js?ts=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store', // bypass caches
      credentials: 'same-origin',
    })
    if (res.status === 404) return false
    return res.ok
  } catch {
    // On network errors, assume still active to avoid noisy prompts
    return true
  }
}


export default function UpdateSnackbar() {
  const [visible, setVisible] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const baselineIdRef = useRef<string>('')
  const initialized = useRef(false)
  const missCountRef = useRef(0) // double-confirm 404s
  const autoReloadTimerRef = useRef<number | undefined>(undefined)
  const intervalIdRef = useRef<number | undefined>(undefined)
  
  // Debug mode - set to true to test snackbar functionality
  const DEBUG_MODE = process.env.NODE_ENV === 'development' && false // Set to true to enable debug mode

  useEffect(() => {
    const init = async () => {
      if (initialized.current) return
      initialized.current = true

      const currentId = getCurrentBuildId()
      // If we cannot read a buildId, skip polling to avoid false positives
      if (!currentId) {
        console.log('UpdateSnackbar: No buildId found, skipping update detection')
        return
      }
      
      console.log('UpdateSnackbar: Initialized with buildId:', currentId)
      baselineIdRef.current = currentId
      
      // Debug keyboard shortcut (Ctrl+Shift+U)
      let handleKeyDown: ((e: KeyboardEvent) => void) | undefined
      if (DEBUG_MODE) {
        handleKeyDown = (e: KeyboardEvent) => {
          if (e.ctrlKey && e.shiftKey && e.key === 'U') {
            e.preventDefault()
            console.log('UpdateSnackbar: Debug shortcut triggered')
            setVisible(true)
          }
        }
        document.addEventListener('keydown', handleKeyDown)
        console.log('UpdateSnackbar: Debug mode enabled. Press Ctrl+Shift+U to test snackbar')
      }
      
      const tick = async () => {
        if (document.visibilityState !== 'visible') return
        if (!navigator.onLine) return
        if (visible || isRefreshing) return // Don't check if already showing or refreshing

        try {
          // Debug mode - simulate update detection
          if (DEBUG_MODE) {
            console.log('UpdateSnackbar: DEBUG MODE - Simulating update detection')
            setVisible(true)
            if (intervalIdRef.current !== undefined) {
              window.clearInterval(intervalIdRef.current)
              intervalIdRef.current = undefined
            }
            return
          }

          // Build asset availability check (with double 404 confirm)
          const stillActive = await isBuildStillActive(baselineIdRef.current)
          if (!stillActive) {
            missCountRef.current += 1
            console.log('UpdateSnackbar: Build not active, miss count:', missCountRef.current)
            if (missCountRef.current >= 2) {
              console.log('UpdateSnackbar: Showing update notification')
              setVisible(true)
              if (intervalIdRef.current !== undefined) {
                window.clearInterval(intervalIdRef.current)
                intervalIdRef.current = undefined
              }
              // Schedule an automatic reload as a fallback
              autoReloadTimerRef.current = window.setTimeout(() => {
                console.log('UpdateSnackbar: Auto-refreshing after timeout')
                doRefresh()
              }, 10000) // Increased to 10 seconds
            }
          } else {
            missCountRef.current = 0
          }
        } catch (error) {
          console.error('UpdateSnackbar: Error during build check:', error)
        }
      }

      // Start polling every 5 seconds
      intervalIdRef.current = window.setInterval(tick, 5000)
      
      // Also run once on visibility regain
      const onVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          void tick()
        }
      }
      
      document.addEventListener('visibilitychange', onVisibilityChange)
      
      // Cleanup function
      const cleanup = () => {
        document.removeEventListener('visibilitychange', onVisibilityChange)
        if (DEBUG_MODE && handleKeyDown) {
          document.removeEventListener('keydown', handleKeyDown)
        }
        if (intervalIdRef.current !== undefined) {
          window.clearInterval(intervalIdRef.current)
          intervalIdRef.current = undefined
        }
        if (autoReloadTimerRef.current !== undefined) {
          window.clearTimeout(autoReloadTimerRef.current)
          autoReloadTimerRef.current = undefined
        }
      }
      
      // Store cleanup function
      ;(window as any).__update_snackbar_cleanup__ = cleanup
    }

    init()

    return () => {
      const cleanup = (window as any).__update_snackbar_cleanup__
      if (typeof cleanup === 'function') cleanup()
    }
  }, [visible, isRefreshing])

  const doRefresh = () => {
    if (isRefreshing) return // Prevent multiple refreshes
    
    setIsRefreshing(true)
    console.log('UpdateSnackbar: Refreshing page...')
    
    try {
      const url = new URL(window.location.href)
      url.searchParams.set('v', Date.now().toString())
      window.location.replace(url.toString())
    } catch (error) {
      console.error('UpdateSnackbar: Error refreshing with URL params:', error)
      window.location.reload()
    }
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex items-end justify-center pointer-events-none">
      <div className="pointer-events-auto mb-[max(env(safe-area-inset-bottom),12px)]">
        <div className="flex items-center gap-3 bg-black text-white px-4 py-3 rounded shadow-lg border border-black mx-3 animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <div className="text-xs sm:text-sm font-medium">
              {isRefreshing ? 'Updating...' : 'New update is available.'}
            </div>
          </div>
          <button
            onClick={doRefresh}
            disabled={isRefreshing}
            className="px-3 py-1 border border-white text-white hover:bg-white hover:text-black transition-colors text-xs font-mono disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRefreshing ? 'UPDATING...' : 'UPDATE'}
          </button>
        </div>
      </div>
    </div>
  )
}


