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
    <div className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton circle height={40} width={40} />
        <div className="flex-1">
          <Skeleton height={18} width={160} />
          <Skeleton height={14} width={100} className="mt-1" />
        </div>
      </div>
      <Skeleton height={16} count={2} className="mb-2" />
    </div>
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
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border-l-4 border-emerald-400"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Skeleton height={22} width={180} />
                  <Skeleton height={16} width={140} className="mt-1" />
                </div>
                <Skeleton height={24} width={80} borderRadius={12} />
              </div>
              <div className="space-y-2 mb-4">
                <Skeleton height={16} width={160} />
                <Skeleton height={16} width={220} />
              </div>
              <div className="flex gap-3">
                <Skeleton height={36} width={110} borderRadius={8} />
                <Skeleton height={36} width={90} borderRadius={8} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Past Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Skeleton circle height={40} width={40} />
          <Skeleton height={24} width={160} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Skeleton height={18} width={120} />
                  <Skeleton height={14} width={100} className="mt-1" />
                </div>
                <Skeleton height={24} width={80} borderRadius={12} />
              </div>
              <Skeleton height={14} width={140} />
            </div>
          ))}
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
        <div className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between mb-3">
            <Skeleton height={14} width={100} />
            <Skeleton circle height={36} width={36} />
          </div>
          <Skeleton height={44} width={140} />
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between mb-3">
            <Skeleton height={14} width={80} />
            <Skeleton circle height={24} width={24} />
          </div>
          <Skeleton height={44} width={120} />
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} height={42} width={100} borderRadius={12} />
        ))}
      </div>

      {/* Invoice Cards */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                <Skeleton height={48} width={48} borderRadius={12} />
                <div>
                  <Skeleton height={18} width={120} />
                  <Skeleton height={14} width={140} className="mt-1" />
                  <Skeleton height={14} width={100} className="mt-1" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton height={32} width={80} />
                <Skeleton height={36} width={70} borderRadius={8} />
                <Skeleton height={36} width={80} borderRadius={8} />
              </div>
            </div>
          </div>
        ))}
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
      <div className="rounded-2xl bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)]">
        <Skeleton height={28} width={320} />
        <Skeleton height={16} width={260} className="mt-2 mb-6" />

        {/* Service Type Cards */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="rounded-xl border-2 border-gray-200 p-4 flex items-center gap-4"
            >
              <Skeleton height={48} width={48} borderRadius={12} />
              <div className="flex-1">
                <Skeleton height={18} width={160} />
                <Skeleton height={14} width={280} className="mt-1" />
              </div>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        <Skeleton height={48} borderRadius={12} className="mt-6" />
      </div>
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
      <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton circle height={40} width={40} />
          <Skeleton height={24} width={140} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Skeleton height={14} width={80} className="mb-2" />
            <Skeleton height={42} borderRadius={12} />
          </div>
          <div>
            <Skeleton height={14} width={60} className="mb-2" />
            <Skeleton height={42} borderRadius={12} />
          </div>
          <div>
            <Skeleton height={14} width={100} className="mb-2" />
            <Skeleton height={42} borderRadius={12} />
          </div>
        </div>
      </div>

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden"
          >
            {/* Top accent bar */}
            <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <Skeleton height={28} width={140} />
                  <Skeleton height={16} width={160} className="mt-1" />
                </div>
                <Skeleton height={28} width={100} borderRadius={14} />
              </div>
              <div className="rounded-xl bg-emerald-50 p-4 mb-6">
                <Skeleton height={12} width={80} />
                <Skeleton height={20} width={160} className="mt-1" />
              </div>
              <div className="space-y-3">
                <Skeleton height={14} width={220} />
                <Skeleton height={14} width={140} />
              </div>
            </div>
          </div>
        ))}
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
      <div className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100 space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton circle height={40} width={40} />
          <Skeleton height={24} width={180} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Skeleton height={14} width={80} className="mb-2" />
            <Skeleton height={44} borderRadius={12} />
          </div>
          <div>
            <Skeleton height={14} width={60} className="mb-2" />
            <Skeleton height={44} borderRadius={12} />
          </div>
          <div>
            <Skeleton height={14} width={50} className="mb-2" />
            <Skeleton height={44} borderRadius={12} />
          </div>
          <div>
            <Skeleton height={14} width={160} className="mb-2" />
            <div className="grid grid-cols-3 gap-2">
              <Skeleton height={42} borderRadius={12} />
              <Skeleton height={42} borderRadius={12} />
              <Skeleton height={42} borderRadius={12} />
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton height={40} width={120} borderRadius={10} />
          <Skeleton height={40} width={180} borderRadius={10} />
        </div>
      </div>

      {/* Addresses Card */}
      <div className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton circle height={40} width={40} />
            <Skeleton height={24} width={160} />
          </div>
          <Skeleton height={36} width={120} borderRadius={10} />
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-gray-200 p-5 flex items-start justify-between">
              <div>
                <Skeleton height={18} width={220} />
                <Skeleton height={14} width={160} className="mt-1" />
              </div>
              <div className="flex gap-2">
                <Skeleton height={32} width={32} borderRadius={8} />
                <Skeleton height={32} width={32} borderRadius={8} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Password Card */}
      <div className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton circle height={40} width={40} />
          <Skeleton height={24} width={180} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Skeleton height={14} width={100} className="mb-2" />
            <Skeleton height={44} borderRadius={12} />
          </div>
          <div>
            <Skeleton height={14} width={120} className="mb-2" />
            <Skeleton height={44} borderRadius={12} />
          </div>
          <div className="flex items-end">
            <Skeleton height={40} width={140} borderRadius={10} />
          </div>
        </div>
      </div>

      {/* Payment Methods Card */}
      <div className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100 space-y-5">
        <div className="flex items-center gap-3">
          <Skeleton circle height={40} width={40} />
          <Skeleton height={24} width={160} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            <div className="rounded-xl border border-gray-200 p-5 flex items-center justify-between">
              <div>
                <Skeleton height={18} width={140} />
                <Skeleton height={14} width={100} className="mt-1" />
              </div>
              <div className="flex gap-2">
                <Skeleton height={32} width={100} borderRadius={8} />
                <Skeleton height={32} width={32} borderRadius={8} />
              </div>
            </div>
          </div>
          <div className="rounded-xl border-2 border-dashed border-gray-300 p-5 space-y-4">
            <Skeleton height={16} width={100} />
            <Skeleton height={40} borderRadius={8} />
            <Skeleton height={40} borderRadius={10} />
          </div>
        </div>
      </div>

      {/* Support Card */}
      <div className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton circle height={40} width={40} />
          <Skeleton height={24} width={140} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl bg-gray-50 p-5">
              <div className="flex items-start gap-3">
                <Skeleton height={40} width={40} borderRadius={12} />
                <div>
                  <Skeleton height={14} width={100} />
                  <Skeleton height={16} width={120} className="mt-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}