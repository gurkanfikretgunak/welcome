import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/events/participants/email - Get participants by email (public)
export async function POST(request: NextRequest) {
  try {
    console.log('📧 Fetching participants by email')
    
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    const { data, error } = await supabase.rpc('get_participants_by_email', {
      p_email: email
    })

    if (error) {
      console.error('❌ Get participants by email error:', error)
      return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 })
    }

    console.log('✅ Participants fetched successfully:', data?.length || 0)
    return NextResponse.json({ participants: data || [] })
  } catch (error) {
    console.error('❌ Get participants by email exception:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
