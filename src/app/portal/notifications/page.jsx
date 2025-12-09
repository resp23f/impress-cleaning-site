'use client'

import { useState, useEffect, useCallback } from 'react'
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
  ChevronRight,
  Check,
  MailOpen,
  Mail
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
  // Validate input
  if (!dateString || typeof dateString !== 'string') {
    return 'Unknown'
  }
  
  const date = new Date(dateString)
  
  // Validate date is valid
  if (isNaN(date.getTime())) {
    return 'Unknown'
  }
  
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  // Handle future dates gracefully
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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [markingAll, setMarkingAll] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)
  const supabase = createClient()

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      // SECURITY: Always get fresh user session
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.error('Authentication error:', authError)
        setNotifications([])
        setTotalCount(0)
        return
      }

      // SECURITY: Query filtered by authenticated user's ID
      let query = supabase
        .from('customer_notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)

      // Apply filters - FIXED: use is_read not read
      if (filter === 'unread') {
        query = query.eq('is_read', false)
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
    }
  }, [supabase, filter, page])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Mark single notification as read
  async function markAsRead(notificationId, e) {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    // SECURITY: Validate notification ID
    if (!notificationId || typeof notificationId !== 'string') {
      console.error('Invalid notification ID')
      return
    }

    setActionLoading(notificationId)
    
    try {
      // SECURITY: Fresh auth check
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.error('Authentication required')
        return
      }

      // SECURITY: Update with user_id filter for defense in depth
      // FIXED: use is_read and read_at
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

      // FIXED: Update local state with is_read
      setNotifications(prev =>
        prev.map(n => n.id === notificationId 
          ? { ...n, is_read: true, read_at: new Date().toISOString() } 
          : n
        )
      )
    } catch (error) {
      console.error('Error in markAsRead:', error)
    } finally {
      setActionLoading(null)
    }
  }

  // NEW: Mark single notification as unread
  async function markAsUnread(notificationId, e) {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    // SECURITY: Validate notification ID
    if (!notificationId || typeof notificationId !== 'string') {
      console.error('Invalid notification ID')
      return
    }

    setActionLoading(notificationId)
    
    try {
      // SECURITY: Fresh auth check
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.error('Authentication required')
        return
      }

      // SECURITY: Update with user_id filter
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

      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId 
          ? { ...n, is_read: false, read_at: null } 
          : n
        )
      )
    } catch (error) {
      console.error('Error in markAsUnread:', error)
    } finally {
      setActionLoading(null)
    }
  }

  // Mark all as read
  async function markAllAsRead() {
    if (markingAll) return
    
    setMarkingAll(true)
    
    try {
      // SECURITY: Fresh auth check
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.error('Authentication required')
        return
      }

      // FIXED: use is_read not read
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

      // FIXED: Update local state with is_read
      setNotifications(prev => prev.map(n => ({ 
        ...n, 
        is_read: true, 
        read_at: new Date().toISOString() 
      })))
    } catch (error) {
      console.error('Error in markAllAsRead:', error)
    } finally {
      setMarkingAll(false)
    }
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
  // FIXED: use is_read not read
  const hasUnread = notifications.some(n => !n.is_read)

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-sm text-gray-500 mt-1">Stay updated on your invoices and payments</p>
            </div>
            {hasUnread && (
              <button
                onClick={markAllAsRead}
                disabled={markingAll}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto w-full"
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-2 p-3 sm:p-4 overflow-x-auto">
            <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setFilter(option.value)
                  setPage(1)
                }}
                className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
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
                // SECURITY: Sanitize link - only allow relative paths
                const safeLink = notification.link?.startsWith('/') 
                  ? notification.link 
                  : '/portal'
                
                const isActionLoading = actionLoading === notification.id
                
                return (
                  <li key={notification.id}>
                    <Link
                      href={safeLink}
                      onClick={() => {
                        // FIXED: use is_read not read
                        if (!notification.is_read) {
                          markAsRead(notification.id)
                        }
                      }}
                      className={`flex items-start gap-3 sm:gap-4 px-4 sm:px-6 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors ${
                        // FIXED: use is_read not read
                        !notification.is_read ? 'bg-emerald-50/50' : ''
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
                            {/* FIXED: use is_read not read */}
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
                          
                          {/* Action buttons - Mark as read/unread */}
                          <div className="flex-shrink-0 flex items-center gap-2">
                            {/* FIXED: use is_read not read */}
                            {!notification.is_read ? (
                              <>
                                <span className="h-2 w-2 bg-emerald-500 rounded-full ring-2 ring-emerald-100" />
                                <button
                                  onClick={(e) => markAsRead(notification.id, e)}
                                  disabled={isActionLoading}
                                  className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                                  title="Mark as read"
                                  aria-label="Mark as read"
                                >
                                  {isActionLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <MailOpen className="h-4 w-4" />
                                  )}
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={(e) => markAsUnread(notification.id, e)}
                                disabled={isActionLoading}
                                className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-50"
                                title="Mark as unread"
                                aria-label="Mark as unread"
                              >
                                {isActionLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Mail className="h-4 w-4" />
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
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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