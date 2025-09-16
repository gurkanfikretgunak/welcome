'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { updateUserProfile } from '@/lib/supabase'
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

export default function SettingsPage() {
  const { user, userProfile, loading, signOut, refreshProfile } = useAuth()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    department: '',
    master_email: '',
    personal_email: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showSignOutDialog, setShowSignOutDialog] = useState(false)
  
  // Navigation useEffect - all hooks must be at the top
  useEffect(() => {
    if (!user) {
      router.push('/')
    }
  }, [user, router])
  
  // Update form data when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setFormData({
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        phone: userProfile.phone || '',
        department: userProfile.department || '',
        master_email: userProfile.master_email || '',
        personal_email: userProfile.personal_email || ''
      })
    }
  }, [userProfile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!user) {
      setError('Authentication required')
      return
    }

    // Validate MasterFabric email if changed
    if (formData.master_email !== userProfile?.master_email) {
      if (!formData.master_email.endsWith('@masterfabric.co')) {
        setError('Email must be a valid @masterfabric.co address')
        return
      }
    }

    setIsSubmitting(true)

    try {
      const { error: updateError } = await updateUserProfile(user.id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        department: formData.department,
        master_email: formData.master_email,
        personal_email: formData.personal_email
      })

      if (updateError) {
        setError(updateError.message)
      } else {
        await refreshProfile()
        setSuccess('Profile updated successfully')
      }
    } catch (err) {
      setError('Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignOutClick = () => {
    setShowSignOutDialog(true)
  }

  const handleSignOutConfirm = async () => {
    setShowSignOutDialog(false)
    await signOut()
    router.push('/')
  }

  const handleSignOutCancel = () => {
    setShowSignOutDialog(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <TextBadge variant="muted">LOADING...</TextBadge>
      </div>
    )
  }

  // Show loading or null while redirecting
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <TextBadge variant="warning">REDIRECTING...</TextBadge>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar user={userProfile} onSignOut={signOut} />
      
      <PageLayout
        title="SETTINGS"
        subtitle="Account & Profile Management"
      >
        <TextCard title="ACCOUNT INFORMATION">
          <TextHierarchy level={1}>
            <TextBadge variant="muted">USER ID</TextBadge> {user.id}
          </TextHierarchy>
          <TextHierarchy level={1}>
            <TextBadge variant="muted">GITHUB USERNAME</TextBadge> {userProfile?.github_username || 'N/A'}
          </TextHierarchy>
          <TextHierarchy level={1}>
            <TextBadge variant="muted">REGISTRATION DATE</TextBadge> {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'N/A'}
          </TextHierarchy>
          <TextHierarchy level={1}>
            <TextBadge variant={userProfile?.is_owner ? "success" : "muted"}>ROLE</TextBadge> {userProfile?.is_owner ? 'Owner' : 'Developer'}
          </TextHierarchy>
        </TextCard>

        <TextCard title="PROFILE SETTINGS">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <TextHierarchy level={1} emphasis className="mb-2">
                MASTERFABRIC EMAIL {userProfile?.is_verified ? <span className="text-green-600">(verified)</span> : ''}
              </TextHierarchy>
              <input
                type="email"
                value={formData.master_email}
                onChange={(e) => setFormData(prev => ({ ...prev, master_email: e.target.value }))}
                className="w-full p-3 border border-black font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
              <TextHierarchy level={2} muted className="mt-1">
                Must be a valid @masterfabric.co email address
              </TextHierarchy>
            </div>

            <div>
              <TextHierarchy level={1} emphasis className="mb-2">
                PERSONAL EMAIL
              </TextHierarchy>
              <input
                type="email"
                value={formData.personal_email}
                onChange={(e) => setFormData(prev => ({ ...prev, personal_email: e.target.value }))}
                placeholder="your.personal@email.com"
                className="w-full p-3 border border-black font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
              />
              <TextHierarchy level={2} muted className="mt-1">
                Optional - Your personal email address for notifications
              </TextHierarchy>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <TextHierarchy level={1} emphasis className="mb-2">
                  FIRST NAME
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
                  LAST NAME
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
            </div>

            <div>
              <TextHierarchy level={1} emphasis className="mb-2">
                DEPARTMENT / ROLE
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

            {error && (
              <TextCard variant="error">
                <TextHierarchy level={1}>
                  <TextBadge variant="error">ERROR</TextBadge> {error}
                </TextHierarchy>
              </TextCard>
            )}

            {success && (
              <TextCard variant="success">
                <TextHierarchy level={1}>
                  <TextBadge variant="success">SUCCESS</TextBadge> {success}
                </TextHierarchy>
              </TextCard>
            )}

            <div className="flex justify-center">
              <TextButton
                type="submit"
                variant="success"
                disabled={isSubmitting}
                className="px-8 py-3"
              >
                {isSubmitting ? 'UPDATING PROFILE...' : 'SAVE CHANGES'}
              </TextButton>
            </div>
          </form>
        </TextCard>

        <div className="border border-black p-6 bg-white">
          <TextHierarchy level={1} emphasis className="mb-4">
            SESSION MANAGEMENT
          </TextHierarchy>
          
          <TextHierarchy level={1} muted className="mb-4">
            Signing out will end your current session and redirect you to the login page.
          </TextHierarchy>
          
          <div className="flex justify-center">
            <TextButton
              onClick={handleSignOutClick}
              variant="error"
              className="px-8 py-3"
            >
              SIGN OUT
            </TextButton>
          </div>
        </div>

        <TextCard variant="muted">
          <TextHierarchy level={1} muted>
            Profile changes are saved immediately and will be reflected across the system.
            Contact IT support if you need assistance with account-related issues.
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


      {/* Sign Out Confirmation Dialog */}
      {showSignOutDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-white border border-black p-6 max-w-md w-full mx-4">
            <TextHierarchy level={1} emphasis className="mb-4">
              CONFIRM SIGN OUT
            </TextHierarchy>
            
            <TextHierarchy level={1} muted className="mb-6">
              Are you sure you want to sign out? This will end your current session and redirect you to the login page.
            </TextHierarchy>
            
            <div className="flex gap-4 justify-end">
              <TextButton
                onClick={handleSignOutCancel}
                variant="default"
                className="px-6 py-2"
              >
                CANCEL
              </TextButton>
              
              <TextButton
                onClick={handleSignOutConfirm}
                variant="error"
                className="px-6 py-2"
              >
                SIGN OUT
              </TextButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
