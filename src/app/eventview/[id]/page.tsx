'use client'

import { useEffect, useState } from 'react'
import TextBadge from '@/components/ui/TextBadge'
import TextCard from '@/components/ui/TextCard'
import TextHierarchy from '@/components/ui/TextHierarchy'
import EventRegistrationForm from '@/components/events/EventRegistrationForm'
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

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-xl mx-auto">
        <TextCard title={event.title}>
          <TextHierarchy level={2} muted>
            📅 {new Date(event.event_date).toLocaleString('tr-TR')}
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

        <div className="mt-4">
          <EventRegistrationForm
            event={event}
            submitLabel="JOIN"
            onSuccess={(data) => {
              if (data?.reference_number) {
                window.location.href = `/ticketview/${data.reference_number}`
              }
            }}
            onCancel={() => { window.location.href = '/events' }}
          />
        </div>
      </div>
    </div>
  )
}


