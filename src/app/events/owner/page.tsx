'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import PageLayout from '@/components/layout/PageLayout'
import TextCard from '@/components/ui/TextCard'
import TextButton from '@/components/ui/TextButton'
import TextHierarchy from '@/components/ui/TextHierarchy'
import TextBadge from '@/components/ui/TextBadge'

interface Event {
  id: string
  title: string
  description?: string
  event_date: string
  location?: string
  max_participants?: number
  participant_count: number
  is_published: boolean
  is_active: boolean
  created_at: string
}

interface Participant {
  id: string
  reference_number: string
  full_name: string
  email: string
  title?: string
  company?: string
  registration_date: string
}

export default function OwnerEventsPage() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [loadingParticipants, setLoadingParticipants] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    if (!loading && userProfile) {
      if (!userProfile.is_owner) {
        router.replace('/events')
        return
      }
      fetchEvents()
    }
  }, [userProfile, loading, router])

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true)
      const response = await fetch('/api/events/owner')
      
      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }
      
      const data = await response.json()
      setEvents(data.events || [])
    } catch (err) {
      console.error('Error fetching events:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch events')
    } finally {
      setLoadingEvents(false)
    }
  }

  const fetchParticipants = async (eventId: string) => {
    try {
      setLoadingParticipants(true)
      const response = await fetch(`/api/events/${eventId}/participants`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch participants')
      }
      
      const data = await response.json()
      setParticipants(data.participants || [])
    } catch (err) {
      console.error('Error fetching participants:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch participants')
    } finally {
      setLoadingParticipants(false)
    }
  }

  const handleEventSelect = (event: Event) => {
    if (selectedEvent && selectedEvent.id === event.id) {
      // collapse if clicking the same card
      setSelectedEvent(null)
      setParticipants([])
      return
    }
    setSelectedEvent(event)
    fetchParticipants(event.id)
  }

  const handlePublishToggle = async (eventId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_published: !currentStatus
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update event')
      }

      // Refresh events list
      fetchEvents()
    } catch (err) {
      console.error('Error updating event:', err)
      setError(err instanceof Error ? err.message : 'Failed to update event')
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete event')
      }

      // Refresh events list
      fetchEvents()
      setSelectedEvent(null)
      setParticipants([])
    } catch (err) {
      console.error('Error deleting event:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete event')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <TextBadge variant="default">LOADING...</TextBadge>
      </div>
    )
  }

  if (!user || !userProfile?.is_owner) {
    router.replace('/')
    return null
  }

  return (
    <div className="min-h-screen">
      <Navbar user={userProfile} onSignOut={() => {}} />
      
      <PageLayout
        title="EVENT MANAGEMENT"
        subtitle="Owner Dashboard"
      >
        {/* Navigation */}
        <TextCard title="NAVIGATION">
          <div className="flex gap-3">
            <TextButton
              variant="default"
              onClick={() => router.push('/events')}
            >
              ← BACK TO EVENTS
            </TextButton>
            <TextButton
              variant={createOpen ? 'warning' : 'success'}
              onClick={() => setCreateOpen(v => !v)}
            >
              {createOpen ? 'HIDE CREATE FORM' : 'CREATE NEW EVENT'}
            </TextButton>
          </div>
        </TextCard>

        {createOpen && (
          <TextCard title="CREATE EVENT">
            <CreateEventForm onCreated={() => { setCreateOpen(false); fetchEvents() }} />
          </TextCard>
        )}

        {/* Error Message */}
        {error && (
          <TextCard title="ERROR" variant="error">
            <TextHierarchy level={1} muted>
              {error}
            </TextHierarchy>
          </TextCard>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Events List */}
          <div>
            <TextCard title="ALL EVENTS">
              {loadingEvents ? (
                <TextHierarchy level={1} muted>
                  Loading events...
                </TextHierarchy>
              ) : events.length === 0 ? (
                <TextHierarchy level={1} muted>
                  No events found.
                </TextHierarchy>
              ) : (
                <div className="space-y-3">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className={`border p-3 rounded cursor-pointer transition-colors ${
                        selectedEvent?.id === event.id 
                          ? 'border-green-500 bg-green-900/20' 
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => handleEventSelect(event)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <TextHierarchy level={1} emphasis>
                          {event.title}
                        </TextHierarchy>
                        <div className="flex gap-2">
                          <TextBadge variant={event.is_published ? 'success' : 'warning'}>
                            {event.is_published ? 'PUBLISHED' : 'DRAFT'}
                          </TextBadge>
                          <TextBadge variant={event.is_active ? 'success' : 'error'}>
                            {event.is_active ? 'ACTIVE' : 'INACTIVE'}
                          </TextBadge>
                          <span className="text-xs muted">
                            {selectedEvent?.id === event.id ? '▼' : '►'}
                          </span>
                        </div>
                      </div>
                      <TextHierarchy level={2} muted>
                        📅 {formatDate(event.event_date)}
                      </TextHierarchy>
                      <TextHierarchy level={2} muted>
                        👥 {event.participant_count} participants
                      </TextHierarchy>
                    </div>
                  ))}
                </div>
              )}
            </TextCard>
          </div>

          {/* Event Details & Participants */}
          <div>
            {selectedEvent ? (
              <div className="space-y-4">
                {/* Event Details */}
                <TextCard title="EVENT DETAILS">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <TextHierarchy level={1} emphasis>
                        {selectedEvent.title}
                      </TextHierarchy>
                      <div className="flex gap-2">
                        <TextButton
                          variant={selectedEvent.is_published ? 'warning' : 'success'}
                          onClick={() => handlePublishToggle(selectedEvent.id, selectedEvent.is_published)}
                        >
                          {selectedEvent.is_published ? 'UNPUBLISH' : 'PUBLISH'}
                        </TextButton>
                        <TextButton
                          variant="error"
                          onClick={() => handleDeleteEvent(selectedEvent.id)}
                        >
                          DELETE
                        </TextButton>
                      </div>
                    </div>
                    <TextHierarchy level={2} muted>
                      📅 {formatDate(selectedEvent.event_date)}
                    </TextHierarchy>
                    {selectedEvent.location && (
                      <TextHierarchy level={2} muted>
                        📍 {selectedEvent.location}
                      </TextHierarchy>
                    )}
                    {selectedEvent.description && (
                      <TextHierarchy level={2} muted>
                        {selectedEvent.description}
                      </TextHierarchy>
                    )}
                    <TextHierarchy level={2} muted>
                      👥 {selectedEvent.participant_count} / {selectedEvent.max_participants || '∞'} participants
                    </TextHierarchy>
                  </div>
                </TextCard>

                {/* Participants List */}
                <TextCard title="PARTICIPANTS">
                  {loadingParticipants ? (
                    <TextHierarchy level={1} muted>
                      Loading participants...
                    </TextHierarchy>
                  ) : participants.length === 0 ? (
                    <TextHierarchy level={1} muted>
                      No participants yet.
                    </TextHierarchy>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {participants.map((participant) => (
                        <div key={participant.id} className="border border-gray-600 p-3 rounded">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-mono font-bold text-sm">
                              {getInitials(participant.full_name)}
                            </div>
                            <div className="flex-1">
                              <TextHierarchy level={1} emphasis>
                                {participant.full_name}
                              </TextHierarchy>
                              <TextHierarchy level={2} muted>
                                {participant.email}
                              </TextHierarchy>
                              {participant.title && (
                                <TextHierarchy level={2} muted>
                                  💼 {participant.title}
                                </TextHierarchy>
                              )}
                              {participant.company && (
                                <TextHierarchy level={2} muted>
                                  🏢 {participant.company}
                                </TextHierarchy>
                              )}
                            </div>
                            <div className="text-right">
                              <TextHierarchy level={2} muted>
                                {participant.reference_number}
                              </TextHierarchy>
                              <TextHierarchy level={2} muted>
                                {formatDate(participant.registration_date)}
                              </TextHierarchy>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TextCard>
              </div>
            ) : (
              <TextCard title="SELECT AN EVENT">
                <TextHierarchy level={1} muted>
                  Select an event from the list to view details and participants.
                </TextHierarchy>
              </TextCard>
            )}
          </div>
        </div>
      </PageLayout>
    </div>
  )
}

function CreateEventForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    max_participants: '' as number | string,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          event_date: form.event_date,
          location: form.location || null,
          max_participants: form.max_participants ? Number(form.max_participants) : null,
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create event')
      onCreated()
      setForm({ title: '', description: '', event_date: '', location: '', max_participants: '' })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <TextHierarchy level={2} className="mb-2">TITLE</TextHierarchy>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white border border-gray-600 text-black font-mono text-sm focus:border-green-500 focus:outline-none"
          placeholder="Event title"
          required
        />
      </div>
      <div>
        <TextHierarchy level={2} className="mb-2">DESCRIPTION</TextHierarchy>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white border border-gray-600 text-black font-mono text-sm focus:border-green-500 focus:outline-none"
          placeholder="Event description"
          rows={3}
        />
      </div>
      <div>
        <TextHierarchy level={2} className="mb-2">DATE/TIME</TextHierarchy>
        <input
          type="datetime-local"
          name="event_date"
          value={form.event_date}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white border border-gray-600 text-black font-mono text-sm focus:border-green-500 focus:outline-none"
          required
        />
      </div>
      <div>
        <TextHierarchy level={2} className="mb-2">LOCATION</TextHierarchy>
        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white border border-gray-600 text-black font-mono text-sm focus:border-green-500 focus:outline-none"
          placeholder="Location or Online"
        />
      </div>
      <div>
        <TextHierarchy level={2} className="mb-2">MAX PARTICIPANTS</TextHierarchy>
        <input
          type="number"
          name="max_participants"
          value={form.max_participants}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white border border-gray-600 text-black font-mono text-sm focus:border-green-500 focus:outline-none"
          placeholder="Leave empty for unlimited"
          min={0}
        />
      </div>
      {error && (
        <TextHierarchy level={2} className="text-red-400">{error}</TextHierarchy>
      )}
      <div className="flex gap-3">
        <TextButton type="submit" variant="success" disabled={submitting}>
          {submitting ? 'CREATING...' : 'CREATE EVENT'}
        </TextButton>
      </div>
    </form>
  )
}
