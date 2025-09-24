interface TextBadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'muted'
  className?: string
  blinking?: boolean
  rgbEffect?: boolean
}

export default function TextBadge({ children, variant = 'default', className = '', blinking = false, rgbEffect = false }: TextBadgeProps) {
  const variantClass = {
    default: '',
    success: 'success',
    warning: 'warning',
    error: 'error',
    muted: 'muted'
  }[variant]

  const classes = ['info-badge', variantClass]
  if (blinking) classes.push('blinking')
  if (rgbEffect) classes.push('rgb-text')
  if (className) classes.push(className)

  return <span className={classes.filter(Boolean).join(' ')}>{children}</span>
}
