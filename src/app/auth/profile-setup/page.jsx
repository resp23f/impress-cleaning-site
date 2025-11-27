'use client'
import Script from 'next/script'
import AddressAutocomplete from '@/components/ui/AddressAutocomplete'
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
import { sanitizeText, sanitizePhone } from '@/lib/sanitize'

const libraries = ['places']

export default function ProfileSetupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    communicationPreference: 'both',
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
    setAddressData({
      street_address: data.street_address,
      unit: data.unit || '',
      city: data.city,
      state: data.state,
      zip_code: data.zip_code,
      place_id: data.place_id,
    })
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
      // Pre-fill name from OAuth if available
      if (user.user_metadata?.full_name) {
        setFormData(prev => ({ ...prev, fullName: user.user_metadata.full_name }))
      }
    }
    getUser()
  }, [supabase, router])

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

    // Validate address fields
    if (!addressData.street_address || !addressData.city || !addressData.state || !addressData.zip_code) {
      toast.error('Please complete your address')
      return
    }

    setLoading(true)
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
        full_name: sanitizeText(formData.fullName),  // ← ADD
        phone: sanitizePhone(formData.phone),         // ← ADD
          communication_preference: formData.communicationPreference,
          account_status: 'active',
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Insert service address
      const { error: addressError } = await supabase
        .from('service_addresses')
        .insert({
          user_id: user.id,
          street_address: addressData.street_address,
          unit: addressData.unit || null,
          city: addressData.city,
          state: addressData.state,
          zip_code: addressData.zip_code,
          place_id: addressData.place_id || null,
          is_primary: true,
        })

      if (addressError) throw addressError

      // Send admin notification email
      fetch('/api/email/admin-new-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.fullName,
          customerEmail: user.email,
          customerId: user.id,
        }),
      }).catch(err => console.error('Admin notification failed:', err))

      toast.success('Profile setup complete!')
      router.push('/portal/dashboard')
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
                  name="name"
                  placeholder="John Smith"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  icon={<User className="w-5 h-5" />}
                  autoComplete="name"
                />
                <Input
                  label="Phone Number"
                  name="tel"
                  placeholder="(512) 555-1234"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  required
                  maxLength={14}
                  icon={<Phone className="w-5 h-5" />}
                  autoComplete="tel"
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
                  <AddressAutocomplete 
                    onSelect={handleAddressSelect}
                    defaultValue={addressData.street_address}
                  />
                </div>

                <Input
                  label="Apt/Unit (Optional)"
                  name="address-line2"
                  placeholder="Apt 123"
                  value={addressData.unit}
                  onChange={(e) => setAddressData({ ...addressData, unit: e.target.value })}
                  autoComplete="address-line2"
                />

                {/* City, State, Zip - Now editable with autofill support */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={addressData.city}
                      onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C294E] focus:border-transparent"
                      placeholder="Austin"
                      required
                      autoComplete="address-level2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={addressData.state}
                      onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C294E] focus:border-transparent"
                      placeholder="TX"
                      maxLength={2}
                      required
                      autoComplete="address-level1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ZIP *
                    </label>
                    <input
                      type="text"
                      name="postal-code"
                      value={addressData.zip_code}
                      onChange={(e) => setAddressData({ ...addressData, zip_code: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C294E] focus:border-transparent"
                      placeholder="78701"
                      maxLength={5}
                      required
                      autoComplete="postal-code"
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  💡 Use Google autocomplete above, or your browser autofill will work too!
                </p>
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