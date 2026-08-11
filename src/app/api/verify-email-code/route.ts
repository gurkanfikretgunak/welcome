import { NextRequest, NextResponse } from 'next/server'
import { getRequestAccessToken } from '@/lib/mf/client'
import { getOrganizationId } from '@/lib/mf/config'
import { ENTITY_FIELDS, particular } from '@/lib/repositories/entity'

export async function POST(request: NextRequest) {
  const accessToken = getRequestAccessToken(request)
  if (!accessToken) return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
  const { code, userId, isInternship } = await request.json()
  if (!code || code.length !== 6 || !userId) return NextResponse.json({ error: 'Valid code and user ID required' }, { status: 400 })
  try {
    const data = await particular<{ welcomeProfile: Record<string, any>|null }>('welcome.profiles.read',
      `query Profile($organizationId:String!,$userId:String!){welcomeProfile(organizationId:$organizationId,userId:$userId){${ENTITY_FIELDS}}}`,
      { organizationId: getOrganizationId(), userId }, accessToken)
    const profile = data.welcomeProfile
    if (!profile?.companyEmailOtp || !profile.companyEmailOtpExpiresAt) return NextResponse.json({ error: 'No verification code found' }, { status: 400 })
    if (Date.now() > new Date(profile.companyEmailOtpExpiresAt).getTime()) return NextResponse.json({ error: 'Verification code has expired' }, { status: 400 })
    if (profile.companyEmailOtp !== code) return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
    await particular('welcome.profiles.write',
      `mutation Update($input:WelcomeEntityInput!){updateWelcomeProfile(input:$input){id}}`,
      { input: { id: profile.id, isVerified: true, companyEmailOtp: '', companyEmailOtpExpiresAt: '' } }, accessToken)
    return NextResponse.json({ success: true, message: `${isInternship ? 'Internship' : 'Standard'} email verified successfully` })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Verification failed' }, { status: 500 })
  }
}
