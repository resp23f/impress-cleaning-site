export default function Card({ children, className = '', padding = 'default', hover = false }) {
      const paddings = {
        none: '',
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
      }
      return (
        <div
          className={`
            bg-white rounded-xl shadow-sm
            ${hover ? 'transition-shadow hover:shadow-md' : ''}
            ${paddings[padding]}
            ${className}
          `}
        >
          {children}
        </div>
      )
    }