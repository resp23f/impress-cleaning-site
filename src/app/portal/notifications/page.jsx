'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import styles from '../shared-animations.module.css'
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
  ChevronRight,
  Check,
  MailOpen,
  Mail
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

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
  if (!dateString || typeof dateString !== 'string') {
    return 'Unknown'
  }

  const date = new Date(dateString)

  if (isNaN(date.getTime())) {
    return 'Unknown'
  }

  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 0) return 'Just now'
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

// Skeleton for notifications page
function NotificationsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Skeleton height={4} width={48} />
            <Skeleton height={14} width={100} />
          </div>
          <Skeleton height={36} width={200} />
          <Skeleton height={16} width={280} className="mt-2" />
        </div>
        <Skeleton height={44} width={160} borderRadius={12} />
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} height={36} width={80} borderRadius={20} />
          ))}
        </div>
      </div>

      {/* Notification items */}
      <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-start gap-4 px-6 py-4 border-b border-gray-100 last:border-b-0">
            <Skeleton circle height={40} width={40} />
            <div className="flex-1">
              <Skeleton height={16} width="60%" />
              <Skeleton height={14} width="80%" className="mt-2" />
              <Skeleton height={12} width={100} className="mt-2" />
            </div>
            <Skeleton height={32} width={32} borderRadius={8} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [markingAll, setMarkingAll] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  // CRITICAL: Stable supabase reference
  const supabase = useMemo(() => createClient(), [])

  const fetchNotifications = useCallback(async () => {
    // Only show full skeleton on initial load, not filter changes
    if (isInitialLoad) {
      setLoading(true)
    }
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        console.error('Authentication error:', authError)
        setNotifications([])
        setTotalCount(0)
        return
      }

      let query = supabase
        .from('customer_notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)

      if (filter === 'unread') {
        query = query.eq('is_read', false)
      } else if (filter === 'payments') {
        query = query.in('type', PAYMENT_TYPES)
      } else if (filter === 'invoices') {
        query = query.in('type', INVOICE_TYPES)
      } else if (filter === 'system') {
        query = query.not('type', 'in', `(${[...PAYMENT_TYPES, ...INVOICE_TYPES].join(',')})`)
      }

      const from = (page - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) {
        console.error('Error fetching notifications:', error)
        return
      }

      setNotifications(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error in fetchNotifications:', error)
    } finally {
      setLoading(false)
      setIsInitialLoad(false)
    }
  }, [supabase, filter, page, isInitialLoad])
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  async function markAsRead(notificationId, e) {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (!notificationId || typeof notificationId !== 'string') {
      console.error('Invalid notification ID')
      return
    }

    setActionLoading(notificationId)

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        console.error('Authentication required')
        return
      }

      const { error } = await supabase
        .from('customer_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error marking as read:', error)
        return
      }

      setNotifications(prev =>
        prev.map(n => n.id === notificationId
          ? { ...n, is_read: true, read_at: new Date().toISOString() }
          : n
        )
      )

      // Dispatch event to update nav bell badge
      window.dispatchEvent(new CustomEvent('notificationRead'))
    } catch (error) {
      console.error('Error in markAsRead:', error)
    } finally {
      setActionLoading(null)
    }
  }

  async function markAsUnread(notificationId, e) {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (!notificationId || typeof notificationId !== 'string') {
      console.error('Invalid notification ID')
      return
    }

    setActionLoading(notificationId)

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        console.error('Authentication required')
        return
      }

      const { error } = await supabase
        .from('customer_notifications')
        .update({
          is_read: false,
          read_at: null
        })
        .eq('id', notificationId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error marking as unread:', error)
        return
      }

      setNotifications(prev =>
        prev.map(n => n.id === notificationId
          ? { ...n, is_read: false, read_at: null }
          : n
        )
      )

      // Dispatch event to update nav bell badge
      window.dispatchEvent(new CustomEvent('notificationRead'))
    } catch (error) {
      console.error('Error in markAsUnread:', error)
    } finally {
      setActionLoading(null)
    }
  }

  async function markAllAsRead() {
    if (markingAll) return

    setMarkingAll(true)

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        console.error('Authentication required')
        return
      }

      const { error } = await supabase
        .from('customer_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) {
        console.error('Error marking all as read:', error)
        return
      }

      setNotifications(prev => prev.map(n => ({
        ...n,
        is_read: true,
        read_at: new Date().toISOString()
      })))

      // Dispatch event to update nav bell badge
      window.dispatchEvent(new CustomEvent('notificationRead'))
    } catch (error) {
      console.error('Error in markAllAsRead:', error)
    } finally {
      setMarkingAll(false)
    }
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
  const hasUnread = notifications.some(n => !n.is_read)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <NotificationsSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 ${styles.contentReveal}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className={`mb-6 sm:mb-8 ${styles.cardReveal}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-1 w-12 bg-gradient-to-r from-[#079447] to-emerald-400 rounded-full" />
                <span className="text-sm font-medium text-[#079447] uppercase tracking-wider">Notifications</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#1C294E] tracking-tight">Notifications</h1>
              <p className="text-gray-500 mt-1">Stay updated on your invoices and payments</p>
            </div>
            {hasUnread && (
              <button
                onClick={markAllAsRead}
                disabled={markingAll}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto w-full"
              >
                {markingAll ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                {markingAll ? 'Marking...' : 'Mark all as read'}
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className={`rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100 mb-6 ${styles.cardReveal1}`}>
          <div className="flex items-center gap-2 p-3 sm:p-4 overflow-x-auto">
            <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setFilter(option.value)
                  setPage(1)
                }}
                disabled={loading && !isInitialLoad}
                className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${filter === option.value
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } ${loading && !isInitialLoad ? 'opacity-50 cursor-wait' : ''}`}
              >
                {option.label}
              </button>
            ))}
            {loading && !isInitialLoad && (
              <Loader2 className="h-4 w-4 text-emerald-500 animate-spin flex-shrink-0" />
            )}
          </div>
        </div>
        {/* Notifications List */}
        <div className={`rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden transition-opacity duration-200 ${styles.cardReveal2} ${loading && !isInitialLoad ? 'opacity-60' : 'opacity-100'}`}>
          {notifications.length === 0 ? (
            <div className="py-16 text-center px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-slate-100 flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">No notifications</h3>
              <p className="text-sm text-gray-500">
                {filter === 'unread'
                  ? "You're all caught up!"
                  : 'Notifications about your invoices and payments will appear here'}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {notifications.map((notification) => {
                const safeLink = notification.link?.startsWith('/')
                  ? notification.link
                  : '/portal'

                const isActionLoading = actionLoading === notification.id

                return (
                  <li key={notification.id}>
                    <Link
                      href={safeLink}
                      onClick={() => {
                        if (!notification.is_read) {
                          markAsRead(notification.id)
                        }
                      }}
                      className={`flex items-start gap-3 sm:gap-4 px-4 sm:px-6 py-4 hover:bg-gray-50 active:bg-gray-100 ${!notification.is_read ? 'bg-emerald-50/50' : ''
                        }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!notification.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {formatDate(notification.created_at)}
                            </p>
                          </div>

                          <div className="flex-shrink-0 flex items-center gap-2">
                            {!notification.is_read ? (
                              <>
                                <span className="h-2 w-2 bg-emerald-500 rounded-full ring-2 ring-emerald-100" />
                                <button
                                  onClick={(e) => markAsRead(notification.id, e)}
                                  disabled={isActionLoading}
                                  className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                                  title="Mark as read"
                                  aria-label="Mark as read"
                                >
                                  {isActionLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Mail className="h-4 w-4" />
                                  )}
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={(e) => markAsUnread(notification.id, e)}
                                disabled={isActionLoading}
                                className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 disabled:opacity-50"
                                title="Mark as unread"
                                aria-label="Mark as unread"
                              >
                                {isActionLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MailOpen className="h-4 w-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50">
              <p className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
                Showing {((page - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(page * ITEMS_PER_PAGE, totalCount)} of {totalCount}
              </p>
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs sm:text-sm text-gray-600 px-2 min-w-[80px] text-center">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next page"
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