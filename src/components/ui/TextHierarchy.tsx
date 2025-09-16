interface TextHierarchyProps {
  level: 1 | 2 | 3 | 4
  children: React.ReactNode
  emphasis?: boolean
  muted?: boolean
  className?: string
}

export default function TextHierarchy({ 
  level, 
  children, 
  emphasis = false, 
  muted = false, 
  className = '' 
}: TextHierarchyProps) {
  const levelClasses = {
    1: 'hierarchy-1',
    2: 'hierarchy-2', 
    3: 'hierarchy-3',
    4: 'hierarchy-4'
  }

  const emphasisClass = emphasis ? 'emphasis' : ''
  const mutedClass = muted ? 'muted' : ''

  return (
    <div className={`${levelClasses[level]} ${emphasisClass} ${mutedClass} ${className}`}>
      {children}
    </div>
  )
}
