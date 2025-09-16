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
  const baselineIdRef = useRef<string>('')
  const initialized = useRef(false)
  const missCountRef = useRef(0) // double-confirm 404s
  const autoReloadTimerRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    let intervalId: number | undefined

    const init = async () => {
      if (initialized.current) return
      initialized.current = true

      const currentId = getCurrentBuildId()
      // If we cannot read a buildId, skip polling to avoid false positives
      if (!currentId) return
      baselineIdRef.current = currentId
      const tick = async () => {
        if (document.visibilityState !== 'visible') return
        if (!navigator.onLine) return

        // Build asset availability check (with double 404 confirm)
        const stillActive = await isBuildStillActive(baselineIdRef.current)
        if (!stillActive) {
          missCountRef.current += 1
          if (missCountRef.current >= 2) {
            setVisible(true)
            if (intervalId !== undefined) {
              window.clearInterval(intervalId)
              intervalId = undefined
            }
            // Schedule an automatic reload as a fallback to avoid being stuck on LOADING...
            autoReloadTimerRef.current = window.setTimeout(() => {
              doRefresh()
            }, 8000)
          }
        } else {
          missCountRef.current = 0
        }
      }

      intervalId = window.setInterval(tick, 5000)
      // Also run once on visibility regain
      const onVis = () => { void tick() }
      document.addEventListener('visibilitychange', onVis)
      // Cleanup extra listener on unmount
      const cleanup = () => document.removeEventListener('visibilitychange', onVis)
      ;(window as any).__update_snackbar_cleanup__ = cleanup
    }

    init()

    return () => {
      if (intervalId !== undefined) window.clearInterval(intervalId)
      if (autoReloadTimerRef.current !== undefined) window.clearTimeout(autoReloadTimerRef.current)
      const cleanup = (window as any).__update_snackbar_cleanup__
      if (typeof cleanup === 'function') cleanup()
    }
  }, [])

  const doRefresh = () => {
    try {
      const url = new URL(window.location.href)
      url.searchParams.set('v', Date.now().toString())
      window.location.replace(url.toString())
    } catch {
      window.location.reload()
    }
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex items-end justify-center pointer-events-none">
      <div className="pointer-events-auto mb-[max(env(safe-area-inset-bottom),12px)]">
        <div className="flex items-center gap-3 bg-black text-white px-4 py-3 rounded shadow-lg border border-black mx-3">
          <div className="text-xs sm:text-sm">New update is available.</div>
          <button
            onClick={doRefresh}
            className="px-3 py-1 border border-white text-white hover:bg-white hover:text-black transition-colors text-xs"
          >
            UPDATE
          </button>
        </div>
      </div>
    </div>
  )
}


