import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@app/lib/email/resend'
import React from 'react'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, html, type, data } = body || {}

    if (!to || !subject) {
      return NextResponse.json({ error: 'to and subject are required' }, { status: 400 })
    }

    // Simple raw HTML email fallback
    if (html) {
      const element = React.createElement('div', { dangerouslySetInnerHTML: { __html: String(html) } as any })
      const { id, error } = await sendEmail({ to, subject, react: element as any })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ id })
    }

    // Template-based emails
    if (type === 'verification_code') {
      const { VerificationCodeEmail } = await import('@app/lib/email/templates/VerificationCodeEmail')
      const { code, email } = data || {}
      if (!code || !email) {
        return NextResponse.json({ error: 'verification code and email required' }, { status: 400 })
      }
      const element = React.createElement(VerificationCodeEmail as any, { code, email })
      const { id, error } = await sendEmail({ to, subject, react: element as any })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ id })
    }

    return NextResponse.json({ error: 'unsupported email type' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}


