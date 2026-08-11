const PLACEHOLDERS = new Set([
  '',
  'your_recaptcha_site_key',
  'your_recaptcha_secret_key',
])

function clean(value?: string | null) {
  const trimmed = value?.trim() || ''
  return PLACEHOLDERS.has(trimmed) ? '' : trimmed
}

/** Public site key for the browser widget. Empty ⇒ captcha disabled. */
export function getRecaptchaSiteKey() {
  return clean(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY)
}

/** Server secret for Google siteverify. Empty ⇒ skip server verification. */
export function getRecaptchaSecretKey() {
  return clean(process.env.RECAPTCHA_SECRET_KEY)
}

export function isRecaptchaClientEnabled() {
  return getRecaptchaSiteKey().length > 0
}

export function isRecaptchaServerEnabled() {
  return getRecaptchaSecretKey().length > 0
}
