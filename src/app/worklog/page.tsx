'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import Navbar from '@/components/layout/Navbar'
import PageLayout from '@/components/layout/PageLayout'
import WorklogSection from '@/components/WorklogSection'

export default function WorklogPage() {
  const { user, userProfile, loading, signOut } = useAuth()
  const router = useRouter()

  // Redirect if not authenticated or not completed all steps
  const redirectedRef = useRef(false)
  useEffect(() => {
    if (redirectedRef.current) return
    if (loading) return

    if (!user) {
      redirectedRef.current = true
      router.replace('/')
      return
    }

    if (!userProfile) return // wait profile fully loads to avoid flicker

    if (!userProfile.master_email || !userProfile.first_name || !userProfile.last_name) {
      redirectedRef.current = true
      if (!userProfile.first_name || !userProfile.last_name) {
        router.replace('/bio')
      } else if (!userProfile.master_email) {
        router.replace('/email')
      }
      return
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
      {userProfile && <Navbar user={userProfile} onSignOut={signOut} />}
      <PageLayout title="WORKLOG">
        <WorklogSection />
      </PageLayout>
    </div>
  )
}
