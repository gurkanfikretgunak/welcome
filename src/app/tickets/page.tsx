'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import PageLayout from '@/components/layout/PageLayout'
import TextButton from '@/components/ui/TextButton'
import TicketForm from '@/components/TicketForm'
import TicketList from '@/components/TicketList'

export default function TicketsPage() {
  const { user, userProfile, loading, signOut } = useAuth()
  const router = useRouter()
  const [showTicketForm, setShowTicketForm] = useState(false)

  // Redirect if not authenticated
  if (!loading && !user) {
    router.push('/')
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-mono">LOADING TICKETS...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {userProfile && <Navbar user={userProfile} onSignOut={signOut} />}
      
      <PageLayout
        title="SUPPORT TICKETS"
        subtitle="Create and manage your support requests"
      >
        <div className="space-y-6">
          {/* Header with Create Button */}
          <div className="flex justify-between items-center">
            <div>
              <TextButton
                onClick={() => router.push('/worklog')}
                variant="default"
                className="px-4 py-2 mb-4"
              >
                ← BACK TO WORKLOG
              </TextButton>
            </div>
          </div>

          {/* Ticket Form or List */}
          {showTicketForm ? (
            <TicketForm
              onTicketCreated={() => {
                setShowTicketForm(false)
              }}
              onCancel={() => setShowTicketForm(false)}
            />
          ) : (
            <TicketList
              onCreateTicket={() => setShowTicketForm(true)}
            />
          )}
        </div>
      </PageLayout>
    </div>
  )
}
