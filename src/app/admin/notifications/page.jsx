'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Bell,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Clock,
  XCircle,
  RefreshCw,
  Users,
  Calendar,
  Receipt,
  MessageSquare,
  Check,
  ChevronRight,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import AdminNav from '@/components/admin/AdminNav'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

function getNotificationIcon(type) {
  const iconMap = {
    payment_received: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    payment_failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
    zelle_claimed: { icon: Clock, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    invoice_overdue: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
    late_fee_pending: { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    dispute_opened: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-600/10' },
    dispute_won: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    dispute_lost: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
    refund_processed: { icon: RefreshCw, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    new_customer: { icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    new_service_request: { icon: MessageSquare, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    service_request: { icon: MessageSquare, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    appointment_confirmed: { icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    appointment_cancelled: { icon: Calendar, color: 'text-red-500', bg: 'bg-red-500/10' },
    appointment_reschedule_request: { icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    invoice_paid: { icon: Receipt, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  }
  
  const config = iconMap[type] || { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-500/10' }
  const Icon = config.icon
  
  return (
    <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
      <Icon className={`h-5 w-5 ${config.color}`} />
    </div>
  )
}

function formatTimeAgo(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'unread', 'read'
  const supabase = createClient()

  useEffect(() => {
    fetchNotifications()

    const channel = supabase
      .channel('admin_notifications_page')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_notifications'
        },
        () => {
          fetchNotifications()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchNotifications() {
    try {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  async function markAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (!error) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        )
      }
    } catch (error) {
      // Silent fail
    }
  }

  async function markAllAsRead() {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('is_read', false)

      if (!error) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        toast.success('All notifications marked as read')
      }
    } catch (error) {
      toast.error('Failed to mark notifications as read')
    }
  }

  async function deleteNotification(notificationId) {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .delete()
        .eq('id', notificationId)

      if (!error) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        toast.success('Notification deleted')
      }
    } catch (error) {
      toast.error('Failed to delete notification')
    }
  }

  async function clearAllRead() {
    if (!confirm('Are you sure you want to delete all read notifications?')) return
    
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .delete()
        .eq('is_read', true)

      if (!error) {
        setNotifications(prev => prev.filter(n => !n.is_read))
        toast.success('Read notifications cleared')
      }
    } catch (error) {
      toast.error('Failed to clear notifications')
    }
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read
    if (filter === 'read') return n.is_read
    return true
  })

  const unreadCount = notifications.filter(n => !n.is_read).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
        <AdminNav />
        <div className="lg:pl-64">
          <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-10 bg-gray-200 rounded-lg w-48" />
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded-2xl" />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <AdminNav />

      <div className="lg:pl-64">
        <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-1 w-12 bg-gradient-to-r from-[#079447] to-emerald-400 rounded-full" />
                <span className="text-sm font-medium text-[#079447] uppercase tracking-wider">Admin</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#1C294E] tracking-tight">Notifications</h1>
              <p className="text-gray-500 mt-1">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="secondary" onClick={markAllAsRead}>
                  <Check className="w-4 h-4" />
                  Mark All Read
                </Button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-white rounded-xl shadow-sm border border-gray-100 w-fit">
            {[
              { key: 'all', label: 'All', count: notifications.length },
              { key: 'unread', label: 'Unread', count: unreadCount },
              { key: 'read', label: 'Read', count: notifications.length - unreadCount },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${filter === tab.key
                    ? 'bg-[#1C294E] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Notifications List */}
          {filteredNotifications.length > 0 ? (
            <div className="space-y-3">
              {filteredNotifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={`
                    bg-white rounded-2xl border shadow-sm overflow-hidden
                    transition-all duration-300 hover:shadow-md
                    ${!notification.is_read ? 'border-blue-200 bg-gradient-to-r from-blue-50/50 to-white' : 'border-gray-100'}
                  `}
                  style={{
                    animation: `fadeSlideIn 0.3s ease-out ${index * 0.05}s both`,
                  }}
                >
                  <div className="flex items-start gap-4 p-5">
                    {getNotificationIcon(notification.type)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className={`text-base ${!notification.is_read ? 'font-semibold text-[#1C294E]' : 'font-medium text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatTimeAgo(notification.created_at)}
                          </p>
                        </div>
                        
                        {!notification.is_read && (
                          <span className="w-3 h-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex-shrink-0 shadow-sm shadow-blue-500/50" />
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-4">
                        {notification.link && (
                          <Link
                            href={notification.link}
                            onClick={() => !notification.is_read && markAsRead(notification.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#079447] hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            View Details
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        )}
                        {!notification.is_read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            Mark Read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear Read Button */}
              {filter !== 'unread' && notifications.some(n => n.is_read) && (
                <div className="pt-4 text-center">
                  <button
                    onClick={clearAllRead}
                    className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                  >
                    Clear all read notifications
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-[#1C294E] mb-2">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
              </h3>
              <p className="text-gray-500">
                {filter === 'unread' ? "You're all caught up!" : 'Notifications will appear here'}
              </p>
            </div>
          )}
        </main>
      </div>

      <style jsx>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}