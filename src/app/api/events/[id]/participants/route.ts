import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/events/[id]/participants - Get event participants (owner only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('👥 Fetching participants for event:', id)
    
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

    // Get participants for the event
    const { data, error } = await supabase
      .from('event_participants')
      .select('*')
      .eq('event_id', id)
      .order('registration_date', { ascending: false })

    if (error) {
      console.error('❌ Fetch participants error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ Participants fetched successfully:', data?.length || 0)
    return NextResponse.json({ participants: data || [] })
  } catch (error) {
    console.error('❌ Fetch participants exception:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
