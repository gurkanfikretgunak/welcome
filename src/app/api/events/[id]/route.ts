import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/events/[id] - Get specific event (public if published)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('📅 Fetching event:', id)
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('❌ Fetch event error:', error)
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    console.log('✅ Event fetched successfully:', data.id)
    return NextResponse.json({ event: data })
  } catch (error) {
    console.error('❌ Fetch event exception:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/events/[id] - Update event (owner only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('📅 Updating event:', id)
    
    const body = await request.json()
    const { title, description, event_date, location, max_participants, is_published } = body

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

    // Update event
    const { data, error } = await supabase
      .from('events')
      .update({
        title,
        description,
        event_date,
        location,
        max_participants,
        is_published,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Update event error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ Event updated successfully:', data.id)
    return NextResponse.json({ event: data })
  } catch (error) {
    console.error('❌ Update event exception:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/events/[id] - Delete event (owner only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('📅 Deleting event:', id)
    
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

    // Delete event (this will cascade delete participants due to foreign key)
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ Delete event error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ Event deleted successfully:', id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Delete event exception:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
