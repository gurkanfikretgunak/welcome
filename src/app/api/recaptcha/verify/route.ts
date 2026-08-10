import { NextRequest, NextResponse } from 'next/server'
import { getRecaptchaSecretKey, isRecaptchaServerEnabled } from '@/lib/recaptcha'

/**
 * POST /api/recaptcha/verify
 * Body: { token: string }
 *
 * When RECAPTCHA_SECRET_KEY is unset, returns { ok: true, skipped: true }
 * so local/dev registration can proceed without Google keys.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const token = typeof body?.token === 'string' ? body.token.trim() : ''

    if (!isRecaptchaServerEnabled()) {
      return NextResponse.json({ ok: true, skipped: true })
    }

    if (!token) {
      return NextResponse.json({ ok: false, error: 'Missing captcha token' }, { status: 400 })
    }

    const params = new URLSearchParams({
      secret: getRecaptchaSecretKey(),
      response: token,
    })
    const remoteip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      ''
    if (remoteip) params.set('remoteip', remoteip)

    const googleRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      cache: 'no-store',
    })
    const result = (await googleRes.json()) as { success?: boolean; 'error-codes'?: string[] }

    if (!result.success) {
      return NextResponse.json(
        { ok: false, error: 'Captcha verification failed', codes: result['error-codes'] ?? [] },
        { status: 400 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('recaptcha verify error:', error)
    return NextResponse.json({ ok: false, error: 'Captcha verification error' }, { status: 500 })
  }
}
