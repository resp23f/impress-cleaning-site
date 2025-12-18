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
import PageTitle from '@/components/portal/PageTitle'


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
  const [unpaidInvoiceIds, setUnpaidInvoiceIds] = useState([])
  // Invoice side panel state
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  useEffect(() => {
    loadDashboard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const loadDashboard = async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
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
      const primary =
        profileData?.service_addresses?.find((addr) => addr.is_primary) ||
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
      // Get recent completed appointments (not service_history - admin completions don't insert there)
      const { data: completedData } = await supabase
        .from('appointments')
        .select('*')
        .eq('customer_id', authUser.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)

      // Map to expected format for display
      const mappedServices = (completedData || []).map(apt => ({
        ...apt,
        completed_date: apt.completed_at
          ? new Date(apt.completed_at).toISOString().split('T')[0]
          : apt.scheduled_date,
      }))
      setRecentServices(mappedServices)
      // Load ALL invoices for balance calculations
      const { data: allInvoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('customer_id', authUser.id)
      const unpaidInvoices =
        allInvoices?.filter(
          (inv) =>
            inv.status === 'sent' ||
            inv.status === 'pending' ||
            inv.status === 'overdue',
        ) || []
      const totalBalance = unpaidInvoices.reduce(
        (sum, inv) => sum + parseFloat(inv.total ?? inv.amount ?? 0),
        0,
      )
      setBalance(totalBalance)
      setUnpaidInvoiceIds(unpaidInvoices.map(inv => inv.id))
      // Use allInvoices (already fetched) - filter and sort client-side
      const unpaidList = (allInvoices || [])
        .filter(inv => ['sent', 'pending', 'overdue'].includes(inv.status))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 2)
      const paidList = (allInvoices || [])
        .filter(inv => inv.status === 'paid')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 1)
      // Combine: unpaid first, then most recent paid (max 2 total)
      const combinedInvoices = [...unpaidList, ...paidList].slice(0, 2)
      setInvoices(combinedInvoices)
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
  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  const nextAppointment = upcomingAppointments[0]
  return (
    <>
      <PageTitle title="Dashboard" />
      {/* Premium Background */}
      <div
        className={`min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 ${!loading ? styles.contentReveal : ''}`}
      >    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          {loading ? (
            // SINGLE, STABLE LOADER: same container as the real content
            <DashboardSkeleton />
          ) : (
            <>
              {/* ========== WELCOME HEADER ========== */}
              <div className={`mb-10 ${styles.cardReveal}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-1 w-12 bg-gradient-to-r from-[#079447] to-emerald-400 rounded-full" />
                  <span className="text-sm font-medium text-[#079447] uppercase tracking-wider">
                    Dashboard
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-[#1C294E] mb-3 tracking-tight">
                  {getGreeting()}, {firstName}
                </h1>
                <p className="text-lg text-gray-500">Your home at a glance</p>
              </div>
              {/* ========== ROW 1: NEXT APPOINTMENT & BALANCE ========== */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Next Appointment Card - Hero Style */}
                <div className={`lg:col-span-2 ${styles.cardReveal1}`}>
                  <div className="relative overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100/80">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#079447] via-emerald-400 to-teal-400" />
                    <div className="p-6">
                      {nextAppointment ? (
                        <>
                          {/* Header */}
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-[#079447]" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-[#079447] uppercase tracking-wider">Coming Up</p>
                                <h2 className="text-xl font-bold text-[#1C294E]">Next Appointment</h2>
                              </div>
                            </div>
                            {(() => {
                              const today = new Date().toISOString().split('T')[0]
                              const isToday = nextAppointment.scheduled_date === today
                              const isConfirmed = nextAppointment.status === 'confirmed'
                              if (isToday && isConfirmed) {
                                return <Badge variant="success" className="bg-emerald-500 text-white">Arriving Today</Badge>
                              }
                              return <Badge variant={getAppointmentStatusVariant(nextAppointment.status)}>{nextAppointment.status}</Badge>
                            })()}
                          </div>

                          {/* Main Content */}
                          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                            {/* Date Block - Hero Element */}
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#079447] to-emerald-600 flex flex-col items-center justify-center text-white shadow-lg shadow-emerald-200">
                                <span className="text-2xl font-bold leading-none">
                                  {format(new Date(nextAppointment.scheduled_date + 'T00:00:00'), 'd')}
                                </span>
                                <span className="text-xs font-medium uppercase tracking-wide opacity-90">
                                  {format(new Date(nextAppointment.scheduled_date + 'T00:00:00'), 'MMM')}
                                </span>
                              </div>
                              <div>
                                <p className="text-xl font-bold text-[#1C294E]">
                                  {format(new Date(nextAppointment.scheduled_date + 'T00:00:00'), 'EEEE')}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {format(new Date(nextAppointment.scheduled_date + 'T00:00:00'), 'MMMM d, yyyy')}
                                </p>
                              </div>
                            </div>

                            {/* Divider */}
                            <div className="hidden lg:block w-px h-14 bg-gray-200" />

                            {/* Details */}
                            <div className="flex flex-wrap gap-x-8 gap-y-3">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <div>
                                  <p className="text-xs text-gray-400 uppercase font-medium">Window</p>
                                  <p className="text-sm font-semibold text-[#1C294E]">
                                    {formatTime(nextAppointment.scheduled_time_start)} - {formatTime(nextAppointment.scheduled_time_end)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <div>
                                  <p className="text-xs text-gray-400 uppercase font-medium">Service</p>
                                  <p className="text-sm font-semibold text-[#1C294E]">{formatServiceType(nextAppointment.service_type)}</p>
                                </div>
                              </div>
                            </div>

                            {/* Action Button */}
                            <div className="lg:ml-auto">
                              <Link href="/portal/appointments">
                                <Button variant="primary">
                                  View Details
                                  <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                              </Link>
                            </div>
                          </div>

                          {/* Address Footer */}
                          {primaryAddress && (
                            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-100">
                              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <p className="text-sm text-gray-500">
                                {primaryAddress.street_address}{primaryAddress.unit && `, ${primaryAddress.unit}`}, {primaryAddress.city}, {primaryAddress.state} {primaryAddress.zip_code}
                              </p>
                            </div>
                          )}

                          {/* Running Late Notice */}
                          {(() => {
                            const today = new Date().toISOString().split('T')[0]
                            if (nextAppointment.scheduled_date === today && nextAppointment.is_running_late) {
                              return (
                                <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-4 h-4 text-amber-600" />
                                  </div>
                                  <p className="text-sm text-amber-700">Running slightly behind schedule — we'll keep you updated!</p>
                                </div>
                              )
                            }
                            return null
                          })()}
                        </>
                      ) : (
                        /* Empty State */
                        <div className="text-center py-10">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 mb-5">
                            <Calendar className="w-8 h-8 text-gray-300" />
                          </div>
                          <h3 className="text-xl font-bold text-[#1C294E] mb-2">No Upcoming Appointments</h3>
                          <p className="text-gray-500 mb-6 max-w-sm mx-auto">Ready to schedule your next cleaning? We'd love to help.</p>
                          <Link href="/portal/request-service">
                            <Button variant="primary">
                              <Plus className="w-4 h-4" />
                              Request Service
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Balance Card - Prominent */}
                <div className={styles.cardReveal2}>
                  <div className={`relative overflow-hidden rounded-2xl h-full shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] ${balance > 0 ? 'bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 border border-red-200/60' : 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border border-emerald-200/50'}`}>
                    {/* Decorative elements */}
                    <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 ${balance > 0 ? 'bg-red-300' : 'bg-emerald-300'}`} />
                    <div className={`absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-15 ${balance > 0 ? 'bg-rose-300' : 'bg-green-300'}`} />
                    
                    <div className="relative p-6 h-full flex flex-col">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-4">
                        <CreditCard className={`w-5 h-5 ${balance > 0 ? 'text-red-600' : 'text-emerald-600'}`} />
                        <h2 className="text-lg font-bold text-[#1C294E]">Account Balance</h2>
                      </div>

                      {balance > 0 ? (
                        <div className="flex-1 flex flex-col">
                          <div className="flex-1">
                            <p className="text-4xl font-bold text-red-600 mb-1">${balance.toFixed(2)}</p>
                            <p className="text-sm text-gray-600">Balance Due</p>
                          </div>
                          <Link href={unpaidInvoiceIds.length === 1 ? `/portal/invoices/${unpaidInvoiceIds[0]}/pay` : '/portal/invoices?status=sent'} className="mt-4">
                            <Button variant="primary" fullWidth className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 border-0">
                              <CreditCard className="w-4 h-4" />
                              Pay Now
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                          <div className="relative mb-3">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                              <CheckCircle className="w-8 h-8 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                            </div>
                          </div>
                          <p className="text-3xl font-bold text-[#1C294E] mb-1">$0.00</p>
                          <p className="text-emerald-600 font-medium">All caught up!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* ========== ROW 2: INVOICES & RECENT SERVICES ========== */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Invoices & Payments Card */}
                <div className={`${styles.cardReveal3} h-full`}>
                  <div
                    className={`
rounded-2xl bg-white p-6 sm:p-8 h-full
shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)]
border border-gray-100/80
             ${styles.cardHover}
`}
                  >
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
                    {invoices && invoices.filter((inv) => inv.status !== 'draft').length > 0 ? (
                      <div className="space-y-3">
                        {invoices
                          .filter((invoice) => invoice.status !== 'draft')
                          .map((invoice) => {
                            const statusProps = getInvoiceStatusProps(invoice.status)
                            const isPaid = invoice.status === 'paid'
                            const isOverdue = invoice.status === 'overdue'
                            return (
                              <div
                                key={invoice.id}
                                onClick={() => handleViewInvoice(invoice.id)}
                                className={`
              relative overflow-hidden rounded-xl cursor-pointer
              border ${isOverdue ? 'border-red-200 bg-gradient-to-br from-red-50/50 to-white' : isPaid ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/30 to-white' : 'border-amber-200 bg-gradient-to-br from-amber-50/30 to-white'}
              hover:shadow-md ${styles.smoothTransition}
            `}
                              >
                                {/* Status accent bar */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${isOverdue ? 'bg-red-500' : isPaid ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                <div className="p-4 pl-5">
                                  <div className="flex items-center gap-4">
                                    {/* Status icon */}
                                    <div className={`
                  w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0
                  ${isOverdue ? 'bg-red-100' : isPaid ? 'bg-emerald-100' : 'bg-amber-100'}
                `}>
                                      {isPaid ? (
                                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                                      ) : (
                                        <FileText className={`w-5 h-5 ${isOverdue ? 'text-red-600' : 'text-amber-600'}`} />
                                      )}
                                    </div>
                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-3">
                                        <p className="font-semibold text-[#1C294E] truncate">
                                          {invoice.invoice_number}
                                        </p>
                                        <p className="text-xl font-bold text-[#1C294E] flex-shrink-0">
                                          ${parseFloat(invoice.total ?? invoice.amount ?? 0).toFixed(2)}
                                        </p>
                                      </div>
                                      <div className="flex items-center justify-between mt-1">
                                        <p className="text-sm text-gray-500">
                                          {format(new Date(invoice.created_at), 'MMM d, yyyy')}
                                        </p>
                                        <span className={`
                      text-xs font-semibold px-2 py-0.5 rounded-full
                      ${isOverdue ? 'bg-red-100 text-red-700' : isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}
                    `}>
                                          {statusProps?.label}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  {/* Action button - only for unpaid */}
                                  {!isPaid && invoice.status !== 'cancelled' && (
                                    <div className="mt-3 pt-3 border-t border-gray-100/80">
                                      <Link
                                        href={`/portal/invoices/${invoice.id}/pay`}
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <Button
                                          variant="primary"
                                          size="sm"
                                          fullWidth
                                          className={`${styles.smoothTransition} shadow-sm`}
                                        >
                                          <CreditCard className="w-4 h-4" />
                                          Pay Now
                                        </Button>
                                      </Link>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    ) : (<div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-50 mb-4">
                        <FileText className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-gray-500">No invoices yet</p>
                    </div>
                    )}
                  </div>
                </div>
                {/* Recent Services Card */}
                <div className={`${styles.cardReveal4} h-full`}>
                  <div
                    className={`
rounded-2xl bg-white p-6 sm:p-8 h-full
shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)]
border border-gray-100/80
                  ${styles.cardHover}
`}
                  >
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
                                  {format(
                                    new Date(service.completed_date),
                                    'MMMM d, yyyy',
                                  )}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-xs font-semibold">
                                  Completed
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 mb-3">
                              Completed by{' '}
                              {service.team_members?.join(', ') || 'Team'}
                            </p>
                            {service.customer_rating && (
                              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                                <span className="text-xs text-gray-400 uppercase tracking-wide">
                                  Your rating:
                                </span>
                                <div className="flex items-center gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <span
                                      key={i}
                                      className={`text-lg ${i < service.customer_rating
                                        ? 'text-amber-400'
                                        : 'text-gray-200'
                                        }`}
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
                        <p className="text-[#1C294E] font-medium mb-1">
                          No services yet
                        </p>
                        <p className="text-gray-400 text-sm">
                          Your cleaning history will appear here
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Row 4: Service Address, Account Summary, Feedback */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Service Address Card */}
                <div className={styles.cardReveal5}>
                  <div
                    className={`
relative overflow-hidden rounded-2xl bg-white h-full
shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)]
border border-gray-100/80
                     ${styles.cardHover}
