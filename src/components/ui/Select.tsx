'use client'
import { forwardRef, useId, SelectHTMLAttributes, ReactNode } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string
  error?: string
  options?: SelectOption[]
  children?: ReactNode
  fullWidth?: boolean
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  options,
  children,
  fullWidth = true,
  className = '',
  id: providedId,
  name: providedName,
  placeholder,
  ...props
}, ref) => {
  const generatedId = useId()
  const selectId = providedId || generatedId
  const selectName = providedName || (label ? label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') : selectId)

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label 
          htmlFor={selectId}
          className="block text-sm font-medium text-[#1C294E] mb-2"
        >
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        name={selectName}
        className={`
          w-full px-4 py-3 rounded-lg border-2 border-gray-200
          focus:border-[#079447] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#079447]/20
          transition-colors duration-200 bg-white appearance-none
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
          ${className}
        `}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options ? (
          options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))
        ) : (
          children
        )}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
})

Select.displayName = 'Select'
export default Select
