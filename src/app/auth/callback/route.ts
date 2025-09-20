import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
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
    
    try {
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('❌ Auth callback error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/?error=auth_callback_failed`)
      }

      if (data.user) {
        console.log('✅ Auth callback success for user:', data.user.email)
        
        // Redirect to home with success parameter
        return NextResponse.redirect(`${requestUrl.origin}/?auth_success=true`)
      }
    } catch (error) {
      console.error('❌ Auth callback exception:', error)
      return NextResponse.redirect(`${requestUrl.origin}/?error=auth_callback_exception`)
    }
  }

  // If no code, redirect to home
  return NextResponse.redirect(`${requestUrl.origin}/`)
}
