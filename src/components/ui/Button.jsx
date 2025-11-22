'use client'

 

export default function Button({

  children,

  variant = 'primary',

  size = 'md',

  fullWidth = false,

  loading = false,

  disabled = false,

  type = 'button',

  onClick,

  className = '',

  ...props

}) {

  const baseStyles = 'font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'

 

  const variants = {

    primary: 'bg-[#079447] text-white hover:bg-[#068038] active:bg-[#057030] shadow-sm hover:shadow-md',

    secondary: 'border-2 border-[#1C294E] text-[#1C294E] hover:bg-[#1C294E] hover:text-white active:bg-[#15203d]',

    text: 'text-[#1C294E] hover:bg-gray-100 active:bg-gray-200',

    danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm hover:shadow-md',

  }

 

  const sizes = {

    sm: 'px-4 py-2 text-sm min-h-[36px]',

    md: 'px-6 py-3 text-base min-h-[48px]',

    lg: 'px-8 py-4 text-lg min-h-[56px]',

  }

 

  return (

    <button

      type={type}

      onClick={onClick}

      disabled={disabled || loading}

      className={`

        ${baseStyles}

        ${variants[variant]}

        ${sizes[size]}

        ${fullWidth ? 'w-full' : ''}

        ${className}

      `}

      {...props}

    >

      {loading && (

        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">

          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>

          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>

        </svg>

      )}

      {children}

    </button>

  )

}