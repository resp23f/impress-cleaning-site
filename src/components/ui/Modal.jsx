'use client'

 

import { useEffect } from 'react'

import { X } from 'lucide-react'

 

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'md' }) {

  useEffect(() => {

    if (isOpen) {

      document.body.style.overflow = 'hidden'

    } else {

      document.body.style.overflow = 'unset'

    }

    return () => {

      document.body.style.overflow = 'unset'

    }

  }, [isOpen])

 

  if (!isOpen) return null

 

  const maxWidths = {

    sm: 'max-w-md',

    md: 'max-w-lg',

    lg: 'max-w-2xl',

    xl: 'max-w-4xl',

  }

 

  return (

    <div className="fixed inset-0 z-50 overflow-y-auto">

      {/* Backdrop */}

      <div

        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"

        onClick={onClose}

      />

 

      {/* Modal */}

      <div className="flex min-h-full items-center justify-center p-4">

        <div

          className={`

            relative bg-white rounded-2xl shadow-xl

            w-full ${maxWidths[maxWidth]}

            transform transition-all

          `}

          onClick={(e) => e.stopPropagation()}

        >

          {/* Header */}

          {title && (

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">

              <h2 className="text-xl font-bold text-[#1C294E]">{title}</h2>

              <button

                onClick={onClose}

                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"

              >

                <X className="w-5 h-5 text-gray-500" />

              </button>

            </div>

          )}

 

          {/* Content */}

          <div className="px-6 py-6">

            {children}

          </div>

        </div>

      </div>

    </div>

  )

}