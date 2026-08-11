import { getUserProfile } from './users'
export interface OtpCode {
  id: string; github_username: string|null; first_name: string|null; last_name: string|null
  verification_code: string; verification_email: string; verification_expires: string
  is_expired?: boolean; time_remaining?: number
}
export async function getActiveOtpCodes() {
  const profile = await getUserProfile()
  if (profile.error || !profile.data) return { data: [], error: profile.error }
  // OTP values are intentionally not returned by the profile compatibility model.
  return { data: [] as OtpCode[], error: null }
}


