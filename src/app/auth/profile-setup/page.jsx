'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { User, Phone, MapPin, MessageSquare, Mail, MessageCircle, ArrowRight, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLoadScript } from '@react-google-maps/api'
import AddressAutocomplete from '@/components/ui/AddressAutocomplete'
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

    if (!addressData.street_address || !addressData.city || !addressData.state || !addressData.zip_code) {
      toast.error('Please complete your address')
      return
    }

    setLoading(true)
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: sanitizeText(formData.fullName),
          phone: sanitizePhone(formData.phone),
          communication_preference: formData.communicationPreference,
          account_status: 'active',
        })
        .eq('id', user.id)

      if (profileError) throw profileError

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

  // Loading state
  if (!user) {
    return (
      <>
        <style>{`html, body { background: #ffffff; }`}</style>
        <div className="min-h-screen flex items-center justify-center bg-white p-6">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{`html, body { background: #ffffff; }`}</style>
      <div className="min-h-screen bg-white py-8 px-4 sm:py-12">
        <div className="max-w-lg mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image
              src="/ImpressLogoNoBackgroundBlue.png"
              alt="Impress Cleaning Services"
              width={180}
              height={60}
              className="h-12 w-auto"
              priority
            />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Step 2 of 2
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
              Complete your profile
            </h1>
            <p className="text-slate-400">
              Help us provide the best cleaning experience
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Your Information */}
            <div>
              <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-500" />
                Your Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      placeholder="John Smith"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      autoComplete="name"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-200 text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Phone className="w-5 h-5" />
                    </div>
                    <input
                      type="tel"
                      name="tel"
                      placeholder="(512) 555-1234"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      required
                      maxLength={14}
                      autoComplete="tel"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-200 text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Service Address */}
            <div>
              <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500" />
                Service Address
              </h2>
              <div className="space-y-4">
                <AddressAutocomplete 
                  onSelect={handleAddressSelect}
                  defaultValue={addressData.street_address}
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Apt/Unit <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="address-line2"
                    placeholder="Apt 123"
                    value={addressData.unit}
                    onChange={(e) => setAddressData({ ...addressData, unit: e.target.value })}
                    autoComplete="address-line2"
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-200 text-slate-800 placeholder:text-slate-400"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={addressData.city}
                      onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                      placeholder="Austin"
                      required
                      autoComplete="address-level2"
                      className="w-full px-3 py-3.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-200 text-slate-800 placeholder:text-slate-400 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={addressData.state}
                      onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                      placeholder="TX"
                      maxLength={2}
                      required
                      autoComplete="address-level1"
                      className="w-full px-3 py-3.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-200 text-slate-800 placeholder:text-slate-400 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      ZIP
                    </label>
                    <input
                      type="text"
                      name="postal-code"
                      value={addressData.zip_code}
                      onChange={(e) => setAddressData({ ...addressData, zip_code: e.target.value })}
                      placeholder="78701"
                      maxLength={5}
                      required
                      autoComplete="postal-code"
                      className="w-full px-3 py-3.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-200 text-slate-800 placeholder:text-slate-400 text-sm"
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span className="text-emerald-500">Tip:</span>
                  Use Google autocomplete above, or your browser autofill works too!
                </p>
              </div>
            </div>

            {/* Communication Preferences */}
            <div>
              <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-500" />
                Communication Preferences
              </h2>
              <div className="space-y-3">
                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  formData.communicationPreference === 'text' 
                    ? 'border-emerald-500 bg-emerald-50/50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="communication"
                    value="text"
                    checked={formData.communicationPreference === 'text'}
                    onChange={(e) => setFormData({ ...formData, communicationPreference: e.target.value })}
                    className="w-5 h-5 text-emerald-500 focus:ring-emerald-500 border-slate-300"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-slate-800 flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-emerald-500" />
                      Text messages
                      <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-medium">Recommended</span>
                    </div>
                    <div className="text-sm text-slate-500 mt-0.5">Get updates via SMS</div>
                  </div>
                </label>

                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  formData.communicationPreference === 'email' 
                    ? 'border-emerald-500 bg-emerald-50/50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="communication"
                    value="email"
                    checked={formData.communicationPreference === 'email'}
                    onChange={(e) => setFormData({ ...formData, communicationPreference: e.target.value })}
                    className="w-5 h-5 text-emerald-500 focus:ring-emerald-500 border-slate-300"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-slate-800 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-500" />
                      Email only
                    </div>
                    <div className="text-sm text-slate-500 mt-0.5">Receive updates via email</div>
                  </div>
                </label>

                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  formData.communicationPreference === 'both' 
                    ? 'border-emerald-500 bg-emerald-50/50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="communication"
                    value="both"
                    checked={formData.communicationPreference === 'both'}
                    onChange={(e) => setFormData({ ...formData, communicationPreference: e.target.value })}
                    className="w-5 h-5 text-emerald-500 focus:ring-emerald-500 border-slate-300"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-slate-800 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-purple-500" />
                      Both
                    </div>
                    <div className="text-sm text-slate-500 mt-0.5">Stay informed via text and email</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  Complete Setup
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-slate-300 mt-8">
            © {new Date().getFullYear()} Impress Cleaning Services
          </p>
        </div>
      </div>
    </>
  )
}