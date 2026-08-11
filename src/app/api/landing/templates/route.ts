import { NextResponse } from 'next/server'

// particular-welcome does not currently expose component-template entities.
export async function GET() {
  return NextResponse.json({ templates: [] })
}

export async function POST() {
  return NextResponse.json(
    { error: 'Component templates are not supported by the current welcome Particular' },
    { status: 501 }
  )
}
