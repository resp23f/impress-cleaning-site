'use client'
import { useState, useEffect, useMemo } from 'react'
import { format } from 'date-fns'
import {
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  Trash2,
  Search,
  Users,
  Navigation,
  AlertCircle,
  Receipt,
  Bell,
  Plus,
  ChevronRight,
  ChevronLeft,
  Sun,
  CloudSun,
  Sunset,
  Sparkles,
  Filter,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import AdminNav from '@/components/admin/AdminNav'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { sanitizeText } from '@/lib/sanitize'

// Time ranges for appointment creation
const TIME_RANGES = [
  { value: 'morning', title: 'Morning', description: '8:00 AM - 12:00 PM', start: '08:00', end: '12:00', icon: Sun },
  { value: 'afternoon', title: 'Afternoon', description: '12:00 PM - 3:00 PM', start: '12:00', end: '15:00', icon: CloudSun },
  { value: 'evening', title: 'Evening', description: '3:00 PM - 5:45 PM', start: '15:00', end: '17:45', icon: Sunset },
]

const SERVICE_TYPES = [
  { value: 'standard', label: 'Standard Cleaning' },
  { value: 'deep', label: 'Deep Cleaning' },
  { value: 'move_in_out', label: 'Move In/Out' },
  { value: 'post_construction', label: 'Post-Construction' },
  { value: 'office', label: 'Office Cleaning' },
]

const STATUS_CONFIG = {
  confirmed: { color: 'success', bg: 'bg-green-100', text: 'text-green-600', label: 'Confirmed' },
  pending: { color: 'warning', bg: 'bg-yellow-100', text: 'text-yellow-600', label: 'Pending Approval' },
  completed: { color: 'primary', bg: 'bg-blue-100', text: 'text-blue-600', label: 'Completed' },
  cancelled: { color: 'danger', bg: 'bg-red-100', text: 'text-red-600', label: 'Cancelled' },
  en_route: { color: 'info', bg: 'bg-sky-100', text: 'text-sky-600', label: 'En Route' },
  not_completed: { color: 'danger', bg: 'bg-orange-100', text: 'text-orange-600', label: 'Not Completed' },
}

export default function AppointmentsPage() {
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState([])
  const [customers, setCustomers] = useState([])
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showManageModal, setShowManageModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [processing, setProcessing] = useState(false)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')

  // Reschedule form
  const [rescheduleData, setRescheduleData] = useState({ date: '', timeStart: '', timeEnd: '' })
  const [notifyCustomer, setNotifyCustomer] = useState(true)
  const [teamInput, setTeamInput] = useState('')

  // Create appointment form
  const [createForm, setCreateForm] = useState({
    customer_id: '',
    address_id: '',
    service_type: 'standard',
    scheduled_date: '',
    timeRange: '',
    special_instructions: '',
  })
  const [selectedCustomerAddresses, setSelectedCustomerAddresses] = useState([])
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d
  })

  // Load data
  useEffect(() => {
    loadAppointments()
    loadCustomers()
  }, [])

  const loadAppointments = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/get-all-appointments')
      if (!res.ok) throw new Error('Failed to load appointments')
      const { data } = await res.json()
      setAppointments(data || [])
    } catch (error) {
      toast.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const loadCustomers = async () => {
    try {
      const res = await fetch('/api/admin/get-all-customers')
      if (!res.ok) throw new Error('Failed to load customers')
      const { data } = await res.json()
      setCustomers(data || [])
    } catch (error) {
      // Silent fail - customers list is supplementary
    }
  }

  // Load addresses when customer is selected
  useEffect(() => {
    if (createForm.customer_id) {
      const customer = customers.find(c => c.id === createForm.customer_id)
      setSelectedCustomerAddresses(customer?.service_addresses || [])
      // Auto-select primary or first address
      const primary = customer?.service_addresses?.find(a => a.is_primary) || customer?.service_addresses?.[0]
      if (primary) {
        setCreateForm(prev => ({ ...prev, address_id: primary.id }))
      }
    } else {
      setSelectedCustomerAddresses([])
      setCreateForm(prev => ({ ...prev, address_id: '' }))
    }
  }, [createForm.customer_id, customers])

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments]

    if (searchQuery) {
      const q = sanitizeText(searchQuery)?.toLowerCase() || ''
      filtered = filtered.filter(apt =>
        apt.profiles?.full_name?.toLowerCase().includes(q) ||
        apt.profiles?.email?.toLowerCase().includes(q) ||
        apt.profiles?.phone?.toLowerCase().includes(q)
      )
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'today') {
        const today = format(new Date(), 'yyyy-MM-dd')
        filtered = filtered.filter(apt => apt.scheduled_date === today)
      } else {
        filtered = filtered.filter(apt => apt.status === statusFilter)
      }
    }

    if (dateFilter) {
      filtered = filtered.filter(apt => apt.scheduled_date === dateFilter)
    }

    // Sort by date (upcoming first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.scheduled_date + 'T' + (a.scheduled_time_start || '00:00'))
      const dateB = new Date(b.scheduled_date + 'T' + (b.scheduled_time_start || '00:00'))
      return dateA - dateB
    })

    return filtered
  }, [appointments, searchQuery, statusFilter, dateFilter])

  // Stats
  const stats = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    return {
      total: appointments.length,
      today: appointments.filter(a => a.scheduled_date === today).length,
      confirmed: appointments.filter(a => a.status === 'confirmed').length,
      pending: appointments.filter(a => a.status === 'pending').length,
      enRoute: appointments.filter(a => a.status === 'en_route').length,
    }
  }, [appointments])

  // Helpers
  const formatTime = (timeStr) => {
    if (!timeStr) return ''
    const [h, m] = timeStr.split(':')
    const d = new Date()
    d.setHours(Number(h || 0), Number(m || 0), 0, 0)
    return format(d, 'h:mm a')
  }

  const formatServiceType = (type) => {
    return SERVICE_TYPES.find(s => s.value === type)?.label || type
  }

  const formatDisplayDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // Calendar helpers
  const minDateObj = new Date()
  const maxDateObj = new Date()
  maxDateObj.setMonth(maxDateObj.getMonth() + 3)

  const calendarDays = useMemo(() => {
    const startOfMonth = new Date(calendarMonth)
    startOfMonth.setDate(1)
    const monthStartDay = startOfMonth.getDay()
    const gridStart = new Date(startOfMonth)
    gridStart.setDate(gridStart.getDate() - monthStartDay)

    const days = []
    for (let i = 0; i < 42; i++) {
      days.push(new Date(gridStart))
      gridStart.setDate(gridStart.getDate() + 1)
    }
    return days
  }, [calendarMonth])

  // Handlers
  const handleStatClick = (filter) => {
    setStatusFilter(filter)
    setDateFilter('')
    setSearchQuery('')
  }

  const openManageModal = (appointment) => {
    setSelectedAppointment(appointment)
    setRescheduleData({
      date: appointment.scheduled_date || '',
      timeStart: appointment.scheduled_time_start?.slice(0, 5) || '',
      timeEnd: appointment.scheduled_time_end?.slice(0, 5) || '',
    })
    setTeamInput(appointment.team_members?.join(', ') || '')
    setNotifyCustomer(true)
    setShowManageModal(true)
  }

  const openCreateModal = () => {
    setCreateForm({
      customer_id: '',
      address_id: '',
      service_type: 'standard',
      scheduled_date: '',
      timeRange: '',
      special_instructions: '',
    })
    setIsCalendarOpen(false)
    setShowCreateModal(true)
  }

  const handleCreateAppointment = async () => {
    const { customer_id, address_id, service_type, scheduled_date, timeRange, special_instructions } = createForm

    if (!customer_id || !service_type || !scheduled_date || !timeRange) {
      toast.error('Please fill in all required fields')
      return
    }

    const timeConfig = TIME_RANGES.find(t => t.value === timeRange)
    if (!timeConfig) {
      toast.error('Please select a time window')
      return
    }

    setProcessing(true)
    try {
      const res = await fetch('/api/admin/create-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id,
          address_id: address_id || null,
          service_type,
          scheduled_date,
          scheduled_time_start: timeConfig.start,
          scheduled_time_end: timeConfig.end,
          special_instructions: special_instructions ? sanitizeText(special_instructions.trim()) : null,
          status: 'confirmed',
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create appointment')

      toast.success('Appointment created successfully!')
      setShowCreateModal(false)
      loadAppointments()
    } catch (error) {
      toast.error(error.message || 'Failed to create appointment')
    } finally {
      setProcessing(false)
    }
  }

  const handleUpdateStatus = async (status) => {
    if (!selectedAppointment) return

    setProcessing(true)
    try {
      const updates = {
        status,
        updated_at: new Date().toISOString(),
      }

      if (status === 'completed') updates.completed_at = new Date().toISOString()
      if (status === 'cancelled') updates.cancelled_at = new Date().toISOString()

      const { error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', selectedAppointment.id)

      if (error) throw error

      if (status === 'cancelled' && notifyCustomer) {
        try {
          await fetch('/api/email/appointment-cancelled', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              appointmentId: selectedAppointment.id,
              customerEmail: selectedAppointment.profiles?.email,
              customerName: selectedAppointment.profiles?.full_name,
              scheduledDate: selectedAppointment.scheduled_date,
              scheduledTime: formatTime(selectedAppointment.scheduled_time_start),
            }),
          })
        } catch (e) {
          // Email send failed silently - appointment still updated
        }
      }

      toast.success(`Appointment ${status.replace('_', ' ')}!`)
      setShowManageModal(false)
      loadAppointments()
    } catch (error) {
      toast.error('Failed to update appointment')
    } finally {
      setProcessing(false)
    }
  }

  const handleReschedule = async () => {
    if (!selectedAppointment) return

    const { date, timeStart, timeEnd } = rescheduleData
    if (!date || !timeStart || !timeEnd) {
      toast.error('Please enter date and time')
      return
    }

    if (timeStart >= timeEnd) {
      toast.error('End time must be after start time')
      return
    }

    setProcessing(true)
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          scheduled_date: date,
          scheduled_time_start: timeStart,
          scheduled_time_end: timeEnd,
          status: 'confirmed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedAppointment.id)

      if (error) throw error

      if (notifyCustomer) {
        try {
          await fetch('/api/email/appointment-rescheduled', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              appointmentId: selectedAppointment.id,
              customerEmail: selectedAppointment.profiles?.email,
              customerName: selectedAppointment.profiles?.full_name,
              oldDate: selectedAppointment.scheduled_date,
              oldTime: formatTime(selectedAppointment.scheduled_time_start),
              newDate: date,
              newTime: formatTime(timeStart),
            }),
          })
        } catch (e) {
          // Email send failed silently - reschedule still saved
        }
      }

      toast.success('Appointment rescheduled!')
      setShowManageModal(false)
      loadAppointments()
    } catch (error) {
      toast.error('Failed to reschedule')
    } finally {
      setProcessing(false)
    }
  }
  // Toggle running late status
  const handleToggleRunningLate = async () => {
    if (!selectedAppointment) return

    setProcessing(true)
    try {
      const newStatus = !selectedAppointment.is_running_late

      const { error } = await supabase
        .from('appointments')
        .update({
          is_running_late: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedAppointment.id)

      if (error) throw error

      // Create customer notification
      if (newStatus && selectedAppointment.customer_id) {
        await supabase.from('customer_notifications').insert({
          user_id: selectedAppointment.customer_id,
          type: 'appointment_update',
          title: 'Appointment Update',
          message: 'Our team is running slightly behind schedule. We\'ll be there as soon as possible. Thank you for your patience!',
          link: '/portal/dashboard',
          reference_id: selectedAppointment.id,
          reference_type: 'appointment',
        })
      }

      toast.success(newStatus ? 'Marked as running late' : 'Running late status cleared')
      setSelectedAppointment(prev => ({ ...prev, is_running_late: newStatus }))
      loadAppointments()
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setProcessing(false)
    }
  }
  const handleUpdateTeam = async () => {
    if (!selectedAppointment) return

    setProcessing(true)
    try {
      const teamMembers = teamInput
        .split(',')
        .map(name => sanitizeText(name.trim())?.slice(0, 50))
        .filter(name => name && name.length > 0)

      const { error } = await supabase
        .from('appointments')
        .update({ team_members: teamMembers, updated_at: new Date().toISOString() })
        .eq('id', selectedAppointment.id)

      if (error) throw error

      toast.success('Team updated!')
      setSelectedAppointment(prev => ({ ...prev, team_members: teamMembers }))
      loadAppointments()
    } catch (error) {
      toast.error('Failed to update team')
    } finally {
      setProcessing(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedAppointment) return
    if (!confirm('Delete this appointment permanently?')) return

    setProcessing(true)
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', selectedAppointment.id)

      if (error) throw error

      toast.success('Appointment deleted')
      setShowManageModal(false)
      loadAppointments()
    } catch (error) {
      toast.error('Failed to delete')
    } finally {
      setProcessing(false)
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setDateFilter('')
  }

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || dateFilter

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
        <AdminNav pendingCount={0} requestsCount={0} />
        <div className="lg:pl-64">
          <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-10 bg-gray-200 rounded-lg w-64" />
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded-xl" />
                ))}
              </div>
              <div className="h-16 bg-gray-200 rounded-xl" />
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-xl" />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <AdminNav pendingCount={stats.pending} requestsCount={0} />

      <div className="lg:pl-64">
        <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-1 w-12 bg-gradient-to-r from-[#079447] to-emerald-400 rounded-full" />
                <span className="text-sm font-medium text-[#079447] uppercase tracking-wider">Admin</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#1C294E] tracking-tight">Appointments</h1>
              <p className="text-gray-500 mt-1">Manage all customer appointments</p>
            </div>
            <Button variant="primary" onClick={openCreateModal} className="shadow-lg shadow-[#079447]/20">
              <Plus className="w-5 h-5" />
              New Appointment
            </Button>
          </div>

          {/* Stats Cards - Clickable */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {[
              { key: 'all', label: 'Total', value: stats.total, icon: Calendar, color: 'blue', gradient: 'from-blue-500 to-indigo-500' },
              { key: 'today', label: 'Today', value: stats.today, icon: Sparkles, color: 'emerald', gradient: 'from-emerald-500 to-green-500' },
              { key: 'confirmed', label: 'Confirmed', value: stats.confirmed, icon: CheckCircle, color: 'green', gradient: 'from-green-500 to-emerald-500' },
              { key: 'pending', label: 'Pending', value: stats.pending, icon: Clock, color: 'yellow', gradient: 'from-yellow-500 to-amber-500' },
              { key: 'en_route', label: 'En Route', value: stats.enRoute, icon: Navigation, color: 'sky', gradient: 'from-sky-500 to-blue-500' },
            ].map((stat) => {
              const Icon = stat.icon
              const isActive = statusFilter === stat.key
              return (
                <button
                  key={stat.key}
                  onClick={() => handleStatClick(stat.key)}
                  className={`
                    relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300
                    ${isActive
                      ? `bg-gradient-to-br ${stat.gradient} text-white shadow-lg scale-[1.02]`
                      : 'bg-white hover:shadow-lg hover:scale-[1.01] border border-gray-100'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs font-medium mb-1 ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                        {stat.label}
                      </p>
                      <p className={`text-3xl font-bold ${isActive ? 'text-white' : 'text-[#1C294E]'}`}>
                        {stat.value}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isActive ? 'bg-white/20' : `bg-${stat.color}-100`
                      }`}>
                      <Icon className={`w-6 h-6 ${isActive ? 'text-white' : `text-${stat.color}-600`}`} />
                    </div>
                  </div>
                  {isActive && (
                    <div className="absolute bottom-2 right-2">
                      <div className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">Active</div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="appointment-search"
                    name="appointment-search"
                    placeholder="Search by customer name, email, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoComplete="off"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#079447] focus:ring-2 focus:ring-[#079447]/20 transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <select
                  id="appointment-status-filter"
                  name="appointment-status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-gray-200 focus:border-[#079447] focus:ring-2 focus:ring-[#079447]/20 transition-all bg-white min-w-[160px]"
                >
                  <option value="all">All Statuses</option>
                  <option value="today">Today Only</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="en_route">En Route</option>
                  <option value="completed">Completed</option>
                  <option value="not_completed">Not Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="!py-3"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-[#1C294E]">{filteredAppointments.length}</span> of {appointments.length} appointments
                </p>
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Appointments List */}
          {filteredAppointments.length > 0 ? (
            <div className="space-y-4">
              {filteredAppointments.map((apt) => {
                const statusConfig = STATUS_CONFIG[apt.status] || STATUS_CONFIG.pending
                const StatusIcon = apt.status === 'confirmed' ? CheckCircle :
                  apt.status === 'pending' ? Clock :
                    apt.status === 'en_route' ? Navigation :
                      apt.status === 'cancelled' ? XCircle :
                        apt.status === 'completed' ? CheckCircle : AlertCircle

                return (
                  <div
                    key={apt.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Left side - Customer & Service Info */}
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`w-14 h-14 rounded-2xl ${statusConfig.bg} flex items-center justify-center flex-shrink-0`}>
                            <StatusIcon className={`w-7 h-7 ${statusConfig.text}`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap mb-2">
                              <h3 className="text-lg font-bold text-[#1C294E] truncate">
                                {apt.profiles?.full_name || 'Unknown Customer'}
                              </h3>
                              <Badge variant={statusConfig.color}>
                                {statusConfig.label}
                              </Badge>
                            </div>

                            <p className="text-[#079447] font-medium mb-3">
                              {formatServiceType(apt.service_type)}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                {format(new Date(apt.scheduled_date + 'T00:00:00'), 'EEE, MMM d, yyyy')}
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                {formatTime(apt.scheduled_time_start)} - {formatTime(apt.scheduled_time_end)}
                              </div>
                              {apt.service_addresses && (
                                <div className="flex items-start gap-2 sm:col-span-2">
                                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                  <span className="truncate">
                                    {apt.service_addresses.street_address}
                                    {apt.service_addresses.unit && `, ${apt.service_addresses.unit}`}, {apt.service_addresses.city}
                                  </span>
                                </div>
                              )}
                              {apt.team_members?.length > 0 && (
                                <div className="flex items-center gap-2 sm:col-span-2">
                                  <Users className="w-4 h-4 text-gray-400" />
                                  <span className="truncate">{apt.team_members.join(', ')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right side - Actions */}
                        <div className="flex items-center gap-3 lg:flex-shrink-0">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => openManageModal(apt)}
                          >
                            Manage
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-[#1C294E] mb-2">No Appointments Found</h3>
              <p className="text-gray-500 mb-6">
                {hasActiveFilters ? 'Try adjusting your filters' : 'Create your first appointment to get started'}
              </p>
              {hasActiveFilters ? (
                <Button variant="secondary" onClick={clearFilters}>Clear Filters</Button>
              ) : (
                <Button variant="primary" onClick={openCreateModal}>
                  <Plus className="w-5 h-5" />
                  Create Appointment
                </Button>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Create Appointment Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Appointment"
        maxWidth="lg"
      >
        <div className="space-y-6">
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-semibold text-[#1C294E] mb-2">
              Customer <span className="text-red-500">*</span>
            </label>
            <select
              id="create-appointment-customer"
              name="create-appointment-customer"
              value={createForm.customer_id}
              onChange={(e) => setCreateForm(prev => ({ ...prev, customer_id: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#079447] focus:ring-2 focus:ring-[#079447]/20 transition-all"
            >
              <option value="">Select a customer...</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.full_name} ({customer.email})
                </option>
              ))}
            </select>
          </div>

          {/* Address Selection */}
          {selectedCustomerAddresses.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-[#1C294E] mb-2">
                Service Address
              </label>
              <select
                id="create-appointment-address"
                name="create-appointment-address"
                value={createForm.address_id}
                onChange={(e) => setCreateForm(prev => ({ ...prev, address_id: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#079447] focus:ring-2 focus:ring-[#079447]/20 transition-all"
              >
                {selectedCustomerAddresses.map((addr) => (
                  <option key={addr.id} value={addr.id}>
                    {addr.street_address}{addr.unit ? `, ${addr.unit}` : ''}, {addr.city} {addr.is_primary ? '(Primary)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Service Type */}
          <div>
            <label className="block text-sm font-semibold text-[#1C294E] mb-2">
              Service Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SERVICE_TYPES.map((service) => (
                <button
                  key={service.value}
                  type="button"
                  onClick={() => setCreateForm(prev => ({ ...prev, service_type: service.value }))}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${createForm.service_type === service.value
                    ? 'border-[#079447] bg-[#079447]/5 text-[#079447]'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                >
                  {service.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-semibold text-[#1C294E] mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#079447] text-left flex items-center gap-3"
              >
                <Calendar className="w-5 h-5 text-[#079447]" />
                <span className={createForm.scheduled_date ? 'text-[#1C294E] font-medium' : 'text-gray-400'}>
                  {createForm.scheduled_date ? formatDisplayDate(createForm.scheduled_date) : 'Select a date'}
                </span>
              </button>

              {isCalendarOpen && (
                <div className="absolute z-30 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <button
                      type="button"
                      onClick={() => {
                        const prev = new Date(calendarMonth)
                        prev.setMonth(prev.getMonth() - 1)
                        setCalendarMonth(prev)
                      }}
                      className="p-2 rounded-lg hover:bg-gray-100"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="font-semibold text-[#1C294E]">
                      {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = new Date(calendarMonth)
                        next.setMonth(next.getMonth() + 1)
                        setCalendarMonth(next)
                      }}
                      className="p-2 rounded-lg hover:bg-gray-100"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 text-xs font-semibold text-gray-500 mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                      <div key={day} className="text-center py-2">{day}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((dateObj, i) => {
                      const iso = dateObj.toISOString().split('T')[0]
                      const isDisabled = dateObj < minDateObj || dateObj > maxDateObj
                      const isCurrentMonth = dateObj.getMonth() === calendarMonth.getMonth()
                      const isSelected = createForm.scheduled_date === iso

                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => {
                            setCreateForm(prev => ({ ...prev, scheduled_date: iso }))
                            setIsCalendarOpen(false)
                          }}
                          className={`
                            w-10 h-10 flex items-center justify-center rounded-lg text-sm transition-all
                            ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                            ${isSelected ? 'bg-[#079447] text-white font-semibold' : !isDisabled ? 'hover:bg-gray-100' : ''}
                            ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                          `}
                        >
                          {dateObj.getDate()}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-sm font-semibold text-[#1C294E] mb-2">
              Time Window <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {TIME_RANGES.map((time) => {
                const Icon = time.icon
                const isSelected = createForm.timeRange === time.value
                return (
                  <button
                    key={time.value}
                    type="button"
                    onClick={() => setCreateForm(prev => ({ ...prev, timeRange: time.value }))}
                    className={`relative p-4 rounded-xl border-2 transition-all text-center ${isSelected
                      ? 'border-[#079447] bg-[#079447]/5'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center ${isSelected ? 'bg-[#079447]' : 'bg-gray-100'
                      }`}>
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <p className={`font-semibold text-sm ${isSelected ? 'text-[#079447]' : 'text-[#1C294E]'}`}>
                      {time.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{time.description}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-sm font-semibold text-[#1C294E] mb-2">
              Special Instructions (optional)
            </label>
            <textarea
              id="create-appointment-instructions"
              name="create-appointment-instructions"
              value={createForm.special_instructions}
              onChange={(e) => setCreateForm(prev => ({ ...prev, special_instructions: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#079447] focus:ring-2 focus:ring-[#079447]/20 transition-all resize-none"
              placeholder="Any special notes or instructions..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateAppointment}
              loading={processing}
              disabled={!createForm.customer_id || !createForm.service_type || !createForm.scheduled_date || !createForm.timeRange}
            >
              <Plus className="w-5 h-5" />
              Create Appointment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Manage Appointment Modal */}
      <Modal
        isOpen={showManageModal}
        onClose={() => setShowManageModal(false)}
        title="Manage Appointment"
        maxWidth="lg"
      >
        {selectedAppointment && (
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Customer</h3>
                <Link href={`/admin/customers?search=${selectedAppointment.profiles?.email}`}>
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4" />
                    View Profile
                  </Button>
                </Link>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-[#1C294E]">{selectedAppointment.profiles?.full_name}</p>
                <p className="text-sm text-gray-600">{selectedAppointment.profiles?.email}</p>
                <p className="text-sm text-gray-600">{selectedAppointment.profiles?.phone || 'No phone'}</p>
              </div>
            </div>

            {/* Appointment Details */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Appointment Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Service</p>
                  <p className="font-semibold text-[#1C294E]">{formatServiceType(selectedAppointment.service_type)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <Badge variant={STATUS_CONFIG[selectedAppointment.status]?.color || 'default'}>
                    {STATUS_CONFIG[selectedAppointment.status]?.label || selectedAppointment.status}
                  </Badge>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Date</p>
                  <p className="font-semibold text-[#1C294E]">
                    {format(new Date(selectedAppointment.scheduled_date + 'T00:00:00'), 'EEE, MMM d, yyyy')}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Time</p>
                  <p className="font-semibold text-[#1C294E]">
                    {formatTime(selectedAppointment.scheduled_time_start)} - {formatTime(selectedAppointment.scheduled_time_end)}
                  </p>
                </div>
              </div>

              {selectedAppointment.service_addresses && (
                <div className="bg-gray-50 rounded-xl p-4 mt-4">
                  <p className="text-xs text-gray-500 mb-1">Address</p>
                  <p className="font-semibold text-[#1C294E]">
                    {selectedAppointment.service_addresses.street_address}
                    {selectedAppointment.service_addresses.unit && `, ${selectedAppointment.service_addresses.unit}`}
                    <br />
                    {selectedAppointment.service_addresses.city}, {selectedAppointment.service_addresses.state} {selectedAppointment.service_addresses.zip_code}
                  </p>
                </div>
              )}

              {selectedAppointment.special_instructions && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
                  <p className="text-xs text-amber-700 font-semibold mb-1">Special Instructions</p>
                  <p className="text-sm text-amber-900">{selectedAppointment.special_instructions}</p>
                </div>
              )}
            </div>

            {/* Team Assignment */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Team Assignment</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Team member names (comma separated)"
                  value={teamInput}
                  onChange={(e) => setTeamInput(e.target.value)}
                  icon={<Users className="w-5 h-5" />}
                  className="flex-1"
                />
                <Button variant="secondary" onClick={handleUpdateTeam} loading={processing}>
                  Update
                </Button>
              </div>
            </div>

            {/* Reschedule */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Reschedule</h3>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <Input
                  type="date"
                  label="Date"
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, date: e.target.value }))}
                />
                <Input
                  type="time"
                  label="Start"
                  value={rescheduleData.timeStart}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, timeStart: e.target.value }))}
                />
                <Input
                  type="time"
                  label="End"
                  value={rescheduleData.timeEnd}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, timeEnd: e.target.value }))}
                />
              </div>
              <label className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="notify-customer"
                  name="notify-customer"
                  checked={notifyCustomer}
                  onChange={(e) => setNotifyCustomer(e.target.checked)}
                  className="w-4 h-4 text-[#079447] rounded"
                />
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <Bell className="w-4 h-4" /> Notify customer
                </span>
              </label>
              <Button variant="secondary" fullWidth onClick={handleReschedule} loading={processing}>
                <Calendar className="w-4 h-4" />
                Reschedule Appointment
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>

              {/* Running Late Toggle - Only for today's confirmed/en_route appointments */}
              {(() => {
                const today = format(new Date(), 'yyyy-MM-dd')
                const isToday = selectedAppointment.scheduled_date === today
                const isActive = ['confirmed', 'en_route'].includes(selectedAppointment.status)

                if (isToday && isActive) {
                  return (
                    <div className="mb-3">
                      <Button
                        variant={selectedAppointment.is_running_late ? 'warning' : 'outline'}
                        fullWidth
                        onClick={handleToggleRunningLate}
                        loading={processing}
                        className={selectedAppointment.is_running_late ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500' : ''}
                      >
                        <Clock className="w-4 h-4" />
                        {selectedAppointment.is_running_late ? 'Running Late (Click to Clear)' : 'Mark as Running Late'}
                      </Button>
                      {selectedAppointment.is_running_late && (
                        <p className="text-xs text-amber-600 mt-1 text-center">
                          Customer has been notified
                        </p>
                      )}
                    </div>
                  )
                }
                return null
              })()}

              <div className="grid grid-cols-2 gap-3">
                <Link href={`/admin/invoices?customer=${selectedAppointment.customer_id}`}>
                  <Button variant="outline" fullWidth size="sm">
                    <Receipt className="w-4 h-4" />
                    View Invoices
                  </Button>
                </Link>
                <Link href="/admin/invoices">
                  <Button variant="outline" fullWidth size="sm">
                    <Plus className="w-4 h-4" />
                    Create Invoice
                  </Button>
                </Link>
              </div>
            </div>

            {/* Status Updates */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Update Status</h3>
              <div className="grid grid-cols-2 gap-3">
                {selectedAppointment.status === 'pending' && (
                  <Button variant="success" fullWidth onClick={() => handleUpdateStatus('confirmed')} loading={processing}>
                    <CheckCircle className="w-4 h-4" />
                    Confirm
                  </Button>
                )}
                {selectedAppointment.status === 'confirmed' && (
                  <Button variant="primary" fullWidth onClick={() => handleUpdateStatus('en_route')} loading={processing}>
                    <Navigation className="w-4 h-4" />
                    En Route
                  </Button>
                )}
                {(selectedAppointment.status === 'confirmed' || selectedAppointment.status === 'en_route') && (
                  <>
                    <Button variant="success" fullWidth onClick={() => handleUpdateStatus('completed')} loading={processing}>
                      <CheckCircle className="w-4 h-4" />
                      Complete
                    </Button>
                    <Button variant="warning" fullWidth onClick={() => handleUpdateStatus('not_completed')} loading={processing}>
                      <AlertCircle className="w-4 h-4" />
                      Not Completed
                    </Button>
                  </>
                )}
              </div>

              {selectedAppointment.status !== 'cancelled' && selectedAppointment.status !== 'completed' && (
                <Button
                  variant="danger"
                  fullWidth
                  className="mt-3"
                  onClick={() => handleUpdateStatus('cancelled')}
                  loading={processing}
                >
                  <XCircle className="w-4 h-4" />
                  Cancel Appointment
                </Button>
              )}

              <Button
                variant="outline"
                fullWidth
                className="mt-3 text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleDelete}
                loading={processing}
              >
                <Trash2 className="w-4 h-4" />
                Delete Permanently
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}