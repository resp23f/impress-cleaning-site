'use client'

import Link from 'next/link'
import {
  Bell,
  CreditCard,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle,
  RefreshCw,
  Loader2,
  Check,
  ChevronRight
} from 'lucide-react'
import { useState } from 'react'

function getNotificationIcon(type) {
  const iconMap = {
    invoice_sent: { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
    payment_reminder: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
    late_fee_warning: { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50' },
    invoice_overdue: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
    invoice_cancelled: { icon: XCircle, color: 'text-gray-500', bg: 'bg-gray-100' },
    refund_processed: { icon: RefreshCw, color: 'text-green-500', bg: 'bg-green-50' },
    zelle_pending: { icon: Clock, color: 'text-purple-500', bg: 'bg-purple-50' },
    zelle_verified: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
    zelle_rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
    credit_applied: { icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    payment_received: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
    payment_failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
    dispute_resolved: { icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-50' }
  }
  const config = iconMap[type] || { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-100' }
  const Icon = config.icon
  return { Icon, color: config.color, bg: config.bg }
}

function formatTimeAgo(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function NotificationDropdown({
  notifications,
  loading,
  onMarkAllAsRead,
  onMarkAsRead,
  onClose,
  isMobile = false
}) {
  const [markingAll, setMarkingAll] = useState(false)
  const hasUnread = notifications.some(n => !n.is_read)

  const handleMarkAllAsRead = async () => {
    if (markingAll) return
    setMarkingAll(true)
    try {
      await onMarkAllAsRead()
    } finally {
      setMarkingAll(false)
    }
  }

  const containerClasses = isMobile
    ? 'flex flex-col flex-1 overflow-hidden'
    : 'absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] border border-gray-100 z-50 overflow-hidden'

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-4 border-b border-gray-100 ${isMobile ? '' : 'bg-gradient-to-r from-slate-50 to-gray-50'}`}>
        <h3 className="text-lg font-bold text-[#1C294E]">Notifications</h3>
        {hasUnread && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:text-white hover:bg-emerald-500 rounded-full border border-emerald-200 hover:border-emerald-500 transition-all duration-200 disabled:opacity-50"
          >
            {markingAll ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            {markingAll ? 'Marking...' : 'Mark all read'}
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className={`overflow-y-auto ${isMobile ? 'flex-1' : 'max-h-[400px]'}`}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mb-3" />
            <p className="text-sm text-gray-400">Loading...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-16 text-center px-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-slate-100 flex items-center justify-center mx-auto mb-5">
              <Bell className="h-10 w-10 text-gray-300" />
            </div>
            <p className="text-lg font-bold text-[#1C294E] mb-1">All caught up!</p>
            <p className="text-sm text-gray-400">You have no notifications</p>
          </div>
        ) : (
          <ul>
            {notifications.map((notification, index) => {
              const { Icon, color, bg } = getNotificationIcon(notification.type)
              return (
                <li key={notification.id}>
                  <Link
                    href={notification.link || '/portal'}
                    onClick={() => {
                      if (!notification.is_read) {
                        onMarkAsRead(notification.id)
                      }
                      onClose()
                    }}
                    className={`
                      flex items-start gap-4 px-5 py-4 
                      hover:bg-gray-50 active:bg-gray-100
                      transition-colors duration-150
                      ${!notification.is_read ? 'bg-emerald-50/60' : ''}
                      ${index !== notifications.length - 1 ? 'border-b border-gray-100' : ''}
                    `}
                  >
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${!notification.is_read ? 'bg-white shadow-sm' : bg}`}>
                      <Icon className={`h-5 w-5 ${color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm leading-snug ${!notification.is_read ? 'font-bold text-[#1C294E]' : 'font-medium text-gray-700'}`}>
                          {notification.title}
                        </p>
                        {!notification.is_read && (
                          <span className="flex-shrink-0 h-2.5 w-2.5 bg-emerald-500 rounded-full mt-1.5 ring-4 ring-emerald-100"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2 font-medium">
                        {formatTimeAgo(notification.created_at)}
                      </p>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className={`border-t border-gray-100 ${isMobile ? 'pb-6' : ''}`}>
          <Link
            href="/portal/notifications"
            onClick={onClose}
            className="flex items-center justify-center gap-2 py-4 text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-200"
          >
            View all notifications
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  )
}