import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function SkeletonLoader({ count = 1, height, width, circle = false, className = '' }) {
  return (
    <SkeletonTheme baseColor="#e2e8f0" highlightColor="#f8fafc" duration={2.5}>
      <Skeleton
        count={count}
        height={height}
        width={width}
        circle={circle}
        className={className}
      />
    </SkeletonTheme>
  )
}

export function CardSkeleton() {
  return (
    <SkeletonTheme baseColor="#e2e8f0" highlightColor="#f8fafc" duration={2.5}>
      <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] p-6 space-y-4">
        <Skeleton height={24} width={160} />
        <Skeleton count={3} height={16} />
      </div>
    </SkeletonTheme>
  )
}
export function InvoiceCardSkeleton() {
  return (
    <SkeletonTheme baseColor="#e2e8f0" highlightColor="#f8fafc" duration={2.5}>
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
    </SkeletonTheme>
  )
}
export function AppointmentCardSkeleton() {
  return (
    <SkeletonTheme baseColor="#e2e8f0" highlightColor="#f8fafc" duration={2.5}>
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
    </SkeletonTheme>
  )
}

export function DashboardSkeleton() {
  return (
    <SkeletonTheme baseColor="#e2e8f0" highlightColor="#f8fafc" duration={2.5}>
      <div className="space-y-8">
        {/* Header area */}
        <div className="space-y-3 max-w-xl">
          {/* small "Dashboard" label */}
          <Skeleton height={14} width={90} />
          {/* big greeting heading */}
          <Skeleton height={36} width={260} />
          {/* subheading */}
          <Skeleton height={18} width={200} />
        </div>

        {/* Row 1: Next appointment (2 cols) + balance (1 col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Large hero-style tile for next appointment */}
          <Skeleton className="w-full lg:col-span-2" height={240} />
          {/* Side tile for balance card */}
          <Skeleton className="w-full" height={240} />
        </div>

        {/* Row 2: Invoices & Recent services */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="w-full" height={220} />
          <Skeleton className="w-full" height={220} />
        </div>

        {/* Row 3: Service address, account summary, feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="w-full" height={190} />
          <Skeleton className="w-full" height={190} />
          <Skeleton className="w-full" height={190} />
        </div>
      </div>
    </SkeletonTheme>
  )
}
