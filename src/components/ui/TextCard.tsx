interface TextCardProps {
  children: React.ReactNode
  title?: string
  variant?: 'default' | 'success' | 'warning' | 'error' | 'muted'
  className?: string
}

export default function TextCard({ children, title, variant = 'default', className = '' }: TextCardProps) {
  const variantClasses = {
    default: '',
    success: 'success',
    warning: 'warning',
    error: 'error',
    muted: 'muted'
  }

  return (
    <div className={`info-card ${variantClasses[variant]} ${className}`}>
      {title && (
        <div className="emphasis mb-4 text-sm uppercase tracking-wider">
          {title}
        </div>
      )}
      <div className="whitespace-pre-line">
        {children}
      </div>
    </div>
  )
}
