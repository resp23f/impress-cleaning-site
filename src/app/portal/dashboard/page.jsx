'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import {
 Calendar,
 Clock,
 MapPin,
 Users,
 CreditCard,
 FileText,
 Plus,
 CheckCircle,
 ChevronRight,
 Sparkles,
 Home,
 Quote,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { DashboardSkeleton } from '@/components/ui/SkeletonLoader'
import InvoiceSidePanel from '../invoices/InvoiceSidePanel'
import styles from '../shared-animations.module.css'

export default function DashboardPage() {
 const router = useRouter()
 const supabase = createClient()

 const [loading, setLoading] = useState(true)
 const [user, setUser] = useState(null)
 const [profile, setProfile] = useState(null)
 const [primaryAddress, setPrimaryAddress] = useState(null)
 const [upcomingAppointments, setUpcomingAppointments] = useState([])
 const [recentServices, setRecentServices] = useState([])
 const [invoices, setInvoices] = useState([])
 const [balance, setBalance] = useState(0)

 // Invoice side panel state
 const [selectedInvoiceId, setSelectedInvoiceId] = useState(null)
 const [isPanelOpen, setIsPanelOpen] = useState(false)

 useEffect(() => {
  loadDashboard()
 }, [])

 const loadDashboard = async () => {
  try {
   const { data: { user: authUser } } = await supabase.auth.getUser()

   if (!authUser) {
    router.push('/auth/login')
    return
   }

   setUser(authUser)

   // Get user profile
   const { data: profileData } = await supabase
    .from('profiles')
    .select('*, service_addresses(*)')
    .eq('id', authUser.id)
    .single()

   setProfile(profileData)

   const primary = profileData?.service_addresses?.find(addr => addr.is_primary) ||
    profileData?.service_addresses?.[0]
   setPrimaryAddress(primary)

   // Get upcoming *active* appointments (limit to 5 for the list)
   const today = new Date().toISOString().split('T')[0]

   const { data: upcomingData } = await supabase
    .from('appointments')
    .select('*')
    .eq('customer_id', authUser.id)
    .in('status', ['pending', 'confirmed', 'en_route'])
    .gte('scheduled_date', today)
    .order('scheduled_date', { ascending: true })
    .order('scheduled_time_start', { ascending: true })
    .limit(5)

   setUpcomingAppointments(upcomingData || [])

   // Get recent service history
   const { data: servicesData } = await supabase
    .from('service_history')
    .select('*')
    .eq('customer_id', authUser.id)
    .order('completed_date', { ascending: false })
    .limit(1)

   setRecentServices(servicesData || [])

   // Load ALL invoices for balance calculations
   const { data: allInvoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('customer_id', authUser.id)

   const unpaidInvoices = allInvoices?.filter(inv =>
    inv.status === 'sent' ||
    inv.status === 'pending' ||
    inv.status === 'overdue'
   ) || []

   const totalBalance = unpaidInvoices.reduce(
    (sum, inv) => sum + parseFloat(inv.total ?? inv.amount ?? 0),
    0
   )

   setBalance(totalBalance)

   // Load ONLY the 2 most recent invoices for the visual list
   const { data: invoicesData } = await supabase
    .from('invoices')
    .select('*')
    .eq('customer_id', authUser.id)
    .order('created_at', { ascending: false })
    .limit(1)

   setInvoices(invoicesData || [])

  } catch (error) {
   console.error('Error loading dashboard:', error)
  } finally {
   setLoading(false)
  }
 }

 const handleViewInvoice = (invoiceId) => {
  setSelectedInvoiceId(invoiceId)
  setIsPanelOpen(true)
 }

 const handleCloseSidePanel = () => {
  setIsPanelOpen(false)
  setTimeout(() => setSelectedInvoiceId(null), 300)
 }

 const formatServiceType = (type) => {
  const types = {
   standard: 'Standard Cleaning',
   deep: 'Deep Cleaning',
   move_in_out: 'Move In/Out Cleaning',
   post_construction: 'Post-Construction Cleaning',
   office: 'Office Cleaning',
  }
  return types[type] || type
 }

 const getAppointmentStatusVariant = (status) => {
  const map = {
   pending: 'warning',
   confirmed: 'info',
   en_route: 'info',
   completed: 'success',
   cancelled: 'danger',
  }
  return map[status] || 'default'
 }

 const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const [h, m, s] = timeStr.split(':')
  const d = new Date()
  d.setHours(Number(h || 0), Number(m || 0), Number(s || 0), 0)
  return format(d, 'h:mm a')
 }

 const getInvoiceStatusProps = (status) => {
  if (!status || status === 'draft') return null

  if (status === 'sent' || status === 'pending') {
   return { label: 'Unpaid', variant: 'info' }
  }
  if (status === 'paid') {
   return { label: 'Paid', variant: 'success' }
  }
  if (status === 'overdue') {
   return { label: 'Overdue', variant: 'danger' }
  }
  if (status === 'cancelled') {
   return { label: 'Cancelled', variant: 'default' }
  }

  return { label: status, variant: 'default' }
 }

 // Get greeting based on time of day
 const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
 }

