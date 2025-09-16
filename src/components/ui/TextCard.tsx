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
    <div className={`info-card ${variantClasses[variant]} ${className} p-4 sm:p-6`}>
      {title && (
        <div className="emphasis mb-4 text-sm uppercase tracking-wider">
          {title}
        </div>
      )}
      <div className="whitespace-pre-line text-sm sm:text-base">
        {children}
      </div>
    </div>
  )
}
