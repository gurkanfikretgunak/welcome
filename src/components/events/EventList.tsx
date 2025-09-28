'use client'

import { useState, useEffect } from 'react'
import EventCard from './EventCard'
import TextCard from '@/components/ui/TextCard'
import TextHierarchy from '@/components/ui/TextHierarchy'

interface Event {
  id: string
  title: string
  description?: string
  event_date: string
  location?: string
  max_participants?: number
  participant_count?: number
}

interface EventListProps {
  onRegister: (eventId: string) => void
  showRegisterButton?: boolean
}

export default function EventList({ onRegister, showRegisterButton = true }: EventListProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/events')
        
        if (!response.ok) {
          throw new Error('Failed to fetch events')
        }
        
        const data = await response.json()
        setEvents(data.events || [])
      } catch (err) {
        console.error('Error fetching events:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch events')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  if (loading) {
    return (
      <TextCard title="EVENTS">
        <TextHierarchy level={1} muted>
          Loading events...
        </TextHierarchy>
      </TextCard>
    )
  }

  if (error) {
    return (
      <TextCard title="EVENTS" variant="error">
        <TextHierarchy level={1} muted>
          Error: {error}
        </TextHierarchy>
      </TextCard>
    )
  }

  if (events.length === 0) {
    return (
      <TextCard title="EVENTS">
        <TextHierarchy level={1} muted>
          No upcoming events available.
        </TextHierarchy>
      </TextCard>
    )
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onRegister={onRegister}
          showRegisterButton={showRegisterButton}
        />
      ))}
    </div>
  )
}
