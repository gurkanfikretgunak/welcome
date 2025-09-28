'use client'

import { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import TextCard from '@/components/ui/TextCard'
import TextHierarchy from '@/components/ui/TextHierarchy'
import TextBadge from '@/components/ui/TextBadge'

interface EventTicketProps {
  participant: {
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
}

export default function EventTicket({ participant }: EventTicketProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')

  // Generate QR code
  useEffect(() => {
    const generateQR = async () => {
      try {
        const qrData = {
          reference: participant.reference_number,
          event: participant.event_title,
          name: participant.full_name,
          date: participant.event_date
        }
        
        const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
          width: 200,
          margin: 2,
          color: {
            dark: '#00ff00',
            light: '#000000'
          }
        })
        setQrCodeDataUrl(qrCodeUrl)
      } catch (error) {
        console.error('Error generating QR code:', error)
      }
    }

    generateQR()
  }, [participant])

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

  return (
    <div className="max-w-md mx-auto">
      <TextCard title="EVENT TICKET" className="text-center">
        <div className="space-y-4">
          {/* QR Code */}
          {qrCodeDataUrl && (
            <div className="flex justify-center mb-4">
              <div className="bg-white p-4 rounded">
                <img 
                  src={qrCodeDataUrl} 
                  alt="Event Ticket QR Code" 
                  className="w-48 h-48"
                />
              </div>
            </div>
          )}

          {/* Reference Number */}
          <div className="border-b border-gray-600 pb-3">
            <TextHierarchy level={1} emphasis>
              REFERENCE: {participant.reference_number}
            </TextHierarchy>
          </div>

          {/* Event Info */}
          <div className="space-y-2">
            <TextHierarchy level={1} emphasis>
              {participant.event_title}
            </TextHierarchy>
            <TextHierarchy level={2} muted>
              📅 {formatDate(participant.event_date)}
            </TextHierarchy>
            {participant.event_location && (
              <TextHierarchy level={2} muted>
                📍 {participant.event_location}
              </TextHierarchy>
            )}
          </div>

          {/* Participant Info */}
          <div className="border-t border-gray-600 pt-3">
            <div className="flex items-center gap-3 mb-3">
              {/* Avatar */}
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-mono font-bold text-lg">
                {getInitials(participant.full_name)}
              </div>
              <div>
                <TextHierarchy level={1} emphasis>
                  {participant.full_name}
                </TextHierarchy>
                <TextHierarchy level={2} muted>
                  {participant.email}
                </TextHierarchy>
              </div>
            </div>

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

          {/* Registration Date */}
          <div className="border-t border-gray-600 pt-3">
            <TextHierarchy level={2} muted>
              Registered: {formatDate(participant.registration_date)}
            </TextHierarchy>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center pt-3">
            <TextBadge variant="success">
              CONFIRMED
            </TextBadge>
          </div>
        </div>
      </TextCard>
    </div>
  )
}
