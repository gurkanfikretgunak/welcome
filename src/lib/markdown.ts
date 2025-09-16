import fs from 'fs'
import path from 'path'

export interface ProcessStep {
  title: string
  items: string[]
}

export async function getWelcomeText(): Promise<string> {
  try {
    const filePath = path.join(process.cwd(), 'content', 'welcome.md')
    const fileContent = fs.readFileSync(filePath, 'utf8')
    return fileContent
  } catch (error) {
    console.error('Error reading welcome text:', error)
    throw new Error('Failed to load welcome text from markdown file')
  }
}

export async function getProcessOverview(): Promise<ProcessStep[]> {
  try {
    const filePath = path.join(process.cwd(), 'content', 'process-overview.md')
    const fileContent = fs.readFileSync(filePath, 'utf8')
    
    return parseProcessOverview(fileContent)
  } catch (error) {
    console.error('Error reading process overview:', error)
    throw new Error('Failed to load process overview from markdown file')
  }
}

function parseProcessOverview(content: string): ProcessStep[] {
  const lines = content.split('\n').filter(line => line.trim() !== '')
  const steps: ProcessStep[] = []
  let currentStep: ProcessStep | null = null

  for (const line of lines) {
    const trimmedLine = line.trim()
    
    // Skip main title
    if (trimmedLine.startsWith('# ')) {
      continue
    }
    
    // Check for step headers (## STEP X: ...)
    if (trimmedLine.startsWith('## STEP ')) {
      // Save previous step if exists
      if (currentStep) {
        steps.push(currentStep)
      }
      
      // Create new step
      currentStep = {
        title: trimmedLine.replace('## ', ''),
        items: []
      }
    }
    // Check for step items (→ ... or - ...)
    else if ((trimmedLine.startsWith('→ ') || trimmedLine.startsWith('- ')) && currentStep) {
      currentStep.items.push(trimmedLine)
    }
  }
  
  // Add the last step
  if (currentStep) {
    steps.push(currentStep)
  }
  
  return steps
}

// Client-side version for static generation
export function parseProcessOverviewClient(content: string): ProcessStep[] {
  return parseProcessOverview(content)
}
