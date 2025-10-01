'use client'

import { useState, useEffect } from 'react'
import EventCard from './EventCard'
import TextCard from '@/components/ui/TextCard'
import TextHierarchy from '@/components/ui/TextHierarchy'
import { getPublishedEvents } from '@/lib/repositories/events'

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
  hideWhenEmpty?: boolean
  maxItems?: number
  section?: boolean
}

export default function EventList({ onRegister, showRegisterButton = true, hideWhenEmpty = false, maxItems, section = false }: EventListProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const { data, error } = await getPublishedEvents()
        
        if (error) {
          throw error
        }
        
        setEvents(data || [])
      } catch (err) {
        console.error('Error fetching events:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch events')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const contentLoading = (
    <TextCard title={section ? 'UPCOMING EVENTS' : 'EVENTS'}>
      <TextHierarchy level={1} muted>
        Loading events...
      </TextHierarchy>
    </TextCard>
  )

  const contentError = (
    <TextCard title={section ? 'UPCOMING EVENTS' : 'EVENTS'} variant="error">
      <TextHierarchy level={1} muted>
        Error: {error}
      </TextHierarchy>
    </TextCard>
  )

  const visibleEvents = typeof maxItems === 'number' ? events.slice(0, maxItems) : events

  if (loading) return section ? contentLoading : contentLoading
  if (error) return section ? contentError : contentError
  if (visibleEvents.length === 0 && hideWhenEmpty) return null
  if (visibleEvents.length === 0) {
    return (
      <TextCard title={section ? 'UPCOMING EVENTS' : 'EVENTS'}>
        <TextHierarchy level={1} muted>
          No upcoming events available.
        </TextHierarchy>
      </TextCard>
    )
  }

  const list = (
    <div className="space-y-4">
      {visibleEvents.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onRegister={onRegister}
          showRegisterButton={showRegisterButton}
        />
      ))}
    </div>
  )

  if (!section) return list

  return (
    <TextCard title="UPCOMING EVENTS">
      <TextHierarchy level={1} muted className="mb-3">
        Join our community events and connect with fellow developers.
      </TextHierarchy>
      {list}
    </TextCard>
  )
}
