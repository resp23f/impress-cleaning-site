'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import styles from '../shared-animations.module.css'
import { sanitizeText } from '@/lib/sanitize'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  RefreshCw,
  XCircle,
  CheckCircle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sun,
  CloudSun,
  Sunset,
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import { AppointmentsSkeleton } from '@/components/ui/SkeletonLoader'
import toast from 'react-hot-toast'

const statusBadges = {
  pending: 'warning',
  confirmed: 'info',
  en_route: 'info',
  completed: 'success',
  cancelled: 'danger',
  not_completed: 'warning',
}

const statusLabels = {
  pending: 'Pending Approval',
  confirmed: 'Confirmed',
  en_route: 'En Route',
  completed: 'Completed',
  cancelled: 'Cancelled',
  not_completed: 'Incomplete',
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

const isWithin48Hours = (apt) => {
  if (!apt?.scheduled_date) return false

  const raw = apt.scheduled_time_start || '00:00'
  const [h, m] = raw.split(':') // "08:00:00" or "08:00"

  const hh = (h || '00').padStart(2, '0')
  const mm = (m || '00').padStart(2, '0')

  const appointmentDateTime = new Date(`${apt.scheduled_date}T${hh}:${mm}:00`)
  const now = new Date()
  const diffMs = appointmentDateTime.getTime() - now.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)

  return diffHours > 0 && diffHours < 48
}
const getAppointmentDateTime = (apt) => {
  if (!apt?.scheduled_date) return null

  const raw = apt.scheduled_time_start || '00:00'
  // handle both "08:00:00" and "08:00"
  const [h, m] = raw.split(':')

  const hh = (h || '00').padStart(2, '0')
  const mm = (m || '00').padStart(2, '0')

  return new Date(`${apt.scheduled_date}T${hh}:${mm}:00`)
}

const TIME_RANGES = [
  {
    value: 'morning',
    title: 'Morning',
    description: '8:00 AM - 12:00 PM',
    start: '08:00',
    end: '12:00',
    icon: Sun,
  },
  {
    value: 'afternoon',
    title: 'Afternoon',
    description: '12:00 PM - 3:00 PM',
    start: '12:00',
    end: '15:00',
    icon: CloudSun,
  },
  {
    value: 'evening',
    title: 'Evening',
    description: '3:00 PM - 5:45 PM',
    start: '15:00',
    end: '17:45',
    icon: Sunset,
  },
]

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

const getMinDate = () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

