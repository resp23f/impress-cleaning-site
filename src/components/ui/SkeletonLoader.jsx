export default function SkeletonLoader({ className = '', count = 1, height = 'h-4' }) {

      return (
    
        <>
    
          {[...Array(count)].map((_, i) => (
    
            <div
    
              key={i}
    
              className={`
    
                ${height} bg-gray-200 rounded animate-pulse
    
                ${className}
    
              `}
    
            />
    
          ))}
    
        </>
    
      )
    
    }
    
     
    
    export function CardSkeleton() {
    
      return (
    
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
    
          <SkeletonLoader height="h-6" className="w-1/3" />
    
          <SkeletonLoader height="h-4" count={3} className="w-full" />
    
        </div>
    
      )
    
    }