'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Bell,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Clock,
  XCircle,
  RefreshCw,
  Loader2,
  Users,
  Calendar,
  Receipt,
  MessageSquare,
  Check,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

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
    <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
      <Icon className={`h-4 w-4 ${config.color}`} />
    </div>
  )
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

export default function AdminNotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef(null)
  const supabase = createClient()

  useEffect(() => {
    fetchNotifications()

    const channel = supabase
      .channel('admin_notifications')
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

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        handleClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
    }, 200)
  }

  const handleOpen = () => {
    setIsOpen(true)
    setIsClosing(false)
  }

  async function fetchNotifications() {
    try {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      setNotifications(data || [])

      const { count, error: countError } = await supabase
        .from('admin_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)

      if (!countError) {
        setUnreadCount(count || 0)
      }
    } catch (error) {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }

  async function markAllAsRead() {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('is_read', false)

      if (!error) {
        setUnreadCount(0)
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      }
    } catch (error) {
      // Silent fail
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
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      // Silent fail
    }
  }

  const displayCount = unreadCount > 9 ? '9+' : unreadCount
  const hasUnread = notifications.some(n => !n.is_read)

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => isOpen ? handleClose() : handleOpen()}
        className={`
          relative p-2.5 rounded-xl transition-all duration-300
          hover:bg-white/10 active:scale-95
          ${isOpen ? 'bg-white/10' : ''}
        `}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell 
          className={`
            h-5 w-5 transition-all duration-300
            ${unreadCount > 0 ? 'text-white' : 'text-gray-400'}
          `}
          style={{
            animation: unreadCount > 0 ? 'wiggle 2s ease-in-out infinite' : 'none',
          }}
        />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
            <span className="relative h-5 min-w-5 flex items-center justify-center bg-gradient-to-br from-red-500 to-rose-600 text-white text-[10px] font-bold rounded-full px-1.5 shadow-lg shadow-red-500/30">
              {displayCount}
            </span>
          </span>
        )}
      </button>

{/* Dropdown */}
      {isOpen && (
        <div 
          className={`
            fixed lg:absolute right-4 lg:right-0 top-16 lg:top-auto lg:bottom-full lg:mb-3
            w-[380px] max-w-[calc(100vw-2rem)]
                        bg-white rounded-2xl shadow-2xl shadow-black/20
            border border-gray-100 z-[100] overflow-hidden
            transition-all duration-200 ease-out origin-top-right
            ${isClosing 
              ? 'opacity-0 scale-95 translate-y-2' 
              : 'opacity-100 scale-100 translate-y-0'
            }
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1C294E] to-[#2a3a5e] flex items-center justify-center">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1C294E]">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-[10px] text-gray-500">{unreadCount} unread</p>
                )}
              </div>
            </div>
            {hasUnread && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#079447] hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200"
              >
                <Check className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto overscroll-contain">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-[#079447] animate-spin mb-3" />
                <p className="text-sm text-gray-500">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center px-6">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-gray-300" />
                </div>
                <h4 className="text-sm font-semibold text-[#1C294E] mb-1">All caught up!</h4>
                <p className="text-xs text-gray-500">No notifications at the moment</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {notifications.map((notification, index) => (
                  <li 
                    key={notification.id}
                    style={{
                      animation: `fadeSlideIn 0.3s ease-out ${index * 0.05}s both`,
                    }}
                  >
                    <Link
                      href={notification.link || '/admin/dashboard'}
                      onClick={() => {
                        if (!notification.is_read) {
                          markAsRead(notification.id)
                        }
                        handleClose()
                      }}
                      className={`
                        group flex items-start gap-3 px-5 py-4 
                        transition-all duration-200
                        hover:bg-gray-50
                        ${!notification.is_read 
                          ? 'bg-gradient-to-r from-blue-50/80 via-white to-white' 
                          : ''
                        }
                      `}
                    >
                      {getNotificationIcon(notification.type)}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm leading-snug ${
                            !notification.is_read 
                              ? 'font-semibold text-[#1C294E]' 
                              : 'font-medium text-gray-700'
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.is_read && (
                            <span className="flex-shrink-0 w-2 h-2 mt-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-sm shadow-blue-500/50" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
                          {formatTimeAgo(notification.created_at)}
                        </p>
                      </div>

                      <ChevronRight 
                        className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200 mt-1 flex-shrink-0" 
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
              <Link
                href="/admin/dashboard"
                onClick={handleClose}
                className="flex items-center justify-center gap-2 text-xs font-medium text-gray-500 hover:text-[#1C294E] transition-colors duration-200"
              >
                View all activity
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(10deg); }
          30% { transform: rotate(-10deg); }
          45% { transform: rotate(5deg); }
          60% { transform: rotate(-5deg); }
          75% { transform: rotate(0deg); }
        }
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
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