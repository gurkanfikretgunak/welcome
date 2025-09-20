import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
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

    // Public, no-auth table suggestion: app_versions(version text, created_at timestamp)
    // Must have RLS policy allowing anon SELECT.
    const { data, error } = await supabase
      .from('app_versions')
      .select('version')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!error && data?.version) {
      return NextResponse.json({ version: data.version })
    }

    // Fallbacks if table missing or no row
    const ver = process.env.VERCEL_GIT_COMMIT_SHA
      || process.env.NEXT_PUBLIC_VERCEL_URL
      || `${Date.now()}`

    return NextResponse.json({ version: ver })
  } catch (e) {
    const ver = process.env.VERCEL_GIT_COMMIT_SHA
      || process.env.NEXT_PUBLIC_VERCEL_URL
      || `${Date.now()}`
    return NextResponse.json({ version: ver })
  }
}


