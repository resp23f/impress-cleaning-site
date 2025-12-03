'use client'
import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import {
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Search,
  Users,
  Navigation,
  AlertCircle,
  Receipt,
  Bell,
  Plus
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import AdminNav from '@/components/admin/AdminNav'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { sanitizeText } from '@/lib/sanitize'

export default function AppointmentsPage() {
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [processing, setProcessing] = useState(false)

  // Reschedule form
  const [adminReschedule, setAdminReschedule] = useState({
    date: '',
    timeStart: '',
    timeEnd: '',
  })
  const [notifyCustomer, setNotifyCustomer] = useState(true)

  // Team member assignment
  const [teamInput, setTeamInput] = useState('')

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')

  const supabase = createClient()

  useEffect(() => {
    loadAppointments()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [appointments, searchQuery, statusFilter, dateFilter])

  const loadAppointments = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/get-all-appointments')
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load appointments')
      }
      const { data } = await res.json()
      setAppointments(data || [])
    } catch (error) {
      console.error('Error loading appointments:', error)
      toast.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const filterAppointments = () => {
    let filtered = [...appointments]

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(apt =>
        apt.profiles?.full_name?.toLowerCase().includes(q) ||
        apt.profiles?.email?.toLowerCase().includes(q) ||
        apt.profiles?.phone?.toLowerCase().includes(q)
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter)
    }

    if (dateFilter) {
      filtered = filtered.filter(apt => apt.scheduled_date === dateFilter)
    }

    // Sort by date (upcoming first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.scheduled_date + 'T' + a.scheduled_time_start)
      const dateB = new Date(b.scheduled_date + 'T' + b.scheduled_time_start)
      return dateA - dateB
    })

    setFilteredAppointments(filtered)
  }

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'success',
      pending: 'warning',
      completed: 'primary',
      cancelled: 'danger',
      en_route: 'info',
      not_completed: 'danger',
    }
    return colors[status] || 'default'
  }

  const getStatusIcon = (status) => {
    const icons = {
      confirmed: CheckCircle,
      pending: Clock,
      completed: CheckCircle,
      cancelled: XCircle,
      en_route: Navigation,
      not_completed: AlertCircle,
    }
    return icons[status] || Clock
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

  const formatTime = (timeStr) => {
    if (!timeStr) return ''
    const [h, m] = timeStr.split(':')
    const d = new Date()
    d.setHours(Number(h || 0), Number(m || 0), 0, 0)
    return format(d, 'h:mm a')
  }

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment)
    setAdminReschedule({
      date: appointment.scheduled_date || '',
      timeStart: appointment.scheduled_time_start?.slice(0, 5) || '',
      timeEnd: appointment.scheduled_time_end?.slice(0, 5) || '',
    })
    setTeamInput(appointment.team_members?.join(', ') || '')
    setNotifyCustomer(true)
    setShowModal(true)
  }

  const handleUpdateStatus = async (status) => {
    if (!selectedAppointment) return

    setProcessing(true)
    try {
      const updates = {
        status,
        updated_at: new Date().toISOString(),
      }

      if (status === 'completed') {
        updates.completed_at = new Date().toISOString()
      } else if (status === 'cancelled') {
        updates.cancelled_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', selectedAppointment.id)

      if (error) throw error

      // Send notification email if cancelling
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
        } catch (emailError) {
          console.error('Failed to send cancellation email:', emailError)
        }
      }

      toast.success(`Appointment ${status.replace('_', ' ')}!`)
      setShowModal(false)
      loadAppointments()
    } catch (error) {
      console.error('Error updating appointment:', error)
      toast.error('Failed to update appointment')
    } finally {
      setProcessing(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedAppointment) return

    if (!confirm('Are you sure you want to delete this appointment? This cannot be undone.')) {
      return
    }

    setProcessing(true)
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', selectedAppointment.id)

      if (error) throw error

      toast.success('Appointment deleted')
      setShowModal(false)
      loadAppointments()
    } catch (error) {
      console.error('Error deleting appointment:', error)
      toast.error('Failed to delete appointment')
    } finally {
      setProcessing(false)
    }
  }

  const handleAdminReschedule = async () => {
    if (!selectedAppointment) return

    const { date, timeStart, timeEnd } = adminReschedule
    if (!date || !timeStart || !timeEnd) {
      toast.error('Please enter date, start time, and end time')
      return
    }

    // Validate time order
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
          completed_at: null,
          cancelled_at: null,
        })
        .eq('id', selectedAppointment.id)

      if (error) throw error

      // Send notification email if enabled
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
        } catch (emailError) {
          console.error('Failed to send reschedule email:', emailError)
        }
      }

      toast.success('Appointment rescheduled')
      setShowModal(false)
      loadAppointments()
    } catch (error) {
      console.error('Error rescheduling appointment:', error)
      toast.error('Failed to reschedule appointment')
    } finally {
      setProcessing(false)
    }
  }

  const handleUpdateTeam = async () => {
    if (!selectedAppointment) return

    setProcessing(true)
    try {
      // Parse and sanitize team members
      const teamMembers = teamInput
        .split(',')
        .map(name => sanitizeText(name.trim())?.slice(0, 50))
        .filter(name => name && name.length > 0)

      const { error } = await supabase
        .from('appointments')
        .update({
          team_members: teamMembers,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedAppointment.id)

      if (error) throw error

      toast.success('Team updated')
      setSelectedAppointment(prev => ({ ...prev, team_members: teamMembers }))
      loadAppointments()
    } catch (error) {
      console.error('Error updating team:', error)
      toast.error('Failed to update team')
    } finally {
      setProcessing(false)
    }
  }

  // Calculate stats
  const stats = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    pending: appointments.filter(a => a.status === 'pending').length,
    today: appointments.filter(a => a.scheduled_date === format(new Date(), 'yyyy-MM-dd')).length,
    enRoute: appointments.filter(a => a.status === 'en_route').length,
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1C294E] mb-2">
              Appointments
            </h1>
            <p className="text-gray-600">
              Manage all customer appointments
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Total</p>
                  <p className="text-2xl sm:text-3xl font-bold text-[#1C294E]">{stats.total}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Today</p>
                  <p className="text-2xl sm:text-3xl font-bold text-[#079447]">{stats.today}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-[#079447]" />
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Confirmed</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.confirmed}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                </div>
              </div>
            </Card>
            <Card className="col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">En Route</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.enRoute}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Navigation className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Search by customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-5 h-5" />}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C294E] focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="en_route">En Route</option>
                <option value="completed">Completed</option>
                <option value="not_completed">Not Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Input
                type="date"
                placeholder="Filter by date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            {(searchQuery || statusFilter !== 'all' || dateFilter) && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {filteredAppointments.length} of {appointments.length} appointments
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('all')
                    setDateFilter('')
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </Card>

          {/* Appointments List */}
          {filteredAppointments.length > 0 ? (
            <div className="space-y-4">
              {filteredAppointments.map((apt) => {
                const StatusIcon = getStatusIcon(apt.status)
                return (
                  <Card key={apt.id} hover>
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                            apt.status === 'confirmed' ? 'bg-green-100' :
                            apt.status === 'pending' ? 'bg-yellow-100' :
                            apt.status === 'en_route' ? 'bg-blue-100' :
                            apt.status === 'completed' ? 'bg-blue-100' :
                            'bg-gray-100'
                          }`}>
                            <StatusIcon className={`w-6 h-6 ${
                              apt.status === 'confirmed' ? 'text-green-600' :
                              apt.status === 'pending' ? 'text-yellow-600' :
                              apt.status === 'en_route' ? 'text-blue-600' :
                              apt.status === 'completed' ? 'text-blue-600' :
                              'text-gray-600'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="text-lg font-semibold text-[#1C294E] truncate">
                                {apt.profiles?.full_name || 'Unknown Customer'}
                              </h3>
                              <Badge variant={getStatusColor(apt.status)}>
                                {apt.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {formatServiceType(apt.service_type)}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            {format(parseISO(apt.scheduled_date), 'EEE, MMM d, yyyy')}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            {formatTime(apt.scheduled_time_start)} - {formatTime(apt.scheduled_time_end)}
                          </div>
                          {apt.service_addresses && (
                            <div className="flex items-start gap-2 text-sm text-gray-600 sm:col-span-2">
                              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <span className="truncate">
                                {apt.service_addresses.street_address}
                                {apt.service_addresses.unit && `, ${apt.service_addresses.unit}`}
                                {', '}
                                {apt.service_addresses.city}
                              </span>
                            </div>
                          )}
                          {apt.team_members && apt.team_members.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 sm:col-span-2">
                              <Users className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{apt.team_members.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleViewDetails(apt)}
                        >
                          <Edit className="w-4 h-4 sm:mr-2" />
                          <span className="hidden sm:inline">Manage</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#1C294E] mb-2">
                  No Appointments Found
                </h3>
                <p className="text-gray-600">
                  {searchQuery || statusFilter !== 'all' || dateFilter
                    ? 'Try adjusting your filters'
                    : 'No appointments scheduled yet'}
                </p>
              </div>
            </Card>
          )}
        </main>
      </div>

      {/* Appointment Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Manage Appointment"
        maxWidth="lg"
      >
        {selectedAppointment && (
          <div className="space-y-6">
            {/* Customer Info */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  Customer Information
                </h3>
                <Link href={`/admin/customers?search=${selectedAppointment.profiles?.email}`}>
                  <Button variant="outline" size="sm">
                    <User className="w-4 h-4 mr-1" />
                    View Profile
                  </Button>
                </Link>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Name:</span>
                  <span className="text-sm font-medium text-[#1C294E]">
                    {selectedAppointment.profiles?.full_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm font-medium text-[#1C294E]">
                    {selectedAppointment.profiles?.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Phone:</span>
                  <span className="text-sm font-medium text-[#1C294E]">
                    {selectedAppointment.profiles?.phone || 'Not provided'}
                  </span>
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Appointment Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Service:</span>
                  <span className="text-sm font-medium text-[#1C294E]">
                    {formatServiceType(selectedAppointment.service_type)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Date:</span>
                  <span className="text-sm font-medium text-[#1C294E]">
                    {format(parseISO(selectedAppointment.scheduled_date), 'EEEE, MMMM d, yyyy')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Time:</span>
                  <span className="text-sm font-medium text-[#1C294E]">
                    {formatTime(selectedAppointment.scheduled_time_start)} - {formatTime(selectedAppointment.scheduled_time_end)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge variant={getStatusColor(selectedAppointment.status)}>
                    {selectedAppointment.status.replace('_', ' ')}
                  </Badge>
                </div>
                {selectedAppointment.service_addresses && (
                  <div className="pt-2">
                    <span className="text-sm text-gray-600 block mb-1">Address:</span>
                    <span className="text-sm font-medium text-[#1C294E]">
                      {selectedAppointment.service_addresses.street_address}
                      {selectedAppointment.service_addresses.unit && `, ${selectedAppointment.service_addresses.unit}`}
                      <br />
                      {selectedAppointment.service_addresses.city}, {selectedAppointment.service_addresses.state} {selectedAppointment.service_addresses.zip_code}
                    </span>
                  </div>
                )}
                {selectedAppointment.special_instructions && (
                  <div className="pt-2">
                    <span className="text-sm text-gray-600 block mb-1">Special Instructions:</span>
                    <p className="text-sm font-medium text-[#1C294E] bg-gray-50 p-3 rounded-lg">
                      {selectedAppointment.special_instructions}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Team Assignment */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Team Assignment
              </h3>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Enter team member names (comma separated)"
                    value={teamInput}
                    onChange={(e) => setTeamInput(e.target.value)}
                    icon={<Users className="w-5 h-5" />}
                  />
                </div>
                <Button
                  variant="secondary"
                  onClick={handleUpdateTeam}
                  loading={processing}
                >
                  Update
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Example: Maria, John, Sarah
              </p>
            </div>

            {/* Reschedule */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Reschedule Appointment
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <Input
                  type="date"
                  label="New Date"
                  value={adminReschedule.date}
                  onChange={(e) =>
                    setAdminReschedule((prev) => ({ ...prev, date: e.target.value }))
                  }
                />
                <Input
                  type="time"
                  label="Start Time"
                  value={adminReschedule.timeStart}
                  onChange={(e) =>
                    setAdminReschedule((prev) => ({ ...prev, timeStart: e.target.value }))
                  }
                />
                <Input
                  type="time"
                  label="End Time"
                  value={adminReschedule.timeEnd}
                  onChange={(e) =>
                    setAdminReschedule((prev) => ({ ...prev, timeEnd: e.target.value }))
                  }
                />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="notifyCustomer"
                  checked={notifyCustomer}
                  onChange={(e) => setNotifyCustomer(e.target.checked)}
                  className="w-4 h-4 text-[#079447] rounded border-gray-300 focus:ring-[#079447]"
                />
                <label htmlFor="notifyCustomer" className="text-sm text-gray-600 flex items-center gap-1">
                  <Bell className="w-4 h-4" />
                  Notify customer via email
                </label>
              </div>
              <Button
                variant="secondary"
                fullWidth
                onClick={handleAdminReschedule}
                loading={processing}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Reschedule Appointment
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Link href={`/admin/invoices?customer=${selectedAppointment.customer_id}`}>
                  <Button variant="outline" fullWidth size="sm">
                    <Receipt className="w-4 h-4 mr-2" />
                    View Invoices
                  </Button>
                </Link>
                <Link href="/admin/invoices">
                  <Button variant="outline" fullWidth size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Invoice
                  </Button>
                </Link>
              </div>
            </div>

            {/* Status Actions */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700">
                Update Status
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {selectedAppointment.status === 'pending' && (
                  <Button
                    variant="success"
                    fullWidth
                    onClick={() => handleUpdateStatus('confirmed')}
                    loading={processing}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm
                  </Button>
                )}

                {selectedAppointment.status === 'confirmed' && (
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => handleUpdateStatus('en_route')}
                    loading={processing}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    En Route
                  </Button>
                )}

                {(selectedAppointment.status === 'confirmed' || selectedAppointment.status === 'en_route') && (
                  <Button
                    variant="success"
                    fullWidth
                    onClick={() => handleUpdateStatus('completed')}
                    loading={processing}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete
                  </Button>
                )}

                {(selectedAppointment.status === 'confirmed' || selectedAppointment.status === 'en_route') && (
                  <Button
                    variant="warning"
                    fullWidth
                    onClick={() => handleUpdateStatus('not_completed')}
                    loading={processing}
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Not Completed
                  </Button>
                )}
              </div>

              {selectedAppointment.status !== 'cancelled' && selectedAppointment.status !== 'completed' && (
                <Button
                  variant="danger"
                  fullWidth
                  onClick={() => handleUpdateStatus('cancelled')}
                  loading={processing}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Appointment
                </Button>
              )}

              <Button
                variant="outline"
                fullWidth
                onClick={handleDelete}
                loading={processing}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Permanently
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}