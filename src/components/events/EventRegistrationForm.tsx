'use client'

import { useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import TextCard from '@/components/ui/TextCard'
import TextButton from '@/components/ui/TextButton'
import TextHierarchy from '@/components/ui/TextHierarchy'
import TextBadge from '@/components/ui/TextBadge'

interface Event {
  id: string
  title: string
  event_date: string
  location?: string
}

interface EventRegistrationFormProps {
  event: Event
  onSuccess: (registrationData: any) => void
  onCancel: () => void
}

export default function EventRegistrationForm({ event, onSuccess, onCancel }: EventRegistrationFormProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    title: '',
    company: '',
    gdpr_consent: false
  })
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.full_name || !formData.email || !formData.gdpr_consent) {
      setError('Full name, email, and GDPR consent are required')
      return
    }

    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA verification')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/events/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: event.id,
          ...formData,
          recaptcha_token: recaptchaToken
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      onSuccess(data.registration)
    } catch (err) {
      console.error('Registration error:', err)
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const eventDate = new Date(event.event_date)
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <TextCard title="EVENT REGISTRATION">
      <div className="space-y-4">
        {/* Event Info */}
        <div className="border-b border-gray-600 pb-4">
          <TextHierarchy level={1} emphasis>
            {event.title}
          </TextHierarchy>
          <TextHierarchy level={2} muted>
            📅 {formatDate(eventDate)}
          </TextHierarchy>
          {event.location && (
            <TextHierarchy level={2} muted>
              📍 {event.location}
            </TextHierarchy>
          )}
        </div>

        {/* GDPR Notice */}
        <div className="bg-yellow-900/20 border border-yellow-600 p-3 rounded">
          <TextHierarchy level={2} className="text-yellow-400">
            <TextBadge variant="warning">GDPR NOTICE</TextBadge>
          </TextHierarchy>
          <TextHierarchy level={2} muted className="mt-2">
            By registering for this event, you consent to the processing of your personal data 
            (name, email, title, company) for event management purposes. Your data will be 
            stored securely and used only for this event. You can request data deletion at any time.
          </TextHierarchy>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <TextHierarchy level={2} className="mb-2">
              FULL NAME *
            </TextHierarchy>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 bg-white border border-gray-600 text-black font-mono text-sm focus:border-green-500 focus:outline-none"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email */}
          <div>
            <TextHierarchy level={2} className="mb-2">
              EMAIL *
            </TextHierarchy>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 bg-white border border-gray-600 text-black font-mono text-sm focus:border-green-500 focus:outline-none"
              placeholder="Enter your email address"
            />
          </div>

          {/* Title */}
          <div>
            <TextHierarchy level={2} className="mb-2">
              TITLE (OPTIONAL)
            </TextHierarchy>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-white border border-gray-600 text-black font-mono text-sm focus:border-green-500 focus:outline-none"
              placeholder="e.g., Software Developer, Manager"
            />
          </div>

          {/* Company */}
          <div>
            <TextHierarchy level={2} className="mb-2">
              COMPANY (OPTIONAL)
            </TextHierarchy>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-white border border-gray-600 text-black font-mono text-sm focus:border-green-500 focus:outline-none"
              placeholder="Enter your company name"
            />
          </div>

          {/* GDPR Consent */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              name="gdpr_consent"
              checked={formData.gdpr_consent}
              onChange={handleInputChange}
              required
              className="mt-1 w-4 h-4 text-green-600 bg-black border-gray-600 rounded focus:ring-green-500"
            />
            <TextHierarchy level={2} muted>
              I consent to the processing of my personal data for this event registration *
            </TextHierarchy>
          </div>

          {/* reCAPTCHA */}
          <div className="flex justify-center">
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
              onChange={setRecaptchaToken}
              theme="dark"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-600 p-3 rounded">
              <TextHierarchy level={2} className="text-red-400">
                <TextBadge variant="error">ERROR</TextBadge> {error}
              </TextHierarchy>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <TextButton
              type="submit"
              variant="success"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'REGISTERING...' : 'REGISTER'}
            </TextButton>
            <TextButton
              type="button"
              variant="default"
              onClick={onCancel}
              disabled={loading}
            >
              CANCEL
            </TextButton>
          </div>
        </form>
      </div>
    </TextCard>
  )
}
