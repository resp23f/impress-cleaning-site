'use client'
import { useState, useEffect } from 'react'
import { format, subDays, startOfMonth, endOfMonth, parseISO } from 'date-fns'
import {
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  FileText,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import AdminNav from '@/components/admin/AdminNav'
export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30') // days
  const [stats, setStats] = useState({
    revenue: 0,
    appointments: 0,
    newCustomers: 0,
    completedServices: 0,
    pendingInvoices: 0,
    averageInvoice: 0,
  })
  const [serviceBreakdown, setServiceBreakdown] = useState([])
  const [revenueByMonth, setRevenueByMonth] = useState([])
  const [topCustomers, setTopCustomers] = useState([])
  const supabase = createClient()
  useEffect(() => {
    loadReports()
  }, [dateRange])
  const loadReports = async () => {
    setLoading(true)
    try {
      const startDate = subDays(new Date(), parseInt(dateRange))
      const startDateStr = format(startDate, 'yyyy-MM-dd')
      // Load all data in parallel
      const [
        invoicesRes,
        appointmentsRes,
        customersRes,
        serviceHistoryRes,
      ] = await Promise.all([
        supabase
          .from('invoices')
          .select('*')
          .gte('created_at', startDateStr),
        supabase
          .from('appointments')
          .select('*, profiles!customer_id(id, full_name, email)')
          .gte('created_at', startDateStr),
        supabase
          .from('profiles')
          .select('*')
          .eq('role', 'customer')
          .gte('created_at', startDateStr),
        supabase
          .from('service_history')
          .select('*')
          .gte('created_at', startDateStr),
      ])
      const invoices = invoicesRes.data || []
      const appointments = appointmentsRes.data || []
      const customers = customersRes.data || []
      const serviceHistory = serviceHistoryRes.data || []
      // Calculate stats
      const paidInvoices = invoices.filter(i => i.status === 'paid')
      const totalRevenue = paidInvoices.reduce((sum, i) => sum + parseFloat(i.amount), 0)
      const pendingInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').length
      setStats({
        revenue: totalRevenue,
        appointments: appointments.length,
        newCustomers: customers.length,
        completedServices: serviceHistory.length,
        pendingInvoices,
        averageInvoice: paidInvoices.length > 0 ? totalRevenue / paidInvoices.length : 0,
      })
      // Service type breakdown
      const serviceTypes = {}
      appointments.forEach(apt => {
        serviceTypes[apt.service_type] = (serviceTypes[apt.service_type] || 0) + 1
      })
      const breakdown = Object.entries(serviceTypes).map(([type, count]) => ({
        type,
        count,
        percentage: (count / appointments.length * 100).toFixed(1)
      }))
      setServiceBreakdown(breakdown.sort((a, b) => b.count - a.count))
      // Revenue by month (last 6 months)
      const monthlyRevenue = {}
      paidInvoices.forEach(inv => {
        const month = format(parseISO(inv.paid_date || inv.created_at), 'MMM yyyy')
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + parseFloat(inv.amount)
      })
      const revenueData = Object.entries(monthlyRevenue).map(([month, amount]) => ({
        month,
        amount
      }))
      setRevenueByMonth(revenueData.slice(-6))
      // Top customers by revenue
      const customerRevenue = {}
      paidInvoices.forEach(inv => {
        const customerId = inv.customer_id
        customerRevenue[customerId] = (customerRevenue[customerId] || 0) + parseFloat(inv.amount)
      })
      // Get customer details
      const topCustomerIds = Object.entries(customerRevenue)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([id]) => id)
      if (topCustomerIds.length > 0) {
        const { data: topCustomerData } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', topCustomerIds)
        const topCustomersWithRevenue = topCustomerData?.map(customer => ({
          ...customer,
          revenue: customerRevenue[customer.id]
        })).sort((a, b) => b.revenue - a.revenue) || []
        setTopCustomers(topCustomersWithRevenue)
      }
    } catch (error) {
      console.error('Error loading reports:', error)
    } finally {
      setLoading(false)
    }
  }
  const formatServiceType = (type) => {
    const types = {
      standard: 'Standard Cleaning',
      deep: 'Deep Cleaning',
      move_in_out: 'Move In/Out',
      post_construction: 'Post-Construction',
      office: 'Office Cleaning',
    }
    return types[type] || type
  }
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AdminNav pendingCount={0} requestsCount={0} />
        <LoadingSpinner size="lg" />
      </div>
    )
  }
  return (
    <div className="min-h-screen">
      <AdminNav pendingCount={0} requestsCount={0} />
      <div className="lg:pl-64">
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#1C294E] mb-2">
                Reports & Analytics
              </h1>
              <p className="text-gray-600">
                Business performance and insights
              </p>
            </div>
            {/* Date Range Filter */}
            <div>
              <select
                id="reports-date-range"
                name="reports-date-range"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C294E] focus:border-transparent"
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="180">Last 6 Months</option>
                <option value="365">Last Year</option>
              </select>
            </div>
          </div>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-[#079447]">
                    ${stats.revenue.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Avg: ${stats.averageInvoice.toFixed(2)}/invoice
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-[#079447]" />
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Appointments</p>
                  <p className="text-3xl font-bold text-[#1C294E]">
                    {stats.appointments}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.completedServices} completed
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">New Customers</p>
                  <p className="text-3xl font-bold text-[#1C294E]">
                    {stats.newCustomers}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.pendingInvoices} pending invoices
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </Card>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Service Type Breakdown */}
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#1C294E]">
                    Service Type Breakdown
                  </h2>
                  <p className="text-sm text-gray-600">
                    Distribution of service types
                  </p>
                </div>
              </div>
              {serviceBreakdown.length > 0 ? (
                <div className="space-y-4">
                  {serviceBreakdown.map((service, index) => (
                    <div key={service.type}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {formatServiceType(service.type)}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {service.count} ({service.percentage}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#079447] h-2 rounded-full transition-all"
                          style={{ width: `${service.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No service data available
                </div>
              )}
            </Card>
            {/* Top Customers */}
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#1C294E]">
                    Top Customers
                  </h2>
                  <p className="text-sm text-gray-600">
                    By revenue generated
                  </p>
                </div>
              </div>
              {topCustomers.length > 0 ? (
                <div className="space-y-3">
                  {topCustomers.map((customer, index) => (
                    <div
                      key={customer.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#1C294E] text-white rounded-full flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-[#1C294E]">
                            {customer.full_name || customer.email}
                          </p>
                          {customer.full_name && (
                            <p className="text-xs text-gray-500">
                              {customer.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#079447]">
                          ${customer.revenue.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No customer data available
                </div>
              )}
            </Card>
          </div>
          {/* Revenue Trend */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#1C294E]">
                  Revenue Trend
                </h2>
                <p className="text-sm text-gray-600">
                  Monthly revenue over time
                </p>
              </div>
            </div>
            {revenueByMonth.length > 0 ? (
              <div className="space-y-4">
                {revenueByMonth.map((data) => {
                  const maxRevenue = Math.max(...revenueByMonth.map(d => d.amount))
                  const percentage = (data.amount / maxRevenue * 100).toFixed(1)
                  return (
                    <div key={data.month}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {data.month}
                        </span>
                        <span className="text-sm font-semibold text-[#079447]">
                          ${data.amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-[#079447] h-3 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p>No revenue data available for this period</p>
              </div>
            )}
          </Card>
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <Card className="text-center">
              <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-[#1C294E]">
                {stats.completedServices}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </Card>
            <Card className="text-center">
              <FileText className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-[#1C294E]">
                {stats.pendingInvoices}
              </p>
              <p className="text-sm text-gray-600">Pending</p>
            </Card>
            <Card className="text-center">
              <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-[#1C294E]">
                ${stats.averageInvoice.toFixed(0)}
              </p>
              <p className="text-sm text-gray-600">Avg Invoice</p>
            </Card>
            <Card className="text-center">
              <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-[#1C294E]">
                {stats.appointments}
              </p>
              <p className="text-sm text-gray-600">Bookings</p>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}