import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/events/owner - Get all events for owner management
export async function GET() {
  try {
    console.log('📅 Fetching all events for owner')
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Verify user is owner
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('is_owner')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile?.is_owner) {
      return NextResponse.json({ error: 'Owner privileges required' }, { status: 403 })
    }

    // Get all events with participant count
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        participants:event_participants(count)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Fetch owner events error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Process data to include participant count
    const eventsWithCounts = data?.map(event => ({
      ...event,
      participant_count: event.participants?.[0]?.count || 0
    })) || []

    console.log('✅ Owner events fetched successfully:', eventsWithCounts.length)
    return NextResponse.json({ events: eventsWithCounts })
  } catch (error) {
    console.error('❌ Fetch owner events exception:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
