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
import EventList from '@/components/events/EventList'
import EventRegistrationForm from '@/components/events/EventRegistrationForm'
import TicketLookup from '@/components/events/TicketLookup'
import EventTicket from '@/components/events/EventTicket'

interface Event {
  id: string
  title: string
  description?: string
  event_date: string
  location?: string
  max_participants?: number
  participant_count?: number
  is_published: boolean
  is_active: boolean
  created_at: string
}

interface RegistrationData {
  participant_id: string
  reference_number: string
  event_title: string
  event_date: string
  full_name: string
  email: string
  registration_date: string
}

export default function EventsPage() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const [currentView, setCurrentView] = useState<'list' | 'register' | 'tickets' | 'create'>('list')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    if (!loading && userProfile) {
      setIsOwner(userProfile.is_owner || false)
    }
  }, [userProfile, loading])

  const handleRegister = (eventId: string) => {
    // Find the event details
    // For now, we'll fetch it from the API
    fetch(`/api/events/${eventId}`)
      .then(response => response.json())
      .then(data => {
        if (data.event) {
          setSelectedEvent(data.event)
          setCurrentView('register')
        }
      })
      .catch(error => {
        console.error('Error fetching event:', error)
      })
  }

  const handleRegistrationSuccess = (data: RegistrationData) => {
    setRegistrationData(data)
    setCurrentView('tickets')
  }

  const handleCancelRegistration = () => {
    setSelectedEvent(null)
    setCurrentView('list')
  }

  const handleBackToList = () => {
    setCurrentView('list')
    setSelectedEvent(null)
    setRegistrationData(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <TextBadge variant="default">LOADING...</TextBadge>
      </div>
    )
  }

  if (!user) {
    router.replace('/')
    return null
  }

  return (
    <div className="min-h-screen">
      <Navbar user={userProfile} onSignOut={() => {}} />
      
      <PageLayout
        title="EVENTS"
        subtitle="Event Management System"
      >
        {/* Navigation */}
        <TextCard title="NAVIGATION">
          <div className="flex flex-wrap gap-3">
            <TextButton
              variant={currentView === 'list' ? 'success' : 'default'}
              onClick={() => setCurrentView('list')}
            >
              VIEW EVENTS
            </TextButton>
            <TextButton
              variant={currentView === 'tickets' ? 'success' : 'default'}
              onClick={() => setCurrentView('tickets')}
            >
              MY TICKETS
            </TextButton>
            {isOwner && (
              <TextButton
                variant={currentView === 'create' ? 'success' : 'default'}
                onClick={() => setCurrentView('create')}
              >
                CREATE EVENT
              </TextButton>
            )}
          </div>
        </TextCard>

        {/* Main Content */}
        {currentView === 'list' && (
          <div>
            <TextCard title="UPCOMING EVENTS">
              <TextHierarchy level={1} muted>
                Browse and register for upcoming events.
              </TextHierarchy>
            </TextCard>
            <EventList onRegister={handleRegister} />
          </div>
        )}

        {currentView === 'register' && selectedEvent && (
          <div>
            <TextButton
              variant="default"
              onClick={handleBackToList}
              className="mb-4"
            >
              ← BACK TO EVENTS
            </TextButton>
            <EventRegistrationForm
              event={selectedEvent}
              onSuccess={handleRegistrationSuccess}
              onCancel={handleCancelRegistration}
            />
          </div>
        )}

        {currentView === 'tickets' && (
          <div>
            <TextButton
              variant="default"
              onClick={handleBackToList}
              className="mb-4"
            >
              ← BACK TO EVENTS
            </TextButton>
            <TicketLookup />
          </div>
        )}

        {currentView === 'create' && isOwner && (
          <div>
            <TextButton
              variant="default"
              onClick={handleBackToList}
              className="mb-4"
            >
              ← BACK TO EVENTS
            </TextButton>
            <TextCard title="CREATE EVENT" variant="warning">
              <TextHierarchy level={1} muted>
                Event creation form will be implemented here.
              </TextHierarchy>
            </TextCard>
          </div>
        )}

        {/* Registration Success */}
        {registrationData && (
          <div className="mt-6">
            <TextCard title="REGISTRATION SUCCESSFUL" variant="success">
              <div className="space-y-3">
                <TextHierarchy level={1} emphasis>
                  Thank you for registering!
                </TextHierarchy>
                <TextHierarchy level={2} muted>
                  Your reference number: {registrationData.reference_number}
                </TextHierarchy>
                <TextHierarchy level={2} muted>
                  Please save this reference number. You can use it to view your ticket later.
                </TextHierarchy>
                <div className="pt-3">
                  <TextButton
                    variant="success"
                    onClick={() => {
                      setCurrentView('tickets')
                      setRegistrationData(null)
                    }}
                  >
                    VIEW MY TICKET
                  </TextButton>
                </div>
              </div>
            </TextCard>
          </div>
        )}
      </PageLayout>
    </div>
  )
}
