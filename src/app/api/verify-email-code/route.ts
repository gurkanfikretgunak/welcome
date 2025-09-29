import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { captureException, captureMessage } from '@/lib/sentry'

export async function POST(request: NextRequest) {
  try {
    const { code, userId, isInternship } = await request.json()
    
    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: 'Valid 6-digit code required' },
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

    // Get verification data from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('verification_code, verification_email, verification_expires, is_internship')
      .eq('id', userId)
      .single()

    if (userError) {
      captureException(userError, {
        tags: { api: 'verify-email-code', operation: 'fetch_user' },
        extra: { userId }
      })
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      )
    }

    const storedCode = userData?.verification_code
    const verificationEmail = userData?.verification_email
    const verificationExpires = userData?.verification_expires
    const storedIsInternship = userData?.is_internship

    if (!storedCode || !verificationEmail || !verificationExpires) {
      return NextResponse.json(
        { error: 'No verification code found' },
        { status: 400 }
      )
    }

    // Verify that the internship flag matches
    if (isInternship !== storedIsInternship) {
      return NextResponse.json(
        { error: 'Verification type mismatch' },
        { status: 400 }
      )
    }

    // Check if code has expired
    if (new Date() > new Date(verificationExpires)) {
      return NextResponse.json(
        { error: 'Verification code has expired' },
        { status: 400 }
      )
    }

    // Verify the code
    if (storedCode !== code) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Update user profile with verified email
    const { error: updateError } = await supabase
      .from('users')
      .update({
        master_email: verificationEmail,
        is_verified: true,
        is_internship: isInternship || false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      captureException(updateError, {
        tags: { api: 'verify-email-code', operation: 'update_profile' },
        extra: { userId, email: verificationEmail, isInternship }
      })
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    // Clear verification data from users table
    await supabase
      .from('users')
      .update({
        verification_code: null,
        verification_email: null,
        verification_expires: null
      })
      .eq('id', userId)

    const emailType = isInternship ? 'Internship' : 'Standard'
    console.log(`✅ ${emailType} email verified successfully for user ${userId}`)
    
    captureMessage(`Email verified successfully`, {
      level: 'info',
      tags: { api: 'verify-email-code', emailType },
      extra: { userId, email: verificationEmail }
    })
    
    return NextResponse.json({ 
      success: true, 
      message: `${emailType} email verified successfully` 
    })
    
  } catch (error) {
    captureException(error, {
      tags: { api: 'verify-email-code', operation: 'verify' },
      extra: { method: 'POST' }
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
