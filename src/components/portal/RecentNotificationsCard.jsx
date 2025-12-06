'use client'

import { useState, useEffect } from 'react'
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
  ChevronRight,
  Loader2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function getNotificationIcon(type) {
  switch (type) {
    case 'invoice_sent':
      return <FileText className="h-5 w-5 text-blue-500" />
    case 'payment_reminder':
      return <Clock className="h-5 w-5 text-amber-500" />
    case 'late_fee_warning':
      return <AlertCircle className="h-5 w-5 text-orange-500" />
    case 'invoice_overdue':
      return <AlertCircle className="h-5 w-5 text-red-500" />
    case 'invoice_cancelled':
      return <XCircle className="h-5 w-5 text-gray-500" />
    case 'refund_processed':
      return <RefreshCw className="h-5 w-5 text-green-500" />
    case 'zelle_pending':
      return <Clock className="h-5 w-5 text-purple-500" />
    case 'zelle_verified':
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case 'zelle_rejected':
      return <XCircle className="h-5 w-5 text-red-500" />
    case 'credit_applied':
      return <CreditCard className="h-5 w-5 text-emerald-500" />
    case 'payment_received':
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case 'payment_failed':
      return <XCircle className="h-5 w-5 text-red-500" />
    case 'dispute_resolved':
      return <CheckCircle className="h-5 w-5 text-blue-500" />
    default:
      return <Bell className="h-5 w-5 text-gray-500" />
  }
}

function formatTimeAgo(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function RecentNotificationsCard() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchNotifications()
  }, [])

  async function fetchNotifications() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('customer_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3)

      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Recent Notifications</h2>
        </div>
      </div>

      {/* Content */}
      <div className="divide-y divide-gray-100">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center">
            <Bell className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No notifications yet</p>
            <p className="text-xs text-gray-400 mt-1">You'll see updates about your invoices here</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <Link
              key={notification.id}
              href={notification.link || '/portal/notifications'}
              className={`flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${
                !notification.read ? 'bg-emerald-50/30' : ''
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {getNotificationIcon(notification.type)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                  {notification.title}
                </p>
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatTimeAgo(notification.created_at)}
                </p>
              </div>
              {!notification.read && (
                <div className="flex-shrink-0 mt-2">
                  <span className="h-2 w-2 bg-emerald-500 rounded-full block"></span>
                </div>
              )}
            </Link>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 bg-gray-50">
        <Link
          href="/portal/notifications"
          className="flex items-center justify-center gap-1 py-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          View all notifications
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
