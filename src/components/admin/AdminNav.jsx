'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Calendar,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Badge from '@/components/ui/Badge'
import AdminNotificationBell from './AdminNotificationBell'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: ClipboardList, label: 'Service Requests', href: '/admin/requests', badge: true },
  { icon: Users, label: 'Customers', href: '/admin/customers' },
  { icon: Calendar, label: 'Appointments', href: '/admin/appointments' },
  { icon: Receipt, label: 'Invoices', href: '/admin/invoices' },
  { icon: BarChart3, label: 'Reports', href: '/admin/reports' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
]

export default function AdminNav({ requestsCount = 0 }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [mounted, setMounted] = useState(false)

  const supabase = createClient()

  // Trigger mount animation
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle body scroll lock when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const handleCloseMobileMenu = () => {
    setIsClosing(true)
    setTimeout(() => {
      setMobileMenuOpen(false)
      setIsClosing(false)
    }, 300)
  }

  const handleOpenMobileMenu = () => {
    setMobileMenuOpen(true)
    setIsClosing(false)
  }

  const getBadgeCount = (item) => {
    if (item.href === '/admin/requests') return requestsCount
    return 0
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`
          hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col
          bg-gradient-to-b from-[#1C294E] via-[#1a2744] to-[#151e36]
          transition-all duration-500 ease-out
          ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
        `}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#079447]/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col flex-grow pt-6 overflow-y-auto relative z-10">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-6 mb-8 group">
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-br from-[#079447] to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-[#079447]/30 group-hover:shadow-[#079447]/50 transition-all duration-500 group-hover:scale-105">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 bg-[#079447] rounded-xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
            </div>
            <div className="ml-3">
              <span className="text-xl font-bold text-white tracking-tight">Impress</span>
              <p className="text-xs text-gray-400 font-medium">Admin Portal</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-1">
            {navItems.map((item, index) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              const badgeCount = item.badge ? getBadgeCount(item) : 0

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    group relative flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl
                    transition-all duration-300 ease-out
                    ${isActive
                      ? 'bg-gradient-to-r from-[#079447] to-emerald-500 text-white shadow-lg shadow-[#079447]/25'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }
                  `}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  {/* Active indicator bar */}
                  <div 
                    className={`
                      absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-white
                      transition-all duration-300 ease-out
                      ${isActive ? 'h-8 opacity-100' : 'h-0 opacity-0'}
                    `}
                  />

                  <div className="flex items-center">
                    <Icon 
                      className={`
                        mr-3 h-5 w-5 transition-all duration-300
                        ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-[#079447]'}
                      `}
                    />
                    <span className="relative">
                      {item.label}
                      {/* Underline effect on hover for non-active */}
                      {!isActive && (
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#079447] group-hover:w-full transition-all duration-300" />
                      )}
                    </span>
                  </div>

                  {/* Badge with pulse */}
                  {badgeCount > 0 && (
                    <div className="relative">
                      <Badge variant="danger" size="sm" className="animate-pulse">
                        {badgeCount}
                      </Badge>
                      {/* Badge glow */}
                      <div className="absolute inset-0 bg-red-500 rounded-full blur-md opacity-40" />
                    </div>
                  )}

                  {/* Hover arrow indicator */}
                  <ChevronRight 
                    className={`
                      w-4 h-4 transition-all duration-300
                      ${isActive 
                        ? 'opacity-100 translate-x-0' 
                        : 'opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0'
                      }
                    `}
                  />
                </Link>
              )
            })}
          </nav>

          {/* Notifications Section */}
          <div className="px-3 py-3 mx-3 mb-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-medium text-gray-300">Notifications</span>
              <AdminNotificationBell />
            </div>
          </div>

          {/* Logout */}
          <div className="p-3 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="group flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all duration-300"
            >
              <LogOut className="mr-3 h-5 w-5 group-hover:rotate-[-10deg] transition-transform duration-300" />
              Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div 
        className={`
          lg:hidden fixed top-0 left-0 right-0 z-40 
          flex items-center justify-between h-16 px-4 
          bg-gradient-to-r from-[#1C294E] to-[#1a2744]
          shadow-lg shadow-black/10
          transition-all duration-300
          ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
        `}
      >
        <div className="flex items-center">
          <div className="relative">
            <div className="w-9 h-9 bg-gradient-to-br from-[#079447] to-emerald-500 rounded-lg flex items-center justify-center shadow-md shadow-[#079447]/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="ml-2.5">
            <span className="text-lg font-bold text-white tracking-tight">Impress</span>
            <span className="text-[10px] text-gray-400 ml-1.5 font-medium">Admin</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Notification Bell */}
          <div className="[&_button]:text-white [&_button]:hover:bg-white/10 [&_button]:rounded-lg [&_button]:transition-all [&_button]:duration-300">
            <AdminNotificationBell />
          </div>
          
          {/* Menu Toggle */}
          <button
            onClick={mobileMenuOpen ? handleCloseMobileMenu : handleOpenMobileMenu}
            className="relative p-2.5 rounded-xl text-white hover:bg-white/10 transition-all duration-300 active:scale-95"
            aria-label="Toggle menu"
          >
            <div className="relative w-6 h-6">
              {/* Hamburger to X animation */}
              <span 
                className={`
                  absolute left-0 top-1 w-6 h-0.5 bg-current rounded-full
                  transition-all duration-300 ease-out origin-center
                  ${mobileMenuOpen && !isClosing ? 'rotate-45 top-[11px]' : ''}
                `}
              />
              <span 
                className={`
                  absolute left-0 top-[11px] w-6 h-0.5 bg-current rounded-full
                  transition-all duration-300 ease-out
                  ${mobileMenuOpen && !isClosing ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}
                `}
              />
              <span 
                className={`
                  absolute left-0 bottom-1 w-6 h-0.5 bg-current rounded-full
                  transition-all duration-300 ease-out origin-center
                  ${mobileMenuOpen && !isClosing ? '-rotate-45 bottom-[11px]' : ''}
                `}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay & Panel */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className={`
              lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm
              transition-opacity duration-300
              ${isClosing ? 'opacity-0' : 'opacity-100'}
            `}
            onClick={handleCloseMobileMenu}
          />

          {/* Menu Panel */}
          <div
            className={`
              lg:hidden fixed inset-y-0 right-0 z-40 w-72
              bg-gradient-to-b from-[#1C294E] via-[#1a2744] to-[#151e36]
              shadow-2xl shadow-black/50
              transition-transform duration-300 ease-out
              ${isClosing ? 'translate-x-full' : 'translate-x-0'}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#079447]/5 via-transparent to-transparent pointer-events-none" />

            <div className="flex flex-col h-full pt-20 pb-6 relative z-10">
              {/* Navigation */}
              <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                {navItems.map((item, index) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  const badgeCount = item.badge ? getBadgeCount(item) : 0

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleCloseMobileMenu}
                      className={`
                        group relative flex items-center justify-between px-4 py-3.5 text-sm font-medium rounded-xl
                        transition-all duration-300 ease-out
                        ${isActive
                          ? 'bg-gradient-to-r from-[#079447] to-emerald-500 text-white shadow-lg shadow-[#079447]/25'
                          : 'text-gray-300 hover:text-white hover:bg-white/10 active:scale-[0.98]'
                        }
                      `}
                      style={{
                        opacity: isClosing ? 0 : 1,
                        transform: isClosing ? 'translateX(20px)' : 'translateX(0)',
                        transition: `all 0.3s ease-out ${index * 30}ms`,
                      }}
                    >
                      {/* Active indicator */}
                      <div 
                        className={`
                          absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-white
                          transition-all duration-300
                          ${isActive ? 'h-8 opacity-100' : 'h-0 opacity-0'}
                        `}
                      />

                      <div className="flex items-center">
                        <Icon 
                          className={`
                            mr-3 h-5 w-5 transition-all duration-300
                            ${isActive ? 'scale-110' : 'group-hover:scale-110'}
                          `}
                        />
                        {item.label}
                      </div>

                      {badgeCount > 0 && (
                        <div className="relative">
                          <Badge variant="danger" size="sm" className="animate-pulse">
                            {badgeCount}
                          </Badge>
                          <div className="absolute inset-0 bg-red-500 rounded-full blur-md opacity-40" />
                        </div>
                      )}

                      <ChevronRight 
                        className={`
                          w-4 h-4 transition-all duration-300
                          ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}
                        `}
                      />
                    </Link>
                  )
                })}
              </nav>

              {/* Notifications */}
              <div 
                className="mx-4 mb-3 p-3 rounded-xl bg-white/5 border border-white/10"
                style={{
                  opacity: isClosing ? 0 : 1,
                  transform: isClosing ? 'translateY(10px)' : 'translateY(0)',
                  transition: 'all 0.3s ease-out 150ms',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">Notifications</span>
                  <AdminNotificationBell />
                </div>
              </div>

              {/* Logout */}
              <div 
                className="px-4 pt-3 border-t border-white/10"
                style={{
                  opacity: isClosing ? 0 : 1,
                  transform: isClosing ? 'translateY(10px)' : 'translateY(0)',
                  transition: 'all 0.3s ease-out 200ms',
                }}
              >
                <button
                  onClick={handleLogout}
                  className="group flex items-center w-full px-4 py-3.5 text-sm font-medium text-gray-300 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 active:scale-[0.98]"
                >
                  <LogOut className="mr-3 h-5 w-5 group-hover:rotate-[-10deg] transition-transform duration-300" />
                  Log Out
                </button>
              </div>

              {/* Version info */}
              <div 
                className="px-6 pt-4 text-center"
                style={{
                  opacity: isClosing ? 0 : 1,
                  transition: 'all 0.3s ease-out 250ms',
                }}
              >
                <p className="text-[10px] text-gray-500">Impress Admin v3.0</p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}