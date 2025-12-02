'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format, parseISO, isAfter, isBefore } from 'date-fns'
import styles from '../shared-animations.module.css'
import {
  History,
  Filter,
  MapPin,
  Users,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { CardSkeleton } from '@/components/ui/SkeletonLoader'
import toast from 'react-hot-toast'

const serviceTypeLabel = (type) => {
 const labels = {
  standard: 'Standard Cleaning',
  deep: 'Deep Cleaning',
  move_in_out: 'Move In/Out',
  post_construction: 'Post-Construction',
  office: 'Office Cleaning',
 }
 return labels[type] || type
}

export default function ServiceHistoryPage() {
 const router = useRouter()
 const supabase = useMemo(() => createClient(), [])
 
 const [loading, setLoading] = useState(true)
 const [services, setServices] = useState([])
 
 const [filters, setFilters] = useState({
  startDate: '',
  endDate: '',
  serviceType: 'all',
 })
 
// custom date picker state
  const [openFromCal, setOpenFromCal] = useState(false)
  const [openToCal, setOpenToCal] = useState(false)
  const [fromCalendarMonth, setFromCalendarMonth] = useState(new Date())
  const [toCalendarMonth, setToCalendarMonth] = useState(new Date())
  const calendarRef = useRef(null)

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setOpenFromCal(false)
        setOpenToCal(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

 const weekdayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
 
 const getCalendarDays = () => {
  const firstOfMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
  const start = new Date(firstOfMonth)
  start.setDate(start.getDate() - firstOfMonth.getDay())
  
  const days = []
  for (let i = 0; i < 42; i++) {
   const d = new Date(start)
   start.setDate(start.getDate() + 1)
   days.push(d)
  }
  return days
 }
 
 const calendarDays = getCalendarDays()
 
 useEffect(() => {
  const load = async () => {
   setLoading(true)
   try {
    const {
     data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
     router.push('/auth/login')
     return
    }
    
    const { data: history, error } = await supabase
    .from('service_history')
    .select('*')
    .eq('customer_id', user.id)
    .order('completed_date', { ascending: false })
    
    if (error) throw error
    
    if (!history || history.length === 0) {
     setServices([])
     return
    }
    
    const appointmentIds = history.map((h) => h.appointment_id).filter(Boolean)
    const appointmentsMap = {}
    const invoicesMap = {}
    
    if (appointmentIds.length > 0) {
     const { data: appointments, error: apptError } = await supabase
     .from('appointments')
     .select(
      `
              id,
              service_type,
              scheduled_date,
              team_members,
              address_id,
              service_addresses:address_id (
                street_address,
                unit,
                city,
                state,
                zip_code
              )
            `
     )
     .in('id', appointmentIds)
     
     if (apptError) throw apptError
     
     appointments?.forEach((apt) => {
      appointmentsMap[apt.id] = apt
     })
     
     const { data: invoices, error: invoiceError } = await supabase
     .from('invoices')
     .select('id, appointment_id, invoice_number, amount, status')
     .in('appointment_id', appointmentIds)
     
     if (invoiceError) throw invoiceError
     
     invoices?.forEach((inv) => {
      invoicesMap[inv.appointment_id] = inv
     })
    }
    
    const merged = history.map((h) => ({
     ...h,
     appointment: h.appointment_id ? appointmentsMap[h.appointment_id] : null,
     invoice: h.appointment_id ? invoicesMap[h.appointment_id] : null,
    }))
    
    setServices(merged)
   } catch (err) {
    console.error('Error loading history', err)
    toast.error('Could not load service history')
   } finally {
    setLoading(false)
   }
  }
  load()
 }, [router, supabase])
 
 const filtered = services.filter((svc) => {
  const date = svc.completed_date ? parseISO(svc.completed_date) : null
  if (filters.startDate && date && isBefore(date, parseISO(filters.startDate))) {
   return false
  }
  if (filters.endDate && date && isAfter(date, parseISO(filters.endDate))) {
   return false
  }
  if (filters.serviceType !== 'all' && svc.service_type !== filters.serviceType) {
   return false
  }
  return true
 })
 
const DatePicker = ({ label, field }) => {
    const isFrom = field === 'startDate'
    const open = isFrom ? openFromCal : openToCal
    const toggle = (value) => (isFrom ? setOpenFromCal(value) : setOpenToCal(value))
    const value = filters[field]
    const calendarMonth = isFrom ? fromCalendarMonth : toCalendarMonth
    const setCalendarMonth = isFrom ? setFromCalendarMonth : setToCalendarMonth

    const getCalendarDays = () => {
      const firstOfMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
      const start = new Date(firstOfMonth)
      start.setDate(start.getDate() - firstOfMonth.getDay())
      const days = []
      for (let i = 0; i < 42; i++) {
        const d = new Date(start)
        start.setDate(start.getDate() + 1)
        days.push(d)
      }
      return days
    }

    const calendarDays = getCalendarDays()
    const today = new Date().toISOString().split('T')[0]

    return (
      <div className="min-w-0 relative" ref={open ? calendarRef : null}>
        <label className="text-sm font-semibold text-gray-700 mb-2 block">{label}</label>

        <button
          type="button"
          onClick={() => {
            // Close the other calendar first
            if (isFrom) setOpenToCal(false)
            else setOpenFromCal(false)
            toggle(!open)
          }}
          className={`
            w-full box-border rounded-xl border px-4 py-2.5
            bg-white text-left font-medium
            transition-all duration-200 ease-out
            ${open 
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 text-gray-900' 
              : 'border-gray-200 text-gray-900 hover:border-gray-300'
            }
          `}
        >
          {value ? format(parseISO(value), 'MMM d, yyyy') : 'Select a date'}
        </button>

        {open && (
          <div 
            className="
              absolute z-[9999] mt-2 w-72 bg-white rounded-2xl p-5
              shadow-[0_20px_50px_-15px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.05)]
              animate-in fade-in slide-in-from-top-2 duration-200
            "
            style={{ left: '50%', transform: 'translateX(-50%)' }}
          >
            {/* Calendar header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => {
                  const prev = new Date(calendarMonth)
                  prev.setMonth(prev.getMonth() - 1)
                  setCalendarMonth(prev)
                }}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-150"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <span className="font-bold text-[#1C294E]">
                {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button
                type="button"
                onClick={() => {
                  const next = new Date(calendarMonth)
                  next.setMonth(next.getMonth() + 1)
                  setCalendarMonth(next)
                }}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-150"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Weekday labels */}
            <div className="grid grid-cols-7 mb-2">
              {weekdayLabels.map((d) => (
                <div key={d} className="text-xs font-semibold text-gray-400 text-center py-2">
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((dateObj, idx) => {
                const iso = dateObj.toISOString().split('T')[0]
                const isCurrentMonth =
                  dateObj.getMonth() === calendarMonth.getMonth() &&
                  dateObj.getFullYear() === calendarMonth.getFullYear()
                const isSelected = value === iso
                const isToday = iso === today

                return (
                  <button
                    key={`${iso}-${idx}`}
                    type="button"
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, [field]: iso }))
                      toggle(false)
                    }}
                    className={`
                      w-9 h-9 flex items-center justify-center rounded-xl text-sm
                      transition-all duration-150 ease-out
                      ${isSelected
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-semibold shadow-md shadow-emerald-500/30'
                        : isToday && isCurrentMonth
                        ? 'bg-emerald-50 text-emerald-600 font-semibold ring-1 ring-emerald-200'
                        : isCurrentMonth
                        ? 'text-gray-700 hover:bg-gray-100 font-medium'
                        : 'text-gray-300'
                      }
                    `}
                  >
                    {dateObj.getDate()}
                  </button>
                )
              })}
            </div>

            {/* Quick actions */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setFilters((prev) => ({ ...prev, [field]: today }))
                  toggle(false)
                }}
                className="flex-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 py-2 rounded-lg transition-colors duration-150"
              >
                Today
              </button>
              {value && (
                <button
                  type="button"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, [field]: '' }))
                    toggle(false)
                  }}
                  className="flex-1 text-xs font-semibold text-gray-500 hover:bg-gray-100 py-2 rounded-lg transition-colors duration-150"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
   return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
    <div className="mb-10">
    <div className="h-8 w-48 bg-gray-200 rounded-lg mb-3 animate-pulse" />
    <div className="h-5 w-64 bg-gray-200 rounded-lg animate-pulse" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <CardSkeleton />
    <CardSkeleton />
    <CardSkeleton />
    <CardSkeleton />
    </div>
    </div>
    </div>
   )
  }
  
  return (
   <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
   <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
   {/* Header */}
   <div className={`mb-10 ${styles.animateFadeIn}`}>
   <div className="flex items-center gap-3 mb-2">
   <div className="h-1 w-12 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" />
   <span className="text-sm font-medium text-emerald-600 uppercase tracking-wider">
   History
   </span>
   </div>
   <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
   <div>
   <h1 className="text-4xl sm:text-5xl font-bold text-[#1C294E] mb-3 tracking-tight">
   Service History
   </h1>
   <p className="text-lg text-gray-500">Your completed cleanings and receipts</p>
   </div>
   <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-100 shadow-sm">
   <History className="w-4 h-4 text-emerald-500" />
   <span className="text-sm text-gray-600 font-medium">Auto-synced</span>
   </div>
   </div>
   </div>
   
   {/* Filters */}
   <div
   className={`
          rounded-2xl bg-white p-6 sm:p-8 mb-8 
          shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)]
          border border-gray-100/80
          ${styles.animateFadeInUp} ${styles.stagger1}
        `}
    >
    <div className="flex items-center gap-3 mb-6">
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
    <Filter className="w-5 h-5 text-gray-500" />
    </div>
    <h2 className="text-xl font-bold text-[#1C294E]">Filter Services</h2>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <DatePicker label="From Date" field="startDate" />
    <DatePicker label="To Date" field="endDate" />
    
    <div className="min-w-0">
    <label className="text-sm font-semibold text-gray-700 mb-2 block">
    Service Type
    </label>
    <select
    value={filters.serviceType}
    onChange={(e) =>
     setFilters((prev) => ({ ...prev, serviceType: e.target.value }))
    }
    className={`
                  w-full rounded-xl border border-gray-200 px-4 py-2.5 
                  bg-white text-gray-900 font-medium appearance-none
                  focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                  ${styles.smoothTransition}
                `}
     >
     <option value="all">All Types</option>
     <option value="standard">Standard Cleaning</option>
     <option value="deep">Deep Cleaning</option>
     <option value="move_in_out">Move In/Out</option>
     <option value="post_construction">Post-Construction</option>
     <option value="office">Office Cleaning</option>
     </select>
     </div>
     </div>
     
     {(filters.startDate || filters.endDate || filters.serviceType !== 'all') && (
      <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100">
      <p className="text-sm text-gray-600">
      <span className="font-semibold text-[#1C294E]">{filtered.length}</span>{' '}
      service{filtered.length !== 1 ? 's' : ''} found
      </p>
      <button
      onClick={() =>
       setFilters({ startDate: '', endDate: '', serviceType: 'all' })
      }
      className={`text-sm font-semibold text-emerald-600 hover:text-emerald-700 ${styles.smoothTransition}`}
      >
      Clear filters
      </button>
      </div>
     )}
     </div>
     
     {/* Results */}
     {filtered.length === 0 ? (
      <div
      className={`
            rounded-2xl bg-white p-12 text-center
            shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)]
            border border-gray-100/80
            ${styles.animateFadeInUp} ${styles.stagger2}
          `}
       >
       <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-50 to-slate-100 mb-6">
       <History className="w-10 h-10 text-gray-300" />
       </div>
       <h3 className="text-xl font-bold text-[#1C294E] mb-2">No Services Found</h3>
       <p className="text-gray-500 mb-8 max-w-sm mx-auto">
       {services.length === 0
        ? 'Your completed cleanings will appear here after your first service.'
        : 'Try adjusting your filters to see more results.'}
        </p>
        {services.length === 0 && (
         <Link href="/portal/request-service">
         <Button variant="primary" className={styles.smoothTransition}>
         <Sparkles className="w-5 h-5" />
         Request Service
         </Button>
         </Link>
        )}
        </div>
       ) : (
        <div
        className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${styles.animateFadeInUp} ${styles.stagger2}`}
        >
        {filtered.map((svc, index) => (
         <div
         key={svc.id}
         className={`
                  relative overflow-hidden rounded-2xl bg-white
                  shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)]
                  border border-gray-100/80
                  ${styles.cardHover} ${styles.animateFadeInUp}
                `}
          style={{ animationDelay: `${0.1 * (index % 4)}s`, opacity: 0 }}
          >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
          
          <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between mb-6">
          <div>
          <p className="text-2xl font-bold text-[#1C294E] mb-1">
          {format(parseISO(svc.completed_date), 'EEEE')}
          </p>
          <p className="text-gray-500">
          {format(parseISO(svc.completed_date), 'MMMM d, yyyy')}
          </p>
          </div>
          <Badge variant="success" className="flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4" />
          Completed
          </Badge>
          </div>
          
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 mb-6">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
          Service Type
          </p>
          <p className="text-lg font-bold text-[#1C294E]">
          {serviceTypeLabel(svc.service_type)}
          </p>
          </div>
          
          <div className="space-y-3 mb-6">
          {svc.appointment?.service_addresses && (
           <div className="flex items-start gap-2">
           <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
           <p className="text-sm text-gray-600 leading-relaxed">
           {svc.appointment.service_addresses.street_address}
           {svc.appointment.service_addresses.unit &&
            `, ${svc.appointment.service_addresses.unit}`}
            , {svc.appointment.service_addresses.city},{' '}
            {svc.appointment.service_addresses.state}{' '}
            {svc.appointment.service_addresses.zip_code}
            </p>
            </div>
           )}
           
           {svc.team_members && svc.team_members.length > 0 && (
            <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <p className="text-sm text-gray-600">
            {svc.team_members.join(', ')}
            </p>
            </div>
           )}
           </div>
           
           </div>
           </div>
          ))}
          </div>
         )}
         </div>
         </div>
        )
       }
       