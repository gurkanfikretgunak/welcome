interface TextButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'default' | 'success' | 'warning' | 'error'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

export default function TextButton({ 
  children, 
  onClick, 
  variant = 'default', 
  disabled = false,
  type = 'button',
  className = '' 
}: TextButtonProps) {
  const variantClasses = {
    default: 'border-black text-black hover:bg-black hover:text-white',
    success: 'text-green-600 border-green-600 hover:!bg-green-600 hover:!text-white hover:!border-green-600',
    warning: 'warning hover:bg-yellow-500 hover:text-white',
    error: 'error'
  }

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-block px-4 py-2 border font-mono font-medium
        transition-colors duration-200 text-sm uppercase tracking-wide
        ${variantClasses[variant]} ${disabledClasses} ${className}
      `}
    >
      {children}
    </button>
  )
}
