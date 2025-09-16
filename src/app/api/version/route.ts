import { NextResponse } from 'next/server'

export async function GET() {
  // Prefer Vercel commit SHA when available; fallback to build time or process start time
  const ver = process.env.VERCEL_GIT_COMMIT_SHA
    || process.env.NEXT_PUBLIC_VERCEL_URL
    || (global as any).__APP_START_TIME__
    || `${Date.now()}`

  return NextResponse.json({ version: ver })
}


