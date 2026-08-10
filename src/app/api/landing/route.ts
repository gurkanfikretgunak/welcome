import { NextRequest, NextResponse } from 'next/server'
import { getRequestAccessToken } from '@/lib/mf/client'
import { getActiveLandingPage } from '@/lib/repositories/landing'

/**
 * GET /api/landing - Get active landing page with sections (public-friendly).
 * Anonymous callers get null so the home page can fall back to static content.
 */
export async function GET(request: NextRequest) {
  try {
    const token = getRequestAccessToken(request)
    if (!token) {
      return NextResponse.json({ landingPage: null })
    }

    const { data, error } = await getActiveLandingPage(token)

    if (error) {
      console.error('Error fetching landing page:', error)
      return NextResponse.json({ landingPage: null })
    }

    return NextResponse.json({ landingPage: data })
  } catch (error) {
    console.error('Error in landing API:', error)
    return NextResponse.json({ landingPage: null })
  }
}
