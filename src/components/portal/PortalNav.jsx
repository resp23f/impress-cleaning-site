'use client'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  Calendar,
  History,
  Receipt,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import styles from '../../app/portal/shared-animations.module.css'

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/portal/dashboard' },
  { icon: Calendar, label: 'Appointments', href: '/portal/appointments' },
  { icon: History, label: 'Service History', href: '/portal/service-history' },
  { icon: Receipt, label: 'Invoices', href: '/portal/invoices' },
  { icon: Bell, label: 'Notifications', href: '/portal/notifications' },
  { icon: Settings, label: 'Settings', href: '/portal/settings' },
]

export default function PortalNav({ userName }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // CRITICAL: Stable supabase reference to prevent subscription leak
  const supabase = useMemo(() => createClient(), [])

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { count } = await supabase
        .from('customer_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      setUnreadCount(count || 0)
    }

    fetchUnreadCount()

    // Listen for notification read events from notifications page
    const handleNotificationRead = () => fetchUnreadCount()
    window.addEventListener('notificationRead', handleNotificationRead)

    // CRITICAL: Cleanup on unmount
    return () => {
      window.removeEventListener('notificationRead', handleNotificationRead)
    }
  }, [supabase])

  const closeMenu = () => {
    setIsClosing(true)
    setTimeout(() => {
      setMobileMenuOpen(false)
      setIsClosing(false)
    }, 600)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col bg-white border-r border-gray-100 shadow-[4px_0_24px_-8px_rgba(0,0,0,0.08)] relative">
        <div className="flex flex-col flex-grow pt-8 overflow-y-auto">

          {/* Logo */}
          <div className="flex-shrink-0 px-6 mb-4">
            <img
              src="/ImpressLogoNoBackgroundBlue.png"
              alt="Impress Cleaning Services"
              className="h-16 w-auto mx-auto"
            />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 pt-2 pb-4 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              const isNotifications = item.label === 'Notifications'
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    if (isActive) {
                      e.preventDefault()
                      router.refresh()
                    }
                  }}
                  className={`
                    group flex items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-xl
                    ${isActive
                      ? 'bg-emerald-500 text-white'
                      : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-900'
                    }
                  `}
                >
                  <div className={`
                    relative w-9 h-9 rounded-lg flex items-center justify-center
                    ${isActive
                      ? 'bg-white/20'
                      : 'bg-gray-100 group-hover:bg-emerald-100'
                    }
                  `}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-emerald-600'}`} />
                    {isNotifications && unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1 ring-2 ring-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="flex-1">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 mt-auto border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="group flex items-center gap-3 w-full px-4 py-3.5 text-sm font-medium text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-600"
            >
              <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-red-100 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-600" />
              </div>
              <span className="flex-1">Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center">
          <img
            src="/ImpressLogoNoBackgroundBlue.png"
            alt="Impress Cleaning Services"
            className="h-10 w-auto"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => mobileMenuOpen ? closeMenu() : setMobileMenuOpen(true)}
            className="relative p-2 rounded-xl hover:bg-gray-100"
          >
            {mobileMenuOpen && !isClosing ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <>
                <Menu className="w-6 h-6 text-gray-700" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-white" />
                )}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop - z-30 keeps header clickable */}
          <div
            className={`lg:hidden fixed inset-0 z-30 bg-slate-100/70 ${isClosing ? styles.fadeOutOverlaySmooth : styles.fadeInOverlaySmooth}`}
            onClick={closeMenu}
          />
          {/* Panel - z-40 same as header */}
          <div
            className={`lg:hidden fixed inset-y-0 right-0 z-40 w-80 backdrop-blur-xl bg-white/40 shadow-2xl flex flex-col ${isClosing ? styles.slideOutMenuPanel : styles.slideInMenuPanel}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with user greeting */}
            <div className="pt-6 px-6 pb-4">
              <p className="text-sm text-gray-500">Welcome back,</p>
              <p className="text-xl font-bold text-[#1C294E]">{userName}</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                const isNotifications = item.label === 'Notifications'
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={(e) => {
                      if (isActive) {
                        e.preventDefault()
                        router.refresh()
                      }
                      closeMenu()
                    }}
                    className={`
                      group flex items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-xl
                      ${isActive
                        ? 'bg-emerald-500 text-white'
                        : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-900'
                      }
                    `}
                  >
                    <div className={`
                      relative w-9 h-9 rounded-lg flex items-center justify-center
                      ${isActive
                        ? 'bg-white/20'
                        : 'bg-gray-100 group-hover:bg-emerald-100'
                      }
                    `}>
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-emerald-600'}`} />
                      {isNotifications && unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1 ring-2 ring-white">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="flex-1">{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Logout - pinned to bottom */}
            <div className="p-4 flex-shrink-0">
              <button
                onClick={handleLogout}
                className="group flex items-center gap-3 w-full px-4 py-3.5 text-sm font-medium text-red-600 rounded-xl bg-red-50 hover:bg-red-100"
              >
                <div className="w-9 h-9 rounded-lg bg-red-100 group-hover:bg-red-200 flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-red-600" />
                </div>
                <span className="flex-1 text-left">Log Out</span>
              </button>
            </div>
          </div>
        </>
      )}
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 shadow-[0_-2px_16px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom)]">
        <nav className="flex justify-evenly items-center px-1 py-2">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  if (isActive) {
                    e.preventDefault()
                    router.refresh()
                  }
                }}
                className="flex flex-col items-center justify-center gap-1 py-1.5 flex-1 max-w-[72px] group"
              >
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center
                  ${isActive
                    ? 'bg-emerald-500'
                    : 'bg-gray-50 group-hover:bg-emerald-50'
                  }
                `}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-emerald-600'}`} />
                </div>
                <span className={`text-xs font-medium ${isActive ? 'text-emerald-600' : 'text-gray-500'}`}>
                  {item.label.split(' ')[0]}
                </span>
              </Link>
            )
          })}
          {/* Notifications in bottom nav */}
          <Link
            href="/portal/notifications"
            onClick={(e) => {
              if (pathname === '/portal/notifications') {
                e.preventDefault()
                router.refresh()
              }
            }}
            className="flex flex-col items-center justify-center gap-1 py-1.5 flex-1 max-w-[72px] group"
          >
            <div className={`
              relative w-10 h-10 rounded-xl flex items-center justify-center
              ${pathname === '/portal/notifications'
                ? 'bg-emerald-500'
                : 'bg-gray-50 group-hover:bg-emerald-50'
              }
            `}>
              <Bell className={`w-5 h-5 ${pathname === '/portal/notifications' ? 'text-white' : 'text-gray-500 group-hover:text-emerald-600'}`} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 ring-2 ring-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            <span className={`text-xs font-medium ${pathname === '/portal/notifications' ? 'text-emerald-600' : 'text-gray-500'}`}>
              Alerts
            </span>
          </Link>
        </nav>
      </div>
    </>
  )
}