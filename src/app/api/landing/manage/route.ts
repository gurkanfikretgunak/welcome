import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import {
  getAllLandingPages,
  createLandingPage,
  updateLandingPage,
  deleteLandingPage,
  setActiveLandingPage
} from '@/lib/repositories/landing'

/**
 * GET /api/landing/manage - Get all landing pages (owner only)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify owner access - try both cookie and header auth
    const cookieStore = await cookies()
    const authHeader = request.headers.get('Authorization')
    
    let supabase
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Use header-based auth if provided
      supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key',
        {
          global: {
            headers: {
              Authorization: authHeader
            }
          },
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
    } else {
      // Use cookie-based auth
      supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key',
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
    }

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('is_owner')
      .eq('id', user.id)
      .single()

    if (!profile?.is_owner) {
      return NextResponse.json({ error: 'Forbidden - Owner only' }, { status: 403 })
    }

    // Get all landing pages directly with authenticated supabase client
    const { data, error } = await supabase
      .from('landing_pages')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching landing pages:', error)
      console.error('Error details:', error.message, error.details, error.hint)
      return NextResponse.json(
        { 
          error: 'Failed to fetch landing pages',
          details: error.message,
          hint: error.hint,
          code: error.code
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ landingPages: data || [] })
  } catch (error) {
    console.error('Error in landing manage API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/landing/manage - Create new landing page (owner only)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify owner access - try both cookie and header auth
    const cookieStore = await cookies()
    const authHeader = request.headers.get('Authorization')
    
    let supabase
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Use header-based auth if provided
      supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key',
        {
          global: {
            headers: {
              Authorization: authHeader
            }
          },
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
    } else {
      // Use cookie-based auth
      supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key',
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
    }

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('is_owner')
      .eq('id', user.id)
      .single()

    if (!profile?.is_owner) {
      return NextResponse.json({ error: 'Forbidden - Owner only' }, { status: 403 })
    }

    const body = await request.json()
    const { title, subtitle, is_active } = body

    if (!title || !subtitle) {
      return NextResponse.json(
        { error: 'Title and subtitle are required' },
        { status: 400 }
      )
    }

    // Create landing page directly with authenticated supabase client
    const { data, error } = await supabase
      .from('landing_pages')
      .insert([{
        title,
        subtitle,
        is_active: is_active || false
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating landing page:', error)
      console.error('Error details:', error.message, error.details, error.hint)
      return NextResponse.json(
        { 
          error: 'Failed to create landing page',
          details: error.message,
          hint: error.hint,
          code: error.code
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ landingPage: data }, { status: 201 })
  } catch (error) {
    console.error('Error in landing manage API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/landing/manage - Update landing page (owner only)
 */
export async function PATCH(request: NextRequest) {
  try {
    // Verify owner access
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key',
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

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('is_owner')
      .eq('id', user.id)
      .single()

    if (!profile?.is_owner) {
      return NextResponse.json({ error: 'Forbidden - Owner only' }, { status: 403 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Landing page ID is required' },
        { status: 400 }
      )
    }

    // Handle set active action
    if (updates.setActive) {
      const { error } = await setActiveLandingPage(id)
      
      if (error) {
        console.error('Error setting active landing page:', error)
        return NextResponse.json(
          { error: 'Failed to set active landing page' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true })
    }

    const { data, error } = await updateLandingPage(id, updates)

    if (error) {
      console.error('Error updating landing page:', error)
      return NextResponse.json(
        { error: 'Failed to update landing page' },
        { status: 500 }
      )
    }

    return NextResponse.json({ landingPage: data })
  } catch (error) {
    console.error('Error in landing manage API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/landing/manage - Delete landing page (owner only)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify owner access
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key',
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

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('is_owner')
      .eq('id', user.id)
      .single()

    if (!profile?.is_owner) {
      return NextResponse.json({ error: 'Forbidden - Owner only' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Landing page ID is required' },
        { status: 400 }
      )
    }

    const { error } = await deleteLandingPage(id)

    if (error) {
      console.error('Error deleting landing page:', error)
      return NextResponse.json(
        { error: 'Failed to delete landing page' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in landing manage API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

