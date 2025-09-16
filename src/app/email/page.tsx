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

export default function EmailPage() {
  const { user, userProfile, loading, signOut, refreshProfile } = useAuth()
  const router = useRouter()
  const [emailInput, setEmailInput] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Navigation
  useEffect(() => {
    if (!user) {
      router.push('/')
    } else if (user && !userProfile) {
      // Wait for user profile to load
      console.log('⏳ Waiting for user profile to load...')
    }
  }, [user, userProfile, router])

  // Load existing email if available
  useEffect(() => {
    if (userProfile?.master_email) {
      setEmailInput(userProfile.master_email.replace('@masterfabric.co', ''))
    }
  }, [userProfile])

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const fullEmail = emailInput.trim().includes('@') 
        ? emailInput.trim() 
        : `${emailInput.trim()}@masterfabric.co`

      if (!fullEmail.includes('@masterfabric.co')) {
        setError('Please enter a valid @masterfabric.co email address')
        setIsSubmitting(false)
        return
      }

      console.log('📧 Sending verification code to:', fullEmail)

      const response = await fetch('/api/send-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: fullEmail,
          userId: user!.id 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send verification code')
        setIsSubmitting(false)
        return
      }

      console.log('✅ Verification code sent successfully')
      setSuccess('Verification code sent to your email!')
      setShowVerification(true)
      setIsSubmitting(false)
    } catch (error) {
      console.error('❌ Error sending verification code:', error)
      setError('An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerifying(true)
    setError('')
    setSuccess('')

    try {
      if (!verificationCode.trim() || verificationCode.length !== 6) {
        setError('Please enter a valid 6-digit verification code')
        setIsVerifying(false)
        return
      }

      console.log('🔐 Verifying code:', verificationCode)

      const response = await fetch('/api/verify-email-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code: verificationCode,
          userId: user!.id 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to verify code')
        setIsVerifying(false)
        return
      }

      console.log('✅ Email verified successfully')
      setSuccess('Email verified successfully! Redirecting...')

      // Refresh profile and redirect to worklog
      await refreshProfile()
      
      setTimeout(() => {
        window.location.href = '/worklog'
      }, 1000)
    } catch (error) {
      console.error('❌ Error verifying code:', error)
      setError('An unexpected error occurred. Please try again.')
      setIsVerifying(false)
    }
  }

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <TextBadge variant="default">
          {loading ? 'LOADING...' : 'LOADING PROFILE...'}
        </TextBadge>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Navbar user={userProfile} onSignOut={signOut} />

      <PageLayout
        title="EMAIL MAPPING"
        subtitle="Email Verification"
      >
        <TextCard title="CURRENT STATUS">
          <TextHierarchy level={1}>
            <TextBadge variant="success">AUTHENTICATED</TextBadge> GitHub OAuth completed
          </TextHierarchy>
          <TextHierarchy level={1}>
            <TextBadge variant="default">GITHUB USER</TextBadge> {user.user_metadata?.user_name || user.email}
          </TextHierarchy>
          <TextHierarchy level={1}>
            <TextBadge variant={userProfile?.master_email ? "success" : "warning"}>
              EMAIL
            </TextBadge> {userProfile?.master_email || 'Not mapped yet'}
          </TextHierarchy>
        </TextCard>

        <TextCard title="MASTERFABRIC EMAIL VERIFICATION">
          <TextHierarchy level={1} className="mb-4">
            Enter your MasterFabric email address for verification:
          </TextHierarchy>

          {!showVerification ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <TextHierarchy level={2} className="mb-2">
                  MASTERFABRIC EMAIL:
                </TextHierarchy>
                <div className="flex items-center border border-gray-300 rounded px-3 py-2 bg-white">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="your.name@masterfabric.co"
                    className="flex-1 outline-none text-sm font-mono"
                    disabled={isSubmitting}
                  />
                </div>
                <TextHierarchy level={3} muted className="mt-1">
                  Must be a @masterfabric.co email address
                </TextHierarchy>
              </div>

              {error && (
                <div className="mt-4 p-3 border border-red-300 bg-red-50 rounded">
                  <TextHierarchy level={2} className="text-red-600">
                    <TextBadge variant="error">ERROR</TextBadge> {error}
                  </TextHierarchy>
                </div>
              )}

              {success && (
                <div className="mt-4 p-3 border border-green-300 bg-green-50 rounded">
                  <TextHierarchy level={2} className="text-green-600">
                    <TextBadge variant="success">SUCCESS</TextBadge> {success}
                  </TextHierarchy>
                </div>
              )}

              <div className="flex justify-center pt-4">
                <TextButton
                  type="submit"
                  variant="success"
                  className="text-base px-8 py-3"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'SENDING CODE...' : 'SEND VERIFICATION CODE'}
                </TextButton>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <TextHierarchy level={2} className="mb-2">
                  VERIFICATION CODE:
                </TextHierarchy>
                <div className="flex items-center border border-gray-300 rounded px-3 py-2 bg-white">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="flex-1 outline-none text-sm font-mono text-center"
                    disabled={isVerifying}
                  />
                </div>
                <TextHierarchy level={3} muted className="mt-1">
                  Check your email for the verification code
                </TextHierarchy>
              </div>

              {error && (
                <div className="mt-4 p-3 border border-red-300 bg-red-50 rounded">
                  <TextHierarchy level={2} className="text-red-600">
                    <TextBadge variant="error">ERROR</TextBadge> {error}
                  </TextHierarchy>
                </div>
              )}

              {success && (
                <div className="mt-4 p-3 border border-green-300 bg-green-50 rounded">
                  <TextHierarchy level={2} className="text-green-600">
                    <TextBadge variant="success">SUCCESS</TextBadge> {success}
                  </TextHierarchy>
                </div>
              )}

              <div className="flex gap-4 justify-center pt-4">
                <TextButton
                  onClick={() => {
                    setShowVerification(false)
                    setVerificationCode('')
                    setError('')
                    setSuccess('')
                  }}
                  variant="default"
                  className="text-base px-6 py-3"
                  disabled={isVerifying}
                >
                  BACK
                </TextButton>
                <TextButton
                  type="submit"
                  variant="success"
                  className="text-base px-6 py-3"
                  disabled={isVerifying}
                >
                  {isVerifying ? 'VERIFYING...' : 'VERIFY CODE'}
                </TextButton>
              </div>
            </form>
          )}
        </TextCard>

        <TextCard title="INFORMATION">
          <TextHierarchy level={1} className="mb-3">
            <TextBadge variant="default">PURPOSE</TextBadge> Link your GitHub account to your email
          </TextHierarchy>
          <TextHierarchy level={1} className="mb-3">
            <TextBadge variant="default">SECURITY</TextBadge> This email will be used for verification and access control
          </TextHierarchy>
          <TextHierarchy level={1}>
            <TextBadge variant="default">NEXT STEP</TextBadge> Complete the onboarding checklist
          </TextHierarchy>
        </TextCard>
      </PageLayout>
    </div>
  )
}