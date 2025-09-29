'use client'

import { useState } from 'react'
import TextCard from '@/components/ui/TextCard'
import TextButton from '@/components/ui/TextButton'
import TextBadge from '@/components/ui/TextBadge'
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

interface EventCardProps {
  event: Event
  onRegister: (eventId: string) => void
  showRegisterButton?: boolean
}

export default function EventCard({ event, onRegister, showRegisterButton = true }: EventCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const eventDate = new Date(event.event_date)
  const isUpcoming = eventDate > new Date()
  const isFull = event.max_participants && event.participant_count && event.participant_count >= event.max_participants
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = () => {
    if (!isUpcoming) {
      return <TextBadge variant="error">PAST EVENT</TextBadge>
    }
    if (isFull) {
      return <TextBadge variant="warning">FULL</TextBadge>
    }
    return <TextBadge variant="success">OPEN</TextBadge>
  }

  return (
    <TextCard title={event.title} className="mb-4 text-left">
      <div className="space-y-3">
        {/* Event Status and Date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <TextHierarchy level={2} muted>
              {formatDate(eventDate)}
            </TextHierarchy>
          </div>
          <span className="text-xs muted">{isExpanded ? '▲' : '▼'}</span>
        </div>

        {/* Location */}
        {event.location && (
          <TextHierarchy level={2} muted>
            📍 {event.location}
          </TextHierarchy>
        )}

        {/* Participants Info */}
        <div className="flex items-center gap-4 text-sm">
          <TextHierarchy level={2} muted>
            👥 {event.participant_count || 0} participants
          </TextHierarchy>
          {event.max_participants && (
            <TextHierarchy level={2} muted>
              (max {event.max_participants})
            </TextHierarchy>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <div>
            <TextHierarchy level={2} muted>
              {isExpanded ? event.description : `${event.description.substring(0, 140)}${event.description.length > 140 ? '...' : ''}`}
            </TextHierarchy>
            {event.description.length > 140 && (
              <TextButton
                variant="default"
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-xs"
              >
                {isExpanded ? 'SHOW LESS' : 'READ MORE'}
              </TextButton>
            )}
          </div>
        )}

        {/* Register Button */}
        {showRegisterButton && isUpcoming && !isFull && (
          <div className="pt-3 border-t border-gray-600">
            <TextButton
              variant="success"
              onClick={() => onRegister(event.id)}
              className="w-full"
            >
              REGISTER FOR EVENT
            </TextButton>
          </div>
        )}

        {showRegisterButton && isFull && (
          <div className="pt-3 border-t border-gray-600">
            <TextButton
              variant="warning"
              disabled
              className="w-full"
            >
              EVENT FULL
            </TextButton>
          </div>
        )}
      </div>
    </TextCard>
  )
}
