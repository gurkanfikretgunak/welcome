'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TextBadge from '@/components/ui/TextBadge'
import TextCard from '@/components/ui/TextCard'
import TextHierarchy from '@/components/ui/TextHierarchy'
import TextButton from '@/components/ui/TextButton'
import EventTicket from '@/components/events/EventTicket'

interface ParticipantTicketData {
  participant_id: string
  reference_number: string
  full_name: string
  email: string
  title?: string
  company?: string
  event_id: string
  event_title: string
  event_date: string
  event_location?: string
  registration_date: string
}

export default function TicketView({ params }: { params: Promise<{ reference: string }> }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [participant, setParticipant] = useState<ParticipantTicketData | null>(null)
  const [showShare, setShowShare] = useState(false)

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const { reference } = await params
        const res = await fetch(`/api/events/participants/reference/${reference}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Ticket not found')
        setParticipant(data.participant)
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    }
    fetchTicket()
  }, [params])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <TextBadge variant="default">LOADING TICKET...</TextBadge>
      </div>
    )
  }

  if (error || !participant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <TextCard variant="error">
          <TextHierarchy level={1} muted>
            {error || 'Ticket not found'}
          </TextHierarchy>
        </TextCard>
      </div>
    )
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || '')
  const ticketUrl = `${origin}/ticketview/${participant.reference_number}`
  const dateStr = new Date(participant.event_date).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  const shareText = `${participant.full_name} will attend "${participant.event_title}" on ${dateStr}. View the digital ticket here:`
  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(ticketUrl)}`
  const linkedinUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(ticketUrl)}&title=${encodeURIComponent(participant.event_title)}`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + ticketUrl)}`

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <EventTicket participant={participant} hideAvatar enableShare />

        {/* Notices under the ticket */}
        <div className="mt-4 space-y-2">
          <TextCard variant="muted">
            <TextHierarchy level={2} muted>
              - Please keep your reference number confidential.
            </TextHierarchy>
            <TextHierarchy level={2} muted>
              - Present the QR code at the entrance for validation.
            </TextHierarchy>
            <TextHierarchy level={2} muted>
              - For any issues, contact the event organizer.
            </TextHierarchy>
          </TextCard>
        </div>
      </div>
    </div>
  )
}


