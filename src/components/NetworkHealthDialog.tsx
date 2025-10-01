'use client'

import { useEffect, useState } from 'react'
import { useNetworkHealth } from '@/hooks/useNetworkHealth'
import TextCard from '@/components/ui/TextCard'
import TextButton from '@/components/ui/TextButton'
import TextHierarchy from '@/components/ui/TextHierarchy'

export default function NetworkHealthDialog() {
  const { isOnline, isSupabaseHealthy, problem, checking, error, checkNow } = useNetworkHealth()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (problem) setVisible(true)
    if (!problem) setVisible(false)
  }, [problem])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/10" />
      <TextCard className="relative z-10 max-w-md w-full border border-black bg-white">
        <div className="space-y-4">
          <TextHierarchy level={1} emphasis>
            Connection problem detected
          </TextHierarchy>
          <TextHierarchy level={2}>
            {problem}
          </TextHierarchy>
          {error && (
            <TextHierarchy level={3} muted>
              {error}
            </TextHierarchy>
          )}
          <div className="flex items-center gap-3">
            <TextButton
              onClick={() => void checkNow()}
              variant="default"
              className="px-4 py-2"
              disabled={checking}
            >
              {checking ? 'Checking…' : 'Check again'}
            </TextButton>
            <TextButton
              onClick={() => void checkNow()}
              variant="success"
              className="px-4 py-2"
              disabled={checking}
            >
              {checking ? 'Validating…' : 'Validate & continue'}
            </TextButton>
          </div>
          <div className="text-xs muted">
            Status: Internet {isOnline ? 'OK' : 'DOWN'} • Supabase {isSupabaseHealthy === null ? '…' : isSupabaseHealthy ? 'OK' : 'DOWN'}
          </div>
        </div>
      </TextCard>
    </div>
  )
}


