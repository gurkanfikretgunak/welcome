import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/events/participants/reference/[reference] - Get participant by reference number (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params
    console.log('🎫 Fetching participant by reference:', reference)
    
    const { data, error } = await supabase.rpc('get_participant_by_reference', {
      p_reference_number: reference
    })

    if (error) {
      console.error('❌ Get participant by reference error:', error)
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 })
    }

    const participantData = Array.isArray(data) ? data[0] : data

    if (!participantData) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 })
    }

    console.log('✅ Participant fetched successfully:', participantData.reference_number)
    return NextResponse.json({ participant: participantData })
  } catch (error) {
    console.error('❌ Get participant by reference exception:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
