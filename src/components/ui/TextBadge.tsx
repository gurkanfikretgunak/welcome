import clsx from 'clsx'

interface TextBadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'muted'
  className?: string
  blinking?: boolean
  rgbEffect?: boolean
}

export default function TextBadge({ children, variant = 'default', className = '', blinking = false, rgbEffect = false }: TextBadgeProps) {
  return (
    <span
      className={clsx(
        'info-badge',
        {
          default: '',
          success: 'success',
          warning: 'warning',
          error: 'error',
          muted: 'muted'
        }[variant],
        blinking && 'blinking',
        rgbEffect && 'rgb-text',
        className
      )}
    >
      {children}
    </span>
  )
}
