import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'content', 'welcome.md')
    const welcomeText = readFileSync(filePath, 'utf8').trim()
    
    console.log('✅ Welcome text loaded from welcome.md')
    return NextResponse.json({ welcomeText })
  } catch (error) {
    console.error('Error loading welcome text:', error)
    return NextResponse.json(
      { error: 'Failed to load welcome text' },
      { status: 500 }
    )
  }
}
