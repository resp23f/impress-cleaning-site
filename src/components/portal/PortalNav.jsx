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
 X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import styles from '../../app/portal/shared-animations.module.css'

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
  <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col bg-white border-r border-gray-100 shadow-[4px_0_24px_-8px_rgba(0,0,0,0.08)]">
  <div className="flex flex-col flex-grow pt-8 overflow-y-auto">
  
  {/* Logo & Welcome */}
  <div className="flex-shrink-0 px-6 mb-8">
  <img
  src="/ImpressLogoNoBackgroundBlue.png"
  alt="Impress Cleaning Services"
  className="h-16 w-auto mx-auto mb-6"
  />
  </div>
  
{/* Navigation */}
      <nav className="flex-1 px-4 pt-2 pb-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
   const Icon = item.icon
   const isActive = pathname === item.href
   return (
    <Link
    key={item.href}
    href={item.href}
className={`
 group flex items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-xl ${styles.smoothTransition}
 ${isActive
  ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-200/50'
  : 'text-gray-600 hover:bg-emerald-50/80 hover:text-emerald-900 shadow-sm shadow-transparent hover:shadow-gray-200/50'
 }
`}
>
<div className={`
 w-9 h-9 rounded-lg flex items-center justify-center ${styles.smoothTransition}
 ${isActive
      ? 'bg-white/20'
      : 'bg-gray-100 group-hover:bg-emerald-50'
     }
`}>    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-emerald-600'}`} />
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
   className="group flex items-center gap-3 w-full px-4 py-3.5 text-sm font-medium text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-200"
   >
   <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-red-100 flex items-center justify-center transition-all">
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
   <button
   onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
   className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
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
<div className="lg:hidden fixed inset-0 z-50 bg-black/30"
  onClick={() => setMobileMenuOpen(false)}>
  <div
      className="fixed inset-y-0 right-0 w-80 backdrop-blur-xl bg-white/40 shadow-2xl flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
    {/* Header with user greeting */}
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
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`
                group flex items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-xl ${styles.smoothTransition}
                ${isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-200/50'
                  : 'text-gray-600 hover:bg-emerald-50/80 hover:text-emerald-900'
                }
              `}
            >
              <div className={`
                w-9 h-9 rounded-lg flex items-center justify-center ${styles.smoothTransition}
                ${isActive ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-emerald-50'}
              `}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-emerald-600'}`} />
              </div>
              <span className="flex-1">{item.label}</span>
            </Link>
          )
        })}
      </nav>

{/* Logout - pinned to bottom */}
      <div className="p-4">    
                <button
          onClick={handleLogout}
          className="group flex items-center gap-3 w-full px-4 py-3.5 text-sm font-medium text-red-600 rounded-xl bg-red-50 hover:bg-red-100 transition-all duration-200"
        >
          <div className="w-9 h-9 rounded-lg bg-red-100 group-hover:bg-red-200 flex items-center justify-center transition-all">
            <LogOut className="w-5 h-5 text-red-600" />
          </div>
          <span className="flex-1 text-left">Log Out</span>
        </button>
      </div>
    </div>
  </div>
)}    
    {/* Mobile Bottom Navigation */}
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 shadow-[0_-2px_16px_rgba(0,0,0,0.04)]">
    <nav className="flex justify-around px-2 py-2">
    {navItems.slice(0, 4).map((item) => {
     const Icon = item.icon
     const isActive = pathname === item.href
     return (
      <Link
      key={item.href}
      href={item.href}
      className="flex flex-col items-center gap-1 py-2 px-3 min-w-0 group"
      >
      <div className={`
         w-10 h-10 rounded-xl flex items-center justify-center transition-all
         ${isActive
       ? 'bg-gradient-to-br from-emerald-500 to-green-500 shadow-md shadow-emerald-200/50'
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
    <Link
    href="/portal/settings"
    className="flex flex-col items-center gap-1 py-2 px-3 min-w-0 group"
    >
    <div className={`
       w-10 h-10 rounded-xl flex items-center justify-center transition-all
       ${pathname === '/portal/settings'
     ? 'bg-gradient-to-br from-emerald-500 to-green-500 shadow-md shadow-emerald-200/50'
     : 'bg-gray-50 group-hover:bg-emerald-50'
    }
      `}>
    <Settings className={`w-5 h-5 ${pathname === '/portal/settings' ? 'text-white' : 'text-gray-500 group-hover:text-emerald-600'}`} />
    </div>
    <span className={`text-xs font-medium ${pathname === '/portal/settings' ? 'text-emerald-600' : 'text-gray-500'}`}>
    Settings
    </span>
    </Link>
    </nav>
    </div>
    </>
   )
  }