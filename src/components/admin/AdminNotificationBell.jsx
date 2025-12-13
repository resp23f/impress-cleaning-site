'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminNotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    fetchUnreadCount()

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
          fetchUnreadCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchUnreadCount() {
    try {
      const { count, error } = await supabase
        .from('admin_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)

      if (!error) {
        setUnreadCount(count || 0)
      }
    } catch (error) {
      // Silent fail
    }
  }

  const displayCount = unreadCount > 9 ? '9+' : unreadCount

  return (
    <Link
      href="/admin/notifications"
      className="relative p-2.5 rounded-xl transition-all duration-300 hover:bg-white/10 active:scale-95"
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
    >
      <Bell 
        className={`h-5 w-5 transition-all duration-300 ${unreadCount > 0 ? 'text-white' : 'text-gray-400'}`}
        style={{
          animation: unreadCount > 0 ? 'wiggle 2s ease-in-out infinite' : 'none',
        }}
      />
      
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center">
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
          <span className="relative h-5 min-w-5 flex items-center justify-center bg-gradient-to-br from-red-500 to-rose-600 text-white text-[10px] font-bold rounded-full px-1.5 shadow-lg shadow-red-500/30">
            {displayCount}
          </span>
        </span>
      )}

      <style jsx>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(10deg); }
          30% { transform: rotate(-10deg); }
          45% { transform: rotate(5deg); }
          60% { transform: rotate(-5deg); }
          75% { transform: rotate(0deg); }
        }
      `}</style>
    </Link>
  )
}