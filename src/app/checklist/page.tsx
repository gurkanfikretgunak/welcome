'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { getChecklistStatus, updateChecklistStep } from '@/lib/supabase'
import { ONBOARDING_CHECKLIST, CATEGORY_LABELS, CATEGORY_DESCRIPTIONS, ChecklistItem } from '@/data/checklist'
import Navbar from '@/components/layout/Navbar'
import PageLayout from '@/components/layout/PageLayout'
import TextCard from '@/components/ui/TextCard'
import TextButton from '@/components/ui/TextButton'
import TextHierarchy from '@/components/ui/TextHierarchy'
import TextBadge from '@/components/ui/TextBadge'

interface ChecklistStatus {
  [key: string]: boolean
}

export default function ChecklistPage() {
  const { user, userProfile, loading, signOut } = useAuth()
  const router = useRouter()
  const [checklistStatus, setChecklistStatus] = useState<ChecklistStatus>({})
  const [isLoading, setIsLoading] = useState(true)
  const [updatingItem, setUpdatingItem] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadChecklistStatus()
    }
  }, [user])
  
  // Navigation
  useEffect(() => {
    if (!user) {
      router.push('/')
    } else if (userProfile && !userProfile.master_email) {
      router.push('/email')
    }
  }, [user, userProfile, router])

  const loadChecklistStatus = async () => {
    if (!user) return

    try {
      console.log('🔄 Loading checklist for user:', user.id)
      const { data, error } = await getChecklistStatus(user.id)
      if (error) {
        console.error('❌ Error loading checklist:', error)
        return
      }

      console.log('📋 Raw checklist data:', data)
      
      const statusMap: ChecklistStatus = {}
      data?.forEach(item => {
        console.log('📝 Processing item:', item.step_name, 'completed:', item.completed)
        statusMap[item.step_name] = item.completed
      })
      
      console.log('✅ Final status map:', statusMap)
      setChecklistStatus(statusMap)
    } catch (error) {
      console.error('❌ Error loading checklist:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleItem = async (itemId: string) => {
    if (!user || updatingItem) return

    console.log('🔄 Toggling item:', itemId, 'for user:', user.id)
    setUpdatingItem(itemId)
    const newStatus = !checklistStatus[itemId]
    console.log('📝 New status for', itemId, ':', newStatus)

    try {
      const { error } = await updateChecklistStep(user.id, itemId, newStatus)
      if (error) {
        console.error('❌ Error updating checklist:', error)
        return
      }

      console.log('✅ Checklist item updated successfully')
      setChecklistStatus(prev => ({
        ...prev,
        [itemId]: newStatus
      }))
    } catch (error) {
      console.error('❌ Error updating checklist:', error)
    } finally {
      setUpdatingItem(null)
    }
  }

  const getCompletionStats = () => {
    const totalItems = ONBOARDING_CHECKLIST.length
    const completedItems = Object.values(checklistStatus).filter(Boolean).length
    const requiredItems = ONBOARDING_CHECKLIST.filter(item => item.required).length
    const completedRequired = ONBOARDING_CHECKLIST
      .filter(item => item.required && checklistStatus[item.id])
      .length

    return {
      total: totalItems,
      completed: completedItems,
      required: requiredItems,
      completedRequired
    }
  }

  const groupedItems = ONBOARDING_CHECKLIST.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, ChecklistItem[]>)

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <TextBadge variant="default">LOADING CHECKLIST...</TextBadge>
      </div>
    )
  }

  // Show loading while redirecting
  if (!user || !userProfile?.master_email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <TextBadge variant="warning">REDIRECTING...</TextBadge>
      </div>
    )
  }

  const stats = getCompletionStats()

  return (
    <div className="min-h-screen">
      <Navbar user={userProfile} onSignOut={signOut} />
      
      <PageLayout
        title="ONBOARDING CHECKLIST"
        subtitle="Step 4 of 4 - Complete Integration Tasks"
      >
        <TextCard title="PROGRESS OVERVIEW">
          <TextHierarchy level={1}>
            <TextBadge variant="default">USER ID</TextBadge> {user?.id}
          </TextHierarchy>
          <TextHierarchy level={1}>
            <TextBadge variant="success">TOTAL PROGRESS</TextBadge> {stats.completed}/{stats.total} items completed
          </TextHierarchy>
          <TextHierarchy level={1}>
            <TextBadge variant={stats.completedRequired === stats.required ? "success" : "warning"}>
              REQUIRED TASKS
            </TextBadge> {stats.completedRequired}/{stats.required} required items completed
          </TextHierarchy>
          <TextHierarchy level={1}>
            <TextBadge variant="default">COMPLETION RATE</TextBadge> {Math.round((stats.completed / stats.total) * 100)}%
          </TextHierarchy>
        </TextCard>

        {Object.entries(groupedItems).map(([category, items]) => (
          <TextCard 
            key={category} 
            title={CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
          >
            <TextHierarchy level={1} muted className="mb-4">
              {CATEGORY_DESCRIPTIONS[category as keyof typeof CATEGORY_DESCRIPTIONS]}
            </TextHierarchy>

            <div className="space-y-4">
              {items.map(item => {
                const isCompleted = checklistStatus[item.id] || false
                const isUpdating = updatingItem === item.id

                return (
                  <div key={item.id} className="border-l-2 border-black pl-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <TextHierarchy level={2} emphasis={!isCompleted}>
                          <span className="mr-2">
                            {isCompleted ? '[✓]' : '[ ]'}
                          </span>
                          {item.title}
                          {item.required && (
                            <TextBadge variant="error" className="ml-2 text-xs">
                              REQUIRED
                            </TextBadge>
                          )}
                          {item.estimatedTime && (
                            <TextBadge variant="default" className="ml-2 text-xs">
                              {item.estimatedTime}
                            </TextBadge>
                          )}
                        </TextHierarchy>
                        <TextHierarchy level={3} muted className="mt-1">
                          {item.description}
                        </TextHierarchy>
                      </div>
                      <TextButton
                        onClick={() => handleToggleItem(item.id)}
                        variant={isCompleted ? "success" : "default"}
                        disabled={isUpdating}
                        className="ml-4 text-xs px-3 py-1"
                      >
                        {isUpdating ? 'UPDATING...' : isCompleted ? 'COMPLETED' : 'MARK DONE'}
                      </TextButton>
                    </div>
                  </div>
                )
              })}
            </div>
          </TextCard>
        ))}

        {stats.completedRequired === stats.required && (
          <TextCard variant="success">
            <TextHierarchy level={1} emphasis>
              <TextBadge variant="success">CONGRATULATIONS!</TextBadge>
            </TextHierarchy>
            <TextHierarchy level={2} className="mt-2">
              You have completed all required onboarding tasks. Welcome to the MasterFabric team!
            </TextHierarchy>
            <TextHierarchy level={2} muted className="mt-2">
              Continue working on optional tasks to complete your full integration.
            </TextHierarchy>
          </TextCard>
        )}

        <TextCard variant="default">
          <TextHierarchy level={1} muted>
            Click "MARK DONE" to toggle completion status for each task. 
            Required tasks must be completed for full system access.
          </TextHierarchy>
          <TextHierarchy level={1} muted>
            Contact your mentor or HR if you need assistance with any checklist items.
          </TextHierarchy>
        </TextCard>

        <div className="flex justify-center pt-8">
          <TextButton
            onClick={() => router.push('/worklog')}
            variant="default"
            className="px-8 py-3"
          >
            ← BACK TO WORKLOG
          </TextButton>
        </div>
      </PageLayout>
    </div>
  )
}
