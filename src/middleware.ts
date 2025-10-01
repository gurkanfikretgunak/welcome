import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Only enforce owner-only routes here; leave other auth to page-level handling
  const ownerRoutes = ['/owner']
  const isOwnerRoute = ownerRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  // If accessing owner routes, check if user is owner
  if (isOwnerRoute && session) {
    try {
      const { data: userProfile } = await supabase
        .from('users')
        .select('is_owner')
        .eq('id', session.user.id)
        .single()

      if (!userProfile?.is_owner) {
        const redirectUrl = new URL('/', req.url)
        return NextResponse.redirect(redirectUrl)
      }
    } catch (error) {
      console.error('Error checking owner status:', error)
      const redirectUrl = new URL('/', req.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}