`}
                  >
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
                              {primaryAddress.unit &&
                                `, ${primaryAddress.unit}`}
                            </p>
                            <p className="text-gray-500">
                              {primaryAddress.city}, {primaryAddress.state}{' '}
                              {primaryAddress.zip_code}
                            </p>
                          </div>
                          <Link
                            href="/portal/settings#addresses"
                            className="mt-6"
                          >
                            <span
                              className={`
inline-flex items-center text-sm font-semibold text-[#079447]
hover:text-emerald-600 ${styles.smoothTransition}
`}
                            >
                              Manage Addresses
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </span>
                          </Link>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                          <MapPin className="w-8 h-8 text-gray-300 mb-3" />
                          <p className="text-gray-500 text-sm mb-4">
                            No address on file
                          </p>
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
                <div className={styles.cardReveal6}>
                  <div
                    className={`
relative overflow-hidden rounded-2xl bg-white h-full
shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)]
border border-gray-100/80
                        ${styles.cardHover}
`}
                  >
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
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                            Member Since
                          </p>
                          <p className="text-xl font-bold text-[#1C294E]">
                            {profile?.created_at
                              ? format(
                                new Date(profile.created_at),
                                'MMM yyyy',
                              )
                              : '-'}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-slate-50">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                            Freshness
                          </p>
                          {(() => {
                            const lastClean =
                              recentServices[0]?.completed_date
                            const daysSince = lastClean
                              ? Math.floor(
                                (new Date() - new Date(lastClean)) /
                                (1000 * 60 * 60 * 24),
                              )
                              : null
                            const getFreshness = () => {
                              if (daysSince === null)
                                return {
                                  label: 'No cleanings',
                                  color: 'bg-gray-100',
                                  iconColor: 'text-gray-400',
                                  width: '0%',
                                }
                              if (daysSince <= 7)
                                return {
                                  label: 'Sparkling',
                                  color: 'bg-emerald-100',
                                  iconColor: 'text-emerald-600',
                                  width: '100%',
                                  barColor: 'bg-emerald-500',
                                }
                              if (daysSince <= 14)
                                return {
                                  label: 'Fresh',
                                  color: 'bg-green-100',
                                  iconColor: 'text-green-600',
                                  width: '70%',
                                  barColor: 'bg-green-400',
                                }
                              if (daysSince <= 21)
                                return {
                                  label: 'Good',
                                  color: 'bg-amber-100',
                                  iconColor: 'text-amber-600',
                                  width: '45%',
                                  barColor: 'bg-amber-400',
                                }
                              return {
                                label: 'Due soon',
                                color: 'bg-orange-100',
                                iconColor: 'text-orange-600',
                                width: '20%',
                                barColor: 'bg-orange-400',
                              }
                            }
                            const freshness = getFreshness()
                            return (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <div
                                    className={`w-6 h-6 rounded-full ${freshness.color} flex items-center justify-center`}
                                  >
                                    <Sparkles
                                      className={`w-3.5 h-3.5 ${freshness.iconColor}`}
                                    />
                                  </div>
                                  <span className="text-sm font-semibold text-[#1C294E]">
                                    {freshness.label}
                                  </span>
                                </div>
                                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${freshness.barColor || 'bg-gray-300'
                                      } rounded-full transition-all duration-500`}
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
                <div
                  className={styles.cardReveal}
                  style={{ animationDelay: '0.9s' }}
                >
                  <div
                    className={`
relative overflow-hidden rounded-2xl h-full
bg-gradient-to-br from-[#1C294E] to-slate-800
shadow-[0_1px_3px_rgba(0,0,0,0.1),0_20px_40px_-15px_rgba(28,41,78,0.4)]
                          ${styles.cardHover}
`}
                  >
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
                        Your feedback helps us deliver an exceptional experience
                        every time.
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
            </>
          )}
          {/* Invoice Side Panel stays mounted so layout is stable */}
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
