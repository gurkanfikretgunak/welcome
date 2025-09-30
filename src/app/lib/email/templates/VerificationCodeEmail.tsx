import * as React from 'react'

export function VerificationCodeEmail(props: { code: string; email: string }) {
  const { code, email } = props
  return (
    <div style={{ fontFamily: 'Inter, -apple-system, Segoe UI, Roboto, Arial, sans-serif', lineHeight: 1.6, color: '#0f172a' }}>
      <h2 style={{ margin: '0 0 12px' }}>Your MasterFabric verification code</h2>
      <p style={{ margin: '0 0 16px' }}>Hi, we received a request to verify the email <strong>{email}</strong>.</p>
      <p style={{ margin: '0 0 8px' }}>Use the following one-time code within 10 minutes:</p>
      <div style={{ display: 'inline-block', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 24, letterSpacing: 4, fontWeight: 700 }}>
        {code}
      </div>
      <p style={{ margin: '16px 0 0', fontSize: 12, color: '#475569' }}>If you didn’t request this, you can safely ignore this email.</p>
    </div>
  )
}


