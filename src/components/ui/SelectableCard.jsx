'use client'
import { Check } from 'lucide-react'
export default function SelectableCard({
  children,
  selected = false,
  onClick,
  icon,
  title,
  description,
  className = ''
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative w-full p-6 rounded-xl border-2 transition-all duration-200
        text-left hover:shadow-md
        ${selected
          ? 'border-[#079447] bg-[#079447]/5 shadow-md'
          : 'border-gray-200 hover:border-[#079447]/50'
        }
        ${className}
      `}
    >
      {selected && (
        <div className="absolute top-4 right-4 w-6 h-6 bg-[#079447] rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
      {icon && (
        <div className={`mb-3 ${selected ? 'text-[#079447]' : 'text-gray-600'}`}>
          {icon}
        </div>
      )}
      {title && (
        <h3 className={`text-lg font-semibold mb-2 ${selected ? 'text-[#079447]' : 'text-[#1C294E]'}`}>
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-gray-600">
          {description}
        </p>
      )}
      {children}
    </button>
  )
}