if (loading) {
  return (
   <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
     <DashboardSkeleton />
    </div>
   </div>
  )
 }
 const firstName = profile?.full_name?.split(' ')[0] || 'there'
 const nextAppointment = upcomingAppointments[0]

 return (
  <>
   {/* Premium Background */}
   <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

     {/* ========== WELCOME HEADER ========== */}
     <div className={`mb-10 ${styles.animateFadeIn}`}>
      <div className="flex items-center gap-3 mb-2">
       <div className="h-1 w-12 bg-gradient-to-r from-[#079447] to-emerald-400 rounded-full" />
       <span className="text-sm font-medium text-[#079447] uppercase tracking-wider">
        Dashboard
       </span>
      </div>
      <h1 className="text-4xl sm:text-5xl font-bold text-[#1C294E] mb-3 tracking-tight">
       {getGreeting()}, {firstName}
      </h1>
      <p className="text-lg text-gray-500">
       Your home at a glance
      </p>
     </div>

     {/* ========== ROW 1: NEXT APPOINTMENT & BALANCE ========== */}
     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

      {/* Next Appointment Card - Premium Hero Style */}
      <div className={`lg:col-span-2 ${styles.animateFadeInUp} ${styles.stagger1}`}>
       <div className={`
                relative overflow-hidden rounded-2xl bg-white 
                shadow-[0_1px_3px_rgba(0,0,0,0.05),0_20px_40px_-15px_rgba(0,0,0,0.1)]
                border border-gray-100/80
                ${styles.cardHover}
              `}>
        {/* Decorative accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#079447] via-emerald-400 to-teal-400" />

        <div className="p-8">
         {nextAppointment ? (
          <>
           {/* Header */}
           <div className="flex items-start justify-between mb-8">
            <div>
             <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#079447]" />
              <span className="text-xs font-semibold text-[#079447] uppercase tracking-wider">
               Coming Up
              </span>
             </div>
             <h2 className="text-2xl font-bold text-[#1C294E]">
              Next Appointment
             </h2>
            </div>
            <Badge variant={getAppointmentStatusVariant(nextAppointment.status)}>
             {nextAppointment.status}
            </Badge>
           </div>

           {/* Main Content Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Left Column - Date & Time */}
            <div className="space-y-5">
             <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#079447]/10 to-emerald-50 flex items-center justify-center">
               <Calendar className="w-6 h-6 text-[#079447]" />
              </div>
              <div>
               <p className="text-2xl font-bold text-[#1C294E] leading-tight">
                {format(new Date(nextAppointment.scheduled_date), 'EEEE')}
               </p>
               <p className="text-lg text-gray-600">
                {format(new Date(nextAppointment.scheduled_date), 'MMMM d, yyyy')}
               </p>
              </div>
             </div>

             <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
               <Clock className="w-6 h-6 text-gray-400" />
              </div>
              <div>
               <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Window</p>    <p className="text-lg font-semibold text-[#1C294E]">
                {formatTime(nextAppointment.scheduled_time_start)} - {formatTime(nextAppointment.scheduled_time_end)}
               </p>
              </div>
             </div>    </div>

            {/* Right Column - Service & Location */}
            <div className="space-y-5">
             <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
               Service Type
              </p>
              <p className="text-lg font-bold text-[#1C294E]">
               {formatServiceType(nextAppointment.service_type)}
              </p>
             </div>

             {nextAppointment.team_members && nextAppointment.team_members.length > 0 && (
              <div className="flex items-center gap-3">
               <Users className="w-5 h-5 text-gray-400" />
               <p className="text-gray-600">
                Team: {nextAppointment.team_members.join(', ')}
               </p>
              </div>
             )}

             {primaryAddress && (
              <div className="flex items-start gap-3">
               <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
               <p className="text-gray-600 text-sm leading-relaxed">
                {primaryAddress.street_address}
                {primaryAddress.unit && `, ${primaryAddress.unit}`}
                <br />
                {primaryAddress.city}, {primaryAddress.state} {primaryAddress.zip_code}
               </p>
              </div>
             )}
            </div>
           </div>

           {/* Action Button */}
           <div className="flex gap-3">
            <Link href="/portal/appointments">
             <Button
              variant="primary"
              className={`
                              ${styles.smoothTransition} 
                              shadow-lg shadow-[#079447]/20 
                              hover:shadow-xl hover:shadow-[#079447]/30
                            `}
             >
              View Details
              <ChevronRight className="w-4 h-4 ml-1" />
             </Button>
            </Link>
           </div>
          </>
         ) : (
          /* Empty State - No Appointments */
          <div className="text-center py-12">
           <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 mb-6">
            <Calendar className="w-10 h-10 text-gray-300" />
           </div>
           <h3 className="text-xl font-bold text-[#1C294E] mb-2">
            No Upcoming Appointments
           </h3>
           <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            Ready to schedule your next cleaning? We'd love to help make your space shine.
           </p>
           <Link href="/portal/request-service">
            <Button
             variant="primary"
             className={`
                            ${styles.smoothTransition} 
                            shadow-lg shadow-[#079447]/20
                            hover:shadow-xl hover:shadow-[#079447]/30
                          `}
            >
             <Plus className="w-5 h-5" />
             Request Service
            </Button>
           </Link>
          </div>
         )}
        </div>
       </div>
      </div>

      {/* Balance Card - Premium Gradient Style */}
      <div className={`${styles.animateFadeInUp} ${styles.stagger2}`}>
       <div className={`
                relative overflow-hidden rounded-2xl h-full
                shadow-[0_1px_3px_rgba(0,0,0,0.05),0_20px_40px_-15px_rgba(0,0,0,0.1)]
      ${balance > 0
         ? 'bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 border border-red-200/60'
         : 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border border-emerald-200/50'
        }              ${styles.cardHover}
              `}>
        {/* Decorative circles */}
        <div className={`
  absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-15
  ${balance > 0 ? 'bg-red-300' : 'bg-emerald-300'}
`} />
        <div className={`
  absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-10
  ${balance > 0 ? 'bg-rose-300' : 'bg-green-300'}
`} />
        <div className="relative p-8 h-full flex flex-col">
         <div className="flex items-center gap-2 mb-6">
          <CreditCard className={`w-5 h-5 ${balance > 0 ? 'text-red-600' : 'text-emerald-600'}`} />
          <h2 className="text-lg font-bold text-[#1C294E]">
           Account Balance
          </h2>
         </div>

         {balance > 0 ? (
          <div className="flex-1 flex flex-col">
           <div className="mb-8">
            <p className="text-5xl font-bold text-red-600 mb-2 tracking-tight">
             ${balance.toFixed(2)}
            </p>
            <p className="text-sm font-medium text-gray-700">
             Balance Due
            </p>
           </div>
           <div className="mt-auto">
            <Link href="/portal/invoices">
             <Button
              variant="primary"
              fullWidth
              className={`
                              ${styles.smoothTransition}
                              bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700
                              shadow-lg shadow-red-200
                              hover:shadow-xl hover:shadow-red-300
                            `}
             >
              <CreditCard className="w-5 h-5" />         Pay Now
             </Button>
            </Link>
           </div>
          </div>
         ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
           <div className="relative mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-200">
             <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white shadow flex items-center justify-center">
             <Sparkles className="w-4 h-4 text-emerald-500" />
            </div>
           </div>
           <p className="text-4xl font-bold text-[#1C294E] mb-1">
            $0.00
           </p>
           <p className="text-emerald-600 font-medium">
            All caught up! 🎉
           </p>
          </div>
         )}
        </div>
       </div>
      </div>
     </div>

     {/* ========== ROW 2: INVOICES & RECENT SERVICES ========== */}
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

      {/* Invoices & Payments Card */}
      <div className={`${styles.animateFadeInUp} ${styles.stagger3} h-full`}>        <div className={`
                rounded-2xl bg-white p-6 sm:p-8 h-full
                shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)]
                border border-gray-100/80
                ${styles.cardHover}
              `}>
       <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
         <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
          <FileText className="w-5 h-5 text-blue-500" />
         </div>
         <h2 className="text-xl font-bold text-[#1C294E]">
          Invoices & Payments
         </h2>
        </div>
        <Link
         href="/portal/invoices"
         className={`
                      inline-flex items-center gap-1 text-sm font-semibold text-[#079447] 
                      hover:text-emerald-600 ${styles.smoothTransition}
                    `}
        >
         View All
         <ChevronRight className="w-4 h-4" />
        </Link>
       </div>

       {invoices && invoices.length > 0 ? (
        <div className="space-y-3">
         {invoices
          .filter((invoice) => invoice.status !== 'draft')
          .map((invoice) => {
           const statusProps = getInvoiceStatusProps(invoice.status)

           return (
            <div
             key={invoice.id}
             className={`
 p-4 rounded-xl bg-gradient-to-br from-white to-gray-50/50
  hover:shadow-md
  ${styles.smoothTransition}
`}               >
             <div className="flex items-start justify-between mb-3">
              <div>
               <p className="font-bold text-[#1C294E]">
                Invoice {invoice.invoice_number}
               </p>
               <p className="text-sm text-gray-500 mt-0.5">
                {format(new Date(invoice.created_at), 'MMM d, yyyy')}
               </p>
              </div>
              <div className="text-right">
               <p className="text-lg font-bold text-[#1C294E]">
                ${parseFloat(invoice.total ?? invoice.amount ?? 0).toFixed(2)}
               </p>
               {statusProps && (
                <Badge variant={statusProps.variant} size="sm">
                 {statusProps.label}
                </Badge>
               )}
              </div>
             </div>
             <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-gray-100">
              {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
               <Link href={`/portal/invoices/${invoice.id}/pay`}>
                <Button
                 variant="primary"
                 size="sm"
                 className={`${styles.smoothTransition} shadow-sm`}
                >
                 Pay Now
                </Button>
               </Link>
              )}
              <Button
               variant="outline"
               size="sm"
               className={styles.smoothTransition}
               onClick={() => handleViewInvoice(invoice.id)}
              >
               View
              </Button>
             </div>
            </div>
           )
          })}
        </div>
       ) : (
        <div className="text-center py-12">
         <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-50 mb-4">
          <FileText className="w-8 h-8 text-gray-300" />
         </div>
         <p className="text-gray-500">No invoices yet</p>
        </div>
       )}
      </div>
      </div>

      {/* Recent Services Card */}
      <div className={`${styles.animateFadeInUp} ${styles.stagger4} h-full`}>            <div className={`
                rounded-2xl bg-white p-6 sm:p-8 h-full
                shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)]
                border border-gray-100/80
                ${styles.cardHover}
              `}>
       <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
         <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
         </div>
         <h2 className="text-xl font-bold text-[#1C294E]">
          Recent Services
         </h2>
        </div>
        <Link
         href="/portal/service-history"
         className={`
                      inline-flex items-center gap-1 text-sm font-semibold text-[#079447] 
                      hover:text-emerald-600 ${styles.smoothTransition}
                    `}
        >
         View All
         <ChevronRight className="w-4 h-4" />
        </Link>
       </div>

       {recentServices && recentServices.length > 0 ? (
        <div className="space-y-3">
         {recentServices.map((service) => (
          <div
           key={service.id}
           className={`
                          p-4 rounded-xl border border-gray-100 bg-gradient-to-br from-white to-gray-50/50
                          hover:border-emerald-200 hover:shadow-md
                          ${styles.smoothTransition}
                        `}
          >
           <div className="flex items-start justify-between mb-2">
            <div>
             <p className="font-bold text-[#1C294E]">
              {formatServiceType(service.service_type)}
             </p>
             <p className="text-sm text-gray-500 mt-0.5">
              {format(new Date(service.completed_date), 'MMMM d, yyyy')}
             </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600">
             <CheckCircle className="w-4 h-4" />
             <span className="text-xs font-semibold">Completed</span>
            </div>
           </div>

           <p className="text-sm text-gray-500 mb-3">
            Completed by {service.team_members?.join(', ') || 'Team'}
           </p>

           {service.customer_rating && (
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
             <span className="text-xs text-gray-400 uppercase tracking-wide">Your rating:</span>
             <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
               <span
                key={i}
                className={`text-lg ${i < service.customer_rating ? 'text-amber-400' : 'text-gray-200'}`}
               >
                ★
               </span>
              ))}
             </div>
            </div>
           )}
          </div>
         ))}
        </div>
       ) : (
        <div className="text-center py-12">
         <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-50 to-green-100 mb-4">
          <Sparkles className="w-7 h-7 text-emerald-400" />
         </div>
         <p className="text-[#1C294E] font-medium mb-1">No services yet</p>
         <p className="text-gray-400 text-sm">Your cleaning history will appear here</p>                </div>
       )}
      </div>
      </div>
     </div>

     {/* Row 3: Service Address, Account Summary, Feedback */}
     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Service Address Card */}
      <div className={`${styles.animateFadeInUp} ${styles.stagger5}`}>
       <div className={`
        relative overflow-hidden rounded-2xl bg-white h-full
        shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)]
        border border-gray-100/80
        ${styles.cardHover}
       `}>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-400 to-gray-300" />
        <div className="p-6 sm:p-8 flex flex-col h-full">
         <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#1C294E]">
           Service Location
          </h2>
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
           <Home className="w-4 h-4 text-slate-500" />
          </div>
         </div>

         {primaryAddress ? (
          <div className="flex-1 flex flex-col">
           <div className="flex-1">
            <p className="text-xl font-semibold text-[#1C294E] mb-1">
             {primaryAddress.street_address}
             {primaryAddress.unit && ` #${primaryAddress.unit}`}
            </p>
            <p className="text-gray-500">
             {primaryAddress.city}, {primaryAddress.state} {primaryAddress.zip_code}
            </p>
           </div>

           <Link href="/portal/settings#addresses" className="mt-6">
            <span className={`
             inline-flex items-center text-sm font-semibold text-[#079447] 
             hover:text-emerald-600 ${styles.smoothTransition}
            `}>
             Manage Addresses
             <ChevronRight className="w-4 h-4 ml-1" />
            </span>
           </Link>
          </div>
         ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
           <MapPin className="w-8 h-8 text-gray-300 mb-3" />
           <p className="text-gray-500 text-sm mb-4">No address on file</p>
           <Link href="/portal/settings#addresses">
            <Button variant="primary" size="sm">
             Add Address
            </Button>
           </Link>
          </div>
         )}
        </div>
       </div>
      </div>

      {/* Account Summary */}
      <div className={`${styles.animateFadeInUp} ${styles.stagger6}`}>
       <div className={`
        relative overflow-hidden rounded-2xl bg-white h-full
        shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)]
        border border-gray-100/80
        ${styles.cardHover}
       `}>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-400" />
        <div className="p-6 sm:p-8 flex flex-col h-full">
         <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#1C294E]">
           Your Account
          </h2>
          <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
           <Users className="w-4 h-4 text-blue-500" />
          </div>
         </div>

         <div className="flex-1 grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-slate-50">
           <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Member Since</p>
           <p className="text-xl font-bold text-[#1C294E]">
            {profile?.created_at ? format(new Date(profile.created_at), 'MMM yyyy') : '-'}
           </p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-slate-50">
           <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Freshness</p>
           {(() => {
            const lastClean = recentServices[0]?.completed_date
            const daysSince = lastClean
             ? Math.floor((new Date() - new Date(lastClean)) / (1000 * 60 * 60 * 24))
             : null

            const getFreshness = () => {
             if (daysSince === null) return { label: 'No cleanings', color: 'bg-gray-100', iconColor: 'text-gray-400', width: '0%' }
             if (daysSince <= 7) return { label: 'Sparkling', color: 'bg-emerald-100', iconColor: 'text-emerald-600', width: '100%', barColor: 'bg-emerald-500' }
             if (daysSince <= 14) return { label: 'Fresh', color: 'bg-green-100', iconColor: 'text-green-600', width: '70%', barColor: 'bg-green-400' }
             if (daysSince <= 21) return { label: 'Good', color: 'bg-amber-100', iconColor: 'text-amber-600', width: '45%', barColor: 'bg-amber-400' }
             return { label: 'Due soon', color: 'bg-orange-100', iconColor: 'text-orange-600', width: '20%', barColor: 'bg-orange-400' }
            }

            const freshness = getFreshness()

            return (
             <div>
              <div className="flex items-center gap-2 mb-2">
               <div className={`w-6 h-6 rounded-full ${freshness.color} flex items-center justify-center`}>
                <Sparkles className={`w-3.5 h-3.5 ${freshness.iconColor}`} />
               </div>
               <span className="text-sm font-semibold text-[#1C294E]">{freshness.label}</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
               <div
                className={`h-full ${freshness.barColor || 'bg-gray-300'} rounded-full transition-all duration-500`}
                style={{ width: freshness.width }}
               />
              </div>
             </div>
            )
           })()}
          </div>
         </div>
        </div>
       </div>
      </div>


      {/* Leave Feedback */}
      <div className={`${styles.animateFadeInUp} ${styles.stagger7}`}>
       <div className={`
        relative overflow-hidden rounded-2xl h-full
        bg-gradient-to-br from-[#1C294E] to-slate-800
        shadow-[0_1px_3px_rgba(0,0,0,0.1),0_20px_40px_-15px_rgba(28,41,78,0.4)]
        ${styles.cardHover}
       `}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative p-6 sm:p-8 flex flex-col h-full">
         <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">
           We Value Your Input
          </h2>
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
           <Quote className="w-4 h-4 text-white/80" />
          </div>
         </div>

         <p className="text-slate-300 text-sm flex-1 mb-6">
          Your feedback helps us deliver an exceptional experience every time.
         </p>

         <Link href="/portal/customer-feedback">
          <Button
           variant="secondary"
           fullWidth
           className={`
            ${styles.smoothTransition}
            bg-white text-[#1C294E] font-semibold
            hover:bg-gray-100
           `}
          >
           Share Your Experience
          </Button>
         </Link>
        </div>
       </div>
      </div>
     </div>


     {/* Invoice Side Panel */}
     <InvoiceSidePanel
      invoiceId={selectedInvoiceId}
      isOpen={isPanelOpen}
      onClose={handleCloseSidePanel}
     />
    </div>
   </div>
  </>
 )
}