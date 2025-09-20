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

export default function InternshipVerificationPage() {
  const { user, userProfile, loading, profileLoading, signOut, refreshProfile } = useAuth()
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
    if (loading) return
    
    if (!user) {
      router.push('/')
    }
  }, [user, loading, router])

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

      // Check if it's a valid internship email format
      if (!fullEmail.includes('@masterfabric.co')) {
        setError('Please enter a valid @masterfabric.co email address')
        setIsSubmitting(false)
        return
      }

      // Check if it's in internship format (internship.name@masterfabric.co)
      if (!fullEmail.startsWith('internship.')) {
        setError('Internship emails must start with "internship." (e.g., internship.johndoe@masterfabric.co)')
        setIsSubmitting(false)
        return
      }

      console.log('📧 Sending internship verification code to:', fullEmail)

      const response = await fetch('/api/send-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: fullEmail,
          userId: user!.id,
          isInternship: true
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send verification code')
        setIsSubmitting(false)
        return
      }

      console.log('✅ Internship verification code sent successfully')
      setSuccess('Internship verification code sent to your email!')
      setShowVerification(true)
      setIsSubmitting(false)
    } catch (error) {
      console.error('❌ Error sending internship verification code:', error)
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

      console.log('🔐 Verifying internship code:', verificationCode)

      const response = await fetch('/api/verify-email-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code: verificationCode,
          userId: user!.id,
          isInternship: true
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to verify code')
        setIsVerifying(false)
        return
      }

      console.log('✅ Internship email verified successfully')
      setSuccess('Internship email verified successfully! Redirecting...')

      // Refresh profile and redirect to worklog
      await refreshProfile()
      
      setTimeout(() => {
        window.location.href = '/worklog'
      }, 1000)
    } catch (error) {
      console.error('❌ Error verifying internship code:', error)
      setError('An unexpected error occurred. Please try again.')
      setIsVerifying(false)
    }
  }

  const handleBackToStandard = () => {
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
        title="INTERNSHIP PROGRAM"
        subtitle="Special Email Verification"
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
              INTERNSHIP EMAIL
            </TextBadge> {userProfile?.master_email || 'Not mapped yet'}
          </TextHierarchy>
        </TextCard>

        <TextCard title="INTERNSHIP EMAIL VERIFICATION">
          <TextHierarchy level={1} className="mb-4">
            Enter your internship email address for verification:
          </TextHierarchy>

          {!showVerification ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <TextHierarchy level={2} className="mb-2">
                  INTERNSHIP EMAIL:
                </TextHierarchy>
                <div className="flex items-center border border-gray-300 rounded px-3 py-2 bg-white">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="internship.yourname@masterfabric.co"
                    className="flex-1 outline-none text-sm font-mono"
                    disabled={isSubmitting}
                  />
                </div>
                <TextHierarchy level={3} muted className="mt-1">
                  Must be in format: internship.yourname@masterfabric.co
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
                  {isSubmitting ? 'SENDING CODE...' : 'SEND INTERNSHIP VERIFICATION CODE'}
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
                  Check your internship email for the verification code
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
            <TextBadge variant="default">PURPOSE</TextBadge> Special verification for internship program participants
          </TextHierarchy>
          <TextHierarchy level={1} className="mb-3">
            <TextBadge variant="default">FORMAT</TextBadge> Email must start with "internship." followed by your name
          </TextHierarchy>
          <TextHierarchy level={1} className="mb-3">
            <TextBadge variant="default">EXAMPLE</TextBadge> internship.johndoe@masterfabric.co
          </TextHierarchy>
          <TextHierarchy level={1}>
            <TextBadge variant="default">NEXT STEP</TextBadge> Complete the onboarding checklist
          </TextHierarchy>
        </TextCard>

        <TextCard title="NEED HELP?">
          <TextHierarchy level={1} className="mb-4">
            If you came here by mistake or need to use the standard MasterFabric email verification instead:
          </TextHierarchy>
          
          <div className="flex justify-center pt-2">
            <TextButton
              onClick={handleBackToStandard}
              variant="default"
              className="text-base px-6 py-3 border-2 border-dashed border-gray-400 hover:border-gray-600"
            >
              BACK TO STANDARD EMAIL VERIFICATION
            </TextButton>
          </div>
          
          <TextHierarchy level={3} muted className="mt-3 text-center">
            This will take you back to the regular MasterFabric email verification process.
          </TextHierarchy>
        </TextCard>
      </PageLayout>
    </div>
  )
}
