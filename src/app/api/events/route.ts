import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/events - Get all published events (public)
export async function GET() {
  try {
    console.log('📅 Fetching published events')
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_published', true)
      .eq('is_active', true)
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })

    if (error) {
      console.error('❌ Fetch events error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ Events fetched successfully:', data?.length || 0)
    return NextResponse.json({ events: data || [] })
  } catch (error) {
    console.error('❌ Fetch events exception:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/events - Create new event (owner only)
export async function POST(request: NextRequest) {
  try {
    console.log('📅 Creating new event')
    
    const body = await request.json()
    const { title, description, event_date, location, max_participants } = body

    // Validate required fields
    if (!title || !event_date) {
      return NextResponse.json({ error: 'Title and event date are required' }, { status: 400 })
    }

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

    // Create event
    const { data, error } = await supabase
      .from('events')
      .insert({
        title,
        description: description || null,
        event_date,
        location: location || null,
        max_participants: max_participants || null,
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Create event error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ Event created successfully:', data.id)
    return NextResponse.json({ event: data }, { status: 201 })
  } catch (error) {
    console.error('❌ Create event exception:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
