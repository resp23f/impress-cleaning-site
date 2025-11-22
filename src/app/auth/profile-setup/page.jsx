'use client'

 

import { useState, useEffect, useCallback } from 'react'

import { useRouter } from 'next/navigation'

import { User, Phone, MapPin, MessageSquare } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'

import { useLoadScript } from '@react-google-maps/api'

import Button from '@/components/ui/Button'

import Input from '@/components/ui/Input'

import Card from '@/components/ui/Card'

import LoadingSpinner from '@/components/ui/LoadingSpinner'

import toast from 'react-hot-toast'

 

const libraries = ['places']

 

export default function ProfileSetupPage() {

  const router = useRouter()

  const [loading, setLoading] = useState(false)

  const [user, setUser] = useState(null)

  const [formData, setFormData] = useState({

    fullName: '',

    phone: '',

    streetAddress: '',

    unit: '',

    city: '',

    state: '',

    zipCode: '',

    placeId: '',

    communicationPreference: 'both',

  })

 

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

 

      // Pre-fill name from OAuth if available

      if (user.user_metadata?.full_name) {

        setFormData(prev => ({ ...prev, fullName: user.user_metadata.full_name }))

      }

    }

    getUser()

  }, [supabase, router])

 

  const initAutocomplete = useCallback(() => {

    if (!isLoaded) return

 

    const input = document.getElementById('address-autocomplete')

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

        if (types.includes('street_number')) {

          street = component.long_name + ' '

        }

        if (types.includes('route')) {

          street += component.long_name

        }

        if (types.includes('locality')) {

          city = component.long_name

        }

        if (types.includes('administrative_area_level_1')) {

          state = component.short_name

        }

        if (types.includes('postal_code')) {

          zip = component.long_name

        }

      })

 

      setFormData(prev => ({

        ...prev,

        streetAddress: street,

        city,

        state,

        zipCode: zip,

        placeId: place.place_id || '',

      }))

    })

  }, [isLoaded])

 

  useEffect(() => {

    if (isLoaded) {

      initAutocomplete()

    }

  }, [isLoaded, initAutocomplete])

 

  const formatPhoneNumber = (value) => {

    const phoneNumber = value.replace(/\D/g, '')

    if (phoneNumber.length <= 3) return phoneNumber

    if (phoneNumber.length <= 6) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`

    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`

  }

 

  const handlePhoneChange = (e) => {

    const formatted = formatPhoneNumber(e.target.value)

    setFormData({ ...formData, phone: formatted })

  }

 

  const handleSubmit = async (e) => {

    e.preventDefault()

    if (!user) return

 

    setLoading(true)

 

    try {

      // Update profile

      const { error: profileError } = await supabase

        .from('profiles')

        .update({

          full_name: formData.fullName,

          phone: formData.phone,

          communication_preference: formData.communicationPreference,

          account_status: 'pending', // Set to pending for admin approval

        })

        .eq('id', user.id)

 

      if (profileError) throw profileError

 

      // Insert service address

      const { error: addressError } = await supabase

        .from('service_addresses')

        .insert({

          user_id: user.id,

          street_address: formData.streetAddress,

          unit: formData.unit || null,

          city: formData.city,

          state: formData.state,

          zip_code: formData.zipCode,

          place_id: formData.placeId || null,

          is_primary: true,

        })

 

      if (addressError) throw addressError

 

      toast.success('Profile setup complete!')

      router.push('/auth/pending-approval')

    } catch (error) {

      console.error('Error setting up profile:', error)

      toast.error(error.message || 'Failed to setup profile')

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

 

  return (

    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">

      <div className="max-w-2xl mx-auto">

        <Card>

          {/* Header */}

          <div className="text-center mb-8">

            <h1 className="text-3xl font-bold text-[#1C294E] mb-2">

              Set Up Your Service Profile

            </h1>

            <p className="text-gray-600">

              Help us provide the best cleaning experience

            </p>

            <div className="mt-4 text-sm text-gray-500">

              Step 2 of 2

            </div>

          </div>

 

          {/* Form */}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Your Information */}

            <div>

              <h2 className="text-lg font-semibold text-[#1C294E] mb-4">

                Your Information

              </h2>

              <div className="space-y-4">

                <Input

                  label="Full Name"

                  placeholder="John Smith"

                  value={formData.fullName}

                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}

                  required

                  icon={<User className="w-5 h-5" />}

                />

 

                <Input

                  label="Phone Number"

                  placeholder="(512) 555-1234"

                  value={formData.phone}

                  onChange={handlePhoneChange}

                  required

                  maxLength={14}

                  icon={<Phone className="w-5 h-5" />}

                />

              </div>

            </div>

 

            {/* Service Address */}

            <div>

              <h2 className="text-lg font-semibold text-[#1C294E] mb-4">

                Service Address

              </h2>

              <div className="space-y-4">

                <div>

                  <Input

                    id="address-autocomplete"

                    label="Street Address"

                    placeholder="Start typing your address..."

                    value={formData.streetAddress}

                    onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}

                    required

                    icon={<MapPin className="w-5 h-5" />}

                  />

                  {!isLoaded && (

                    <p className="text-xs text-gray-500 mt-1">Loading address autocomplete...</p>

                  )}

                </div>

 

                <Input

                  label="Unit/Apt (optional)"

                  placeholder="Apt 4B"

                  value={formData.unit}

                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}

                />

 

                <div className="grid grid-cols-2 gap-4">

                  <Input

                    label="City"

                    placeholder="Austin"

                    value={formData.city}

                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}

                    required

                  />

 

                  <Input

                    label="State"

                    placeholder="TX"

                    value={formData.state}

                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}

                    required

                    maxLength={2}

                  />

                </div>

 

                <Input

                  label="ZIP Code"

                  placeholder="78701"

                  value={formData.zipCode}

                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}

                  required

                  maxLength={5}

                />

              </div>

            </div>

 

            {/* Communication Preferences */}

            <div>

              <h2 className="text-lg font-semibold text-[#1C294E] mb-4 flex items-center gap-2">

                <MessageSquare className="w-5 h-5" />

                Communication Preferences

              </h2>

              <div className="space-y-3">

                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-[#079447] transition-colors">

                  <input

                    type="radio"

                    name="communication"

                    value="text"

                    checked={formData.communicationPreference === 'text'}

                    onChange={(e) => setFormData({ ...formData, communicationPreference: e.target.value })}

                    className="w-5 h-5 text-[#079447] focus:ring-[#079447]"

                  />

                  <div>

                    <div className="font-medium text-[#1C294E]">Text messages (recommended)</div>

                    <div className="text-sm text-gray-600">Get updates via SMS</div>

                  </div>

                </label>

 

                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-[#079447] transition-colors">

                  <input

                    type="radio"

                    name="communication"

                    value="email"

                    checked={formData.communicationPreference === 'email'}

                    onChange={(e) => setFormData({ ...formData, communicationPreference: e.target.value })}

                    className="w-5 h-5 text-[#079447] focus:ring-[#079447]"

                  />

                  <div>

                    <div className="font-medium text-[#1C294E]">Email only</div>

                    <div className="text-sm text-gray-600">Receive updates via email</div>

                  </div>

                </label>

 

                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-[#079447] transition-colors">

                  <input

                    type="radio"

                    name="communication"

                    value="both"

                    checked={formData.communicationPreference === 'both'}

                    onChange={(e) => setFormData({ ...formData, communicationPreference: e.target.value })}

                    className="w-5 h-5 text-[#079447] focus:ring-[#079447]"

                  />

                  <div>

                    <div className="font-medium text-[#1C294E]">Both</div>

                    <div className="text-sm text-gray-600">Stay informed via text and email</div>

                  </div>

                </label>

              </div>

            </div>

 

            {/* Submit Button */}

            <Button

              type="submit"

              variant="primary"

              fullWidth

              size="lg"

              loading={loading}

            >

              Complete Setup

            </Button>

          </form>

        </Card>

      </div>

    </div>

  )

}