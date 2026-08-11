import { NextRequest, NextResponse } from 'next/server'
import { getAppUrl } from '@/lib/mf/config'
import { loginWithGitHub } from '@/lib/mf/auth-api'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  if (!code) return NextResponse.redirect(`${requestUrl.origin}/`)
  try {
    const payload = await loginWithGitHub(code, `${getAppUrl()}/auth/callback`)
    if (payload.otpRequired || !payload.accessToken || !payload.refreshToken) {
      return NextResponse.redirect(`${requestUrl.origin}/?error=otp_not_supported`)
    }
    const response = NextResponse.redirect(`${requestUrl.origin}/?auth_success=true`)
    const options = { path: '/', sameSite: 'lax' as const, secure: requestUrl.protocol === 'https:' }
    response.cookies.set('mf_welcome_access', payload.accessToken, options)
    response.cookies.set('mf_welcome_refresh', payload.refreshToken, options)
    response.cookies.set('mf_welcome_user', JSON.stringify(payload.user), options)
    response.cookies.set('mf_welcome_role', payload.user.role, options)
    return response
  } catch (error) {
    console.error('Auth callback failed:', error)
    return NextResponse.redirect(`${requestUrl.origin}/?error=auth_callback_failed`)
  }
}
