import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { captureException, captureMessage } from '@/lib/sentry'
import { sendEmail } from '@app/lib/email/resend'
import { VerificationCodeEmail } from '@app/lib/email/templates/VerificationCodeEmail'
import React from 'react'

export async function POST(request: NextRequest) {
  try {
    const { email, userId, isInternship } = await request.json()
    
    if (!email || !email.includes('@masterfabric.co')) {
      return NextResponse.json(
        { error: 'Valid MasterFabric email required' },
        { status: 400 }
      )
    }

    // Check internship email format if it's an internship verification
    if (isInternship && !email.startsWith('internship.')) {
      return NextResponse.json(
        { error: 'Internship emails must start with "internship." (e.g., internship.johndoe@masterfabric.co)' },
        { status: 400 }
      )
    }
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key',
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Use the provided userId instead of getting from session
    console.log('Using userId:', userId)

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Store verification code in users table
    const { error: updateError } = await supabase
      .from('users')
      .update({
        verification_code: verificationCode,
        verification_email: email,
        verification_expires: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
        is_internship: isInternship || false
      })
      .eq('id', userId)

    if (updateError) {
      captureException(updateError, {
        tags: { api: 'send-verification-code', operation: 'store_code' },
        extra: { userId, email, isInternship }
      })
      return NextResponse.json(
        { error: 'Failed to generate verification code' },
        { status: 500 }
      )
    }

    // Send verification email
    const emailType = isInternship ? 'Internship' : 'Standard'
    const element = React.createElement(VerificationCodeEmail as any, { code: verificationCode, email })
    const { error: emailError } = await sendEmail({ to: email, subject: `${emailType} verification code`, react: element as any })
    if (emailError) {
      captureException(emailError, {
        tags: { api: 'send-verification-code', operation: 'email_send' },
        extra: { userId, email, isInternship }
      })
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      )
    }
    
    captureMessage(`Verification code sent to ${email}`, {
      level: 'info',
      tags: { api: 'send-verification-code', emailType },
      extra: { userId, email }
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Verification code sent'
    })
    
  } catch (error) {
    captureException(error, {
      tags: { api: 'send-verification-code', operation: 'send' },
      extra: { method: 'POST' }
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
