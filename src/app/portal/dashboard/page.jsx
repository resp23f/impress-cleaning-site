import { createClient } from '@/lib/supabase/server'

import { redirect } from 'next/navigation'

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

  ChevronRight,

  CheckCircle,

  AlertCircle,

  Repeat

} from 'lucide-react'

import Card from '@/components/ui/Card'

import Button from '@/components/ui/Button'

import Badge from '@/components/ui/Badge'

 

export default async function DashboardPage() {

  const supabase = await createClient()

 

  const {

    data: { user },

  } = await supabase.auth.getUser()

 

  if (!user) {

    redirect('/auth/login')

  }

 

  // Get user profile

  const { data: profile } = await supabase

    .from('profiles')

    .select('*, service_addresses(*)')

    .eq('id', user.id)

    .single()

 

  const primaryAddress = profile?.service_addresses?.find(addr => addr.is_primary) ||

    profile?.service_addresses?.[0]

 

  // Get upcoming appointments

  const { data: upcomingAppointments } = await supabase

    .from('appointments')

    .select('*')

    .eq('customer_id', user.id)

    .gte('scheduled_date', new Date().toISOString().split('T')[0])

    .order('scheduled_date', { ascending: true })

    .order('scheduled_time_start', { ascending: true })

    .limit(3)

 

  const nextAppointment = upcomingAppointments?.[0]

 

  // Get recent service history

  const { data: recentServices } = await supabase

    .from('service_history')

    .select('*')

    .eq('customer_id', user.id)

    .order('completed_date', { ascending: false })

    .limit(2)

 

  // Get invoices

  const { data: invoices } = await supabase

    .from('invoices')

    .select('*')

    .eq('customer_id', user.id)

    .order('created_at', { ascending: false })

    .limit(3)

 

  // Calculate balance

  const unpaidInvoices = invoices?.filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled') || []

  const balance = unpaidInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0)

 

  // Get recurring services

  const { data: recurringServices } = await supabase

    .from('appointments')

    .select('*')

    .eq('customer_id', user.id)

    .eq('is_recurring', true)

    .is('parent_recurring_id', null)

    .limit(1)

 

  const firstName = profile?.full_name?.split(' ')[0] || 'there'

 

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

 

  const getStatusBadge = (status) => {

    const variants = {

      pending: 'warning',

      confirmed: 'info',

      completed: 'success',

      cancelled: 'danger',

    }

    return variants[status] || 'default'

  }

 

  const getInvoiceStatusBadge = (status) => {

    const variants = {

      paid: 'success',

      sent: 'info',

      overdue: 'danger',

      draft: 'default',

    }

    return variants[status] || 'default'

  }

 

  return (

    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      {/* Welcome Header */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-[#1C294E] mb-2">

          Hi {firstName} 👋

        </h1>

        <p className="text-gray-600">Welcome to your customer portal</p>

      </div>

 

      {/* Hero Section - Next Appointment & Balance */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Next Appointment Card */}

        <Card className="lg:col-span-2" padding="lg">

          {nextAppointment ? (

            <>

              <div className="flex items-center justify-between mb-6">

                <h2 className="text-xl font-bold text-[#1C294E]">Next Appointment</h2>

                <Badge variant={getStatusBadge(nextAppointment.status)}>

                  {nextAppointment.status}

                </Badge>

              </div>

 

              <div className="space-y-4">

                <div className="flex items-start gap-3">

                  <Calendar className="w-5 h-5 text-[#079447] mt-0.5" />

                  <div>

                    <p className="text-lg font-semibold text-[#1C294E]">

                      {format(new Date(nextAppointment.scheduled_date), 'EEEE, MMMM d')}

                    </p>

                    <p className="text-sm text-gray-600">

                      {formatServiceType(nextAppointment.service_type)}

                    </p>

                  </div>

                </div>

 

                <div className="flex items-center gap-3">

                  <Clock className="w-5 h-5 text-gray-400" />

                  <p className="text-gray-700">

                    {nextAppointment.scheduled_time_start} - {nextAppointment.scheduled_time_end}

                  </p>

                </div>

 

                {nextAppointment.team_members && nextAppointment.team_members.length > 0 && (

                  <div className="flex items-center gap-3">

                    <Users className="w-5 h-5 text-gray-400" />

                    <p className="text-gray-700">

                      Team: {nextAppointment.team_members.join(', ')}

                    </p>

                  </div>

                )}

 

                {primaryAddress && (

                  <div className="flex items-start gap-3">

                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />

                    <p className="text-gray-700">

                      {primaryAddress.street_address}

                      {primaryAddress.unit && `, ${primaryAddress.unit}`}

                      <br />

                      {primaryAddress.city}, {primaryAddress.state} {primaryAddress.zip_code}

                    </p>

                  </div>

                )}

              </div>

 

              <div className="flex gap-3 mt-6">

                <Link href={`/portal/appointments/${nextAppointment.id}`}>

                  <Button variant="primary">View Details</Button>

                </Link>

                <Link href={`/portal/appointments/${nextAppointment.id}/reschedule`}>

                  <Button variant="secondary">Reschedule</Button>

                </Link>

              </div>

            </>

          ) : (

            <div className="text-center py-8">

              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />

              <h3 className="text-lg font-semibold text-[#1C294E] mb-2">

                No Upcoming Appointments

              </h3>

              <p className="text-gray-600 mb-6">

                Ready to schedule your next cleaning?

              </p>

              <Link href="/portal/request-service">

                <Button variant="primary">

                  <Plus className="w-5 h-5" />

                  Request Service

                </Button>

              </Link>

            </div>

          )}

        </Card>

 

        {/* Balance Card */}

        <Card padding="lg">

          <h2 className="text-lg font-semibold text-[#1C294E] mb-4">Balance</h2>

 

          {balance > 0 ? (

            <>

              <div className="mb-6">

                <p className="text-3xl font-bold text-[#1C294E] mb-1">

                  ${balance.toFixed(2)}

                </p>

                <p className="text-sm text-gray-600">Due</p>

              </div>

 

              <Link href="/portal/invoices">

                <Button variant="primary" fullWidth>

                  <CreditCard className="w-5 h-5" />

                  Pay Now

                </Button>

              </Link>

            </>

          ) : (

            <div className="text-center py-4">

              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />

              <p className="text-lg font-semibold text-[#1C294E] mb-1">

                $0.00 Due

              </p>

              <p className="text-sm text-gray-600">

                All caught up!

              </p>

            </div>

          )}

        </Card>

      </div>

 

      {/* Quick Actions */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

        <Link href="/portal/request-service">

          <Button variant="secondary" fullWidth size="lg">

            <Calendar className="w-5 h-5" />

            Request Service

          </Button>

        </Link>

        <Link href="/portal/invoices">

          <Button variant="secondary" fullWidth size="lg">

            <CreditCard className="w-5 h-5" />

            Pay Invoice

          </Button>

        </Link>

        <Link href="/portal/history">

          <Button variant="secondary" fullWidth size="lg">

            <FileText className="w-5 h-5" />

            View History

          </Button>

        </Link>

      </div>

 

      {/* Main Content Grid */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Upcoming Appointments */}

        <Card>

          <div className="flex items-center justify-between mb-6">

            <h2 className="text-xl font-bold text-[#1C294E]">Upcoming Appointments</h2>

            <Link

              href="/portal/appointments"

              className="text-sm text-[#079447] font-medium hover:underline"

            >

              View All

            </Link>

          </div>

 

          {upcomingAppointments && upcomingAppointments.length > 0 ? (

            <div className="space-y-4">

              {upcomingAppointments.map((apt) => (

                <div

                  key={apt.id}

                  className="p-4 border border-gray-200 rounded-lg hover:border-[#079447] transition-colors"

                >

                  <div className="flex items-start justify-between mb-2">

                    <div>

                      <p className="font-semibold text-[#1C294E]">

                        {format(new Date(apt.scheduled_date), 'MMM d')} • {apt.scheduled_time_start}

                      </p>

                      <p className="text-sm text-gray-600">

                        {formatServiceType(apt.service_type)}

                      </p>

                    </div>

                    <Badge variant={getStatusBadge(apt.status)} size="sm">

                      {apt.status}

                    </Badge>

                  </div>

 

                  {apt.team_members && apt.team_members.length > 0 && (

                    <p className="text-sm text-gray-600 mb-3">

                      Team: {apt.team_members.join(', ')}

                    </p>

                  )}

 

                  <div className="flex gap-2">

                    <Link href={`/portal/appointments/${apt.id}`}>

                      <Button variant="text" size="sm">

                        View

                      </Button>

                    </Link>

                    <Link href={`/portal/appointments/${apt.id}/reschedule`}>

                      <Button variant="text" size="sm">

                        Reschedule

                      </Button>

                    </Link>

                  </div>

                </div>

              ))}

            </div>

          ) : (

            <div className="text-center py-8 text-gray-500">

              <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-300" />

              <p>No upcoming appointments</p>

            </div>

          )}

        </Card>

 

        {/* Recent Services */}

        <Card>

          <div className="flex items-center justify-between mb-6">

            <h2 className="text-xl font-bold text-[#1C294E]">Recent Services</h2>

            <Link

              href="/portal/history"

              className="text-sm text-[#079447] font-medium hover:underline"

            >

              View Full History

            </Link>

          </div>

 

          {recentServices && recentServices.length > 0 ? (

            <div className="space-y-4">

              {recentServices.map((service) => (

                <div

                  key={service.id}

                  className="p-4 border border-gray-200 rounded-lg"

                >

                  <div className="flex items-start justify-between mb-2">

                    <div>

                      <p className="font-semibold text-[#1C294E]">

                        {format(new Date(service.completed_date), 'MMM d')} • {formatServiceType(service.service_type)}

                      </p>

                      <p className="text-sm text-gray-600">

                        Completed by {service.team_members?.join(', ') || 'Team'}

                      </p>

                    </div>

                    <CheckCircle className="w-5 h-5 text-green-500" />

                  </div>

 

                  {service.customer_rating && (

                    <div className="flex items-center gap-1 mt-2">

                      {[...Array(service.customer_rating)].map((_, i) => (

                        <span key={i} className="text-yellow-400">★</span>

                      ))}

                      {[...Array(5 - service.customer_rating)].map((_, i) => (

                        <span key={i} className="text-gray-300">★</span>

                      ))}

                    </div>

                  )}

                </div>

              ))}

            </div>

          ) : (

            <div className="text-center py-8 text-gray-500">

              <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />

              <p>No service history yet</p>

            </div>

          )}

        </Card>

 

        {/* Invoices & Payments */}

        <Card>

          <div className="flex items-center justify-between mb-6">

            <h2 className="text-xl font-bold text-[#1C294E]">Invoices & Payments</h2>

            <Link

              href="/portal/invoices"

              className="text-sm text-[#079447] font-medium hover:underline"

            >

              View All Invoices

            </Link>

          </div>

 

          {invoices && invoices.length > 0 ? (

            <div className="space-y-4">

              {invoices.map((invoice) => (

                <div

                  key={invoice.id}

                  className="p-4 border border-gray-200 rounded-lg"

                >

                  <div className="flex items-start justify-between mb-2">

                    <div>

                      <p className="font-semibold text-[#1C294E]">

                        Invoice {invoice.invoice_number}

                      </p>

                      <p className="text-sm text-gray-600">

                        {format(new Date(invoice.created_at), 'MMM d, yyyy')} • ${parseFloat(invoice.amount).toFixed(2)}

                      </p>

                    </div>

                    <Badge variant={getInvoiceStatusBadge(invoice.status)} size="sm">

                      {invoice.status}

                    </Badge>

                  </div>

 

                  <div className="flex gap-2 mt-3">

                    {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (

                      <Link href={`/portal/invoices/${invoice.id}/pay`}>

                        <Button variant="primary" size="sm">

                          Pay Now

                        </Button>

                      </Link>

                    )}

                    <Link href={`/portal/invoices/${invoice.id}`}>

                      <Button variant="text" size="sm">

                        View

                      </Button>

                    </Link>

                  </div>

                </div>

              ))}

            </div>

          ) : (

            <div className="text-center py-8 text-gray-500">

              <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />

              <p>No invoices yet</p>

            </div>

          )}

        </Card>

 

        {/* Service Address & Recurring Services */}

        <div className="space-y-6">

          {/* Recurring Services */}

          {recurringServices && recurringServices.length > 0 && (

            <Card>

              <h2 className="text-xl font-bold text-[#1C294E] mb-4">Recurring Services</h2>

 

              {recurringServices.map((service) => (

                <div key={service.id} className="p-4 bg-[#079447]/5 rounded-lg border border-[#079447]/20">

                  <div className="flex items-start gap-3 mb-3">

                    <Repeat className="w-5 h-5 text-[#079447] mt-0.5" />

                    <div>

                      <p className="font-semibold text-[#1C294E]">

                        {service.recurring_frequency} {formatServiceType(service.service_type)}

                      </p>

                      <p className="text-sm text-gray-600">

                        Every {service.recurring_frequency} at {service.scheduled_time_start}

                      </p>

                      <p className="text-sm text-gray-600">

                        Next: {format(new Date(service.scheduled_date), 'MMM d, yyyy')}

                      </p>

                    </div>

                  </div>

 

                  <div className="flex gap-2">

                    <Link href={`/portal/appointments/${service.id}`}>

                      <Button variant="text" size="sm">

                        Manage

                      </Button>

                    </Link>

                    <Button variant="text" size="sm">

                      Pause

                    </Button>

                  </div>

                </div>

              ))}

            </Card>

          )}

 

          {/* Service Address */}

          {primaryAddress && (

            <Card>

              <h2 className="text-xl font-bold text-[#1C294E] mb-4">Service Address</h2>

 

              <div className="flex items-start gap-3 mb-4">

                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />

                <div>

                  <p className="text-[#1C294E]">

                    {primaryAddress.street_address}

                    {primaryAddress.unit && `, ${primaryAddress.unit}`}

                  </p>

                  <p className="text-gray-600">

                    {primaryAddress.city}, {primaryAddress.state} {primaryAddress.zip_code}

                  </p>

                </div>

              </div>

 

              <Link href="/portal/settings#addresses">

                <Button variant="text" size="sm">

                  Edit Address

                </Button>

              </Link>

            </Card>

          )}

        </div>

      </div>

    </div>

  )

}