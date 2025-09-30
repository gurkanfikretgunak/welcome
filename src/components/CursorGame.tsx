'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

interface CursorPosition {
  id: string
  x: number
  y: number
  username: string
  color: string
  last_seen: string
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
]

const RANDOM_NAMES = [
  'AnonymousDev', 'CodeNinja', 'PixelWizard', 'ByteMaster', 'CloudWalker',
  'DataDancer', 'LogicLover', 'BugHunter', 'StackSurfer', 'GitGuru',
  'ReactRanger', 'NodeNomad', 'CSSChampion', 'APIAvenger', 'DebugDuck',
  'SyntaxSage', 'FrameworkFan', 'DatabaseDiver', 'ServerSage', 'WebWizard'
]

export default function CursorGame() {
  const { user } = useAuth()
  const [cursors, setCursors] = useState<CursorPosition[]>([])
  const [myCursor, setMyCursor] = useState<CursorPosition | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const mouseMoveRef = useRef<NodeJS.Timeout>()
  const sessionId = useRef<string>(Math.random().toString(36).substring(7))
  const username = useRef<string>(RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)])
  const color = useRef<string>(COLORS[Math.floor(Math.random() * COLORS.length)])

  // Don't show cursor game for authenticated users
  if (user) {
    return null
  }

  useEffect(() => {
    let subscription: any

    const setupRealtime = async () => {
      try {
        // Subscribe to cursor position changes
        subscription = supabase
          .channel('cursor-positions')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'cursor_positions'
            },
            (payload) => {
              if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                const newCursor = payload.new as CursorPosition
                setCursors(prev => {
                  const filtered = prev.filter(c => c.id !== newCursor.id)
                  return [...filtered, newCursor]
                })
              } else if (payload.eventType === 'DELETE') {
                const deletedCursor = payload.old as CursorPosition
                setCursors(prev => prev.filter(c => c.id !== deletedCursor.id))
              }
            }
          )
          .subscribe((status) => {
            setIsConnected(status === 'SUBSCRIBED')
          })

        // Clean up old cursors (older than 5 seconds)
        const cleanupInterval = setInterval(() => {
          const now = new Date().toISOString()
          setCursors(prev => 
            prev.filter(cursor => {
              const lastSeen = new Date(cursor.last_seen)
              const nowDate = new Date(now)
              return (nowDate.getTime() - lastSeen.getTime()) < 5000
            })
          )
        }, 2000)

        return () => {
          if (subscription) {
            supabase.removeChannel(subscription)
          }
          clearInterval(cleanupInterval)
        }
      } catch (error) {
        console.error('Error setting up realtime:', error)
      }
    }

    const cleanup = setupRealtime()
    return () => {
      cleanup.then(cleanupFn => cleanupFn?.())
    }
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (mouseMoveRef.current) {
        clearTimeout(mouseMoveRef.current)
      }

      mouseMoveRef.current = setTimeout(async () => {
        const cursorData = {
          id: sessionId.current,
          x: e.clientX,
          y: e.clientY,
          username: username.current,
          color: color.current,
          last_seen: new Date().toISOString()
        }

        setMyCursor(cursorData)

        try {
          await supabase
            .from('cursor_positions')
            .upsert(cursorData, { onConflict: 'id' })
        } catch (error) {
          console.error('Error updating cursor position:', error)
        }
      }, 100) // Throttle updates
    }

    const handleMouseLeave = async () => {
      try {
        await supabase
          .from('cursor_positions')
          .delete()
          .eq('id', sessionId.current)
      } catch (error) {
        console.error('Error removing cursor:', error)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('beforeunload', handleMouseLeave)
    window.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('beforeunload', handleMouseLeave)
      window.removeEventListener('mouseleave', handleMouseLeave)
      if (mouseMoveRef.current) {
        clearTimeout(mouseMoveRef.current)
      }
    }
  }, [])

  return (
    <>
      {/* Other users' cursors */}
      {cursors
        .filter(cursor => cursor.id !== sessionId.current)
        .map((cursor) => (
          <div
            key={cursor.id}
            className="fixed pointer-events-none z-50 transition-all duration-100"
            style={{
              left: cursor.x,
              top: cursor.y,
              transform: 'translate(-2px, -2px)'
            }}
          >
            {/* Cursor pointer */}
            <div
              className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
              style={{ backgroundColor: cursor.color }}
            />
            {/* Username badge */}
            <div
              className="absolute top-6 left-0 bg-black text-white text-xs px-2 py-1 rounded-full whitespace-nowrap shadow-lg"
              style={{ backgroundColor: cursor.color }}
            >
              {cursor.username}
            </div>
          </div>
        ))}

      {/* My cursor */}
      {myCursor && (
        <div
          className="fixed pointer-events-none z-50 transition-all duration-100"
          style={{
            left: myCursor.x,
            top: myCursor.y,
            transform: 'translate(-2px, -2px)'
          }}
        >
          {/* My cursor pointer */}
          <div
            className="w-4 h-4 rounded-full border-2 border-white shadow-lg animate-pulse"
            style={{ backgroundColor: myCursor.color }}
          />
          {/* My username badge */}
          <div
            className="absolute top-6 left-0 bg-black text-white text-xs px-2 py-1 rounded-full whitespace-nowrap shadow-lg"
            style={{ backgroundColor: myCursor.color }}
          >
            {myCursor.username} (you)
          </div>
        </div>
      )}

      {/* Connection status indicator */}
      {!isConnected && (
        <div className="fixed bottom-4 right-4 bg-yellow-500 text-black text-xs px-2 py-1 rounded shadow-lg z-50">
          Connecting to live cursors...
        </div>
      )}
    </>
  )
}
