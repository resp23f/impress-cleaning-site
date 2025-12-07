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
  Check
} from 'lucide-react'
import { useState } from 'react'

function getNotificationIcon(type) {
  const iconMap = {
    invoice_sent: <FileText className="h-4 w-4 text-blue-500" />,
    payment_reminder: <Clock className="h-4 w-4 text-amber-500" />,
    late_fee_warning: <AlertCircle className="h-4 w-4 text-orange-500" />,
    invoice_overdue: <AlertCircle className="h-4 w-4 text-red-500" />,
    invoice_cancelled: <XCircle className="h-4 w-4 text-gray-500" />,
    refund_processed: <RefreshCw className="h-4 w-4 text-green-500" />,
    zelle_pending: <Clock className="h-4 w-4 text-purple-500" />,
    zelle_verified: <CheckCircle className="h-4 w-4 text-green-500" />,
    zelle_rejected: <XCircle className="h-4 w-4 text-red-500" />,
    credit_applied: <CreditCard className="h-4 w-4 text-emerald-500" />,
    payment_received: <CheckCircle className="h-4 w-4 text-green-500" />,
    payment_failed: <XCircle className="h-4 w-4 text-red-500" />,
    dispute_resolved: <CheckCircle className="h-4 w-4 text-blue-500" />
  }
  return iconMap[type] || <Bell className="h-4 w-4 text-gray-500" />
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
  onClose
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

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-gray-100 z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
            <Bell className="h-4 w-4 text-emerald-600" />
          </div>
          <h3 className="text-base font-bold text-[#1C294E]">Notifications</h3>
        </div>
        {hasUnread && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:text-white hover:bg-emerald-600 rounded-full border border-emerald-200 hover:border-emerald-600 transition-all duration-200 disabled:opacity-50"
          >
            {markingAll ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3" />
            )}
            {markingAll ? 'Marking...' : 'Mark all read'}
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mb-3" />
            <p className="text-sm text-gray-400">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center px-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-slate-100 flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-base font-semibold text-[#1C294E] mb-1">All caught up!</p>
            <p className="text-sm text-gray-400">No notifications yet</p>
          </div>
        ) : (
          <ul>
            {notifications.map((notification, index) => (
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
                    hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-transparent
                    transition-all duration-200
                    ${!notification.is_read ? 'bg-gradient-to-r from-emerald-50/80 to-transparent' : ''}
                    ${index !== notifications.length - 1 ? 'border-b border-gray-50' : ''}
                  `}
                >
                  <div className={`
                    flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                    ${!notification.is_read 
                      ? 'bg-gradient-to-br from-emerald-100 to-green-100' 
                      : 'bg-gray-100'
                    }
                  `}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm leading-tight ${!notification.is_read ? 'font-bold text-[#1C294E]' : 'font-medium text-gray-700'}`}>
                        {notification.title}
                      </p>
                      {!notification.is_read && (
                        <span className="flex-shrink-0 h-2.5 w-2.5 bg-emerald-500 rounded-full mt-1 animate-pulse"></span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2 font-medium">
                      {formatTimeAgo(notification.created_at)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
          <Link
            href="/portal/notifications"
            onClick={onClose}
            className="flex items-center justify-center gap-2 py-4 text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-200"
          >
            View all notifications
            <span className="text-emerald-400">→</span>
          </Link>
        </div>
      )}
    </div>
  )
}