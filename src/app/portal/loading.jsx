import { DashboardSkeleton } from '@/components/ui/SkeletonLoader'

export default function PortalLoading() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="max-w-7xl mx-auto">
        <DashboardSkeleton />
      </div>
    </div>
  )
}