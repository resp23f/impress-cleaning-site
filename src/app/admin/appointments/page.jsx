'use client'

import { useState, useEffect } from 'react'
import { format, parseISO, startOfDay, endOfDay } from 'date-fns'
import {
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Filter
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

export default function AppointmentsPage() {
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [processing, setProcessing] = useState(false)
  
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
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          profiles!customer_id(full_name, email, phone),
          service_addresses!address_id(street_address, unit, city, state, zip_code)
        `)
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time_start', { ascending: true })

      if (error) throw error

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

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(apt =>
        apt.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter)
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(apt => apt.scheduled_date === dateFilter)
    }

    setFilteredAppointments(filtered)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success'
      case 'pending':
        return 'warning'
      case 'completed':
        return 'primary'
      case 'cancelled':
        return 'danger'
      default:
        return 'default'
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

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment)
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

      toast.success(`Appointment ${status}!`)
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

  // Calculate stats
  const stats = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    pending: appointments.filter(a => a.status === 'pending').length,
    today: appointments.filter(a => a.scheduled_date === format(new Date(), 'yyyy-MM-dd')).length,
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total</p>
                  <p className="text-3xl font-bold text-[#1C294E]">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Confirmed</p>
                  <p className="text-3xl font-bold text-green-600">{stats.confirmed}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Today</p>
                  <p className="text-3xl font-bold text-[#079447]">{stats.today}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-[#079447]" />
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Search by customer name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<User className="w-5 h-5" />}
              />

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C294E] focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <Input
                type="date"
                placeholder="Filter by date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                icon={<Filter className="w-5 h-5" />}
              />
            </div>
          </Card>

          {/* Appointments List */}
          {filteredAppointments.length > 0 ? (
            <div className="space-y-4">
              {filteredAppointments.map((apt) => (
                <Card key={apt.id} hover>
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-[#1C294E]">
                              {apt.profiles?.full_name || 'Unknown Customer'}
                            </h3>
                            <Badge variant={getStatusColor(apt.status)}>
                              {apt.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {formatServiceType(apt.service_type)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {format(parseISO(apt.scheduled_date), 'EEEE, MMMM d, yyyy')}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          {apt.scheduled_time_start} - {apt.scheduled_time_end}
                        </div>

                        {apt.service_addresses && (
                          <div className="flex items-start gap-2 text-sm text-gray-600 md:col-span-2">
                            <MapPin className="w-4 h-4 mt-0.5" />
                            <span>
                              {apt.service_addresses.street_address}
                              {apt.service_addresses.unit && `, ${apt.service_addresses.unit}`}
                              {', '}
                              {apt.service_addresses.city}, {apt.service_addresses.state}
                            </span>
                          </div>
                        )}

                        {apt.team_members && apt.team_members.length > 0 && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 md:col-span-2">
                            <User className="w-4 h-4" />
                            Team: {apt.team_members.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 lg:min-w-[200px]">
                      <Button
                        variant="primary"
                        onClick={() => handleViewDetails(apt)}
                        fullWidth
                      >
                        <Edit className="w-4 h-4" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
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
        title="Appointment Details"
        maxWidth="lg"
      >
        {selectedAppointment && (
          <div className="space-y-6">
            {/* Customer Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Customer Information
              </h3>
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
                    {format(parseISO(selectedAppointment.scheduled_date), 'MMMM d, yyyy')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Time:</span>
                  <span className="text-sm font-medium text-[#1C294E]">
                    {selectedAppointment.scheduled_time_start} - {selectedAppointment.scheduled_time_end}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge variant={getStatusColor(selectedAppointment.status)}>
                    {selectedAppointment.status}
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
                {selectedAppointment.team_members && selectedAppointment.team_members.length > 0 && (
                  <div className="pt-2">
                    <span className="text-sm text-gray-600 block mb-1">Team Members:</span>
                    <span className="text-sm font-medium text-[#1C294E]">
                      {selectedAppointment.team_members.join(', ')}
                    </span>
                  </div>
                )}
                {selectedAppointment.special_instructions && (
                  <div className="pt-2">
                    <span className="text-sm text-gray-600 block mb-1">Special Instructions:</span>
                    <p className="text-sm font-medium text-[#1C294E] italic">
                      "{selectedAppointment.special_instructions}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              {selectedAppointment.status === 'pending' && (
                <Button
                  variant="success"
                  fullWidth
                  onClick={() => handleUpdateStatus('confirmed')}
                  loading={processing}
                >
                  <CheckCircle className="w-5 h-5" />
                  Confirm Appointment
                </Button>
              )}

              {(selectedAppointment.status === 'confirmed' || selectedAppointment.status === 'pending') && (
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => handleUpdateStatus('completed')}
                  loading={processing}
                >
                  <CheckCircle className="w-5 h-5" />
                  Mark as Completed
                </Button>
              )}

              {selectedAppointment.status !== 'cancelled' && (
                <Button
                  variant="danger"
                  fullWidth
                  onClick={() => handleUpdateStatus('cancelled')}
                  loading={processing}
                >
                  <XCircle className="w-5 h-5" />
                  Cancel Appointment
                </Button>
              )}

              <Button
                variant="danger"
                fullWidth
                onClick={handleDelete}
                loading={processing}
              >
                <Trash2 className="w-5 h-5" />
                Delete Appointment
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}