'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import NotificationDropdown from './NotificationDropdown'

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef(null)
  const supabase = createClient()

  useEffect(() => {
    fetchNotifications()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('customer_notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customer_notifications'
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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function fetchNotifications() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get recent notifications
      const { data, error } = await supabase
        .from('customer_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error

      setNotifications(data || [])

      // Get unread count
      const { count, error: countError } = await supabase
        .from('customer_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (!countError) {
        setUnreadCount(count || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  async function markAllAsRead() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('customer_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) {
        console.error('Error updating notifications:', error)
        return
      }

      // Update local state immediately for responsiveness
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })))

      // Refetch to ensure sync with database
      await fetchNotifications()
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    }
  }

  async function markAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from('customer_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)

      if (!error) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const displayCount = unreadCount > 9 ? '9+' : unreadCount

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center bg-red-500 text-white text-xs font-medium rounded-full px-1">
            {displayCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          loading={loading}
          onMarkAllAsRead={markAllAsRead}
          onMarkAsRead={markAsRead}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
