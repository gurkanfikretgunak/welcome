import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { captureException } from '@/lib/sentry'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      .update({
        title,
        description,
        date,
        hours: parseFloat(hours),
        project,
        category,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      captureException(error, {
        tags: { api: 'worklogs', operation: 'update' },
        extra: { userId: user.id, worklogId: id }
      })
      return NextResponse.json(
        { error: 'Failed to update worklog' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    captureException(error, {
      tags: { api: 'worklogs', operation: 'put' },
      extra: { method: 'PUT' }
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const { error } = await supabase
      .from('worklogs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      captureException(error, {
        tags: { api: 'worklogs', operation: 'delete' },
        extra: { userId: user.id, worklogId: id }
      })
      return NextResponse.json(
        { error: 'Failed to delete worklog' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    captureException(error, {
      tags: { api: 'worklogs', operation: 'delete_catch' },
      extra: { method: 'DELETE' }
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
