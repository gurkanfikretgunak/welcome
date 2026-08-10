import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/owner')) {
    const accessToken = req.cookies.get('mf_welcome_access')?.value
    const role = req.cookies.get('mf_welcome_role')?.value.toLowerCase()
    if (!accessToken || !role || !['owner', 'admin'].includes(role)) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }
  return NextResponse.next()
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


