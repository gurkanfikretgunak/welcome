'use client'

import { useEffect, useState } from 'react'
import TextBadge from '@/components/ui/TextBadge'
import TextCard from '@/components/ui/TextCard'
import TextHierarchy from '@/components/ui/TextHierarchy'
import EventRegistrationForm from '@/components/events/EventRegistrationForm'

interface EventData {
  id: string
  title: string
  description?: string
  event_date: string
  location?: string
  max_participants?: number
}

interface ParticipantInfo {
  participant_id: string
  reference_number: string
  event_id: string
  event_title: string
  event_date: string
  event_location?: string
}

export default function PublicEventView({ params }: { params: Promise<{ reference: string }> }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [event, setEvent] = useState<EventData | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { reference } = await params
        const res = await fetch(`/api/events/participants/reference/${reference}`)
        const data = await res.json()
        if (!res.ok || !data?.participant) throw new Error(data.error || 'Event not found')

        const p: ParticipantInfo = data.participant
        const evRes = await fetch(`/api/events/${p.event_id}`)
        const evData = await evRes.json()
        if (!evRes.ok || !evData?.event) throw new Error('Event not available')
        setEvent(evData.event)
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


