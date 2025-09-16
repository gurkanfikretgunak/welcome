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
    const res = await fetch(`/_next/static/${buildId}/_buildManifest.js`, {
      method: 'GET',
      cache: 'no-store',
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

  useEffect(() => {
    let intervalId: number | undefined

    const init = async () => {
      if (initialized.current) return
      initialized.current = true

      const currentId = getCurrentBuildId()
      baselineIdRef.current = currentId

      intervalId = window.setInterval(async () => {
        const stillActive = await isBuildStillActive(baselineIdRef.current)
        if (!stillActive) {
          setVisible(true)
        }
      }, 5000)
    }

    init()

    return () => {
      if (intervalId !== undefined) window.clearInterval(intervalId)
    }
  }, [])

  const doRefresh = () => {
    window.location.reload()
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


