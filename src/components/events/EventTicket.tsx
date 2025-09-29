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
  hideAvatar?: boolean
  enableShare?: boolean
}

export default function EventTicket({ participant, hideAvatar = false, enableShare = false }: EventTicketProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [showShare, setShowShare] = useState(false)

  // Generate QR code (encode public ticket view URL)
  useEffect(() => {
    const generateQR = async () => {
      try {
        const base = (typeof window !== 'undefined')
          ? window.location.origin
          : (process.env.NEXT_PUBLIC_SITE_URL || '')
        const qrUrl = `${base}/ticketview/${participant.reference_number}`
        
        const qrCodeUrl = await QRCode.toDataURL(qrUrl, {
          width: 220,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
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

  const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || '')
  const ticketUrl = `${origin}/ticketview/${participant.reference_number}`
  const dateStr = new Date(participant.event_date).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  const shareText = `${participant.full_name} will attend "${participant.event_title}" on ${dateStr}. View the digital ticket here:`
  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(ticketUrl)}`
  const linkedinUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(ticketUrl)}&title=${encodeURIComponent(participant.event_title)}`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + ticketUrl)}`

  return (
    <div className="max-w-md mx-auto">
      <TextCard title="EVENT TICKET" className="text-center">
        <div className="space-y-4">
          {/* QR Code */}
          {qrCodeDataUrl && (
            <div className="flex justify-center mb-4">
              <div className="bg-white p-3 rounded border border-gray-300">
                <img
                  src={qrCodeDataUrl}
                  alt="Event Ticket QR Code"
                  className="w-52 h-52"
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
          <div className="border-t border-gray-600 pt-3 text-left">
            <div className="flex items-center gap-3 mb-3">
              {!hideAvatar && (
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-mono font-bold text-lg">
                  {getInitials(participant.full_name)}
                </div>
              )}
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

          {enableShare && (
            <div className="pt-2">
              <button
                className="border border-black bg-white px-3 py-2 font-mono text-xs hover:bg-black hover:text-white"
                onClick={() => setShowShare(true)}
              >
                SHARE TICKET
              </button>
              {showShare && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }} onClick={() => setShowShare(false)}>
                  <div className="bg-white border border-black p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-mono font-bold text-sm tracking-wider">SHARE TICKET</h3>
                      <button className="border border-black px-2 py-1 text-xs font-mono" onClick={() => setShowShare(false)}>CLOSE</button>
                    </div>
                    <div className="space-y-3">
                      <a className="block border border-black px-3 py-2 font-mono text-sm hover:bg-black hover:text-white" href={xUrl} target="_blank" rel="noopener noreferrer">Share on X</a>
                      <a className="block border border-black px-3 py-2 font-mono text-sm hover:bg-black hover:text-white" href={linkedinUrl} target="_blank" rel="noopener noreferrer">Share on LinkedIn</a>
                      <a className="block border border-black px-3 py-2 font-mono text-sm hover:bg-black hover:text-white" href={whatsappUrl} target="_blank" rel="noopener noreferrer">Share on WhatsApp</a>
                      <button
                        className="w-full border border-black px-3 py-2 font-mono text-sm hover:bg-black hover:text-white"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(ticketUrl)
                            alert('Link copied to clipboard')
                          } catch {
                            prompt('Copy ticket URL:', ticketUrl)
                          }
                        }}
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </TextCard>
    </div>
  )
}
