'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminNotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    
    async function fetchUnreadCount() {
      const { count } = await supabase
        .from('admin_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
      
      setUnreadCount(count || 0)
    }
    
    fetchUnreadCount()
  }, [])

  const displayCount = unreadCount > 9 ? '9+' : unreadCount

  return (
    <Link
      href="/admin/notifications"
      className="relative p-2.5 rounded-xl transition-all duration-300 hover:bg-white/10 active:scale-95"
    >
      <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'text-white' : 'text-gray-400'}`} />
      
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 shadow-lg">
          {displayCount}
        </span>
      )}
    </Link>
  )
}