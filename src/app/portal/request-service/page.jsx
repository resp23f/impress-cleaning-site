'use client'
import Script from 'next/script'
import AddressAutocomplete from '@/components/ui/AddressAutocomplete'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  Home,
  TruckIcon,
  Building2,
  Wrench,
  Calendar as CalendarIcon,
  MapPin,
  FileText,
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
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

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
    specialRequests: '',
    isRecurring: false,
    recurringFrequency: '',
  })

  const [addressData, setAddressData] = useState({
    street_address: '',
    unit: '',
    city: '',
    state: '',
    zip_code: '',
    place_id: '',
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
    setAddressData(data)
  }

  const supabase = createClient()

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || '',
    libraries,
  })

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
            street_address: formData.newAddress.streetAddress,
            unit: formData.newAddress.unit || null,
            city: formData.newAddress.city,
            state: formData.newAddress.state,
            zip_code: formData.newAddress.zipCode,
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

      const payload = {
        service_type: formData.serviceType,
        preferred_date: formData.preferredDate,
        preferred_time: formData.preferredTime,
        is_flexible: formData.isFlexible,
        address_id: addressId,
        special_requests: formData.specialRequests,
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

      setStep(6)
    } catch (error) {
      console.error('Error submitting request:', error)
      toast.error(error.message || 'Failed to submit request')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
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
                  specialRequests: '',
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
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="beforeInteractive"
      />

      <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1C294E] mb-2">
            Request Service
          </h1>
          <p className="text-gray-600">
            Step {step} of 5
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#079447] transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        <Card padding="lg">
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
                    <input
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      min={getMinDate()}
                      max={getMaxDate()}
                      className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-[#079447] focus:outline-none focus:ring-2 focus:ring-[#079447]/20 transition-all duration-200 text-[#1C294E] font-medium bg-white cursor-pointer appearance-none"
                      style={{
                        colorScheme: 'light',
                      }}
                    />
                  </div>
                  {formData.preferredDate && (
                    <p className="mt-2 text-sm text-[#079447] font-medium">
                      {formatDate(formData.preferredDate)}
                    </p>
                  )}
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
                          className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                            isSelected
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
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                              isSelected ? 'bg-[#079447]' : 'bg-gray-100'
                            }`}>
                              <IconComponent className={`w-5 h-5 ${
                                isSelected ? 'text-white' : 'text-[#079447]'
                              }`} />
                            </div>
                            <div className="text-center sm:text-left">
                              <p className={`font-semibold ${
                                isSelected ? 'text-[#079447]' : 'text-[#1C294E]'
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
                      defaultValue={addressData.street_address}
                    />
                    <Input
                      label="Apt/Unit (Optional)"
                      placeholder="Apt 123"
                      value={addressData.unit}
                      onChange={(e) => setAddressData({ ...addressData, unit: e.target.value })}
                    />
                    {/* City, State, Zip auto-filled */}
                    <div className="grid grid-cols-3 gap-4">
                      <Input
                        label="City"
                        value={addressData.city}
                        readOnly
                      />
                      <Input
                        label="State"
                        value={addressData.state}
                        readOnly
                      />
                      <Input
                        label="Zip"
                        value={addressData.zip_code}
                        readOnly
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

          {/* Step 4: Special Requests */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-[#1C294E] mb-2">
                Any special requests?
              </h2>
              <p className="text-gray-600 mb-6">
                Tell us anything special about this cleaning (optional)
              </p>

              <textarea
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                placeholder="E.g., Focus on kitchen, pet-friendly products, gate code is 1234..."
                rows={6}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#079447] focus:outline-none focus:ring-2 focus:ring-[#079447]/20 transition-all duration-200 resize-none"
              />

              <div className="flex gap-3 mt-6">
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