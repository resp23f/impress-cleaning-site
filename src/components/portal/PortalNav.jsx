'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
 Home,
 Calendar,
 History,
 Receipt,
 Settings,
 LogOut,
 Menu,
 X
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
const navItems = [
 { icon: Home, label: 'Dashboard', href: '/portal/dashboard' },
 { icon: Calendar, label: 'Appointments', href: '/portal/appointments' },
 { icon: History, label: 'Service History', href: '/portal/service-history' },
 { icon: Receipt, label: 'Invoices', href: '/portal/invoices' },
 { icon: Settings, label: 'Settings', href: '/portal/settings' },
]
export default function PortalNav({ userName }) {
 const pathname = usePathname()
 const router = useRouter()
 const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
 const supabase = createClient()
 const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/auth/login')
 }
 return (
  <>
  {/* Desktop Sidebar */}
<aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-gradient-to-b from-white via-white to-slate-50 border-r border-gray-100 shadow-[1px_0_30px_-15px_rgba(0,0,0,0.1)]">  <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
  {/* Logo */}
  <div className="flex items-center flex-shrink-0 px-6 mb-8">
  <img
  src="/ImpressLogoNoBackgroundBlue.png"
  alt="Impress Cleaning Services"
  className="h-19 w-auto"
  />
  </div>
  {/* Navigation */}
  <nav className="flex-1 px-3 space-y-1">
  {navItems.map((item) => {
   const Icon = item.icon
   const isActive = pathname === item.href
   return (
    <Link
    key={item.href}
    href={item.href}
className={`
                    group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200
                    ${isActive
     ? 'bg-gradient-to-r from-[#079447] to-emerald-500 text-white shadow-md shadow-emerald-200'
     : 'text-gray-600 hover:bg-gray-100/80 hover:text-[#1C294E]'
    }
                  `}    >
    <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`} />
    {item.label}
    </Link>
   )
  })}
  </nav>
  {/* Logout */}
  <div className="p-3 border-t border-gray-200">
  <button
  onClick={handleLogout}
  className="group flex items-center w-full px-3 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
  >
  <LogOut className="mr-3 h-5 w-5 text-gray-500 group-hover:text-gray-700" />
  Log Out
  </button>
  </div>
  </div>
  </aside>
  {/* Mobile Header */}
  <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
  <div className="flex items-center">
  <img
  src="/ImpressLogoNoBackgroundBlue.png"
  alt="Impress Cleaning Services"
  className="h-11 w-auto"
  />
  </div>
  <button
  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
  className="p-2 rounded-lg hover:bg-gray-100"
  >
  {mobileMenuOpen ? (
   <X className="w-6 h-6 text-gray-700" />
  ) : (
   <Menu className="w-6 h-6 text-gray-700" />
  )}
  </button>
  </div>
  {/* Mobile Menu */}
  {mobileMenuOpen && (
   <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
   <div
   className="fixed inset-y-0 right-0 w-64 bg-white shadow-xl"
   onClick={(e) => e.stopPropagation()}
   >
   <div className="flex flex-col h-full pt-20 pb-4">
   {/* User Info */}
   {userName && (
    <div className="px-6 mb-6">
    <p className="text-sm text-gray-600">Welcome back,</p>
    <p className="text-lg font-semibold text-[#1C294E]">{userName}</p>
    </div>
   )}
   {/* Navigation */}
   <nav className="flex-1 px-3 space-y-1">
   {navItems.map((item) => {
    const Icon = item.icon
    const isActive = pathname === item.href
    return (
     <Link
     key={item.href}
     href={item.href}
     onClick={() => setMobileMenuOpen(false)}
className={`
                    group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200
                    ${isActive
     ? 'bg-gradient-to-r from-[#079447] to-emerald-500 text-white shadow-md shadow-emerald-200'
     : 'text-gray-600 hover:bg-gray-100/80 hover:text-[#1C294E]'
    }
                  `}     >
     <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
     {item.label}
     </Link>
    )
   })}
   </nav>
   {/* Logout */}
   <div className="px-3 pt-3 border-t border-gray-200">
   <button
   onClick={handleLogout}
className="group flex items-center w-full px-3 py-3 text-sm font-medium text-gray-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-200"   >
   <LogOut className="mr-3 h-5 w-5 text-gray-500" />
   Log Out
   </button>
   </div>
   </div>
   </div>
   </div>
  )}
  {/* Mobile Bottom Navigation */}
  <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200">
  <nav className="flex justify-around">
  {navItems.slice(0, 4).map((item) => {
   const Icon = item.icon
   const isActive = pathname === item.href
   return (
    <Link
    key={item.href}
    href={item.href}
    className={`
                  flex flex-col items-center py-2 px-3 min-w-0
                  ${isActive ? 'text-[#079447]' : 'text-gray-600'}
                `}
     >
     <Icon className="h-6 w-6" />
     <span className="text-xs mt-1">{item.label.split(' ')[0]}</span>
     </Link>
    )
   })}
   <Link
   href="/portal/settings"
   className={`
              flex flex-col items-center py-2 px-3 min-w-0
              ${pathname === '/portal/settings' ? 'text-[#079447]' : 'text-gray-600'}
            `}
    >
    <Settings className="h-6 w-6" />
    <span className="text-xs mt-1">Settings</span>
    </Link>
    </nav>
    </div>
    </>
   )
  }