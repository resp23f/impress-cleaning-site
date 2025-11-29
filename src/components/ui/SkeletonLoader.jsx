import styles from '@/app/portal/shared-animations.module.css'

export default function SkeletonLoader({ className = '', count = 1, height = 'h-4' }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className={`
            ${height} rounded relative overflow-hidden bg-gray-200
            ${className}
          `}
        >
          <div 
            className={`absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent ${styles.shimmerWave}`} 
          />
        </div>
      ))}
    </>
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] p-6 space-y-4">
      <SkeletonLoader height="h-6" className="w-1/3" />
      <SkeletonLoader height="h-4" className="w-full" />
      <SkeletonLoader height="h-4" className="w-5/6" />
      <SkeletonLoader height="h-4" className="w-4/6" />
    </div>
  )
}

export function InvoiceCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] p-6 border border-gray-100/50">
      <div className="flex items-center gap-4">
        <SkeletonLoader height="h-12 w-12" className="!rounded-xl" />
        <div className="flex-1 space-y-2">
          <SkeletonLoader height="h-5" className="w-1/3" />
          <SkeletonLoader height="h-4" className="w-1/4" />
        </div>
        <SkeletonLoader height="h-10" className="w-24 !rounded-xl" />
      </div>
    </div>
  )
}

export function AppointmentCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border-l-4 border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonLoader height="h-5" className="w-32" />
          <SkeletonLoader height="h-4" className="w-24" />
        </div>
        <SkeletonLoader height="h-6" className="w-20 !rounded-full" />
      </div>
      <div className="space-y-2">
        <SkeletonLoader height="h-4" className="w-40" />
        <SkeletonLoader height="h-4" className="w-56" />
      </div>
      <div className="flex gap-3">
        <SkeletonLoader height="h-9" className="w-28 !rounded-xl" />
        <SkeletonLoader height="h-9" className="w-20 !rounded-xl" />
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <SkeletonLoader height="h-8" className="w-48" />
        <SkeletonLoader height="h-5" className="w-64" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CardSkeleton />
        </div>
        <CardSkeleton />
      </div>
    </div>
  )
}