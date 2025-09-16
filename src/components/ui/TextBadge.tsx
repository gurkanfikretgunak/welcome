interface TextBadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'muted'
  className?: string
  blinking?: boolean
  rgbEffect?: boolean
}

export default function TextBadge({ children, variant = 'default', className = '', blinking = false, rgbEffect = false }: TextBadgeProps) {
  const variantClasses = {
    default: '',
    success: 'success',
    warning: 'warning', 
    error: 'error',
    muted: 'muted'
  }

  const animationClasses = [
    blinking ? 'blinking' : '',
    rgbEffect ? 'rgb-text' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={`info-badge ${variantClasses[variant]} ${animationClasses}`}>
      {children}
    </span>
  )
}
