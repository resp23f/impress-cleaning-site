import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

// Base skeleton component
export default function SkeletonLoader({ count, height, width, circle, className }) {
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

// Reusable card skeleton
export function CardSkeleton() {
  return (
    <Skeleton height={160} borderRadius={16} />
  )
}

// Dashboard page skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <Skeleton height={16} width={100} />
        <Skeleton height={40} width={320} />
        <Skeleton height={20} width={180} />
      </div>

      {/* Row 1: Next Appointment (2/3) + Balance (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Skeleton height={320} borderRadius={16} />
        </div>
        <Skeleton height={320} borderRadius={16} />
      </div>

      {/* Row 2: Invoices (1/2) + Recent Services (1/2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton height={280} borderRadius={16} />
        <Skeleton height={280} borderRadius={16} />
      </div>

      {/* Row 3: Three equal cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton height={200} borderRadius={16} />
        <Skeleton height={200} borderRadius={16} />
        <Skeleton height={200} borderRadius={16} />
      </div>
    </div>
  )
}

// Appointments page skeleton
export function AppointmentsSkeleton() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Skeleton height={4} width={48} />
            <Skeleton height={14} width={100} />
          </div>
          <Skeleton height={40} width={300} />
        </div>
        <Skeleton height={44} width={180} borderRadius={12} />
      </div>

      {/* Upcoming Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Skeleton circle height={40} width={40} />
          <Skeleton height={24} width={120} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton height={200} borderRadius={16} />
          <Skeleton height={200} borderRadius={16} />
        </div>
      </div>

      {/* Past Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Skeleton circle height={40} width={40} />
          <Skeleton height={24} width={180} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton height={140} borderRadius={16} />
          <Skeleton height={140} borderRadius={16} />
        </div>
      </div>
    </div>
  )
}

// Invoices page skeleton
export function InvoicesSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Skeleton height={4} width={48} />
          <Skeleton height={14} width={80} />
        </div>
        <Skeleton height={40} width={280} />
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton height={120} borderRadius={16} />
        <Skeleton height={120} borderRadius={16} />
      </div>

      {/* Filter Buttons */}
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} height={42} width={80} borderRadius={12} />
        ))}
      </div>

      {/* Invoice Cards */}
      <div className="space-y-4">
        <Skeleton height={100} borderRadius={16} />
        <Skeleton height={100} borderRadius={16} />
        <Skeleton height={100} borderRadius={16} />
      </div>
    </div>
  )
}

// Request Service page skeleton
export function RequestServiceSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Skeleton height={36} width={220} />
        <Skeleton height={16} width={100} className="mt-2" />
      </div>

      {/* Progress Bar */}
      <Skeleton height={8} borderRadius={4} />

      {/* Form Card */}
      <Skeleton height={500} borderRadius={16} />
    </div>
  )
}

// Service History page skeleton
export function ServiceHistorySkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Skeleton height={4} width={48} />
          <Skeleton height={14} width={80} />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <Skeleton height={48} width={280} />
            <Skeleton height={18} width={240} className="mt-3" />
          </div>
          <Skeleton height={40} width={140} borderRadius={12} />
        </div>
      </div>

      {/* Filters Card */}
      <Skeleton height={160} borderRadius={16} />

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton height={240} borderRadius={16} />
        <Skeleton height={240} borderRadius={16} />
        <Skeleton height={240} borderRadius={16} />
        <Skeleton height={240} borderRadius={16} />
      </div>
    </div>
  )
}

// Settings page skeleton
export function SettingsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Skeleton height={4} width={48} />
          <Skeleton height={14} width={80} />
        </div>
        <Skeleton height={40} width={260} />
        <Skeleton height={16} width={300} className="mt-2" />
      </div>

      {/* Profile Card */}
      <Skeleton height={280} borderRadius={16} />

      {/* Addresses Card */}
      <Skeleton height={200} borderRadius={16} />

      {/* Password Card */}
      <Skeleton height={140} borderRadius={16} />

      {/* Payment Methods Card */}
      <Skeleton height={200} borderRadius={16} />

      {/* Support Card */}
      <Skeleton height={160} borderRadius={16} />
    </div>
  )
}
