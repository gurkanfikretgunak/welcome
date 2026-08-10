import { NextRequest, NextResponse } from 'next/server'
import { getRequestAccessToken } from '@/lib/mf/client'
import { ENTITY_FIELDS, particular, toInput, toLegacy } from '@/lib/repositories/entity'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const accessToken = getRequestAccessToken(request)
  if (!accessToken) return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
  const { id } = await params
  const body = await request.json()
  try {
    const data = await particular<{ updateWorklog: Record<string, any> }>('welcome.worklogs.write',
      `mutation Update($input:WelcomeEntityInput!){updateWorklog(input:$input){${ENTITY_FIELDS}}}`,
      { input: toInput({ id, ...body, hours: Number(body.hours) }) }, accessToken)
    return NextResponse.json({ data: toLegacy(data.updateWorklog) })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update worklog' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const accessToken = getRequestAccessToken(request)
  if (!accessToken) return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
  try {
    const { id } = await params
    await particular('welcome.worklogs.write', `mutation Delete($id:String!){deleteWorklog(id:$id)}`, { id }, accessToken)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to delete worklog' }, { status: 500 })
  }
}
