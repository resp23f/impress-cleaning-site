'use client'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import {
  Bell,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
  Check
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

export default function NotificationsCard() {
  const router = useRouter()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/customer-portal/notifications')
      const body = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(body.error || 'Failed to load notifications')
      }

      const { data, unreadCount: count } = body
      setNotifications(data || [])
      setUnreadCount(count || 0)
    } catch (error) {
      console.error('Error loading notifications:', error)
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/customer-portal/notifications/${notificationId}`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to mark notification as read')
      }

      // Update local state
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/customer-portal/notifications/mark-all-read', {
        method: 'POST',
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to mark notifications as read')
      }

      setNotifications(notifications.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.is_read) {
      handleMarkAsRead(notification.id)
    }
    // Navigate to link if provided
    if (notification.link) {
      router.push(notification.link)
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'appointment_updated':
      case 'appointment_confirmed':
        return <Calendar className="w-5 h-5 text-blue-600" />
      case 'invoice_sent':
      case 'payment_received':
        return <FileText className="w-5 h-5 text-green-600" />
      case 'service_completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'account_approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-100 rounded"></div>
            <div className="h-16 bg-gray-100 rounded"></div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-[#1C294E]">Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="primary" size="sm">
              {unreadCount} new
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="text"
            size="sm"
            onClick={handleMarkAllAsRead}
          >
            <Check className="w-4 h-4" />
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.slice(0, 5).map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                notification.is_read
                  ? 'border-gray-200 bg-white hover:border-gray-300'
                  : 'border-[#079447]/20 bg-[#079447]/5 hover:bg-[#079447]/10'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 ${!notification.is_read ? 'opacity-100' : 'opacity-60'}`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className={`text-sm font-semibold text-[#1C294E] ${!notification.is_read ? 'font-bold' : ''}`}>
                      {notification.title}
                    </p>
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-[#079447] rounded-full flex-shrink-0 mt-1.5"></div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
            <Bell className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm">No notifications yet</p>
          <p className="text-xs text-gray-400 mt-1">
            We'll notify you of important updates here
          </p>
        </div>
      )}
    </Card>
  )
}
