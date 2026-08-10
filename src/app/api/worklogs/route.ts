import { NextRequest, NextResponse } from 'next/server'
import { getRequestAccessToken } from '@/lib/mf/client'
import { getOrganizationId } from '@/lib/mf/config'
import { ENTITY_FIELDS, particular, toInput, toLegacy } from '@/lib/repositories/entity'

export async function GET(request: NextRequest) {
  const accessToken = getRequestAccessToken(request)
  if (!accessToken) return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
  try {
    const data = await particular<{ worklogs: Record<string, any>[] }>('welcome.worklogs.read',
      `query Worklogs($organizationId:String!){worklogs(organizationId:$organizationId){${ENTITY_FIELDS}}}`,
      { organizationId: getOrganizationId() }, accessToken)
    return NextResponse.json({ data: data.worklogs.map((row) => toLegacy(row)) })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to fetch worklogs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const accessToken = getRequestAccessToken(request)
  if (!accessToken) return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
  const body = await request.json()
  if (!body.title || !body.date || body.hours === undefined) {
    return NextResponse.json({ error: 'Title, date, and hours are required' }, { status: 400 })
  }
  try {
    const data = await particular<{ createWorklog: Record<string, any> }>('welcome.worklogs.write',
      `mutation Create($input:WelcomeEntityInput!){createWorklog(input:$input){${ENTITY_FIELDS}}}`,
      { input: toInput({ ...body, hours: Number(body.hours), organizationId: getOrganizationId() }) }, accessToken)
    return NextResponse.json({ data: toLegacy(data.createWorklog) })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create worklog' }, { status: 500 })
  }
}
