'use client'

import { useState } from 'react'
import { createTicket, Ticket } from '@/lib/repositories/tickets'
import TextCard from '@/components/ui/TextCard'
import TextButton from '@/components/ui/TextButton'
import TextHierarchy from '@/components/ui/TextHierarchy'
import TextBadge from '@/components/ui/TextBadge'
import { sanitizeTurkishText } from '@/lib/validation'

interface TicketFormProps {
  onTicketCreated?: (ticket: Ticket) => void
  onCancel?: () => void
}

const TICKET_CATEGORIES = [
  { value: 'technical', label: 'Technical Issue' },
  { value: 'onboarding', label: 'Onboarding Help' },
  { value: 'account', label: 'Account Problem' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'other', label: 'Other' }
]

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'default' },
  { value: 'medium', label: 'Medium', color: 'warning' },
  { value: 'high', label: 'High', color: 'error' },
  { value: 'urgent', label: 'Urgent', color: 'error' }
]

export default function TicketForm({ onTicketCreated, onCancel }: TicketFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'technical' as Ticket['category'],
    priority: 'medium' as Ticket['priority']
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      if (!formData.title.trim() || !formData.description.trim()) {
        setError('Please fill in all required fields')
        setIsSubmitting(false)
        return
      }

      const { data, error } = await createTicket({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority
      })

      if (error) {
        setError(error.message || 'Failed to create ticket')
      } else if (data) {
        setSuccess('Ticket created successfully!')
        setFormData({
          title: '',
          description: '',
          category: 'technical',
          priority: 'medium'
        })
        
        if (onTicketCreated) {
          onTicketCreated(data)
        }
      }
    } catch (error) {
      console.error('Error creating ticket:', error)
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    const sanitized = field === 'title' ? sanitizeTurkishText(value) : (field === 'description' ? sanitizeTurkishText(value) : value)
    setFormData(prev => ({
      ...prev,
      [field]: sanitized
    }))
  }

  return (
    <TextCard title="CREATE SUPPORT TICKET">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <TextHierarchy level={1} emphasis className="mb-2">
            TITLE *
          </TextHierarchy>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Brief description of your issue"
            className="w-full px-4 py-2 border border-black bg-white text-black font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={255}
            disabled={isSubmitting}
          />
        </div>

        {/* Category */}
        <div>
          <TextHierarchy level={1} emphasis className="mb-2">
            CATEGORY *
          </TextHierarchy>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {TICKET_CATEGORIES.map(category => (
              <button
                key={category.value}
                type="button"
                onClick={() => handleInputChange('category', category.value)}
                className={`
                  px-3 py-2 border font-mono text-xs transition-colors
                  ${formData.category === category.value
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-black hover:bg-gray-100'
                  }
                `}
                disabled={isSubmitting}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div>
          <TextHierarchy level={1} emphasis className="mb-2">
            PRIORITY
          </TextHierarchy>
          <div className="flex gap-2">
            {PRIORITY_LEVELS.map(priority => (
              <button
                key={priority.value}
                type="button"
                onClick={() => handleInputChange('priority', priority.value)}
                className={`
                  px-3 py-2 border font-mono text-xs transition-colors
                  ${formData.priority === priority.value
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-black hover:bg-gray-100'
                  }
                `}
                disabled={isSubmitting}
              >
                {priority.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <TextHierarchy level={1} emphasis className="mb-2">
            DESCRIPTION *
          </TextHierarchy>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Please provide detailed information about your issue, including steps to reproduce if applicable..."
            rows={6}
            className="w-full px-4 py-2 border border-black bg-white text-black font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
            disabled={isSubmitting}
          />
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <TextHierarchy level={2} className="text-red-600">
              {error}
            </TextHierarchy>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <TextHierarchy level={2} className="text-green-600">
              {success}
            </TextHierarchy>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <TextButton
            type="submit"
            variant="default"
            disabled={isSubmitting}
            className="px-6 py-2 w-full sm:w-auto"
          >
            {isSubmitting ? 'CREATING...' : 'CREATE TICKET'}
          </TextButton>
          
          {onCancel && (
            <TextButton
              type="button"
              variant="default"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-2 w-full sm:w-auto"
            >
              CANCEL
            </TextButton>
          )}
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded">
        <TextHierarchy level={2} muted className="mb-2">
          TICKET GUIDELINES:
        </TextHierarchy>
        <ul className="text-sm text-gray-600 space-y-1 font-mono">
          <li>• Be specific and detailed in your description</li>
          <li>• Include error messages or screenshots if applicable</li>
          <li>• Choose the most appropriate category and priority</li>
          <li>• We'll respond within 24 hours for urgent issues</li>
        </ul>
      </div>
    </TextCard>
  )
}
