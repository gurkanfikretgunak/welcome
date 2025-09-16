'use client'

import { useState } from 'react'
import { DynamicChecklist } from '@/lib/supabase'
import TextButton from '@/components/ui/TextButton'
import TextHierarchy from '@/components/ui/TextHierarchy'
import TextBadge from '@/components/ui/TextBadge'

interface DynamicChecklistFormProps {
  checklist?: DynamicChecklist | null
  onSubmit: (checklistData: {
    title: string
    description?: string
    category: string
    is_global: boolean
  }) => void
  onCancel: () => void
}

const CHECKLIST_CATEGORIES = [
  'onboarding',
  'development',
  'reporting',
  'communication',
  'documentation',
  'quality',
  'training',
  'general'
]

export default function DynamicChecklistForm({ checklist, onSubmit, onCancel }: DynamicChecklistFormProps) {
  const [formData, setFormData] = useState({
    title: checklist?.title || '',
    description: checklist?.description || '',
    category: checklist?.category || 'general',
    is_global: checklist?.is_global || false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Validate form data
      if (!formData.title.trim()) {
        setError('Title is required')
        return
      }
      
      if (!formData.category) {
        setError('Category is required')
        return
      }

      await onSubmit(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <TextHierarchy level={2} className="text-red-800 mb-2">
            ❌ ERROR:
          </TextHierarchy>
          <div className="text-sm text-red-700 font-mono">
            {error}
          </div>
        </div>
      )}

      {/* Title */}
      <div>
        <TextHierarchy level={1} emphasis className="mb-2">
          TITLE *
        </TextHierarchy>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Checklist item title"
          className="w-full px-4 py-2 border border-black bg-white text-black font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxLength={255}
          disabled={isSubmitting}
          required
        />
      </div>

      {/* Description */}
      <div>
        <TextHierarchy level={1} emphasis className="mb-2">
          DESCRIPTION
        </TextHierarchy>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Optional description for this checklist item"
          rows={3}
          className="w-full px-4 py-2 border border-black bg-white text-black font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
          disabled={isSubmitting}
        />
      </div>

      {/* Category */}
      <div>
        <TextHierarchy level={1} emphasis className="mb-2">
          CATEGORY *
        </TextHierarchy>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {CHECKLIST_CATEGORIES.map(category => (
            <button
              key={category}
              type="button"
              onClick={() => handleInputChange('category', category)}
              className={`
                px-3 py-2 border font-mono text-xs transition-colors capitalize
                ${formData.category === category
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-black hover:bg-gray-100'
                }
              `}
              disabled={isSubmitting}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Global Checkbox */}
      <div>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={formData.is_global}
            onChange={(e) => handleInputChange('is_global', e.target.checked)}
            className="w-4 h-4"
            disabled={isSubmitting}
          />
          <TextHierarchy level={1} emphasis>
            GLOBAL CHECKLIST
          </TextHierarchy>
        </label>
        <div className="text-xs text-gray-500 mt-1 ml-7">
          Global checklists are available to all users by default
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <TextButton
          type="submit"
          variant="default"
          disabled={isSubmitting || !formData.title.trim()}
          className="px-6 py-2"
        >
          {isSubmitting ? 'SAVING...' : (checklist ? 'UPDATE CHECKLIST' : 'CREATE CHECKLIST')}
        </TextButton>
        
        <TextButton
          type="button"
          variant="default"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-2"
        >
          CANCEL
        </TextButton>
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded">
        <TextHierarchy level={2} muted className="mb-2">
          CHECKLIST GUIDELINES:
        </TextHierarchy>
        <ul className="text-sm text-gray-600 space-y-1 font-mono">
          <li>• Use clear, actionable titles</li>
          <li>• Choose appropriate categories for organization</li>
          <li>• Global checklists are assigned to all users automatically</li>
          <li>• Custom checklists can be assigned to specific users</li>
        </ul>
      </div>
    </form>
  )
}
