'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { updateUserProfile } from '@/lib/repositories/users'
import Navbar from '@/components/layout/Navbar'
import PageLayout from '@/components/layout/PageLayout'
import TextCard from '@/components/ui/TextCard'
import TextButton from '@/components/ui/TextButton'
import TextHierarchy from '@/components/ui/TextHierarchy'
import TextBadge from '@/components/ui/TextBadge'

const DEPARTMENTS = [
  'Frontend Development',
  'Backend Development',
  'Full Stack Development',
  'DevOps Engineering',
  'Mobile Development',
  'UI/UX Design',
  'Product Management',
  'Quality Assurance',
  'Data Engineering',
  'System Administration',
  'Other'
]

export default function ProfilePage() {
  const { user, userProfile, loading, signOut, refreshProfile } = useAuth()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    department: '',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (userProfile) {
      setFormData({
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        phone: userProfile.phone || '',
        department: userProfile.department || '',
        notes: ''
      })
    }
  }, [userProfile])
  
  // Navigation useEffect - keep all useEffects together
  useEffect(() => {
    if (!user || !userProfile?.master_email) {
      router.push('/')
    }
  }, [user, userProfile, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!user) {
      setError('Authentication required')
      return
    }

    if (!formData.first_name || !formData.last_name || !formData.department) {
      setError('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      const { error: updateError } = await updateUserProfile(user.id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        department: formData.department
      })

      if (updateError) {
        setError(updateError.message)
      } else {
        await refreshProfile()
        router.push('/checklist')
      }
    } catch (err) {
      setError('Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <TextBadge variant="muted">LOADING...</TextBadge>
      </div>
    )
  }

  // This useEffect has been moved up to keep all hooks together
  
  // Show loading or null while redirecting
  if (!user || !userProfile?.master_email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <TextBadge variant="warning">REDIRECTING...</TextBadge>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {userProfile && <Navbar user={userProfile} onSignOut={signOut} />}
      
      <PageLayout
        title="PROFILE INFORMATION"
        subtitle="Step 3 of 4 - Personal Details"
      >
        <TextCard title="CURRENT STATUS">
          <TextHierarchy level={1}>
            <TextBadge variant="success">AUTHENTICATED</TextBadge> GitHub OAuth completed
          </TextHierarchy>
          <TextHierarchy level={1}>
            <TextBadge variant="success">EMAIL VERIFIED</TextBadge> {userProfile.master_email}
          </TextHierarchy>
          <TextHierarchy level={1}>
            <TextBadge variant="warning">PROFILE PENDING</TextBadge> Complete personal information
          </TextHierarchy>
        </TextCard>

        <TextCard title="PROFILE FORM">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <TextHierarchy level={1} emphasis className="mb-2">
                  FIRST NAME *
                </TextHierarchy>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  className="w-full p-3 border border-black font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <div>
                <TextHierarchy level={1} emphasis className="mb-2">
                  LAST NAME *
                </TextHierarchy>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  className="w-full p-3 border border-black font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>
            </div>

            <div>
              <TextHierarchy level={1} emphasis className="mb-2">
                PHONE NUMBER
              </TextHierarchy>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+90 555 123 45 67"
                className="w-full p-3 border border-black font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
              />
              <TextHierarchy level={2} muted className="mt-1">
                Optional - for internal communications
              </TextHierarchy>
            </div>

            <div>
              <TextHierarchy level={1} emphasis className="mb-2">
                DEPARTMENT / ROLE *
              </TextHierarchy>
              <select
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                className="w-full p-3 border border-black font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                required
              >
                <option value="">Select your department</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <TextHierarchy level={1} emphasis className="mb-2">
                ADDITIONAL NOTES
              </TextHierarchy>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional information about your role, skills, or onboarding requirements..."
                rows={4}
                className="w-full p-3 border border-black font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black resize-none"
              />
              <TextHierarchy level={2} muted className="mt-1">
                Optional - helps HR and your team prepare for your integration
              </TextHierarchy>
            </div>

            {error && (
              <TextCard variant="error">
                <TextHierarchy level={1}>
                  <TextBadge variant="error">ERROR</TextBadge> {error}
                </TextHierarchy>
              </TextCard>
            )}

            <div className="flex justify-center">
              <TextButton
                type="submit"
                variant="success"
                disabled={isSubmitting || !formData.first_name || !formData.last_name || !formData.department}
                className="px-8 py-3"
              >
                {isSubmitting ? 'SAVING PROFILE...' : 'CONTINUE TO CHECKLIST →'}
              </TextButton>
            </div>
          </form>
        </TextCard>

        <TextCard variant="muted">
          <TextHierarchy level={1} muted>
            * Required fields must be completed to proceed to the onboarding checklist.
            All information will be kept confidential and used only for internal processes.
          </TextHierarchy>
        </TextCard>
      </PageLayout>
    </div>
  )
}
