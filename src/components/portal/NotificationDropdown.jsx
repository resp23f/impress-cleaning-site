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
  Loader2
} from 'lucide-react'

function getNotificationIcon(type) {
  switch (type) {
    case 'invoice_sent':
      return <FileText className="h-4 w-4 text-blue-500" />
    case 'payment_reminder':
      return <Clock className="h-4 w-4 text-amber-500" />
    case 'late_fee_warning':
      return <AlertCircle className="h-4 w-4 text-orange-500" />
    case 'invoice_overdue':
      return <AlertCircle className="h-4 w-4 text-red-500" />
    case 'invoice_cancelled':
      return <XCircle className="h-4 w-4 text-gray-500" />
    case 'refund_processed':
      return <RefreshCw className="h-4 w-4 text-green-500" />
    case 'zelle_pending':
      return <Clock className="h-4 w-4 text-purple-500" />
    case 'zelle_verified':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'zelle_rejected':
      return <XCircle className="h-4 w-4 text-red-500" />
    case 'credit_applied':
      return <CreditCard className="h-4 w-4 text-emerald-500" />
    case 'payment_received':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'payment_failed':
      return <XCircle className="h-4 w-4 text-red-500" />
    case 'dispute_resolved':
      return <CheckCircle className="h-4 w-4 text-blue-500" />
    default:
      return <Bell className="h-4 w-4 text-gray-500" />
  }
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
  const hasUnread = notifications.some(n => !n.read)

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
        {hasUnread && (
          <button
            onClick={onMarkAllAsRead}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center">
            <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <li key={notification.id}>
                <Link
                  href={notification.link || '/portal'}
                  onClick={() => {
                    if (!notification.read) {
                      onMarkAsRead(notification.id)
                    }
                    onClose()
                  }}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-emerald-50/50' : ''
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTimeAgo(notification.created_at)}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0">
                      <span className="h-2 w-2 bg-emerald-500 rounded-full block"></span>
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 bg-gray-50">
        <Link
          href="/portal/notifications"
          onClick={onClose}
          className="block text-center py-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          View all notifications
        </Link>
      </div>
    </div>
  )
}
