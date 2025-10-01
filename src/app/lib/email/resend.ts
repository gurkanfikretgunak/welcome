import { Resend } from 'resend'
import { captureMessage } from '@/lib/sentry'

const resendApiKey = process.env.RESEND_API_KEY
const fromAddress = process.env.RESEND_FROM || 'no-reply@masterfabric.co'

if (!resendApiKey) {
  // Avoid throwing during build; fail fast at runtime when used
  captureMessage('RESEND_API_KEY is not set. Emails will not be sent.', {
    level: 'warning',
    tags: { module: 'email', provider: 'resend' },
  })
}

export const resend = resendApiKey ? new Resend(resendApiKey) : null

export async function sendEmail(params: {
  to: string | string[]
  subject: string
  react: React.ReactElement
  from?: string
}): Promise<{ id?: string; error?: Error | null }> {
  if (!resend) {
    return { error: new Error('RESEND_API_KEY is not configured') }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: params.from || fromAddress,
      to: params.to,
      subject: params.subject,
      react: params.react,
    })
    if (error) return { error }
    return { id: data?.id }
  } catch (error) {
    return { error: error as Error }
  }
}


