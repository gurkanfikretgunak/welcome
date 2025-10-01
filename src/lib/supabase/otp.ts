import { supabase } from './client'

export interface OtpCode {
  id: string
  github_username: string | null
  first_name: string | null
  last_name: string | null
  verification_code: string
  verification_email: string
  verification_expires: string
  is_expired?: boolean
  time_remaining?: number
}

export async function getActiveOtpCodes(): Promise<{ data: OtpCode[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        github_username,
        first_name,
        last_name,
        verification_code,
        verification_email,
        verification_expires
      `)
      .not('verification_code', 'is', null)
      .order('verification_expires', { ascending: false })

    if (error) return { data: null, error }

    const now = new Date()
    const processedOtpData = (data || []).map((user: any) => ({
      ...user,
      is_expired: user.verification_expires ? new Date(user.verification_expires) < now : true,
      time_remaining: user.verification_expires ?
        Math.max(0, Math.floor((new Date(user.verification_expires).getTime() - now.getTime()) / 1000)) : 0
    }))

    return { data: processedOtpData, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}


