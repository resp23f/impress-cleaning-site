'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  RefreshCw,
  XCircle,
  CheckCircle,
  AlertCircle,
  ShieldCheck
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const statusBadges = {
  pending: 'warning',
  confirmed: 'info',
  en_route: 'info',
  completed: 'success',
  cancelled: 'danger',
}

const statusLabels = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  en_route: 'En Route',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const serviceTypeLabel = (type) => {
  const labels = {
    standard: 'Standard Cleaning',
    deep: 'Deep Cleaning',
    move_in_out: 'Move In/Out',
    post_construction: 'Post-Construction',
    office: 'Office Cleaning',
  }
  return labels[type] || type
}

export default function AppointmentsPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState([])
  const [userId, setUserId] = useState(null)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [modalMode, setModalMode] = useState(null) // 'reschedule' | 'cancel'
  const [processing, setProcessing] = useState(false)
  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    timeStart: '',
    timeEnd: '',
  })
  const [cancelReason, setCancelReason] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }
        setUserId(user.id)

        const { data, error } = await supabase
          .from('appointments')
          .select(`
            *,
            service_addresses:address_id (
              street_address,
              unit,
              city,
              state,
              zip_code
            )
          `)
          .eq('customer_id', user.id)
          .order('scheduled_date', { ascending: true })
          .order('scheduled_time_start', { ascending: true })

        if (error) throw error

        setAppointments(data || [])
      } catch (err) {
        console.error('Error loading appointments', err)
        toast.error('Could not load appointments')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [router, supabase])

  const upcoming = appointments.filter(
    (apt) => new Date(apt.scheduled_date) >= new Date() && apt.status !== 'cancelled'
  )
  const past = appointments.filter(
    (apt) => new Date(apt.scheduled_date) < new Date() || apt.status === 'cancelled'
  )

  const openReschedule = (apt) => {
    setSelectedAppointment(apt)
    setRescheduleData({
      date: apt.scheduled_date || '',
      timeStart: apt.scheduled_time_start || '',
      timeEnd: apt.scheduled_time_end || '',
    })
    setModalMode('reschedule')
  }

  const openCancel = (apt) => {
    setSelectedAppointment(apt)
    setCancelReason('')
    setModalMode('cancel')
  }

  const closeModal = () => {
    setSelectedAppointment(null)
    setModalMode(null)
  }

  const handleReschedule = async () => {
    if (!selectedAppointment) return
    setProcessing(true)
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          scheduled_date: rescheduleData.date,
          scheduled_time_start: rescheduleData.timeStart,
          scheduled_time_end: rescheduleData.timeEnd,
          status: 'confirmed',
        })
        .eq('id', selectedAppointment.id)
        .eq('customer_id', userId)

      if (error) throw error

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === selectedAppointment.id
            ? {
                ...apt,
                scheduled_date: rescheduleData.date,
                scheduled_time_start: rescheduleData.timeStart,
                scheduled_time_end: rescheduleData.timeEnd,
                status: 'confirmed',
              }
            : apt
        )
      )

      toast.success('Appointment rescheduled')
      closeModal()
    } catch (err) {
      console.error('Reschedule error', err)
      toast.error(err.message || 'Could not reschedule')
    } finally {
      setProcessing(false)
    }
  }

  const handleCancel = async () => {
    if (!selectedAppointment) return
    setProcessing(true)
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status: 'cancelled',
          cancellation_reason: cancelReason || null,
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', selectedAppointment.id)
        .eq('customer_id', userId)

      if (error) throw error

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === selectedAppointment.id
            ? { ...apt, status: 'cancelled', cancellation_reason: cancelReason || null }
            : apt
        )
      )

      toast.success('Appointment cancelled')
      closeModal()
    } catch (err) {
      console.error('Cancel error', err)
      toast.error(err.message || 'Could not cancel appointment')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-[#1C294E]">Appointments</h1>
          <p className="text-gray-600">Manage your upcoming cleanings</p>
        </div>
        <Link href="/portal/request-service">
          <Button variant="primary">Book another cleaning</Button>
        </Link>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-[#079447]" />
          <h2 className="text-xl font-semibold text-[#1C294E]">Upcoming</h2>
        </div>
        {upcoming.length === 0 ? (
          <Card className="text-center py-8">
            <div className="flex flex-col items-center gap-2">
              <ShieldCheck className="w-10 h-10 text-gray-300" />
              <p className="text-gray-600">No upcoming appointments</p>
              <Link href="/portal/request-service">
                <Button variant="primary">Schedule a cleaning</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcoming.map((apt) => (
              <Card key={apt.id} padding="lg" className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-[#1C294E]">
                      {format(parseISO(apt.scheduled_date), 'EEEE, MMM d')}
                    </p>
                    <p className="text-gray-600">
                      {apt.scheduled_time_start} - {apt.scheduled_time_end}
                    </p>
                  </div>
                  <Badge variant={statusBadges[apt.status] || 'default'}>
                    {statusLabels[apt.status] || apt.status}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{serviceTypeLabel(apt.service_type)}</span>
                  </div>
                  {apt.service_addresses && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>
                        {apt.service_addresses.street_address}
                        {apt.service_addresses.unit && `, ${apt.service_addresses.unit}`}, {' '}
                        {apt.service_addresses.city}, {apt.service_addresses.state}{' '}
                        {apt.service_addresses.zip_code}
                      </span>
                    </div>
                  )}
                  {apt.team_members && apt.team_members.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>Team: {apt.team_members.join(', ')}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openReschedule(apt)}
                    disabled={apt.status === 'cancelled'}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reschedule
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openCancel(apt)}
                    disabled={apt.status === 'cancelled'}
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel
                  </Button>
                  <Link href={`/portal/appointments/${apt.id}`}>
                    <Button variant="outline" size="sm">
                      View details
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-gray-500" />
          <h2 className="text-xl font-semibold text-[#1C294E]">Past & Cancelled</h2>
        </div>
        {past.length === 0 ? (
          <Card className="text-center py-6 text-gray-600">Nothing here yet.</Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {past.map((apt) => (
              <Card key={apt.id} padding="lg" className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#1C294E]">
                      {format(parseISO(apt.scheduled_date), 'MMM d, yyyy')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {apt.scheduled_time_start} - {apt.scheduled_time_end}
                    </p>
                  </div>
                  <Badge variant={statusBadges[apt.status] || 'default'}>
                    {statusLabels[apt.status] || apt.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-700">{serviceTypeLabel(apt.service_type)}</p>
                {apt.cancellation_reason && (
                  <p className="text-xs text-gray-500">
                    Cancel reason: {apt.cancellation_reason}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      <Modal open={!!modalMode} onClose={closeModal} title={modalMode === 'reschedule' ? 'Reschedule appointment' : 'Cancel appointment'}>
        {modalMode === 'reschedule' ? (
          <div className="space-y-4">
            <Input
              type="date"
              label="New date"
              value={rescheduleData.date}
              onChange={(e) => setRescheduleData((prev) => ({ ...prev, date: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="time"
                label="Start time"
                value={rescheduleData.timeStart}
                onChange={(e) => setRescheduleData((prev) => ({ ...prev, timeStart: e.target.value }))}
              />
              <Input
                type="time"
                label="End time"
                value={rescheduleData.timeEnd}
                onChange={(e) => setRescheduleData((prev) => ({ ...prev, timeEnd: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={closeModal}>Close</Button>
              <Button variant="primary" loading={processing} onClick={handleReschedule}>
                <RefreshCw className="w-4 h-4" />
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Are you sure you want to cancel this appointment?
            </p>
            <Input
              label="Reason (optional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Schedule conflict, not needed, etc."
            />
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={closeModal}>Keep appointment</Button>
              <Button variant="danger" loading={processing} onClick={handleCancel}>
                <XCircle className="w-4 h-4" />
                Cancel appointment
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
