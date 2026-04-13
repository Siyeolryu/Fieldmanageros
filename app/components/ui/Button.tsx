import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'danger' | 'ghost' | 'outline' | 'premium' | 'glass'
  size?: 'sm' | 'md' | 'lg' | 'full'
  isLoading?: boolean
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  isLoading,
  disabled,
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl active:scale-95'
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 focus:ring-blue-500',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 focus:ring-emerald-500',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-500/20 focus:ring-rose-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
    outline: 'bg-transparent border-2 border-gray-100 text-gray-700 hover:border-blue-600 hover:text-blue-600 focus:ring-blue-500 backdrop-blur-sm',
    premium: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:opacity-90 shadow-xl shadow-purple-500/30 focus:ring-purple-500 border-none',
    glass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 focus:ring-white/50 shadow-sm',
  }

  const sizes = {
    sm: 'h-9 px-4 text-sm',
    md: 'min-h-[44px] px-6 py-2.5 text-base',
    lg: 'h-14 px-8 text-lg',
    full: 'w-full min-h-[48px] px-6 text-base',
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-current" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          처리 중...
        </span>
      ) : children}
    </button>
  )
}

export default Button
