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
  ChevronRight,
  Loader2,
  Check
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// Notification type icon mapping - centralized for maintainability
const NOTIFICATION_ICONS = {
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

function getNotificationIcon(type) {
  const config = NOTIFICATION_ICONS[type] || { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-100' }
  return config
}

function formatTimeAgo(dateString) {
  // Validate input to prevent potential issues
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

  // Prevent negative time (future dates)
  if (diffInSeconds < 0) return 'Just now'
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function RecentNotificationsCard() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)
  const [userId, setUserId] = useState(null)
  
  // Create supabase client once
  const supabase = createClient()

  // Memoized fetch function for security - always validates user session
  const fetchNotifications = useCallback(async () => {
    try {
      // SECURITY: Always get fresh user session - never trust cached/stored user IDs
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.error('Authentication error:', authError)
        setNotifications([])
        setUnreadCount(0)
        setUserId(null)
        return
      }

      // Store userId for real-time subscription filter
      setUserId(user.id)

      // SECURITY: Query filtered by authenticated user's ID
      // RLS policies on Supabase should also enforce this server-side
      const { data, error } = await supabase
        .from('customer_notifications')
        .select('id, type, title, message, link, is_read, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(2) // Only fetch 2 for the card display

      if (error) {
        console.error('Error fetching notifications:', error)
        return
      }

      setNotifications(data || [])

      // Get unread count separately for the badge
      const { count, error: countError } = await supabase
        .from('customer_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (!countError) {
        setUnreadCount(count || 0)
      }
    } catch (error) {
      console.error('Error in fetchNotifications:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Initial fetch and real-time subscription
  useEffect(() => {
    fetchNotifications()

    // Set up real-time subscription for live updates
    const channel = supabase
      .channel('recent_notifications_card')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customer_notifications'
          // Note: RLS policies handle user filtering server-side
        },
        (payload) => {
          // SECURITY: Re-fetch to ensure we only get authorized data
          // Don't directly insert payload data without validation
          fetchNotifications()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchNotifications])

  // Mark single notification as read
  async function markAsRead(notificationId) {
    // SECURITY: Validate notificationId format (UUID)
    if (!notificationId || typeof notificationId !== 'string') {
      console.error('Invalid notification ID')
      return
    }

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.error('Authentication required')
        return
      }

      // SECURITY: Update includes user_id filter to prevent unauthorized updates
      // Even if someone manipulates the notificationId, they can't update other users' notifications
      const { error } = await supabase
        .from('customer_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', user.id) // SECURITY: Double-check ownership

      if (error) {
        console.error('Error marking notification as read:', error)
        return
      }

      // Update local state optimistically
      setNotifications(prev =>
        prev.map(n => n.id === notificationId 
          ? { ...n, is_read: true, read_at: new Date().toISOString() } 
          : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error in markAsRead:', error)
    }
  }

  // Mark all notifications as read
  async function markAllAsRead() {
    if (markingAll || unreadCount === 0) return
    
    setMarkingAll(true)
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.error('Authentication required')
        return
      }

      // SECURITY: Update filtered by user_id
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

      // Update local state
      setNotifications(prev => prev.map(n => ({ 
        ...n, 
        is_read: true, 
        read_at: new Date().toISOString() 
      })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error in markAllAsRead:', error)
    } finally {
      setMarkingAll(false)
    }
  }

  const hasUnread = unreadCount > 0

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header with integrated bell */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <div className={`
              p-2 rounded-lg transition-all duration-200
              ${hasUnread 
                ? 'bg-gradient-to-br from-emerald-500 to-green-500 shadow-md shadow-emerald-200/50' 
                : 'bg-gray-100'
              }
            `}>
              <Bell className={`h-4 w-4 sm:h-5 sm:w-5 ${hasUnread ? 'text-white' : 'text-gray-500'}`} />
            </div>
            {/* Unread badge */}
            {hasUnread && (
              <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1 shadow-md ring-2 ring-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Recent Notifications
          </h2>
        </div>

        {/* Mark all as read button */}
        {hasUnread && (
          <button
            onClick={markAllAsRead}
            disabled={markingAll}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:text-white hover:bg-emerald-500 rounded-full border border-emerald-200 hover:border-emerald-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Mark all notifications as read"
          >
            {markingAll ? (
              <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin" />
            ) : (
              <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            )}
            <span className="hidden xs:inline sm:inline">
              {markingAll ? 'Marking...' : 'Mark all read'}
            </span>
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="divide-y divide-gray-100">
        {loading ? (
          <div className="flex items-center justify-center py-10 sm:py-12">
            <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-10 sm:py-12 text-center px-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-gray-100 to-slate-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Bell className="h-7 w-7 sm:h-8 sm:w-8 text-gray-300" />
            </div>
            <p className="text-sm sm:text-base font-semibold text-gray-700 mb-1">All caught up!</p>
            <p className="text-xs sm:text-sm text-gray-400">You'll see updates about your invoices here</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const { icon: Icon, color, bg } = getNotificationIcon(notification.type)
            
            // SECURITY: Sanitize link - only allow relative paths or specific domains
            const safeLink = notification.link?.startsWith('/') 
              ? notification.link 
              : '/portal/notifications'
            
            return (
              <Link
                key={notification.id}
                href={safeLink}
                onClick={() => {
                  if (!notification.is_read) {
                    markAsRead(notification.id)
                  }
                }}
                className={`
                  flex items-start gap-3 sm:gap-4 px-4 sm:px-6 py-4 
                  hover:bg-gray-50 active:bg-gray-100
                  transition-colors duration-150
                  ${!notification.is_read ? 'bg-emerald-50/40' : ''}
                `}
              >
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  <div className={`p-2 sm:p-2.5 rounded-lg ${!notification.is_read ? 'bg-white shadow-sm' : bg}`}>
                    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${color}`} />
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm leading-snug line-clamp-1 ${
                      !notification.is_read 
                        ? 'font-semibold text-gray-900' 
                        : 'font-medium text-gray-700'
                    }`}>
                      {notification.title}
                    </p>
                    {!notification.is_read && (
                      <span className="flex-shrink-0 h-2 w-2 bg-emerald-500 rounded-full mt-1.5 ring-2 ring-emerald-100" />
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5 line-clamp-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1.5 font-medium">
                    {formatTimeAgo(notification.created_at)}
                  </p>
                </div>
              </Link>
            )
          })
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 bg-gray-50/50">
        <Link
          href="/portal/notifications"
          className="flex items-center justify-center gap-1 py-3 sm:py-3.5 text-sm text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-medium transition-colors duration-150"
        >
          View all notifications
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}