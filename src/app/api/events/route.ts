import { NextRequest, NextResponse } from 'next/server'
import { getRequestAccessToken } from '@/lib/mf/client'
import { getPublishedEvents } from '@/lib/repositories/events'

/**
 * GET /api/events - Published events for the public home page.
 */
export async function GET(request: NextRequest) {
  try {
    const token = getRequestAccessToken(request)
    if (!token) {
      return NextResponse.json({ events: [] })
    }

    const { data, error } = await getPublishedEvents(token)
    if (error) {
      console.error('Error fetching events:', error)
      return NextResponse.json({ events: [] })
    }

    return NextResponse.json({ events: data ?? [] })
  } catch (error) {
    console.error('Error in events API:', error)
    return NextResponse.json({ events: [] })
  }
}
