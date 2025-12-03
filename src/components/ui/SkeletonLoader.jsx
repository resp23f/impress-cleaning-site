import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function SkeletonLoader({ count = 1, height, width, circle = false, className = '' }) {
  return (
    <Skeleton
      count={count}
      height={height}
      width={width}
      circle={circle}
      className={className}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] p-6 space-y-4">
      <Skeleton height={24} width={160} />
      <Skeleton count={3} height={16} />
    </div>
  )
}

export function InvoiceCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] p-6 border border-gray-100/50">
      <div className="flex items-center gap-4">
        <Skeleton circle height={48} width={48} />
        <div className="flex-1">
          <Skeleton height={20} width={180} />
          <Skeleton height={16} width={100} style={{ marginTop: 8 }} />
        </div>
        <Skeleton height={40} width={100} borderRadius={12} />
      </div>
    </div>
  )
}

export function AppointmentCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border-l-4 border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton height={20} width={140} />
          <Skeleton height={16} width={100} style={{ marginTop: 8 }} />
        </div>
        <Skeleton height={28} width={80} borderRadius={20} />
      </div>
      <div className="space-y-2">
        <Skeleton height={16} width={180} />
        <Skeleton height={16} width={240} />
      </div>
      <div className="flex gap-3">
        <Skeleton height={36} width={110} borderRadius={12} />
        <Skeleton height={36} width={80} borderRadius={12} />
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3 max-w-md">
        <Skeleton height={14} width={120} />
        <Skeleton height={32} width={260} />
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Skeleton height={220} />
        <Skeleton height={220} />
        <Skeleton height={220} />
        <Skeleton height={220} />
      </div>

      {/* Lower tile */}
      <Skeleton height={220} />
    </div>
  )
}