'use client'
import { useState } from 'react'
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
  Bell
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Badge from '@/components/ui/Badge'
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
  const supabase = createClient()
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }
const getBadgeCount = (item) => {
  if (item.href === '/admin/requests') return requestsCount
  return 0
}
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-[#1C294E]">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-6 mb-8">
            <div className="w-10 h-10 bg-[#079447] rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-white">IC</span>
            </div>
            <div className="ml-3">
              <span className="text-xl font-bold text-white">Impress</span>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              const badgeCount = item.badge ? getBadgeCount(item) : 0
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    group flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg transition-colors
                    ${isActive
                      ? 'bg-[#079447] text-white'
                      : 'text-gray-300 hover:bg-white/10'
                    }
                  `}
                >
                  <div className="flex items-center">
                    <Icon className={`mr-3 h-5 w-5`} />
                    {item.label}
                  </div>
                  {badgeCount > 0 && (
                    <Badge variant="danger" size="sm">
                      {badgeCount}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>
          {/* Logout */}
          <div className="p-3 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="group flex items-center w-full px-3 py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-white/10 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Log Out
            </button>
          </div>
        </div>
      </aside>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-16 px-4 bg-[#1C294E]">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-[#079447] rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-white">IC</span>
          </div>
          <div className="ml-2">
            <span className="text-lg font-bold text-white">Admin</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-white hover:bg-white/10"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="fixed inset-y-0 right-0 w-64 bg-[#1C294E] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full pt-20 pb-4">
              {/* Navigation */}
              <nav className="flex-1 px-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  const badgeCount = item.badge ? getBadgeCount(item) : 0
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        group flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg transition-colors
                        ${isActive
                          ? 'bg-[#079447] text-white'
                          : 'text-gray-300 hover:bg-white/10'
                        }
                      `}
                    >
                      <div className="flex items-center">
                        <Icon className="mr-3 h-5 w-5" />
                        {item.label}
                      </div>
                      {badgeCount > 0 && (
                        <Badge variant="danger" size="sm">
                          {badgeCount}
                        </Badge>
                      )}
                    </Link>
                  )
                })}
              </nav>
              {/* Logout */}
              <div className="px-3 pt-3 border-t border-white/10">
                <button
                  onClick={handleLogout}
                  className="group flex items-center w-full px-3 py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}