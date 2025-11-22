import { createClient } from '@/lib/supabase/server'

import Link from 'next/link'

import {

  Users,

  Calendar,

  Receipt,

  DollarSign,

  AlertCircle,

  TrendingUp,

  Clock

} from 'lucide-react'

import Card from '@/components/ui/Card'

import Button from '@/components/ui/Button'

import Badge from '@/components/ui/Badge'

import AdminNav from '@/components/admin/AdminNav'

 

export default async function AdminDashboard() {

  const supabase = await createClient()

 

  // Get pending registrations count

  const { count: pendingRegistrations } = await supabase

    .from('profiles')

    .select('*', { count: 'exact', head: true })

    .eq('account_status', 'pending')

    .eq('role', 'customer')

 

  // Get pending service requests count

  const { count: pendingRequests } = await supabase

    .from('service_requests')

    .select('*', { count: 'exact', head: true })

    .eq('status', 'pending')

 

  // Get total customers

  const { count: totalCustomers } = await supabase

    .from('profiles')

    .select('*', { count: 'exact', head: true })

    .eq('role', 'customer')

    .eq('account_status', 'active')

 

  // Get upcoming appointments

  const { count: upcomingAppointments } = await supabase

    .from('appointments')

    .select('*', { count: 'exact', head: true })

    .gte('scheduled_date', new Date().toISOString().split('T')[0])

 

  // Get unpaid invoices

  const { data: unpaidInvoices } = await supabase

    .from('invoices')

    .select('amount')

    .neq('status', 'paid')

    .neq('status', 'cancelled')

 

  const totalUnpaid = unpaidInvoices?.reduce((sum, inv) => sum + parseFloat(inv.amount), 0) || 0

 

  // Get recent activity

  const { data: recentRegistrations } = await supabase

    .from('profiles')

    .select('*')

    .eq('account_status', 'pending')

    .eq('role', 'customer')

    .order('created_at', { ascending: false })

    .limit(5)

 

  const { data: recentRequests } = await supabase

    .from('service_requests')

    .select('*, profiles(full_name)')

    .eq('status', 'pending')

    .order('created_at', { ascending: false })

    .limit(5)

 

  return (

    <div className="min-h-screen">

      <AdminNav

        pendingCount={pendingRegistrations || 0}

        requestsCount={pendingRequests || 0}

      />

 

      <div className="lg:pl-64">

        <main className="py-8 px-4 sm:px-6 lg:px-8">

          {/* Header */}

          <div className="mb-8">

            <h1 className="text-3xl font-bold text-[#1C294E] mb-2">

              Admin Dashboard

            </h1>

            <p className="text-gray-600">

              Welcome back! Here&apos;s what&apos;s happening today.

            </p>

          </div>

 

          {/* Alerts */}

          {(pendingRegistrations > 0 || pendingRequests > 0) && (

            <div className="mb-8 space-y-4">

              {pendingRegistrations > 0 && (

                <Card className="border-l-4 border-l-yellow-500">

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <AlertCircle className="w-6 h-6 text-yellow-600" />

                      <div>

                        <p className="font-semibold text-[#1C294E]">

                          {pendingRegistrations} Pending Registration{pendingRegistrations !== 1 ? 's' : ''}

                        </p>

                        <p className="text-sm text-gray-600">

                          New customers waiting for approval

                        </p>

                      </div>

                    </div>

                    <Link href="/admin/registrations">

                      <Button variant="primary">

                        Review Now

                      </Button>

                    </Link>

                  </div>

                </Card>

              )}

 

              {pendingRequests > 0 && (

                <Card className="border-l-4 border-l-blue-500">

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <Clock className="w-6 h-6 text-blue-600" />

                      <div>

                        <p className="font-semibold text-[#1C294E]">

                          {pendingRequests} Pending Service Request{pendingRequests !== 1 ? 's' : ''}

                        </p>

                        <p className="text-sm text-gray-600">

                          Customers waiting for appointment confirmation

                        </p>

                      </div>

                    </div>

                    <Link href="/admin/requests">

                      <Button variant="primary">

                        Review Now

                      </Button>

                    </Link>

                  </div>

                </Card>

              )}

            </div>

          )}

 

          {/* Stats Grid */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

            <Card>

              <div className="flex items-center justify-between mb-4">

                <p className="text-sm text-gray-600">Total Customers</p>

                <Users className="w-5 h-5 text-[#079447]" />

              </div>

              <p className="text-3xl font-bold text-[#1C294E]">

                {totalCustomers || 0}

              </p>

              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">

                <TrendingUp className="w-4 h-4" />

                Active accounts

              </p>

            </Card>

 

            <Card>

              <div className="flex items-center justify-between mb-4">

                <p className="text-sm text-gray-600">Upcoming Appointments</p>

                <Calendar className="w-5 h-5 text-blue-600" />

              </div>

              <p className="text-3xl font-bold text-[#1C294E]">

                {upcomingAppointments || 0}

              </p>

              <Link href="/admin/appointments" className="text-sm text-blue-600 mt-2 hover:underline inline-block">

                View calendar →

              </Link>

            </Card>

 

            <Card>

              <div className="flex items-center justify-between mb-4">

                <p className="text-sm text-gray-600">Unpaid Invoices</p>

                <Receipt className="w-5 h-5 text-yellow-600" />

              </div>

              <p className="text-3xl font-bold text-[#1C294E]">

                ${totalUnpaid.toFixed(2)}

              </p>

              <Link href="/admin/invoices?filter=unpaid" className="text-sm text-yellow-600 mt-2 hover:underline inline-block">

                View details →

              </Link>

            </Card>

 

            <Card>

              <div className="flex items-center justify-between mb-4">

                <p className="text-sm text-gray-600">Pending Actions</p>

                <AlertCircle className="w-5 h-5 text-red-600" />

              </div>

              <p className="text-3xl font-bold text-[#1C294E]">

                {(pendingRegistrations || 0) + (pendingRequests || 0)}

              </p>

              <p className="text-sm text-gray-600 mt-2">

                Requires attention

              </p>

            </Card>

          </div>

 

          {/* Recent Activity */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Pending Registrations */}

            <Card>

              <div className="flex items-center justify-between mb-6">

                <h2 className="text-xl font-bold text-[#1C294E]">

                  Pending Registrations

                </h2>

                <Link href="/admin/registrations" className="text-sm text-[#079447] font-medium hover:underline">

                  View All

                </Link>

              </div>

 

              {recentRegistrations && recentRegistrations.length > 0 ? (

                <div className="space-y-4">

                  {recentRegistrations.map((reg) => (

                    <div key={reg.id} className="p-4 border border-gray-200 rounded-lg">

                      <div className="flex items-start justify-between mb-2">

                        <div>

                          <p className="font-semibold text-[#1C294E]">

                            {reg.full_name || 'No name'}

                          </p>

                          <p className="text-sm text-gray-600">{reg.email}</p>

                          {reg.phone && (

                            <p className="text-sm text-gray-600">{reg.phone}</p>

                          )}

                        </div>

                        <Badge variant="warning" size="sm">

                          Pending

                        </Badge>

                      </div>

                      <p className="text-xs text-gray-500">

                        Registered {new Date(reg.created_at).toLocaleDateString()}

                      </p>

                    </div>

                  ))}

                </div>

              ) : (

                <div className="text-center py-8 text-gray-500">

                  <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />

                  <p>No pending registrations</p>

                </div>

              )}

            </Card>

 

            {/* Pending Service Requests */}

            <Card>

              <div className="flex items-center justify-between mb-6">

                <h2 className="text-xl font-bold text-[#1C294E]">

                  Pending Service Requests

                </h2>

                <Link href="/admin/requests" className="text-sm text-[#079447] font-medium hover:underline">

                  View All

                </Link>

              </div>

 

              {recentRequests && recentRequests.length > 0 ? (

                <div className="space-y-4">

                  {recentRequests.map((req) => (

                    <div key={req.id} className="p-4 border border-gray-200 rounded-lg">

                      <div className="flex items-start justify-between mb-2">

                        <div>

                          <p className="font-semibold text-[#1C294E]">

                            {req.profiles?.full_name}

                          </p>

                          <p className="text-sm text-gray-600">

                            {req.service_type.replace('_', ' ')} cleaning

                          </p>

                          {req.preferred_date && (

                            <p className="text-sm text-gray-600">

                              Preferred: {new Date(req.preferred_date).toLocaleDateString()}

                            </p>

                          )}

                        </div>

                        <Badge variant="info" size="sm">

                          New

                        </Badge>

                      </div>

                      <p className="text-xs text-gray-500">

                        Requested {new Date(req.created_at).toLocaleDateString()}

                      </p>

                    </div>

                  ))}

                </div>

              ) : (

                <div className="text-center py-8 text-gray-500">

                  <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-300" />

                  <p>No pending requests</p>

                </div>

              )}

            </Card>

          </div>

        </main>

      </div>

    </div>

  )

}