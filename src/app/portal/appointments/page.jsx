'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import { format, parseISO, isBefore, isToday, isTomorrow } from 'date-fns'
import { Calendar, Clock, MapPin, Package, XCircle, Edit2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('upcoming') // upcoming, past, cancelled, all
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchAppointments()

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
        },
        () => {
          fetchAppointments()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function fetchAppointments() {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          service_addresses (
            address,
            address_line2,
            city,
            state,
            zip_code
          )
        `)
        .eq('user_id', user.id)
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true })

      if (error) throw error

      setAppointments(data || [])
    } catch (error) {
      console.error('Error fetching appointments:', error)
      toast.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  async function handleCancelAppointment() {
    if (!selectedAppointment) return

    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', selectedAppointment.id)

      if (error) throw error

      toast.success('Appointment cancelled successfully')
      setShowCancelModal(false)
      setSelectedAppointment(null)
      fetchAppointments()
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      toast.error('Failed to cancel appointment')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleRescheduleAppointment() {
    if (!selectedAppointment || !rescheduleDate || !rescheduleTime) {
      toast.error('Please select both date and time')
      return
    }

    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          scheduled_date: rescheduleDate,
          scheduled_time: rescheduleTime,
          status: 'pending', // Reset to pending for admin approval
        })
        .eq('id', selectedAppointment.id)

      if (error) throw error

      toast.success('Reschedule request submitted! Waiting for confirmation.')
      setShowRescheduleModal(false)
      setSelectedAppointment(null)
      setRescheduleDate('')
      setRescheduleTime('')
      fetchAppointments()
    } catch (error) {
      console.error('Error rescheduling appointment:', error)
      toast.error('Failed to reschedule appointment')
    } finally {
      setActionLoading(false)
    }
  }

  const filteredAppointments = appointments.filter((apt) => {
    const aptDate = parseISO(apt.scheduled_date)
    const now = new Date()

    if (filter === 'upcoming') {
      return apt.status !== 'cancelled' && apt.status !== 'completed' && !isBefore(aptDate, now)
    }
    if (filter === 'past') {
      return apt.status === 'completed' || isBefore(aptDate, now)
    }
    if (filter === 'cancelled') {
      return apt.status === 'cancelled'
    }
    return true // 'all'
  })

  function getStatusColor(status) {
    const colors = {
      pending: 'yellow',
      confirmed: 'blue',
      in_progress: 'purple',
      completed: 'green',
      cancelled: 'gray',
    }
    return colors[status] || 'gray'
  }

  function getDateLabel(dateStr) {
    const date = parseISO(dateStr)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'EEEE, MMM d, yyyy')
  }

  function openDetailsModal(appointment) {
    setSelectedAppointment(appointment)
    setShowDetailsModal(true)
  }

  function openRescheduleModal(appointment) {
    setSelectedAppointment(appointment)
    setRescheduleDate(appointment.scheduled_date)
    setRescheduleTime(appointment.scheduled_time)
    setShowRescheduleModal(true)
  }

  function openCancelModal(appointment) {
    setSelectedAppointment(appointment)
    setShowCancelModal(true)
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1C294E] mb-2">My Appointments</h1>
        <p className="text-gray-600">View and manage your cleaning appointments</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <Button
          variant={filter === 'upcoming' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilter('upcoming')}
        >
          Upcoming ({appointments.filter(a => a.status !== 'cancelled' && a.status !== 'completed' && !isBefore(parseISO(a.scheduled_date), new Date())).length})
        </Button>
        <Button
          variant={filter === 'past' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilter('past')}
        >
          Past ({appointments.filter(a => a.status === 'completed' || isBefore(parseISO(a.scheduled_date), new Date())).length})
        </Button>
        <Button
          variant={filter === 'cancelled' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilter('cancelled')}
        >
          Cancelled ({appointments.filter(a => a.status === 'cancelled').length})
        </Button>
        <Button
          variant={filter === 'all' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({appointments.length})
        </Button>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <Card className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No appointments found</h3>
          <p className="text-gray-500 mb-6">
            {filter === 'upcoming' && "You don't have any upcoming appointments"}
            {filter === 'past' && "You don't have any past appointments"}
            {filter === 'cancelled' && "You don't have any cancelled appointments"}
            {filter === 'all' && "You haven't scheduled any appointments yet"}
          </p>
          <Button onClick={() => window.location.href = '/portal/request-service'}>
            Request a Service
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Left: Appointment Info */}
                <div className="flex-1 space-y-3">
                  {/* Service Type & Status */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <Package className="w-5 h-5 text-[#079447]" />
                    <span className="font-semibold text-lg text-[#1C294E] capitalize">
                      {appointment.service_type.replace('_', ' ')}
                    </span>
                    <Badge variant={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{getDateLabel(appointment.scheduled_date)}</span>
                    <span className="text-gray-400">•</span>
                    <Clock className="w-4 h-4" />
                    <span>{format(parseISO(`2000-01-01T${appointment.scheduled_time}`), 'h:mm a')}</span>
                  </div>

                  {/* Address */}
                  {appointment.service_addresses && (
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                      <span className="text-sm">
                        {appointment.service_addresses.address}, {appointment.service_addresses.city}, {appointment.service_addresses.state}
                      </span>
                    </div>
                  )}

                  {/* Special Instructions */}
                  {appointment.special_instructions && (
                    <p className="text-sm text-gray-600 italic pl-6">
                      "{appointment.special_instructions}"
                    </p>
                  )}
                </div>

                {/* Right: Action Buttons */}
                <div className="flex md:flex-col gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openDetailsModal(appointment)}
                    className="flex-1 md:flex-none"
                  >
                    View Details
                  </Button>

                  {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openRescheduleModal(appointment)}
                        className="flex-1 md:flex-none"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Reschedule
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => openCancelModal(appointment)}
                        className="flex-1 md:flex-none"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <Modal onClose={() => setShowDetailsModal(false)} title="Appointment Details">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Service Type</label>
              <p className="text-lg font-semibold text-[#1C294E] capitalize">
                {selectedAppointment.service_type.replace('_', ' ')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
              <Badge variant={getStatusColor(selectedAppointment.status)}>
                {selectedAppointment.status}
              </Badge>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Date & Time</label>
              <p className="text-gray-900">
                {getDateLabel(selectedAppointment.scheduled_date)} at{' '}
                {format(parseISO(`2000-01-01T${selectedAppointment.scheduled_time}`), 'h:mm a')}
              </p>
            </div>

            {selectedAppointment.service_addresses && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Service Address</label>
                <p className="text-gray-900">
                  {selectedAppointment.service_addresses.address}
                  {selectedAppointment.service_addresses.address_line2 && (
                    <>, {selectedAppointment.service_addresses.address_line2}</>
                  )}
                  <br />
                  {selectedAppointment.service_addresses.city}, {selectedAppointment.service_addresses.state}{' '}
                  {selectedAppointment.service_addresses.zip_code}
                </p>
              </div>
            )}

            {selectedAppointment.special_instructions && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Special Instructions</label>
                <p className="text-gray-900 italic">"{selectedAppointment.special_instructions}"</p>
              </div>
            )}

            {selectedAppointment.estimated_duration && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Estimated Duration</label>
                <p className="text-gray-900">{selectedAppointment.estimated_duration} minutes</p>
              </div>
            )}

            {selectedAppointment.is_recurring && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Recurring</label>
                <p className="text-gray-900 capitalize">
                  Yes - {selectedAppointment.recurring_frequency?.replace('_', ' ')}
                </p>
              </div>
            )}

            <div className="pt-4">
              <Button onClick={() => setShowDetailsModal(false)} fullWidth>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedAppointment && (
        <Modal onClose={() => setShowRescheduleModal(false)} title="Reschedule Appointment">
          <div className="space-y-4">
            <p className="text-gray-600">
              Request a new date and time for your appointment. Your request will be reviewed and confirmed by our team.
            </p>

            <Input
              label="New Date"
              type="date"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />

            <Input
              label="New Time"
              type="time"
              value={rescheduleTime}
              onChange={(e) => setRescheduleTime(e.target.value)}
              required
            />

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Your reschedule request will be sent to our team for approval.
                You'll be notified once it's confirmed.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => setShowRescheduleModal(false)}
                fullWidth
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRescheduleAppointment}
                fullWidth
                loading={actionLoading}
              >
                Submit Request
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Modal */}
      {showCancelModal && selectedAppointment && (
        <Modal onClose={() => setShowCancelModal(false)} title="Cancel Appointment">
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">
                <strong>Are you sure you want to cancel this appointment?</strong>
              </p>
              <p className="text-sm text-red-700 mt-2">
                This action cannot be undone. You'll need to request a new service if you change your mind.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Appointment Details:</p>
              <p className="font-semibold text-[#1C294E] capitalize">
                {selectedAppointment.service_type.replace('_', ' ')}
              </p>
              <p className="text-gray-700">
                {getDateLabel(selectedAppointment.scheduled_date)} at{' '}
                {format(parseISO(`2000-01-01T${selectedAppointment.scheduled_time}`), 'h:mm a')}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => setShowCancelModal(false)}
                fullWidth
                disabled={actionLoading}
              >
                Keep Appointment
              </Button>
              <Button
                variant="danger"
                onClick={handleCancelAppointment}
                fullWidth
                loading={actionLoading}
              >
                Yes, Cancel It
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
