import React from 'react'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@app/lib/email/resend'
import { VerificationCodeEmail } from '@app/lib/email/templates/VerificationCodeEmail'
import { getRequestAccessToken } from '@/lib/mf/client'
import { getOrganizationId } from '@/lib/mf/config'
import { ENTITY_FIELDS, particular } from '@/lib/repositories/entity'

export async function POST(request: NextRequest) {
  const accessToken = getRequestAccessToken(request)
  if (!accessToken) return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
  const { email, userId, isInternship } = await request.json()
  if (!email?.endsWith('@masterfabric.co')) return NextResponse.json({ error: 'Valid MasterFabric email required' }, { status: 400 })
  if (isInternship && !email.startsWith('internship.')) return NextResponse.json({ error: 'Internship emails must start with "internship."' }, { status: 400 })
  if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 })
  try {
    const current = await particular<{ welcomeProfile: Record<string, any>|null }>('welcome.profiles.read',
      `query Profile($organizationId:String!,$userId:String!){welcomeProfile(organizationId:$organizationId,userId:$userId){${ENTITY_FIELDS}}}`,
      { organizationId: getOrganizationId(), userId }, accessToken)
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    await particular('welcome.profiles.write',
      `mutation Update($input:WelcomeEntityInput!){upsertWelcomeProfile(input:$input){id}}`,
      { input: { id: current.welcomeProfile?.id, organizationId: getOrganizationId(), userId, masterEmail: email, isVerified: false, companyEmailOtp: code,
        companyEmailOtpExpiresAt: new Date(Date.now() + 600_000).toISOString() } }, accessToken)
    const react = React.createElement(VerificationCodeEmail as any, { code, email })
    const { error } = await sendEmail({ to: email, subject: `${isInternship ? 'Internship' : 'Standard'} verification code`, react: react as any })
    if (error) throw error
    return NextResponse.json({ success: true, message: 'Verification code sent' })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to send code' }, { status: 500 })
  }
}
