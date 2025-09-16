'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import PageLayout from '@/components/layout/PageLayout'
import WorklogSection from '@/components/WorklogSection'

export default function WorklogPage() {
  const { user, userProfile, loading, signOut } = useAuth()
  const router = useRouter()

  // Redirect if not authenticated or not completed all steps
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/')
        return
      }
      
      if (!userProfile?.master_email || !userProfile?.first_name || !userProfile?.last_name) {
        // Redirect to appropriate step
        if (!userProfile?.first_name || !userProfile?.last_name) {
          router.push('/bio')
        } else if (!userProfile?.master_email) {
          router.push('/email')
        }
        return
      }
    }
  }, [user, userProfile, loading, router])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-mono">LOADING...</div>
        </div>
      </div>
    )
  }

  // Show loading while redirecting
  if (!user || !userProfile?.master_email || !userProfile?.first_name || !userProfile?.last_name) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-mono">REDIRECTING...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar user={userProfile} onSignOut={signOut} />
      <PageLayout title="WORKLOG">
        <WorklogSection />
      </PageLayout>
    </div>
  )
}
