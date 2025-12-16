'use client'
import Script from 'next/script'
import AddressAutocomplete from '@/components/ui/AddressAutocomplete'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from '../shared-animations.module.css'
import {
  Sparkles,
  Home,
  TruckIcon,
  Building2,
  Wrench,
  Calendar as CalendarIcon,
  MapPin,
  Repeat,
  CheckCircle,
  Sun,
  CloudSun,
  Sunset,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLoadScript } from '@react-google-maps/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import SelectableCard from '@/components/ui/SelectableCard'
import Input from '@/components/ui/Input'
import { RequestServiceSkeleton } from '@/components/ui/SkeletonLoader'
import toast from 'react-hot-toast'
import { sanitizeText } from '@/lib/sanitize'

const libraries = ['places']

const SERVICE_TYPES = [
  {
    value: 'standard',
    title: 'Standard Cleaning',
    description: 'Regular home cleaning - dusting, vacuuming, bathrooms, kitchen',
    icon: <Home className="w-8 h-8" />,
  },
  {
    value: 'deep',
    title: 'Deep Cleaning',
    description: 'Thorough cleaning including baseboards, inside appliances, detailed work',
    icon: <Sparkles className="w-8 h-8" />,
  },
  {
    value: 'move_in_out',
    title: 'Move In/Out',
    description: 'Complete cleaning for moving in or out of a property',
    icon: <TruckIcon className="w-8 h-8" />,
  },
  {
    value: 'post_construction',
    title: 'Post-Construction',
    description: 'Clean up after renovation or construction work',
    icon: <Wrench className="w-8 h-8" />,
  },
  {
    value: 'office',
    title: 'Office Cleaning',
    description: 'Commercial office space cleaning',
    icon: <Building2 className="w-8 h-8" />,
  },
]

const TIME_RANGES = [
  {
    value: 'morning',
    title: 'Morning',
    description: '8:00 AM - 12:00 PM',
    icon: Sun,
  },
  {
    value: 'afternoon',
    title: 'Afternoon',
    description: '12:00 PM - 3:00 PM',
    icon: CloudSun,
  },
  {
    value: 'evening',
    title: 'Evening',
    description: '3:00 PM - 5:45 PM',
    icon: Sunset,
  },
]
// Service-specific planning options
const SERVICE_OPTIONS = {
  standard: {
    helperText: 'Standard cleaning assumes the home is regularly maintained. These selections help us plan the appropriate time and team.',
    options: [
      { value: 'first_time', label: 'First-time cleaning at this address' },
      { value: 'buildup', label: 'Noticeable buildup in kitchens or bathrooms (grease, soap scum, grime)' },
      { value: 'pet_hair', label: 'Heavy pet hair present' },
      { value: 'construction_dust', label: 'Recent remodel or construction dust' },
      { value: 'interior_windows', label: 'Interior windows requested' },
    ],
  },
  deep: {
    helperText: 'Deep cleaning includes detailed work throughout the home. These selections help identify cases that may require extended time or expanded scope.',
    options: [
      { value: 'significant_buildup', label: 'Significant buildup beyond a typical deep clean (heavy grease, scale, or residue)' },
      { value: 'pet_hair_odors', label: 'Heavy pet hair and/or lingering pet odors' },
      { value: 'inside_appliances', label: 'Inside appliances requested (oven and/or fridge)' },
      { value: 'first_professional', label: 'First professional cleaning in a long period of time' },
      { value: 'interior_windows', label: 'Interior windows requested' },
    ],
  },
  move_in_out: {
    helperText: 'Move in/out cleaning scope varies based on property status. These selections help us plan accordingly.',
    options: [
      { value: 'vacant', label: 'Property will be vacant' },
      { value: 'inside_appliances', label: 'Inside appliances requested (oven and/or fridge)' },
      { value: 'cabinets_closets', label: 'Inside cabinets or closets requested' },
      { value: 'heavy_buildup', label: 'Heavy buildup present' },
      { value: 'interior_windows', label: 'Interior windows requested' },
    ],
  },
  post_construction: {
    helperText: 'Post-construction cleaning varies by debris type and intensity. These selections help us plan crew size and duration.',
    options: [
      { value: 'fine_dust', label: 'Fine construction dust on floors and surfaces' },
      { value: 'paint_residue', label: 'Paint, caulk, or adhesive residue present' },
      { value: 'heavy_debris', label: 'Heavy debris or material remnants' },
      { value: 'interior_windows', label: 'Interior windows requested' },
      { value: 'first_after_construction', label: 'First professional cleaning after construction' },
    ],
  },
  office: {
    helperText: 'Office cleaning scope depends on traffic and facilities. These selections help us plan appropriately.',
    options: [
      { value: 'high_traffic', label: 'High-traffic office environment (10+ people daily)' },
      { value: 'breakroom', label: 'Breakroom or kitchen included' },
      { value: 'restrooms', label: 'Restrooms require deep sanitizing' },
      { value: 'interior_windows', label: 'Interior windows requested' },
      { value: 'first_time', label: 'First-time cleaning for this office space' },
    ],
  },
}
const FREQUENCIES = [
  {
    value: 'weekly',
    title: 'Weekly',
    description: 'Every week',
  },
  {
    value: 'bi-weekly',
    title: 'Bi-Weekly',
    description: 'Every two weeks',
  },
  {
    value: 'monthly',
    title: 'Monthly',
    description: 'Once a month',
  },
]