const getMaxDate = () => {
  const maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() + 3)
  return maxDate.toISOString().split('T')[0]
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
  const [rescheduleTimeRange, setRescheduleTimeRange] = useState('') // morning | afternoon | evening
  const [cancelReason, setCancelReason] = useState('')
  const [cancelReasonOther, setCancelReasonOther] = useState('')

  // Calendar state for rescheduling
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const base = rescheduleData.date
      ? new Date(rescheduleData.date + 'T00:00:00')
      : new Date()
    base.setDate(1)
    return base
  })

  // Keep calendar in sync if date changes
  useEffect(() => {
    if (rescheduleData.date) {
      const base = new Date(rescheduleData.date + 'T00:00:00')
      base.setDate(1)
      setCalendarMonth(base)
    }
  }, [rescheduleData.date])

  // Calendar helpers (computed per render)
  const minDateObj = new Date(getMinDate() + 'T00:00:00')
  const maxDateObj = new Date(getMaxDate() + 'T00:00:00')

  const startOfMonth = new Date(calendarMonth)
  startOfMonth.setDate(1)
  const monthStartDay = startOfMonth.getDay() // 0 = Sun
  const gridStart = new Date(startOfMonth)
  gridStart.setDate(gridStart.getDate() - monthStartDay)

  const calendarDays = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart)
    gridStart.setDate(gridStart.getDate() + 1)
    calendarDays.push(d)
  }

  const monthLabel = calendarMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const weekdayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        setUserId(user.id)

        const { data, error } = await supabase
          .from('appointments')
          .select(
            `
            *,
            service_addresses:address_id (
              street_address,
              unit,
              city,
              state,
              zip_code
            )
          `
          )
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

  const UPCOMING_STATUSES = ['pending', 'confirmed', 'en_route']
  const PAST_STATUSES = ['cancelled', 'not_completed'] // completed goes to Service History, not here
  const now = new Date()

  const upcoming = appointments.filter((apt) => {
    const dt = getAppointmentDateTime(apt)
    if (!dt) return false
    return dt >= now && UPCOMING_STATUSES.includes(apt.status)
  })

  const past = appointments.filter((apt) => {
    const dt = getAppointmentDateTime(apt)
    if (!dt) return false
    return dt < now || PAST_STATUSES.includes(apt.status)
  })
  const formatTime = (timeStr) => {
    if (!timeStr) return ''
    // handle "08:00:00" or "08:00"
    const [h, m] = timeStr.split(':')
    const d = new Date()
    d.setHours(Number(h || 0), Number(m || 0), 0, 0)
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }) // e.g. "8:00 AM"
  }


  const openReschedule = (apt) => {
    setSelectedAppointment(apt)

    const date = apt.scheduled_date || ''
    const timeStart = apt.scheduled_time_start || ''
    const timeEnd = apt.scheduled_time_end || ''

    setRescheduleData({
      date,
      timeStart,
      timeEnd,
    })

    // Try to infer which time range this appointment is in
    const matchingRange =
      TIME_RANGES.find(
        (range) => range.start === timeStart && range.end === timeEnd
      )?.value || ''

    setRescheduleTimeRange(matchingRange)
    setIsCalendarOpen(false)
    setModalMode('reschedule')
  }

  const openCancel = (apt) => {
    setSelectedAppointment(apt)
    setCancelReason('')
    setCancelReasonOther('')
    setModalMode('cancel')
  }
  const closeModal = () => {
    setSelectedAppointment(null)
    setModalMode(null)
    setIsCalendarOpen(false)
  }

  const handleReschedule = async () => {
    if (!selectedAppointment) return

    // 48-hour protection - same as cancel
    if (isWithin48Hours(selectedAppointment)) {
      toast.error(
        'Appointments within 48 hours cannot be rescheduled online. Please contact our office.'
      )
      return
    }

    // Protect against missing inputs
    if (!rescheduleData.date || !rescheduleData.timeStart || !rescheduleData.timeEnd) {
      toast.error('Please select a date and time window')
      return
    }

    setProcessing(true)
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          scheduled_date: rescheduleData.date,
          scheduled_time_start: rescheduleData.timeStart,
          scheduled_time_end: rescheduleData.timeEnd,
          status: 'pending',
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
              status: 'pending',
            }
            : apt
        )
      )

      // Notify admin by email
      try {
        await fetch('/api/email/notify-appointment-change', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'reschedule',
            appointment: selectedAppointment,
            rescheduleData,
          }),
        })
      } catch (e) {
        console.error('Failed to send reschedule notification email', e)
      }

      toast.success('Reschedule request submitted - pending admin approval')
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

    // Guard: prevent cancel within 48 hours
    if (isWithin48Hours(selectedAppointment)) {
      toast.error(
        'Appointments within 48 hours cannot be cancelled online. Please contact our office.'
      )
      return
    }
    // Require a reason
    if (!cancelReason) {
      toast.error('Please select a cancellation reason')
      return
    }

    // Require text if "Other" is selected
    if (cancelReason === 'Other' && !cancelReasonOther?.trim()) {
      toast.error('Please specify your cancellation reason')
      return
    }
    setProcessing(true)
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status: 'cancelled',
          cancellation_reason: cancelReason === 'Other'
            ? sanitizeText(cancelReasonOther)?.slice(0, 500)
            : cancelReason, cancelled_at: new Date().toISOString(),
        }).eq('id', selectedAppointment.id)
        .eq('customer_id', userId)

      if (error) throw error

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === selectedAppointment.id
            ? {
              ...apt,
              status: 'cancelled',
              cancellation_reason: cancelReason || null,
            }
            : apt
        )
      )

      // Notify admin by email
      try {
        await fetch('/api/email/notify-appointment-change', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'cancel',
            appointment: selectedAppointment,
            cancelReason,
          }),
        })
      } catch (e) {
        console.error('Failed to send cancellation notification email', e)
      }

      toast.success('Appointment cancelled')
      closeModal()
    } catch (err) {
      console.error('Cancel error', err)
      toast.error(err.message || 'Could not cancel appointment')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
        {loading ? (
          <AppointmentsSkeleton />
        ) : (
          <div className={styles.contentFadeIn}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-1 w-12 bg-gradient-to-r from-[#079447] to-emerald-400 rounded-full" />
                  <span className="text-sm font-medium text-[#079447] uppercase tracking-wider">Appointments</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-[#1C294E] tracking-tight">Manage Your Cleanings</h1>
              </div>
              <Link href="/portal/request-service" className="w-full sm:w-auto">
                <Button variant="primary" className={`w-full sm:w-auto whitespace-nowrap ${styles.smoothTransition}`}>Book another cleaning</Button>
              </Link>
            </div>

            {/* Upcoming */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#079447]" />
                </div>
                <h2 className="text-xl font-bold text-[#1C294E]">Upcoming</h2>
              </div>
              {upcoming.length === 0 ? (
                <Card className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <ShieldCheck className="w-10 h-10 text-gray-300" />
                    <p className="text-gray-600">No upcoming appointments</p>
                    <Link href="/portal/request-service">
                      <Button variant="primary" className={styles.smoothTransition}>Schedule a cleaning</Button>
                    </Link>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcoming.map((apt, index) => (
                    <Card key={apt.id} padding="lg" className="space-y-4 border-l-4 border-emerald-400 !rounded-2xl !shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] hover:!shadow-[0_1px_3px_rgba(0,0,0,0.08),0_15px_40px_-10px_rgba(0,0,0,0.12)] transition-shadow duration-200">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold text-[#1C294E]">
                            {format(parseISO(apt.scheduled_date), 'EEEE, MMM d')}
                          </p>
                          <p className="text-gray-600">
                            {formatTime(apt.scheduled_time_start)} - {formatTime(apt.scheduled_time_end)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {apt.is_recurring && (
                            <Badge variant="info" className="flex items-center gap-1">
                              <RefreshCw className="w-3 h-3" />
                              Recurring
                            </Badge>
                          )}
                          <Badge variant={statusBadges[apt.status] || 'default'}>
                            {statusLabels[apt.status] || apt.status}
                          </Badge>
                        </div>
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
                              {apt.service_addresses.unit &&
                                `, ${apt.service_addresses.unit}`}
                              , {apt.service_addresses.city},{' '}
                              {apt.service_addresses.state}{' '}
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
                          disabled={apt.status === 'cancelled' || isWithin48Hours(apt)}
                          className={styles.smoothTransition}
                        >
                          <RefreshCw className="w-4 h-4" />
                          Reschedule
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openCancel(apt)}
                          disabled={apt.status === 'cancelled' || isWithin48Hours(apt)}
                          className={styles.smoothTransition}
                        >
                          <XCircle className="w-4 h-4" />
                          Cancel
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Past Appointments */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-slate-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-gray-500" />
                </div>
                <h2 className="text-xl font-bold text-[#1C294E]">Cancelled</h2>
              </div>
              {past.length === 0 ? (
                <Card className="text-center py-8 !rounded-2xl !shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] text-gray-500">
                  Nothing here yet
                </Card>) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {past.map((apt, index) => (
                    <Card key={apt.id} padding="lg" className="space-y-3 !rounded-2xl !shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-[#1C294E]">
                            {format(parseISO(apt.scheduled_date), 'MMM d, yyyy')}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatTime(apt.scheduled_time_start)} - {formatTime(apt.scheduled_time_end)}
                          </p>
                        </div>
                        <Badge variant={statusBadges[apt.status] || 'default'}>
                          {statusLabels[apt.status] || apt.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700">
                        {serviceTypeLabel(apt.service_type)}
                      </p>
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
          </div>
        )}

        {/* Modal */}
        <Modal
          isOpen={!!modalMode}
          onClose={closeModal}
          title={
            modalMode === 'reschedule'
              ? 'Reschedule appointment'
              : 'Cancel appointment'
          }
        >
          {modalMode === 'reschedule' ? (
            // Reschedule content with calendar + time cards
            <div className="space-y-6">
              {/* Date picker */}
              <div>
                <label className="block text-sm font-medium text-[#1C294E] mb-2">
                  New date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar className="w-5 h-5 text-[#079447]" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCalendarOpen((prev) => !prev)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#079447] focus:outline-none focus:ring-2 focus:ring-[#079447]/20 transition-all duration-200 text-left bg-white"
                  >
                    <span
                      className={
                        rescheduleData.date
                          ? 'text-[#1C294E] font-medium'
                          : 'text-gray-400'
                      }
                    >
                      {rescheduleData.date
                        ? formatDisplayDate(rescheduleData.date)
                        : 'Select a new date'}
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
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <span className="font-semibold text-[#1C294E]">
                          {monthLabel}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const next = new Date(calendarMonth)
                            next.setMonth(next.getMonth() + 1)
                            setCalendarMonth(next)
                          }}
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>

                      {/* Weekday labels */}
                      <div className="grid grid-cols-7 text-xs font-semibold text-gray-500 mb-2">
                        {weekdayLabels.map((day) => (
                          <div key={day} className="text-center">
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Days grid */}
                      <div className="grid grid-cols-7 gap-1 text-sm">
                        {calendarDays.map((dateObj) => {
                          const iso = dateObj.toISOString().split('T')[0]
                          const isDisabled =
                            dateObj < minDateObj || dateObj > maxDateObj
                          const isCurrentMonth =
                            dateObj.getMonth() === calendarMonth.getMonth()
                          const isSelected = rescheduleData.date === iso

                          return (
                            <button
                              key={iso}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => {
                                if (isDisabled) return
                                setRescheduleData((prev) => ({
                                  ...prev,
                                  date: iso,
                                }))
                                setIsCalendarOpen(false)
                              }}
                              className={[
                                'w-9 h-9 flex items-center justify-center rounded-full text-xs',
                                !isCurrentMonth
                                  ? 'text-gray-300'
                                  : 'text-gray-700',
                                isSelected
                                  ? 'bg-[#079447] text-white font-semibold'
                                  : !isDisabled
                                    ? 'hover:bg-gray-100'
                                    : '',
                                isDisabled
                                  ? 'opacity-40 cursor-not-allowed'
                                  : 'cursor-pointer',
                              ].join(' ')}
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

              {/* Time window selector */}
              <div>
                <label className="block text-sm font-medium text-[#1C294E] mb-3">
                  Time window <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {TIME_RANGES.map((time) => {
                    const IconComponent = time.icon
                    const isSelected = rescheduleTimeRange === time.value
                    return (
                      <button
                        key={time.value}
                        type="button"
                        onClick={() => {
                          setRescheduleTimeRange(time.value)
                          setRescheduleData((prev) => ({
                            ...prev,
                            timeStart: time.start,
                            timeEnd: time.end,
                          }))
                        }}
                        className={`relative p-3 rounded-xl border-2 transition-all duration-200 text-left ${isSelected
                          ? 'border-[#079447] bg-[#079447]/5 ring-2 ring-[#079447]/20'
                          : 'border-gray-200 hover:border-[#079447]/50 hover:bg-gray-50'
                          }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <div className="w-5 h-5 bg-[#079447] rounded-full flex items-center justify-center">
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                          </div>
                        )}
                        <div className="flex flex-col items-center sm:items-start">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${isSelected ? 'bg-[#079447]' : 'bg-gray-100'
                              }`}
                          >
                            <IconComponent
                              className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[#079447]'
                                }`}
                            />
                          </div>
                          <div className="text-center sm:text-left">
                            <p
                              className={`font-semibold ${isSelected
                                ? 'text-[#079447]'
                                : 'text-[#1C294E]'
                                }`}
                            >
                              {time.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {time.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={closeModal}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  loading={processing}
                  onClick={handleReschedule}
                  disabled={
                    !rescheduleData.date ||
                    !rescheduleData.timeStart ||
                    !rescheduleData.timeEnd
                  }
                >
                  <RefreshCw className="w-4 h-4" />
                  Save
                </Button>
              </div>
            </div>
          ) : (
            // Cancel content
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                Are you sure you want to cancel this appointment?
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1C294E] mb-3">
                    Cancellation reason <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'Schedule conflict', label: 'Schedule conflict' },
                      { value: 'Plans changed', label: 'Plans changed' },
                      { value: 'Budget concerns', label: 'Budget concerns' },
                      { value: 'Moving or out of town', label: 'Moving or out of town' },
                      { value: 'Going with another provider', label: 'Going with another provider' },
                      { value: 'Other', label: 'Other (please specify)' },
                    ].map((reason) => {
                      const isSelected = cancelReason === reason.value
                      return (
                        <button
                          key={reason.value}
                          type="button"
                          onClick={() => setCancelReason(reason.value)}
                          className={`w-full p-3 rounded-xl border-2 transition-all duration-200 text-left ${isSelected
                            ? 'border-red-400 bg-red-50 ring-2 ring-red-100'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                                ? 'border-red-500 bg-red-500'
                                : 'border-gray-300'
                                }`}
                            >
                              {isSelected && (
                                <div className="w-2 h-2 bg-white rounded-full" />
                              )}
                            </div>
                            <span className={`text-sm font-medium ${isSelected ? 'text-red-700' : 'text-gray-700'
                              }`}>
                              {reason.label}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {cancelReason === 'Other' && (
                  <div className="animate-fadeIn">
                    <label className="block text-sm font-medium text-[#1C294E] mb-2">
                      Please specify your reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 transition-all duration-200 text-sm resize-none"
                      rows="3"
                      placeholder="Tell us why you're cancelling..."
                      value={cancelReason === 'Other' ? (cancelReasonOther || '') : ''}
                      onChange={(e) => setCancelReasonOther(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={closeModal}>
                  Keep appointment
                </Button>
                <Button
                  variant="danger"
                  loading={processing}
                  onClick={handleCancel}
                  disabled={!cancelReason} // disables if empty
                >
                  <XCircle className="w-4 h-4" />
                  Cancel appointment
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  )
}
