import { NextRequest, NextResponse } from 'next/server'
import { getRequestAccessToken } from '@/lib/mf/client'
import { getOrganizationId } from '@/lib/mf/config'
import { particular } from '@/lib/repositories/entity'

export async function GET(request: NextRequest) {
  try {
    const data = await particular<{ appVersions: { version?: string; createdAt?: string }[] }>('welcome.graphql',
      `query Versions($organizationId:String!){appVersions(organizationId:$organizationId){version createdAt}}`,
      { organizationId: getOrganizationId() }, getRequestAccessToken(request))
    const latest = data.appVersions.sort((a,b)=>(b.createdAt??'').localeCompare(a.createdAt??''))[0]
    if (latest?.version) return NextResponse.json({ version: latest.version })
  } catch {}
  return NextResponse.json({ version: process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_VERCEL_URL || `${Date.now()}` })
}
