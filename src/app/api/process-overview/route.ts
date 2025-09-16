import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'content', 'process-overview.md')
    const fileContent = readFileSync(filePath, 'utf8')
    
    // Parse markdown content into steps array
    const lines = fileContent.split('\n')
    const steps: Array<{ title: string; items: string[] }> = []
    let currentStep: { title: string; items: string[] } | null = null
    
    for (const line of lines) {
      if (line.startsWith('## STEP')) {
        if (currentStep) {
          steps.push(currentStep)
        }
        currentStep = {
          title: line.replace('## ', '').trim(),
          items: []
        }
      } else if (line.startsWith('→') && currentStep) {
        currentStep.items.push(line.replace('→', '').trim())
      }
    }
    
    if (currentStep) {
      steps.push(currentStep)
    }
    
    console.log('✅ Process overview loaded from process-overview.md')
    return NextResponse.json({ steps })
  } catch (error) {
    console.error('Error loading process overview:', error)
    return NextResponse.json(
      { error: 'Failed to load process overview' },
      { status: 500 }
    )
  }
}
