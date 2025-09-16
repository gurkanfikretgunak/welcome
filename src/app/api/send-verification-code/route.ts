import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, userId } = await request.json()
    
    if (!email || !email.includes('@masterfabric.co')) {
      return NextResponse.json(
        { error: 'Valid MasterFabric email required' },
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
        verification_expires: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error storing verification code:', updateError)
      return NextResponse.json(
        { error: 'Failed to generate verification code' },
        { status: 500 }
      )
    }

    // In a real implementation, you would send the email here
    // For now, we'll just log it
    console.log(`📧 Verification code for ${email}: ${verificationCode}`)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Verification code sent',
      // In development, return the code for testing
      ...(process.env.NODE_ENV === 'development' && { code: verificationCode })
    })
    
  } catch (error) {
    console.error('Error sending verification code:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
