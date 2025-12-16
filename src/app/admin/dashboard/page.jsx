import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  Users,
  Calendar,
  Receipt,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Plus,
  CalendarDays,
  CreditCard,
  AlertTriangle,
  Sparkles,
  MapPin,
  ChevronRight,
  FileText,
  UserPlus,
  RefreshCw,
  Banknote,
} from 'lucide-react'
import AdminNav from '@/components/admin/AdminNav'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

  // Parallel data fetching for performance
  const [
    customersResult,
    todayAppointmentsResult,
    upcomingAppointmentsResult,
    unpaidInvoicesResult,
    overdueInvoicesResult,
    pendingRequestsResult,
    pendingRegistrationsResult,
    recentPaymentsResult,
    monthRevenueResult,
    totalRevenueResult,
    zelleClaimsResult,
    recentActivityResult,
  ] = await Promise.all([
    // Total active customers
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer')
      .eq('account_status', 'active'),

    // Today's appointments with details
    supabase
      .from('appointments')
      .select(`
        *,
        profiles(full_name, phone),
        service_addresses(street_address, city)
      `)
      .eq('scheduled_date', today)
      .order('scheduled_time_start', { ascending: true }),

    // Upcoming appointments (next 7 days)
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('scheduled_date', today)
      .in('status', ['pending', 'confirmed']),

    // Unpaid invoices
    supabase
      .from('invoices')
      .select('id, total, amount, status, due_date, invoice_number')
      .in('status', ['sent', 'overdue'])
      .eq('archived', false),

    // Overdue invoices specifically
    supabase
      .from('invoices')
      .select('id, total, amount, invoice_number, due_date, customer_id, profiles(full_name)')
      .eq('status', 'overdue')
      .eq('archived', false)
      .order('due_date', { ascending: true })
      .limit(5),

    // Pending service requests
    supabase
      .from('service_requests')
      .select(`
        *,
        profiles!customer_id(full_name, email),
        service_addresses!address_id(street_address, city)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5),
    // Pending registrations
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('account_status', 'pending')
      .eq('role', 'customer'),

    // Recent payments (last 7 days)
    supabase
      .from('invoices')
      .select('id, total, amount, paid_date, payment_method, invoice_number, profiles(full_name)')
      .eq('status', 'paid')
      .gte('paid_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('paid_date', { ascending: false })
      .limit(5),

    // This month's revenue
    supabase
      .from('invoices')
      .select('total, amount')
      .eq('status', 'paid')
      .gte('paid_date', startOfMonth),

    // Total all-time revenue
    supabase
      .from('invoices')
      .select('total, amount')
      .eq('status', 'paid'),

    // Zelle claims awaiting verification
    supabase
      .from('invoices')
      .select('id, invoice_number, total, amount, profiles(full_name)')
      .eq('payment_method', 'zelle')
      .eq('status', 'sent'),

    // Recent activity (admin notifications)
    supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  // Process results
  const totalCustomers = customersResult.count || 0
  const todayAppointments = todayAppointmentsResult.data || []
  const upcomingCount = upcomingAppointmentsResult.count || 0
  const unpaidInvoices = unpaidInvoicesResult.data || []
  const overdueInvoices = overdueInvoicesResult.data || []
  const pendingRequests = pendingRequestsResult.data || []
  const pendingRegistrations = pendingRegistrationsResult.count || 0
  const recentPayments = recentPaymentsResult.data || []
  const zelleClaims = zelleClaimsResult.data || []
  const recentActivity = recentActivityResult.data || []

  const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || inv.amount || 0), 0)
  const monthRevenue = (monthRevenueResult.data || []).reduce((sum, inv) => sum + parseFloat(inv.total || inv.amount || 0), 0)
  const totalRevenue = (totalRevenueResult.data || []).reduce((sum, inv) => sum + parseFloat(inv.total || inv.amount || 0), 0)

  // Calculate attention items count
  const attentionCount = overdueInvoices.length + pendingRequests.length + zelleClaims.length + pendingRegistrations

  const getStatusConfig = (status) => {
    const configs = {
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Confirmed' },
      en_route: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'En Route' },
      completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
    }
    return configs[status] || configs.pending
  }

  const getServiceLabel = (type) => {
    const labels = {
      standard: 'Standard',
      deep: 'Deep Clean',
      move_in_out: 'Move In/Out',
      post_construction: 'Post-Construction',
      office: 'Office',
    }
    return labels[type] || type
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return ''
    const [hours, minutes] = timeStr.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const getActivityIcon = (type) => {
    const icons = {
      payment_received: { icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-100' },
      payment_failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100' },
      new_service_request: { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-100' },
      service_request: { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-100' },
      new_customer: { icon: UserPlus, color: 'text-indigo-500', bg: 'bg-indigo-100' },
      appointment_cancelled: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100' },
      refund_processed: { icon: RefreshCw, color: 'text-amber-500', bg: 'bg-amber-100' },
      zelle_claimed: { icon: Banknote, color: 'text-purple-500', bg: 'bg-purple-100' },
    }
    return icons[type] || { icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-100' }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <AdminNav
        pendingCount={pendingRegistrations}
        requestsCount={pendingRequests.length}
      />

      <div className="lg:pl-64">
        <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-1 w-12 bg-gradient-to-r from-[#079447] to-emerald-400 rounded-full" />
                <span className="text-sm font-medium text-[#079447] uppercase tracking-wider">
                  {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#1C294E] tracking-tight">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, Alex
              </h1>
              <p className="text-gray-500 mt-1">Here's what's happening with your business today.</p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Link href="/admin/appointments">
                <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                  <Plus className="w-4 h-4" />
                  New Appointment
                </button>
              </Link>
              <Link href="/admin/invoices">
                <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                  <Receipt className="w-4 h-4" />
                  New Invoice
                </button>
              </Link>
              <Link href="/admin/customers">
                <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#079447] rounded-xl text-sm font-medium text-white hover:bg-emerald-600 transition-all shadow-sm shadow-[#079447]/20">
                  <UserPlus className="w-4 h-4" />
                  Add Customer
                </button>
              </Link>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Revenue This Month */}
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-emerald-100">This Month</span>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-bold">${monthRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-sm text-emerald-100 mt-1">
                ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} all time
              </p>
            </div>

            {/* Customers */}
            <Link href="/admin/customers" className="group">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 h-full">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-500">Customers</span>
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-[#1C294E]">{totalCustomers}</p>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  Active accounts
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
              </div>
            </Link>

            {/* Upcoming Appointments */}
            <Link href="/admin/appointments" className="group">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 h-full">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-500">Upcoming</span>
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-[#1C294E]">{upcomingCount}</p>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  Appointments
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
              </div>
            </Link>

            {/* Outstanding */}
            <Link href="/admin/invoices" className="group">
              <div className={`rounded-2xl p-5 border shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 h-full ${totalUnpaid > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-500">Outstanding</span>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${totalUnpaid > 0 ? 'bg-amber-200' : 'bg-gray-100'}`}>
                    <Receipt className={`w-5 h-5 ${totalUnpaid > 0 ? 'text-amber-700' : 'text-gray-500'}`} />
                  </div>
                </div>
                <p className={`text-3xl font-bold ${totalUnpaid > 0 ? 'text-amber-700' : 'text-[#1C294E]'}`}>
                  ${totalUnpaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  {unpaidInvoices.length} invoice{unpaidInvoices.length !== 1 ? 's' : ''}
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
              </div>
            </Link>
          </div>

          {/* Attention Required Banner */}
          {attentionCount > 0 && (
            <div className="bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl p-5 mb-8 text-white shadow-lg shadow-red-500/20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{attentionCount} item{attentionCount !== 1 ? 's' : ''} need your attention</h3>
                    <p className="text-red-100 text-sm">
                      {overdueInvoices.length > 0 && `${overdueInvoices.length} overdue invoice${overdueInvoices.length !== 1 ? 's' : ''}`}
                      {overdueInvoices.length > 0 && pendingRequests.length > 0 && ' • '}
                      {pendingRequests.length > 0 && `${pendingRequests.length} pending request${pendingRequests.length !== 1 ? 's' : ''}`}
                      {(overdueInvoices.length > 0 || pendingRequests.length > 0) && zelleClaims.length > 0 && ' • '}
                      {zelleClaims.length > 0 && `${zelleClaims.length} Zelle to verify`}
                    </p>
                  </div>
                </div>
                <Link href="/admin/invoices?status=overdue">
                  <button className="px-4 py-2 bg-white text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors">
                    Review Now
                  </button>
                </Link>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Today's Schedule */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1C294E] to-[#2a3a5e] flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-[#1C294E]">Today's Schedule</h2>
                    <p className="text-sm text-gray-500">{todayAppointments.length} appointment{todayAppointments.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <Link href="/admin/appointments" className="text-sm font-medium text-[#079447] hover:text-emerald-700 flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {todayAppointments.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {todayAppointments.map((apt, index) => {
                    const statusConfig = getStatusConfig(apt.status)
                    return (
                      <div
                        key={apt.id}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        {/* Time */}
                        <div className="w-20 flex-shrink-0">
                          <p className="text-sm font-bold text-[#1C294E]">{formatTime(apt.scheduled_time_start)}</p>
                          <p className="text-xs text-gray-400">{formatTime(apt.scheduled_time_end)}</p>
                        </div>

                        {/* Divider */}
                        <div className="w-1 h-12 rounded-full bg-gradient-to-b from-[#079447] to-emerald-300" />

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-[#1C294E] truncate">{apt.profiles?.full_name || 'Customer'}</p>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                              {statusConfig.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{getServiceLabel(apt.service_type)}</p>
                          {apt.service_addresses && (
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              {apt.service_addresses.street_address}, {apt.service_addresses.city}
                            </p>
                          )}
                        </div>

                        {/* Phone */}
                        {apt.profiles?.phone && (
                          <a href={`tel:${apt.profiles.phone}`} className="text-sm text-gray-500 hover:text-[#079447] hidden sm:block">
                            {apt.profiles.phone}
                          </a>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="font-semibold text-[#1C294E] mb-1">No appointments today</h3>
                  <p className="text-sm text-gray-500">Enjoy your free day!</p>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-[#1C294E]">Recent Activity</h2>
                <Link href="/admin/notifications" className="text-sm font-medium text-[#079447] hover:text-emerald-700">
                  See All
                </Link>
              </div>

              {recentActivity.length > 0 ? (
                <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                  {recentActivity.map((activity) => {
                    const iconConfig = getActivityIcon(activity.type)
                    const Icon = iconConfig.icon
                    return (
                      <Link
                        key={activity.id}
                        href={activity.link || '/admin/notifications'}
                        className="flex items-start gap-3 px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className={`w-9 h-9 rounded-lg ${iconConfig.bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-4 h-4 ${iconConfig.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1C294E] line-clamp-1">{activity.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{activity.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {format(new Date(activity.created_at), 'MMM d, h:mm a')}
                          </p>
                        </div>
                        {!activity.is_read && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                        )}
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Service Requests */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-[#1C294E]">Pending Requests</h2>
                    <p className="text-sm text-gray-500">{pendingRequests.length} awaiting approval</p>
                  </div>
                </div>
                <Link href="/admin/requests" className="text-sm font-medium text-[#079447] hover:text-emerald-700 flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {pendingRequests.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {pendingRequests.slice(0, 4).map((req) => (
                    <Link
                      key={req.id}
                      href="/admin/requests"
                      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-[#1C294E]">{req.profiles?.full_name || 'Customer'}</p>
                        <p className="text-sm text-gray-500">
                          {getServiceLabel(req.service_type)} • {req.preferred_date ? format(new Date(req.preferred_date + 'T00:00:00'), 'MMM d') : 'Flexible'}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                        Pending
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-500">No pending requests</p>
                </div>
              )}
            </div>

            {/* Recent Payments */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-[#1C294E]">Recent Payments</h2>
                    <p className="text-sm text-gray-500">Last 7 days</p>
                  </div>
                </div>
                <Link href="/admin/invoices?status=paid" className="text-sm font-medium text-[#079447] hover:text-emerald-700 flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {recentPayments.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {recentPayments.slice(0, 4).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between px-6 py-4">
                      <div>
                        <p className="font-medium text-[#1C294E]">{payment.profiles?.full_name || 'Customer'}</p>
                        <p className="text-sm text-gray-500">
                          {payment.invoice_number} • {payment.payment_method?.charAt(0).toUpperCase() + payment.payment_method?.slice(1)}
                        </p>
                      </div>
                      <span className="font-bold text-emerald-600">
                        +${parseFloat(payment.total || payment.amount || 0).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-500">No recent payments</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}