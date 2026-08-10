export const ACCESS_TOKEN_KEY = 'mf_welcome_access'
export const REFRESH_TOKEN_KEY = 'mf_welcome_refresh'
export const USER_KEY = 'mf_welcome_user'
export const ROLE_COOKIE_KEY = 'mf_welcome_role'

export interface MfUser {
  id: string
  email: string
  displayName: string
  avatarURL: string
  role: string
}

export interface MfSession {
  accessToken: string
  refreshToken: string
  user: MfUser
}

const readCookie = (name: string) => {
  if (typeof document === 'undefined') return null
  const prefix = `${name}=`
  const value = document.cookie.split('; ').find((part) => part.startsWith(prefix))
  return value ? decodeURIComponent(value.slice(prefix.length)) : null
}

export function readSession(): MfSession | null {
  if (typeof window === 'undefined') return null
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY) || readCookie(ACCESS_TOKEN_KEY)
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY) || readCookie(REFRESH_TOKEN_KEY)
  const rawUser = localStorage.getItem(USER_KEY) || readCookie(USER_KEY)
  if (!accessToken || !refreshToken || !rawUser) return null
  try {
    const user = JSON.parse(rawUser) as MfUser
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    return { accessToken, refreshToken, user }
  } catch {
    return null
  }
}

export function writeSession(session: MfSession) {
  if (typeof window === 'undefined') return
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken)
  localStorage.setItem(USER_KEY, JSON.stringify(session.user))
  const options = 'path=/; SameSite=Lax'
  document.cookie = `${ACCESS_TOKEN_KEY}=${encodeURIComponent(session.accessToken)}; ${options}`
  document.cookie = `${REFRESH_TOKEN_KEY}=${encodeURIComponent(session.refreshToken)}; ${options}`
  document.cookie = `${USER_KEY}=${encodeURIComponent(JSON.stringify(session.user))}; ${options}`
  document.cookie = `${ROLE_COOKIE_KEY}=${encodeURIComponent(session.user.role)}; ${options}`
}

export function clearSession() {
  if (typeof window === 'undefined') return
  ;[ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY].forEach((key) => localStorage.removeItem(key))
  ;[ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY, ROLE_COOKIE_KEY].forEach((key) => {
    document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
  })
}
