'use client'

import { useEffect, useState } from 'react'
import TextBadge from '@/components/ui/TextBadge'
import TextCard from '@/components/ui/TextCard'
import TextHierarchy from '@/components/ui/TextHierarchy'
import EventRegistrationForm from '@/components/events/EventRegistrationForm'
import TicketLookup from '@/components/events/TicketLookup'
import { getEventById } from '@/lib/supabase'

interface EventData {
  id: string
  title: string
  description?: string
  event_date: string
  location?: string
  max_participants?: number
}

export default function PublicEventView({ params }: { params: Promise<{ id: string }> }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [event, setEvent] = useState<EventData | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [redirectReference, setRedirectReference] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { id } = await params
        const { data, error } = await getEventById(id)
        
        if (error || !data) throw error || new Error('Event not found')
        
        setEvent(data)
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params])

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0 && redirectReference) {
      window.location.href = `/ticketview/${redirectReference}`
    }
  }, [countdown, redirectReference])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <TextBadge variant="default">LOADING EVENT...</TextBadge>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <TextCard variant="error">
          <TextHierarchy level={1} muted>{error || 'Event not found'}</TextHierarchy>
        </TextCard>
      </div>
    )
  }

  if (countdown !== null) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b-2 border-black bg-white">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-center space-x-4">
              <h1 className="text-2xl font-mono font-bold">
                MASTERFABRIC
              </h1>
              <TextBadge variant="muted">
                WELCOME
              </TextBadge>
            </div>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <TextCard variant="success" title="REGISTRATION SUCCESSFUL! 🎉">
            <div className="text-center space-y-4">
              <TextHierarchy level={1} emphasis className="text-4xl">
                {countdown}
              </TextHierarchy>
              <TextHierarchy level={2} muted>
                Preparing your ticket...
              </TextHierarchy>
              <TextHierarchy level={2} muted>
                Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}
              </TextHierarchy>
            </div>
          </TextCard>
        </div>
        
        {/* Footer */}
        <footer className="border-t border-black p-4 mt-8">
          <div className="max-w-6xl mx-auto text-center">
            <TextHierarchy level={2} muted>
              © 2024 MasterFabric. All rights reserved.
            </TextHierarchy>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b-2 border-black bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-4">
            <h1 className="text-2xl font-mono font-bold">
              MASTERFABRIC
            </h1>
            <TextBadge variant="muted">
              WELCOME
            </TextBadge>
          </div>
        </div>
      </header>

      <div className="flex-1 p-4">
        <div className="max-w-xl mx-auto space-y-4">
          {/* Ticket Lookup Section */}
          <TicketLookup />

          {/* Event Info Section */}
          <TextCard title={event.title}>
            <TextHierarchy level={2} muted>
              📅 {new Date(event.event_date).toLocaleString('en-US')}
            </TextHierarchy>
            {event.location && (
              <TextHierarchy level={2} muted>
                📍 {event.location}
              </TextHierarchy>
            )}
            {event.description && (
              <TextHierarchy level={2} muted className="mt-2">
                {event.description}
              </TextHierarchy>
            )}
          </TextCard>

          {/* Registration Form Section */}
          <EventRegistrationForm
            event={event}
            submitLabel="JOIN"
            onSuccess={(data) => {
              if (data?.reference_number) {
                setRedirectReference(data.reference_number)
                setCountdown(3)
              }
            }}
            onCancel={() => { window.location.href = '/events' }}
          />
        </div>
      </div>
      
      {/* Footer */}
      <footer className="border-t border-black p-4 mt-8">
        <div className="max-w-6xl mx-auto text-center">
          <TextHierarchy level={2} muted>
            © 2025 MasterFabric. All rights reserved.
          </TextHierarchy>
        </div>
      </footer>
    </div>
  )
}


