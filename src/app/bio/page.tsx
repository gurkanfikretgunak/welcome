'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { updateUserProfile } from '@/lib/repositories/users'
import Navbar from '@/components/layout/Navbar'
import { sanitizeTurkishName } from '@/lib/validation'
import PageLayout from '@/components/layout/PageLayout'
import TextCard from '@/components/ui/TextCard'
import TextButton from '@/components/ui/TextButton'
import TextHierarchy from '@/components/ui/TextHierarchy'
import TextBadge from '@/components/ui/TextBadge'

export default function BioPage() {
  const { user, userProfile, loading, profileLoading, signOut, refreshProfile } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    department: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Navigation
  useEffect(() => {
    if (loading) return
    
    if (!user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Load existing data
  useEffect(() => {
    if (userProfile) {
      setFormData({
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        phone: userProfile.phone || '',
        department: userProfile.department || ''
      })
    }
  }, [userProfile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    await updateUserProfile(user!.id, {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      phone: formData.phone.trim() || undefined,
      department: formData.department || undefined
    })

    await refreshProfile()
    router.push('/email')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <TextBadge variant="default">LOADING...</TextBadge>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen">
      {userProfile && <Navbar user={userProfile} onSignOut={signOut} />}

      <PageLayout
        title="BIO INFORMATION"
        subtitle="Personal Details Setup"
      >
        <TextCard title="CURRENT STATUS">
          <TextHierarchy level={1}>
            <TextBadge variant="success">AUTHENTICATED</TextBadge> GitHub OAuth completed
          </TextHierarchy>
          <TextHierarchy level={1}>
            <TextBadge variant="default">GITHUB USER</TextBadge> {user.user_metadata?.user_name || user.email}
          </TextHierarchy>
          <TextHierarchy level={1}>
            <TextBadge variant={userProfile?.first_name ? "success" : "warning"}>
              BIO INFORMATION
            </TextBadge> {userProfile?.first_name ? 'Completed' : 'Pending'}
          </TextHierarchy>
        </TextCard>

        <TextCard title="PERSONAL INFORMATION">
          <TextHierarchy level={1} className="mb-4">
            Please provide your personal information:
          </TextHierarchy>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <TextHierarchy level={2} className="mb-2">
                  First Name *
                </TextHierarchy>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: sanitizeTurkishName(e.target.value) })}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-sm font-mono"
                  placeholder="Enter your first name"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div>
                <TextHierarchy level={2} className="mb-2">
                  Last Name *
                </TextHierarchy>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: sanitizeTurkishName(e.target.value) })}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-sm font-mono"
                  placeholder="Enter your last name"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div>
              <TextHierarchy level={2} className="mb-2">
                Phone Number
              </TextHierarchy>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-sm font-mono"
                placeholder="Enter your phone number (optional)"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <TextHierarchy level={2} className="mb-2">
                Department
              </TextHierarchy>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-sm font-mono"
                disabled={isSubmitting}
              >
                <option value="">Select your department</option>
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Operations">Operations</option>
                <option value="HR">Human Resources</option>
                <option value="Finance">Finance</option>
                <option value="Other">Other</option>
              </select>
            </div>


            <div className="flex justify-center pt-4">
              <TextButton
                type="submit"
                variant="success"
                className="text-base px-8 py-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'SAVING...' : 'SAVE BIO → CONTINUE'}
              </TextButton>
            </div>
          </form>
        </TextCard>

        <TextCard title="INFORMATION">
          <TextHierarchy level={1} className="mb-3">
            <TextBadge variant="default">PURPOSE</TextBadge> Complete your personal profile information
          </TextHierarchy>
          <TextHierarchy level={1} className="mb-3">
            <TextBadge variant="default">REQUIRED</TextBadge> First name and last name are mandatory
          </TextHierarchy>
          <TextHierarchy level={1}>
            <TextBadge variant="default">NEXT STEP</TextBadge> Map your MasterFabric company email
          </TextHierarchy>
        </TextCard>
      </PageLayout>
    </div>
  )
}