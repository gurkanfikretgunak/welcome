'use client'

import { useState, useEffect } from 'react'
import { getUserTickets, Ticket } from '@/lib/supabase'
import TextCard from '@/components/ui/TextCard'
import TextButton from '@/components/ui/TextButton'
import TextHierarchy from '@/components/ui/TextHierarchy'
import TextBadge from '@/components/ui/TextBadge'

interface TicketListProps {
  showCreateButton?: boolean
  onCreateTicket?: () => void
}

const STATUS_COLORS = {
  open: 'warning',
  in_progress: 'default',
  resolved: 'success',
  closed: 'muted'
} as const

const PRIORITY_COLORS = {
  low: 'muted',
  medium: 'default',
  high: 'warning',
  urgent: 'error'
} as const

const CATEGORY_LABELS = {
  technical: 'Technical',
  onboarding: 'Onboarding',
  account: 'Account',
  bug: 'Bug',
  feature: 'Feature',
  other: 'Other'
} as const

export default function TicketList({ showCreateButton = true, onCreateTicket }: TicketListProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all')

  const loadTickets = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await getUserTickets()

      if (error) {
        setError(error.message || 'Failed to load tickets')
      } else {
        setTickets(data || [])
      }
    } catch (error) {
      console.error('Error loading tickets:', error)
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTickets()
  }, [])

  const getFilteredTickets = () => {
    if (filter === 'all') return tickets
    return tickets.filter(ticket => ticket.status === filter)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusStats = () => {
    const stats = {
      all: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      in_progress: tickets.filter(t => t.status === 'in_progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length
    }
    return stats
  }

  if (isLoading) {
    return (
      <TextCard title="MY TICKETS">
        <div className="flex items-center justify-center py-8">
          <TextBadge variant="muted">LOADING TICKETS...</TextBadge>
        </div>
      </TextCard>
    )
  }

  if (error) {
    return (
      <TextCard title="MY TICKETS">
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <TextHierarchy level={2} className="text-red-600">
            {error}
          </TextHierarchy>
          <TextButton
            onClick={loadTickets}
            variant="error"
            className="mt-2"
          >
            RETRY
          </TextButton>
        </div>
      </TextCard>
    )
  }

  const filteredTickets = getFilteredTickets()
  const stats = getStatusStats()

  return (
    <TextCard title="MY TICKETS">
      {/* Header with Create Button */}
      {showCreateButton && onCreateTicket && (
        <div className="flex justify-between items-center mb-6">
          <TextHierarchy level={1} emphasis>
            SUPPORT TICKETS
          </TextHierarchy>
          <TextButton
            onClick={onCreateTicket}
            variant="default"
            className="px-4 py-2"
          >
            CREATE TICKET
          </TextButton>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: 'ALL', count: stats.all },
          { key: 'open', label: 'OPEN', count: stats.open },
          { key: 'in_progress', label: 'IN PROGRESS', count: stats.in_progress },
          { key: 'resolved', label: 'RESOLVED', count: stats.resolved },
          { key: 'closed', label: 'CLOSED', count: stats.closed }
        ].map(option => (
          <button
            key={option.key}
            onClick={() => setFilter(option.key as any)}
            className={`
              px-3 py-1 border font-mono text-xs transition-colors
              ${filter === option.key
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-black hover:bg-gray-100'
              }
            `}
          >
            {option.label} ({option.count})
          </button>
        ))}
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="text-center py-8">
          <TextHierarchy level={1} muted>
            {filter === 'all' ? 'No tickets found' : `No ${filter} tickets found`}
          </TextHierarchy>
          {showCreateButton && onCreateTicket && (
            <TextButton
              onClick={onCreateTicket}
              variant="default"
              className="mt-4"
            >
              CREATE YOUR FIRST TICKET
            </TextButton>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTickets.map(ticket => (
            <div key={ticket.id} className="bg-white border-2 border-black p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-400">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <TextHierarchy level={1} emphasis className="text-lg mb-3 text-gray-900">
                    {ticket.title}
                  </TextHierarchy>
                  <div className="flex gap-2">
                    <TextBadge variant={STATUS_COLORS[ticket.status]} className="text-xs font-bold">
                      {ticket.status.toUpperCase()}
                    </TextBadge>
                    <TextBadge variant={PRIORITY_COLORS[ticket.priority]} className="text-xs font-bold">
                      {ticket.priority.toUpperCase()}
                    </TextBadge>
                  </div>
                </div>
              </div>

              {/* Category and Date */}
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-mono text-sm">CATEGORY:</span>
                  <TextBadge variant="default" className="text-xs">
                    {CATEGORY_LABELS[ticket.category]}
                  </TextBadge>
                </div>
                <div className="text-gray-500 font-mono text-xs">
                  {formatDate(ticket.created_at)}
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <div className="text-sm text-gray-600 font-mono mb-2">DESCRIPTION:</div>
                <div className="text-sm text-gray-800 bg-gray-50 p-4 border-l-4 border-gray-300 rounded-r-lg">
                  {ticket.description.length > 120 
                    ? `${ticket.description.substring(0, 120)}...` 
                    : ticket.description
                  }
                </div>
              </div>

              {/* Resolution Notes (if exists) */}
              {ticket.resolution_notes && (
                <div className="mb-4">
                  <div className="text-sm text-green-600 font-mono mb-2">RESOLUTION:</div>
                  <div className="text-sm text-green-800 bg-green-50 p-4 border-l-4 border-green-400 rounded-r-lg">
                    {ticket.resolution_notes}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 font-mono">
                  ID: {ticket.id.substring(0, 8)}...
                </div>
                {ticket.resolved_at && (
                  <div className="text-xs text-green-600 font-mono flex items-center gap-1">
                    <span className="text-green-500">✓</span>
                    {formatDate(ticket.resolved_at)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </TextCard>
  )
}
