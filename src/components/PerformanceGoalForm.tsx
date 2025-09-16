'use client'

import { useState } from 'react'
import { User } from '@/lib/supabase'
import TextButton from '@/components/ui/TextButton'
import TextHierarchy from '@/components/ui/TextHierarchy'
import TextBadge from '@/components/ui/TextBadge'

interface PerformanceGoalFormProps {
  user: User | null
  onSubmit: (goalData: {
    target_hours: number
    target_story_points: number
    monthly_checklist: any[]
  }) => void
  onCancel: () => void
}

const DEFAULT_CHECKLIST_ITEMS = [
  { title: 'Complete all assigned tasks', completed: false },
  { title: 'Attend all team meetings', completed: false },
  { title: 'Submit weekly reports', completed: false },
  { title: 'Code review participation', completed: false },
  { title: 'Documentation updates', completed: false }
]

export default function PerformanceGoalForm({ user, onSubmit, onCancel }: PerformanceGoalFormProps) {
  const [formData, setFormData] = useState({
    target_hours: 160, // Default 40 hours/week * 4 weeks
    target_story_points: 20,
    monthly_checklist: DEFAULT_CHECKLIST_ITEMS
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

  const handleChecklistChange = (index: number, field: string, value: any) => {
    const newChecklist = [...formData.monthly_checklist]
    newChecklist[index] = { ...newChecklist[index], [field]: value }
    setFormData(prev => ({
      ...prev,
      monthly_checklist: newChecklist
    }))
  }

  const addChecklistItem = () => {
    setFormData(prev => ({
      ...prev,
      monthly_checklist: [...prev.monthly_checklist, { title: '', completed: false }]
    }))
  }

  const removeChecklistItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      monthly_checklist: prev.monthly_checklist.filter((_, i) => i !== index)
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* User Info */}
      {user && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded">
          <TextHierarchy level={2} emphasis className="mb-2">
            SETTING GOALS FOR:
          </TextHierarchy>
          <div className="flex gap-2">
            <TextBadge variant="default">
              {user.first_name} {user.last_name}
            </TextBadge>
            <TextBadge variant="muted">
              {user.department || 'No Department'}
            </TextBadge>
          </div>
        </div>
      )}

      {/* Target Hours */}
      <div>
        <TextHierarchy level={1} emphasis className="mb-2">
          TARGET HOURS (Monthly) *
        </TextHierarchy>
        <input
          type="number"
          value={formData.target_hours}
          onChange={(e) => handleInputChange('target_hours', parseInt(e.target.value) || 0)}
          min="0"
          max="400"
          className="w-full px-4 py-2 border border-black bg-white text-black font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        />
        <div className="text-xs text-gray-500 mt-1">
          Typical: 160 hours (40 hours/week × 4 weeks)
        </div>
      </div>

      {/* Target Story Points */}
      <div>
        <TextHierarchy level={1} emphasis className="mb-2">
          TARGET STORY POINTS (Monthly) *
        </TextHierarchy>
        <input
          type="number"
          value={formData.target_story_points}
          onChange={(e) => handleInputChange('target_story_points', parseInt(e.target.value) || 0)}
          min="0"
          max="100"
          className="w-full px-4 py-2 border border-black bg-white text-black font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        />
        <div className="text-xs text-gray-500 mt-1">
          Typical: 20-30 story points per month
        </div>
      </div>

      {/* Monthly Checklist */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <TextHierarchy level={1} emphasis>
            MONTHLY CHECKLIST
          </TextHierarchy>
          <button
            type="button"
            onClick={addChecklistItem}
            className="px-3 py-1 border border-black bg-white text-black font-mono text-xs hover:bg-black hover:text-white transition-colors"
            disabled={isSubmitting}
          >
            ADD ITEM
          </button>
        </div>
        
        <div className="space-y-2">
          {formData.monthly_checklist.map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={(e) => handleChecklistChange(index, 'completed', e.target.checked)}
                className="w-4 h-4"
                disabled={isSubmitting}
              />
              <input
                type="text"
                value={item.title}
                onChange={(e) => handleChecklistChange(index, 'title', e.target.value)}
                placeholder="Checklist item title..."
                className="flex-1 px-3 py-1 border border-gray-300 bg-white text-black font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => removeChecklistItem(index)}
                className="px-2 py-1 border border-red-300 bg-white text-red-600 font-mono text-xs hover:bg-red-50 transition-colors"
                disabled={isSubmitting}
              >
                REMOVE
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <TextButton
          type="submit"
          variant="default"
          disabled={isSubmitting}
          className="px-6 py-2"
        >
          {isSubmitting ? 'CREATING...' : 'CREATE GOALS'}
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
          PERFORMANCE GOALS GUIDELINES:
        </TextHierarchy>
        <ul className="text-sm text-gray-600 space-y-1 font-mono">
          <li>• Set realistic targets based on team capacity</li>
          <li>• Consider individual experience and role</li>
          <li>• Monthly checklist helps track additional responsibilities</li>
          <li>• Goals can be updated throughout the month</li>
        </ul>
      </div>
    </form>
  )
}
