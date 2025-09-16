'use client'

import { useState } from 'react'
import TextButton from '@/components/ui/TextButton'
import TextHierarchy from '@/components/ui/TextHierarchy'

interface ExistingChecklistFormProps {
  checklist: any
  onSubmit: (checklistData: {
    title: string
    description?: string
    category: string
    required: boolean
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

export default function ExistingChecklistForm({ checklist, onSubmit, onCancel }: ExistingChecklistFormProps) {
  const [formData, setFormData] = useState({
    title: checklist?.title || '',
    description: checklist?.description || '',
    category: checklist?.category || 'onboarding',
    required: checklist?.required || false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSubmit(formData)
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

      {/* Required Checkbox */}
      <div>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={formData.required}
            onChange={(e) => handleInputChange('required', e.target.checked)}
            className="w-4 h-4"
            disabled={isSubmitting}
          />
          <TextHierarchy level={1} emphasis>
            REQUIRED CHECKLIST ITEM
          </TextHierarchy>
        </label>
        <div className="text-xs text-gray-500 mt-1 ml-7">
          Required items must be completed before proceeding to next steps
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
          {isSubmitting ? 'UPDATING...' : 'UPDATE CHECKLIST'}
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

      {/* Warning Message */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <TextHierarchy level={2} className="mb-2 text-yellow-800">
          ⚠️ IMPORTANT NOTICE:
        </TextHierarchy>
        <div className="text-sm text-yellow-700 font-mono">
          <p className="mb-2">This is an existing checklist item that requires code changes to update permanently.</p>
          <p>Your changes will be logged but may require developer intervention to take effect.</p>
        </div>
      </div>
    </form>
  )
}
