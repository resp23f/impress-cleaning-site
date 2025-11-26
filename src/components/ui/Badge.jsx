export default function Badge({ children, variant = 'default', size = 'md' }) {
      const variants = {
        default: 'bg-gray-100 text-gray-700',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-yellow-100 text-yellow-700',
        danger: 'bg-red-100 text-red-700',
        info: 'bg-blue-100 text-blue-700',
        primary: 'bg-[#079447]/10 text-[#079447]',
      }
      const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
      }
      return (
        <span
          className={`
            inline-flex items-center font-medium rounded-full
            ${variants[variant]}
            ${sizes[size]}
          `}
        >
          {children}
        </span>
      )
    }