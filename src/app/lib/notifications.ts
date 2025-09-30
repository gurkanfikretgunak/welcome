export async function sendEmailNotification(payload: {
  to: string | string[]
  subject: string
  html?: string
  type?: 'verification_code' | 'generic'
  data?: any
}) {
  try {
    const res = await fetch('/api/notifications/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error || `Email send failed: ${res.status}`)
    }
    return await res.json()
  } catch (error) {
    console.error('Notification send failed:', error)
    return null
  }
}

export function absoluteUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || ''
  if (!base) return path
  return base.endsWith('/') ? `${base.slice(0, -1)}${path}` : `${base}${path}`
}


