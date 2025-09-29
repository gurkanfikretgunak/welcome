import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { captureException } from '@/lib/sentry'

export async function GET(request: NextRequest) {
  try {
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

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('worklogs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (error) {
      captureException(error, {
        tags: { api: 'worklogs', operation: 'fetch' },
        extra: { userId: user.id }
      })
      return NextResponse.json(
        { error: 'Failed to fetch worklogs' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    captureException(error, {
      tags: { api: 'worklogs', operation: 'get' },
      extra: { method: 'GET' }
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, description, date, hours, project, category } = body

    if (!title || !date || hours === undefined) {
      return NextResponse.json(
        { error: 'Title, date, and hours are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('worklogs')
      .insert({
        user_id: user.id,
        title,
        description,
        date,
        hours: parseFloat(hours),
        project,
        category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      captureException(error, {
        tags: { api: 'worklogs', operation: 'create' },
        extra: { userId: user.id, title }
      })
      return NextResponse.json(
        { error: 'Failed to create worklog' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    captureException(error, {
      tags: { api: 'worklogs', operation: 'post' },
      extra: { method: 'POST' }
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
