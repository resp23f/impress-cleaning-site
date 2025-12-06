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
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const ITEMS_PER_PAGE = 20

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'payments', label: 'Payments' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'system', label: 'System' }
]

const PAYMENT_TYPES = ['payment_received', 'payment_failed', 'refund_processed', 'zelle_pending', 'zelle_verified', 'zelle_rejected', 'credit_applied']
const INVOICE_TYPES = ['invoice_sent', 'payment_reminder', 'late_fee_warning', 'invoice_overdue', 'invoice_cancelled']

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

function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 172800) return 'Yesterday'

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    fetchNotifications()
  }, [filter, page])

  async function fetchNotifications() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase
        .from('customer_notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)

      // Apply filters
      if (filter === 'unread') {
        query = query.eq('read', false)
      } else if (filter === 'payments') {
        query = query.in('type', PAYMENT_TYPES)
      } else if (filter === 'invoices') {
        query = query.in('type', INVOICE_TYPES)
      } else if (filter === 'system') {
        query = query.not('type', 'in', `(${[...PAYMENT_TYPES, ...INVOICE_TYPES].join(',')})`)
      }

      // Pagination
      const from = (page - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error

      setNotifications(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  async function markAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from('customer_notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (!error) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  async function markAllAsRead() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('customer_notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (!error) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
  const hasUnread = notifications.some(n => !n.read)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-sm text-gray-500 mt-1">Stay updated on your invoices and payments</p>
            </div>
            {hasUnread && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-2 p-4 overflow-x-auto">
            <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setFilter(option.value)
                  setPage(1)
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === option.value
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
              <p className="text-sm text-gray-500">
                {filter === 'unread'
                  ? "You're all caught up!"
                  : 'Notifications about your invoices and payments will appear here'}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <Link
                    href={notification.link || '/portal'}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification.id)
                      }
                    }}
                    className={`flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-emerald-50/50' : ''
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <span className="h-2 w-2 bg-emerald-500 rounded-full flex-shrink-0 mt-2"></span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
              <p className="text-sm text-gray-500">
                Showing {((page - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(page * ITEMS_PER_PAGE, totalCount)} of {totalCount}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-600 px-2">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
