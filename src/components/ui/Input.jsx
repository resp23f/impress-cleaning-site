'use client'
import { forwardRef } from 'react'
const Input = forwardRef(({
  label,
  error,
  icon,
  type = 'text',
  placeholder,
  fullWidth = true,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-[#1C294E] mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
className={`
  w-full min-w-0 px-4 py-3 rounded-lg border-2 border-gray-200
              focus:border-[#079447] focus:outline-none focus:ring-2 focus:ring-[#079447]/20
            transition-all duration-200
            ${icon ? 'pl-12' : ''}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
})
Input.displayName = 'Input'
export default Input