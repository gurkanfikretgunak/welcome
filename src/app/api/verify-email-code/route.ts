import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { code, userId } = await request.json()
    
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
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
      .select('verification_code, verification_email, verification_expires')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('Error fetching user data:', userError)
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      )
    }

    const storedCode = userData?.verification_code
    const verificationEmail = userData?.verification_email
    const verificationExpires = userData?.verification_expires

    if (!storedCode || !verificationEmail || !verificationExpires) {
      return NextResponse.json(
        { error: 'No verification code found' },
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
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating user profile:', updateError)
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

    return NextResponse.json({ 
      success: true, 
      message: 'Email verified successfully' 
    })
    
  } catch (error) {
    console.error('Error verifying code:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
