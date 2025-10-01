"use client"

import { useEffect } from 'react'
import { installConsoleBridge } from '@/lib/consoleBridge'

export default function ConsoleBridgeClient() {
  useEffect(() => {
    try {
      installConsoleBridge()
    } catch {
      // ignore
    }
  }, [])

  return null
}