// Helper to format date for display
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

// Helper to get minimum date (today)
const getMinDate = () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

// Helper to get maximum date (3 months from now)
const getMaxDate = () => {
  const maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() + 3)
  return maxDate.toISOString().split('T')[0]
}

export default function RequestServicePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [formData, setFormData] = useState({
    serviceType: '',
    preferredDate: '',
    preferredTime: '',
    isFlexible: false,
    addressId: '',
    useNewAddress: false,
    newAddress: {
      streetAddress: '',
      unit: '',
      city: '',
      state: '',
      zipCode: '',
      placeId: '',
    },
    planningOptions: [], // Selected checkboxes
    additionalNotes: '', // Only shown if planningOptions.length > 0
    isRecurring: false,
    recurringFrequency: '',
  })
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const base = formData.preferredDate
      ? new Date(formData.preferredDate + 'T00:00:00')
      : new Date()
    base.setDate(1)
    return base
  })

  const handleAddressSelect = (data) => {
    setFormData({
      ...formData,
      newAddress: {
        streetAddress: data.street_address,
        unit: data.unit || '',
        city: data.city,
        state: data.state,
        zipCode: data.zip_code,
        placeId: data.place_id,
      }
    })
  }

  const supabase = createClient()

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || '',
    libraries,
  })

  useEffect(() => {
    if (formData.preferredDate) {
      const base = new Date(formData.preferredDate + 'T00:00:00')
      base.setDate(1)
      setCalendarMonth(base)
    }
  }, [formData.preferredDate])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)

      // Get user's addresses
      const { data: userAddresses } = await supabase
        .from('service_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false })

      setAddresses(userAddresses || [])
      if (userAddresses && userAddresses.length > 0) {
        setFormData(prev => ({ ...prev, addressId: userAddresses[0].id }))
      }
    }
    getUser()
  }, [supabase, router])

  useEffect(() => {
    if (isLoaded && formData.useNewAddress) {
      const input = document.getElementById('new-address-autocomplete')
      if (!input) return

      const autocomplete = new window.google.maps.places.Autocomplete(input, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
      })

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        if (!place.address_components) return

        let street = ''
        let city = ''
        let state = ''
        let zip = ''

        place.address_components.forEach(component => {
          const types = component.types
          if (types.includes('street_number')) street = component.long_name + ' '
          if (types.includes('route')) street += component.long_name
          if (types.includes('locality')) city = component.long_name
          if (types.includes('administrative_area_level_1')) state = component.short_name
          if (types.includes('postal_code')) zip = component.long_name
        })

        setFormData(prev => ({
          ...prev,
          newAddress: {
            streetAddress: street,
            city,
            state,
            zipCode: zip,
            placeId: place.place_id || '',
            unit: prev.newAddress.unit,
          },
        }))
      })
    }
  }, [isLoaded, formData.useNewAddress])

  const handleNext = () => {
    if (step === 1 && !formData.serviceType) {
      toast.error('Please select a service type')
      return
    }
    if (step === 2 && !formData.preferredDate) {
      toast.error('Please select a preferred date')
      return
    }
    if (step === 2 && !formData.preferredTime) {
      toast.error('Please select a preferred time range')
      return
    }
    if (step === 3 && !formData.addressId && !formData.useNewAddress) {
      toast.error('Please select an address')
      return
    }
    if (step === 3 && formData.useNewAddress && !formData.newAddress.streetAddress) {
      toast.error('Please enter an address')
      return
    }
    setStep(step + 1)
  }

  const handleSubmit = async () => {
    if (!user) return

    setLoading(true)
    try {
      let addressId = formData.addressId

      // If using new address, create it first
      if (formData.useNewAddress) {
        const { data: newAddr, error: addrError } = await supabase
          .from('service_addresses')
          .insert({
            user_id: user.id,
            street_address: sanitizeText(formData.newAddress.streetAddress)?.slice(0, 200),
            unit: sanitizeText(formData.newAddress.unit)?.slice(0, 50) || null,
            city: sanitizeText(formData.newAddress.city)?.slice(0, 100),
            state: sanitizeText(formData.newAddress.state)?.slice(0, 2),
            zip_code: sanitizeText(formData.newAddress.zipCode)?.slice(0, 10),
            place_id: formData.newAddress.placeId || null,
            is_primary: addresses.length === 0,
          })
          .select()
          .single()

        if (addrError) {
          console.error('Address creation error:', addrError)
          throw new Error('Failed to save address')
        }
        addressId = newAddr.id
      }

      // Build special_requests from planning options + additional notes
      const planningLabels = formData.planningOptions.map(opt => {
        const serviceOpts = SERVICE_OPTIONS[formData.serviceType]?.options || []
        const found = serviceOpts.find(o => o.value === opt)
        return found?.label || opt
      })
      const specialRequestsText = [
        planningLabels.length > 0 ? `Planning flags: ${planningLabels.join('; ')}` : '',
        formData.additionalNotes ? `Notes: ${sanitizeText(formData.additionalNotes)}` : '',
      ].filter(Boolean).join('\n\n')

      const payload = {
        service_type: formData.serviceType,
        preferred_date: formData.preferredDate,
        preferred_time: formData.preferredTime,
        is_flexible: formData.isFlexible,
        address_id: addressId,
        special_requests: specialRequestsText || null,
        is_recurring: formData.isRecurring,
        recurring_frequency: formData.isRecurring ? formData.recurringFrequency : null,
      }
      console.log('SERVICE REQUEST PAYLOAD:', payload)

      const res = await fetch('/api/customer-portal/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to submit request')
      }

      // Create notification for the user
      const serviceLabel = SERVICE_TYPES.find(s => s.value === formData.serviceType)?.title || formData.serviceType

      await supabase.from('customer_notifications').insert({
        user_id: user.id,
        type: 'service_request_submitted',
        title: 'Service Request Submitted',
        message: `Your ${serviceLabel} request for ${formatDate(formData.preferredDate)} has been submitted. We'll confirm your appointment within 24 hours.`,
        link: '/portal/appointments',
        is_read: false
      })

      setStep(6)
    } catch (error) {
      console.error('Error submitting request:', error)
      toast.error(error.message || 'Failed to submit request')
    } finally {
      setLoading(false)
    }
  }

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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <RequestServiceSkeleton />
        </div>
      </div>
    )
  }
  // Success screen
  if (step === 6) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#1C294E] mb-3">
            Request Submitted!
          </h1>
          <p className="text-gray-600 mb-6">
            We&apos;ll review your request and contact you within 24 hours to confirm your appointment.
          </p>
          <div className="space-y-3">
            <Button
              variant="primary"
              fullWidth
              onClick={() => router.push('/portal/dashboard')}
            >
              Back to Dashboard
            </Button>
            <Button
              variant="text"
              fullWidth
              onClick={() => {
                setStep(1)
                setFormData({
                  serviceType: '',
                  preferredDate: '',
                  preferredTime: '',
                  isFlexible: false,
                  addressId: addresses[0]?.id || '',
                  useNewAddress: false,
                  newAddress: {
                    streetAddress: '',
                    unit: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    placeId: '',
                  },
                  planningOptions: [],
                  additionalNotes: '',
                  isRecurring: false,
                  recurringFrequency: '',
                })
              }}
            >
              Submit Another Request
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places`}
        strategy="beforeInteractive"
      />

      <div className={`py-8 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto ${styles.contentReveal}`}>
        {/* Header */}
        <div className={`mb-8 ${styles.cardReveal}`}>
          <h1 className="text-3xl font-bold text-[#1C294E] mb-2">
            Request Service
          </h1>
          <p className="text-gray-600">
            Step {step} of 5
          </p>
        </div>

        {/* Progress Bar */}
        <div className={`mb-8 ${styles.cardReveal1}`}>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#079447] transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        <Card padding="lg" className={styles.cardReveal2}>
          {/* Step 1: Service Type */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-[#1C294E] mb-2">
                What kind of cleaning do you need?
              </h2>
              <p className="text-gray-600 mb-6">
                Select the service that best fits your needs
              </p>

              <div className="grid grid-cols-1 gap-4">
                {SERVICE_TYPES.map((service) => (
                  <SelectableCard
                    key={service.value}
                    selected={formData.serviceType === service.value}
                    onClick={() => setFormData({ ...formData, serviceType: service.value })}
                    icon={service.icon}
                    title={service.title}
                    description={service.description}
                  />
                ))}
              </div>

              <div className="mt-6">
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  onClick={handleNext}
                  disabled={!formData.serviceType}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-[#1C294E] mb-2">
                When would you like service?
              </h2>
              <p className="text-gray-600 mb-6">
                Choose your preferred date and time range
              </p>

              <div className="space-y-6">
                {/* Date Picker */}
                <div>
                  <label className="block text-sm font-medium text-[#1C294E] mb-2">
                    Preferred Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <CalendarIcon className="w-5 h-5 text-[#079447]" />
                    </div>

                    {/* Big, pretty opener */}
                    <button
                      type="button"
                      onClick={() => setIsCalendarOpen((prev) => !prev)}
                      className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-[#079447] focus:outline-none focus:ring-2 focus:ring-[#079447]/20 transition-all duration-200 text-left bg-white"
                    >
                      <span
                        className={
                          formData.preferredDate
                            ? 'text-[#1C294E] font-medium'
                            : 'text-gray-400'
                        }
                      >
                        {formData.preferredDate
                          ? formatDate(formData.preferredDate)
                          : 'Select a date'}
                      </span>
                    </button>

                    {/* Hidden semantic input for forms / SEO */}
                    <input
                      type="hidden"
                      name="preferred_date"
                      value={formData.preferredDate}
                    />

                    {/* Custom Calendar Popover */}
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
                            const isSelected = formData.preferredDate === iso

                            return (
                              <button
                                key={iso}
                                type="button"
                                disabled={isDisabled}
                                onClick={() => {
                                  if (isDisabled) return
                                  setFormData({ ...formData, preferredDate: iso })
                                  setIsCalendarOpen(false)
                                }}
                                className={[
                                  'w-10 h-10 flex items-center justify-center rounded-full',
                                  !isCurrentMonth ? 'text-gray-300' : 'text-gray-700',
                                  isSelected
                                    ? 'bg-[#079447] text-white font-semibold'
                                    : !isDisabled
                                      ? 'hover:bg-gray-100'
                                      : '',
                                  isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
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

                {/* Time Range Selector */}
                <div>
                  <label className="block text-sm font-medium text-[#1C294E] mb-3">
                    Preferred Time Range <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {TIME_RANGES.map((time) => {
                      const IconComponent = time.icon
                      const isSelected = formData.preferredTime === time.value
                      return (
                        <button
                          key={time.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, preferredTime: time.value })}
                          className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${isSelected
                            ? 'border-[#079447] bg-[#079447]/5 ring-2 ring-[#079447]/20'
                            : 'border-gray-200 hover:border-[#079447]/50 hover:bg-gray-50'
                            }`}
                        >
                          {/* Checkmark */}
                          {isSelected && (
                            <div className="absolute top-3 right-3">
                              <div className="w-5 h-5 bg-[#079447] rounded-full flex items-center justify-center">
                                <CheckCircle className="w-3 h-3 text-white" />
                              </div>
                            </div>
                          )}

                          <div className="flex flex-col items-center sm:items-start">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${isSelected ? 'bg-[#079447]' : 'bg-gray-100'
                              }`}>
                              <IconComponent className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[#079447]'
                                }`} />
                            </div>
                            <div className="text-center sm:text-left">
                              <p className={`font-semibold ${isSelected ? 'text-[#079447]' : 'text-[#1C294E]'
                                }`}>
                                {time.title}
                              </p>
                              <p className="text-sm text-gray-500 mt-0.5">
                                {time.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Flexible Checkbox */}
                <label className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer hover:border-[#079447]/50 transition-colors bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.isFlexible}
                    onChange={(e) => setFormData({ ...formData, isFlexible: e.target.checked })}
                    className="w-5 h-5 text-[#079447] focus:ring-[#079447] rounded border-gray-300"
                  />
                  <div>
                    <div className="font-medium text-[#1C294E]">Flexible with timing</div>
                    <div className="text-sm text-gray-600">
                      I&apos;m flexible and can work with your available schedule
                    </div>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 mt-8">
                <Button
                  variant="secondary"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={handleNext}
                  className="flex-1"
                  disabled={!formData.preferredDate || !formData.preferredTime}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Address */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-[#1C294E] mb-2">
                Where should we clean?
              </h2>
              <p className="text-gray-600 mb-6">
                Choose a service address
              </p>

              <div className="space-y-4">
                {addresses.map((address) => (
                  <SelectableCard
                    key={address.id}
                    selected={formData.addressId === address.id && !formData.useNewAddress}
                    onClick={() => setFormData({ ...formData, addressId: address.id, useNewAddress: false })}
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="font-medium text-[#1C294E]">
                          {address.street_address}
                          {address.unit && `, ${address.unit}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {address.city}, {address.state} {address.zip_code}
                        </p>
                        {address.is_primary && (
                          <span className="text-xs text-[#079447] font-medium">Primary</span>
                        )}
                      </div>
                    </div>
                  </SelectableCard>
                ))}

                <SelectableCard
                  selected={formData.useNewAddress}
                  onClick={() => setFormData({ ...formData, useNewAddress: true })}
                  title="Use a different address"
                  description="Enter a new service address"
                  icon={<MapPin className="w-6 h-6" />}
                />

                {formData.useNewAddress && (
                  <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
                    <AddressAutocomplete
                      onSelect={handleAddressSelect}
                      defaultValue={formData.newAddress.streetAddress}
                    />
                    <Input
                      label="Apt/Unit (Optional)"
                      placeholder="Apt 123"
                      value={formData.newAddress.unit}
                      onChange={(e) => setFormData({
                        ...formData,
                        newAddress: { ...formData.newAddress, unit: e.target.value }
                      })}
                    />

                    {/* City, State, Zip - auto-filled but editable */}
                    <div className="grid grid-cols-3 gap-4">
                      <Input
                        label="City"
                        value={formData.newAddress.city}
                        onChange={(e) => setFormData({
                          ...formData,
                          newAddress: { ...formData.newAddress, city: e.target.value }
                        })}
                        placeholder="City"
                      />
                      <Input
                        label="State"
                        value={formData.newAddress.state}
                        onChange={(e) => setFormData({
                          ...formData,
                          newAddress: { ...formData.newAddress, state: e.target.value.toUpperCase().slice(0, 2) }
                        })}
                        placeholder="TX"
                        maxLength={2}
                      />
                      <Input
                        label="Zip"
                        value={formData.newAddress.zipCode}
                        onChange={(e) => setFormData({
                          ...formData,
                          newAddress: { ...formData.newAddress, zipCode: e.target.value.replace(/\D/g, '').slice(0, 10) }
                        })}
                        placeholder="78633"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setStep(2)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={handleNext}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Planning Options */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-[#1C294E] mb-2">
                Help us plan your service
              </h2>
              <p className="text-gray-600 mb-6">
                Select any that apply to help us schedule the right team and time (optional)
              </p>

              {SERVICE_OPTIONS[formData.serviceType] && (
                <div className="space-y-5">
                  {/* Helper text card */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/80">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="text-sm text-blue-700 leading-relaxed">
                        {SERVICE_OPTIONS[formData.serviceType].helperText}
                      </p>
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-3">
                    {SERVICE_OPTIONS[formData.serviceType].options.map((option, index) => {
                      const isChecked = formData.planningOptions.includes(option.value)
                      return (
                        <label
                          key={option.value}
                          className={`
                            group relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer 
                            transition-all duration-200 ease-out
                            ${isChecked
                              ? 'border-[#079447] bg-gradient-to-br from-emerald-50/80 to-green-50/50 shadow-sm shadow-emerald-100'
                              : 'border-gray-200 bg-white hover:border-emerald-200 hover:bg-gray-50/50'
                            }
                          `}
                        >
                          {/* Custom checkbox */}
                          <div className={`
                            relative w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                            transition-all duration-200
                            ${isChecked
                              ? 'bg-[#079447] border-[#079447]'
                              : 'border-gray-300 bg-white group-hover:border-emerald-300'
                            }
                          `}>
                            <CheckCircle className={`
                              w-4 h-4 text-white transition-all duration-200
                              ${isChecked ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
                            `} />
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    planningOptions: [...formData.planningOptions, option.value],
                                  })
                                } else {
                                  setFormData({
                                    ...formData,
                                    planningOptions: formData.planningOptions.filter(v => v !== option.value),
                                  })
                                }
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>

                          {/* Label text */}
                          <span className={`
                            text-sm leading-relaxed transition-colors duration-200
                            ${isChecked ? 'text-[#1C294E] font-medium' : 'text-gray-600 group-hover:text-gray-800'}
                          `}>
                            {option.label}
                          </span>

                          {/* Selected indicator accent */}
                          {isChecked && (
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#079447] rounded-l-xl" />
                          )}
                        </label>
                      )
                    })}
                  </div>

                  {/* Additional notes - only shown if at least one option selected */}
                  {formData.planningOptions.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                        <label className="text-sm font-semibold text-[#1C294E]">
                          Additional notes
                        </label>
                        <span className="text-xs text-gray-400 font-normal">(optional)</span>
                      </div>
                      <textarea
                        value={formData.additionalNotes}
                        onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                        placeholder="Gate code, parking instructions, areas of focus, or anything else we should know..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#079447] focus:outline-none focus:ring-2 focus:ring-[#079447]/20 transition-all duration-200 resize-none text-sm placeholder:text-gray-400"
                      />
                    </div>
                  )}

                  {/* Selection summary */}
                  {formData.planningOptions.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                      <CheckCircle className="w-4 h-4" />
                      <span>{formData.planningOptions.length} option{formData.planningOptions.length !== 1 ? 's' : ''} selected</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 mt-8">
                <Button
                  variant="secondary"
                  onClick={() => setStep(3)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={handleNext}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}
          {/* Step 5: Recurring */}
          {step === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-[#1C294E] mb-2">
                Make this recurring?
              </h2>
              <p className="text-gray-600 mb-6">
                Save time by scheduling regular cleanings
              </p>

              <label className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer hover:border-[#079447]/50 transition-colors mb-4">
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="w-5 h-5 text-[#079447] focus:ring-[#079447] rounded border-gray-300"
                />
                <div className="flex items-center gap-2">
                  <Repeat className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-[#1C294E]">Yes, make this recurring</div>
                    <div className="text-sm text-gray-600">
                      Schedule regular cleanings automatically
                    </div>
                  </div>
                </div>
              </label>

              {formData.isRecurring && (
                <div className="space-y-3">
                  {FREQUENCIES.map((freq) => (
                    <SelectableCard
                      key={freq.value}
                      selected={formData.recurringFrequency === freq.value}
                      onClick={() => setFormData({ ...formData, recurringFrequency: freq.value })}
                      title={freq.title}
                      description={freq.description}
                    />
                  ))}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setStep(4)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  loading={loading}
                  className="flex-1"
                >
                  Submit Request
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}