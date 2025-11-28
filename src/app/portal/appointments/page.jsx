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

const isWithin48Hours = (apt) => {
 if (!apt?.scheduled_date) return false
 
 const datePart = apt.scheduled_date
 const timePart = apt.scheduled_time_start || '00:00'
 
 const appointmentDateTime = new Date(`${datePart}T${timePart}:00`)
 const now = new Date()
 const diffMs = appointmentDateTime.getTime() - now.getTime()
 const diffHours = diffMs / (1000 * 60 * 60)
 
 return diffHours > 0 && diffHours < 48
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
 
 const upcoming = appointments.filter(
  (apt) =>
   new Date(apt.scheduled_date) >= new Date() &&
  apt.status !== 'cancelled'
 )
 
 const past = appointments.filter(
  (apt) =>
   new Date(apt.scheduled_date) < new Date() ||
  apt.status === 'cancelled'
 )
 
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
  setModalMode('cancel')
 }
 
 const closeModal = () => {
  setSelectedAppointment(null)
  setModalMode(null)
  setIsCalendarOpen(false)
 }
 
 const handleReschedule = async () => {
  if (!selectedAppointment) return
  
  // Optional: protect against missing inputs
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
 
 {/* Upcoming */}
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
    disabled={apt.status === 'cancelled'}
    >
    <RefreshCw className="w-4 h-4" />
    Reschedule
    </Button>
    <Button
    variant="ghost"
    size="sm"
    onClick={() => openCancel(apt)}
    disabled={
     apt.status === 'cancelled' || isWithin48Hours(apt)
    }
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
  
  {/* Past & Cancelled */}
  <section>
  <div className="flex items-center gap-2 mb-4">
  <Clock className="w-5 h-5 text-gray-500" />
  <h2 className="text-xl font-semibold text-[#1C294E]">
  Past & Cancelled
  </h2>
  </div>
  {past.length === 0 ? (
   <Card className="text-center py-6 text-gray-600">
   Nothing here yet.
   </Card>
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
      className={`relative p-3 rounded-xl border-2 transition-all duration-200 text-left ${
       isSelected
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
      className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${
       isSelected ? 'bg-[#079447]' : 'bg-gray-100'
      }`}
      >
      <IconComponent
      className={`w-5 h-5 ${
       isSelected ? 'text-white' : 'text-[#079447]'
      }`}
      />
      </div>
      <div className="text-center sm:text-left">
      <p
      className={`font-semibold ${
       isSelected
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
    
    <div>
    <label className="block text-sm font-medium text-[#1C294E] mb-1">
    Cancellation reason <span className="text-red-500">*</span>
    </label>
    <select
    className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-[#079447] focus:outline-none focus:ring-2 focus:ring-[#079447]/20 text-sm"
    value={cancelReason}
    onChange={(e) => setCancelReason(e.target.value)}
    required
    >
    <option value="">Select a reason</option>
    <option value="Schedule conflict">Schedule conflict</option>
    <option value="No longer need the service">No longer need the service</option>
    <option value="Going with another provider">Going with another provider</option>
    <option value="Financial reasons / budget">Financial reasons / budget</option>
    <option value="Moving or out of town">Moving or out of town</option>
    <option value="Other">Other</option>
    </select>
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
  )
 }
 