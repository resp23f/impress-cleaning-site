'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format, parseISO, isAfter, isBefore } from 'date-fns'
import styles from '../shared-animations.module.css'
import {
 History,
 Calendar,
 Filter,
 Image as ImageIcon,
 Receipt,
 CheckCircle,
 FileDown,
 MapPin,
 Users,
 Sparkles,
 ChevronRight,
 Star,
 Download
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
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
 
 useEffect(() => {
  const load = async () => {
   setLoading(true)
   try {
    const { data: { user } } = await supabase.auth.getUser()
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
     .select(`
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
            `)
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
   <p className="text-lg text-gray-500">
   Your completed cleanings and receipts
   </p>
   </div>
   <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-100 shadow-sm">
   <History className="w-4 h-4 text-emerald-500" />
   <span className="text-sm text-gray-600 font-medium">Auto-synced</span>
   </div>
   </div>
   </div>
   
   {/* Filters Card */}
   <div className={`
          rounded-2xl bg-white p-6 sm:p-8 mb-8
          shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)]
          border border-gray-100/80
          ${styles.animateFadeInUp} ${styles.stagger1}
        `}>
    <div className="flex items-center gap-3 mb-6">
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
    <Filter className="w-5 h-5 text-gray-500" />
    </div>
    <h2 className="text-xl font-bold text-[#1C294E]">Filter Services</h2>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div>
    <label className="text-sm font-semibold text-gray-700 mb-2 block">From Date</label>
<Input
  type="date"
  value={filters.startDate}
  onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
  className={`${styles.smoothTransition} ${styles.mobileInput}`}
/>    </div>
    
    <div>
    <label className="text-sm font-semibold text-gray-700 mb-2 block">To Date</label>
<Input
  type="date"
  value={filters.endDate}
  onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
  className={`${styles.smoothTransition} ${styles.mobileInput}`}
/>    </div>
    
    <div>
    <label className="text-sm font-semibold text-gray-700 mb-2 block">Service Type</label>
    <select
    value={filters.serviceType}
    onChange={(e) => setFilters((prev) => ({ ...prev, serviceType: e.target.value }))}
    className={`
                  w-full rounded-xl border border-gray-200 px-4 py-2.5 
                  focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                  bg-white text-gray-900 font-medium
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
      <span className="font-semibold text-[#1C294E]">{filtered.length}</span> service{filtered.length !== 1 ? 's' : ''} found
      </p>
      <button
      onClick={() => setFilters({ startDate: '', endDate: '', serviceType: 'all' })}
      className={`text-sm font-semibold text-emerald-600 hover:text-emerald-700 ${styles.smoothTransition}`}
      >
      Clear filters
      </button>
      </div>
     )}
     </div>
     
     {/* Services Grid */}
     {filtered.length === 0 ? (
      <div className={`
            rounded-2xl bg-white p-12 text-center
            shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)]
            border border-gray-100/80
            ${styles.animateFadeInUp} ${styles.stagger2}
          `}>
       <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-50 to-slate-100 mb-6">
       <History className="w-10 h-10 text-gray-300" />
       </div>
       <h3 className="text-xl font-bold text-[#1C294E] mb-2">
       No Services Found
       </h3>
       <p className="text-gray-500 mb-8 max-w-sm mx-auto">
       {services.length === 0 
        ? "Your completed cleanings will appear here after your first service."
        : "Try adjusting your filters to see more results."
       }
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
       <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${styles.animateFadeInUp} ${styles.stagger2}`}>
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
         {/* Decorative accent */}
         <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
         
         <div className="p-6 sm:p-8">
         {/* Header */}
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
         
         {/* Service Type */}
         <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 mb-6">
         <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
         Service Type
         </p>
         <p className="text-lg font-bold text-[#1C294E]">
         {serviceTypeLabel(svc.service_type)}
         </p>
         </div>
         
         {/* Details */}
         <div className="space-y-3 mb-6">
         {/* Address */}
         {svc.appointment?.service_addresses && (
          <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-600 leading-relaxed">
          {svc.appointment.service_addresses.street_address}
          {svc.appointment.service_addresses.unit && `, ${svc.appointment.service_addresses.unit}`}, {svc.appointment.service_addresses.city}, {svc.appointment.service_addresses.state}{' '}
          {svc.appointment.service_addresses.zip_code}
          </p>
          </div>
         )}
         
         {/* Team Members */}
         {svc.team_members && svc.team_members.length > 0 && (
          <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <p className="text-sm text-gray-600">
          {svc.team_members.join(', ')}
          </p>
          </div>
         )}
         </div>
         
         {/* Actions */}
         <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-100">
         {svc.invoice && (
          <Link href={`/portal/invoices?focus=${svc.invoice.id}`} className="flex-1 min-w-[140px]">
          <Button
          variant="outline"
          fullWidth
          size="sm"
          className={styles.smoothTransition}
          >
          <Receipt className="w-4 h-4" />
          View Invoice
          </Button>
          </Link>
         )}
         {svc.invoice?.id && (
          <Link href={`/portal/invoices/${svc.invoice.id}/pay`} className="flex-1 min-w-[140px]">
          <Button
          variant="secondary"
          fullWidth
          size="sm"
          className={styles.smoothTransition}
          >
          <Download className="w-4 h-4" />
          Receipt
          </Button>
          </Link>
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