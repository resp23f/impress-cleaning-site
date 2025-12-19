'use client'
import { forwardRef, useId, TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  fullWidth?: boolean
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  fullWidth = true,
  resize = 'vertical',
  className = '',
  id: providedId,
  name: providedName,
  rows = 4,
  ...props
}, ref) => {
  const generatedId = useId()
  const textareaId = providedId || generatedId
  const textareaName = providedName || (label ? label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') : textareaId)

  const resizeClass = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize',
  }[resize]

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label 
          htmlFor={textareaId}
          className="block text-sm font-medium text-[#1C294E] mb-2"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        name={textareaName}
        rows={rows}
        className={`
          w-full px-4 py-3 rounded-lg border-2 border-gray-200
          focus:border-[#079447] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#079447]/20
          transition-colors duration-200
          ${resizeClass}
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'
export default Textarea
