'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { User, Phone, MapPin, ArrowRight, RefreshCw, Gift } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import AddressAutocomplete from '@/components/ui/AddressAutocomplete'
import toast from 'react-hot-toast'
import { sanitizeText, sanitizePhone, validateName, validatePhone } from '@/lib/sanitize'
export const dynamic = 'force-dynamic'


export default function ProfileSetupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    birthMonth: '',
    birthDay: '',
  })

  const [addressData, setAddressData] = useState({
    street_address: '',
    unit: '',
    city: '',
    state: '',
    zip_code: '',
    place_id: '',
  })
  const [addressSelected, setAddressSelected] = useState(false)
  const [existingAddressId, setExistingAddressId] = useState(null)

  const handleAddressSelect = (data) => {
    setAddressData({
      street_address: data.street_address,
      unit: data.unit || '',
      city: data.city,
      state: data.state,
      zip_code: data.zip_code,
      place_id: data.place_id,
    })
    setAddressSelected(true)
  }

  // Reset selection state if user types after selecting
  const handleAddressInputChange = (value) => {
    if (addressSelected) {
      // User is typing after having selected - reset everything
      setAddressSelected(false)
      setAddressData({
        street_address: value,
        unit: '',
        city: '',
        state: '',
        zip_code: '',
        place_id: '',
      })
    } else {
      setAddressData(prev => ({ ...prev, street_address: value }))
    }
  }

  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError) {
          console.error('Auth error:', userError)
          router.push('/auth/login')
          return
        }

        if (!user) {
          router.push('/auth/login')
          return
        }

        // Check if profile is already complete
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, first_name, last_name, phone, birth_month, birth_day, account_status')
          .eq('id', user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          // PGRST116 = no rows returned, which is okay for new users
          console.error('Profile fetch error:', profileError)
        }

        const { data: addresses, error: addressError } = await supabase
          .from('service_addresses')
          .select('id, street_address, unit, city, state, zip_code, place_id')
          .eq('user_id', user.id)
          .limit(1)

        if (addressError) {
          console.error('Address fetch error:', addressError)
        }

        // If profile has first_name, last_name, phone, and at least one verified address → go to dashboard
        const hasValidAddress = addresses?.length > 0 && addresses[0]?.place_id
        const hasCompleteName = profile?.first_name && profile?.last_name
        if (hasCompleteName && profile?.phone && hasValidAddress) {
          router.push('/portal/dashboard')
          return
        }

        setUser(user)

        // Pre-fill existing data
        if (profile?.first_name) {
          setFormData(prev => ({ ...prev, firstName: profile.first_name }))
        } else if (profile?.full_name) {
          // Legacy: try to parse full_name
          const parts = profile.full_name.trim().split(' ')
          setFormData(prev => ({ ...prev, firstName: parts[0] || '' }))
        } else if (user.user_metadata?.full_name) {
          const parts = user.user_metadata.full_name.trim().split(' ')
          setFormData(prev => ({ ...prev, firstName: parts[0] || '' }))
        }

        if (profile?.last_name) {
          setFormData(prev => ({ ...prev, lastName: profile.last_name }))
        } else if (profile?.full_name) {
          const parts = profile.full_name.trim().split(' ')
          if (parts.length > 1) {
            setFormData(prev => ({ ...prev, lastName: parts.slice(1).join(' ') }))
          }
        } else if (user.user_metadata?.full_name) {
          const parts = user.user_metadata.full_name.trim().split(' ')
          if (parts.length > 1) {
            setFormData(prev => ({ ...prev, lastName: parts.slice(1).join(' ') }))
          }
        }

        if (profile?.phone) {
          setFormData(prev => ({ ...prev, phone: profile.phone }))
        }

        if (profile?.birth_month) {
          setFormData(prev => ({ ...prev, birthMonth: String(profile.birth_month) }))
        }
        if (profile?.birth_day) {
          setFormData(prev => ({ ...prev, birthDay: String(profile.birth_day) }))
        }

        // Pre-fill existing address (if any) - user may need to re-select to get place_id
        if (addresses?.length > 0) {
          const addr = addresses[0]
          setExistingAddressId(addr.id)
          setAddressData({
            street_address: addr.street_address || '',
            unit: addr.unit || '',
            city: addr.city || '',
            state: addr.state || '',
            zip_code: addr.zip_code || '',
            place_id: addr.place_id || '',
          })
          // Only mark as selected if it has a valid place_id
          if (addr.place_id) {
            setAddressSelected(true)
          }
        }
      } catch (error) {
        console.error('Profile setup error:', error)
        // Don't redirect on error - let user try to use the page
      }
    }
    getUser()
  }, [router])
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

    // Validate first name
    const firstNameValidation = validateName(formData.firstName, 'First name')
    if (!firstNameValidation.valid) {
      toast.error(firstNameValidation.error)
      return
    }

    // Validate last name
    const lastNameValidation = validateName(formData.lastName, 'Last name')
    if (!lastNameValidation.valid) {
      toast.error(lastNameValidation.error)
      return
    }

    // Validate phone
    const phoneValidation = validatePhone(formData.phone)
    if (!phoneValidation.valid) {
      toast.error(phoneValidation.error)
      return
    }

    // Validate birthday if partially filled
    if ((formData.birthMonth && !formData.birthDay) || (!formData.birthMonth && formData.birthDay)) {
      toast.error('Please select both month and day for your birthday, or leave both empty')
      return
    }

    // Require Google-validated address (must have place_id)
    if (!addressData.place_id) {
      toast.error('Please select an address from the dropdown suggestions')
      return
    }

    if (!addressData.street_address || !addressData.city || !addressData.state || !addressData.zip_code) {
      toast.error('Please complete your address by selecting from suggestions')
      return
    }

    // Validate ZIP is 5 digits
    if (!/^\d{5}$/.test(addressData.zip_code)) {
      toast.error('Please enter a valid 5-digit ZIP code')
      return
    }

    // Validate state is 2 letters
    if (!/^[A-Z]{2}$/i.test(addressData.state)) {
      toast.error('Please enter a valid 2-letter state code')
      return
    }

    setLoading(true)
    try {
      const profileUpdate = {
        first_name: sanitizeText(formData.firstName),
        last_name: sanitizeText(formData.lastName),
        full_name: sanitizeText(`${formData.firstName} ${formData.lastName}`), // Keep full_name in sync
        phone: sanitizePhone(formData.phone),
        account_status: 'active',
      }

      // Add birthday if provided
      if (formData.birthMonth && formData.birthDay) {
        profileUpdate.birth_month = parseInt(formData.birthMonth, 10)
        profileUpdate.birth_day = parseInt(formData.birthDay, 10)
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id)

      if (profileError) throw profileError

      const { error: addressError } = existingAddressId
        ? await supabase
          .from('service_addresses')
          .update({
            street_address: sanitizeText(addressData.street_address)?.slice(0, 200),
            unit: sanitizeText(addressData.unit)?.slice(0, 50) || null,
            city: sanitizeText(addressData.city)?.slice(0, 100),
            state: sanitizeText(addressData.state)?.slice(0, 2),
            zip_code: sanitizeText(addressData.zip_code)?.slice(0, 10),
            place_id: addressData.place_id || null,
          })
          .eq('id', existingAddressId)
        : await supabase
          .from('service_addresses')
          .insert({
            user_id: user.id,
            street_address: sanitizeText(addressData.street_address)?.slice(0, 200),
            unit: sanitizeText(addressData.unit)?.slice(0, 50) || null,
            city: sanitizeText(addressData.city)?.slice(0, 100),
            state: sanitizeText(addressData.state)?.slice(0, 2),
            zip_code: sanitizeText(addressData.zip_code)?.slice(0, 10),
            place_id: addressData.place_id || null,
            is_primary: true,
            is_registration_address: true, // Lock this address - cannot be edited/deleted by customer
          })
      if (addressError) throw addressError

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
                {/* First Name & Last Name - Side by side on desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first-name" className="block text-sm font-medium text-slate-700 mb-1.5">
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <User className="w-5 h-5" />
                      </div>
                      <input
                        id="first-name"
                        type="text"
                        name="given-name"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                        autoComplete="given-name"
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-200 text-slate-800 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="last-name" className="block text-sm font-medium text-slate-700 mb-1.5">
                      Last Name
                    </label>
                    <input
                      id="last-name"
                      type="text"
                      name="family-name"
                      placeholder="Smith"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                      autoComplete="family-name"
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-200 text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone-number" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Phone className="w-5 h-5" />
                    </div>
                    <input
                      id="phone-number"
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

                {/* Birthday - Optional */}
                <fieldset>
                  <legend className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-emerald-500" />
                    Birthday <span className="text-slate-400 font-normal">(Optional — we&apos;ll send you something special!)</span>
                  </legend>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      id="birth-month"
                      name="bday-month"
                      aria-label="Birth month"
                      value={formData.birthMonth}
                      onChange={(e) => setFormData({ ...formData, birthMonth: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-200 text-slate-800 bg-white appearance-none cursor-pointer"
                    >
                      <option value="">Month</option>
                      <option value="1">January</option>
                      <option value="2">February</option>
                      <option value="3">March</option>
                      <option value="4">April</option>
                      <option value="5">May</option>
                      <option value="6">June</option>
                      <option value="7">July</option>
                      <option value="8">August</option>
                      <option value="9">September</option>
                      <option value="10">October</option>
                      <option value="11">November</option>
                      <option value="12">December</option>
                    </select>
                    <select
                      id="birth-day"
                      name="bday-day"
                      aria-label="Birth day"
                      value={formData.birthDay}
                      onChange={(e) => setFormData({ ...formData, birthDay: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-200 text-slate-800 bg-white appearance-none cursor-pointer"
                    >
                      <option value="">Day</option>
                      {[...Array(31)].map((_, i) => (
                        <option key={i + 1} value={String(i + 1)}>{i + 1}</option>
                      ))}
                    </select>
                  </div>
                </fieldset>
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
                  onInputChange={handleAddressInputChange}
                  defaultValue={addressData.street_address}
                />
                <div>
                  <label htmlFor="apt-unit" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Apt/Unit <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    id="apt-unit"
                    type="text"
                    name="address-line2"
                    placeholder="Apt 123"
                    value={addressData.unit}
                    onChange={(e) => setAddressData({ ...addressData, unit: e.target.value })}
                    autoComplete="address-line2"
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-200 text-slate-800 placeholder:text-slate-400"
                  />
                </div>

                {/* Address validation indicator */}
                {addressData.street_address && (
                  <div className={`flex items-center gap-2 text-sm ${addressSelected ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {addressSelected ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Address verified • {addressData.city}, {addressData.state} {addressData.zip_code}
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Please select an address from the dropdown
                      </>
                    )}
                  </div>
                )}

                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span className="text-emerald-500">Tip:</span>
                  Start typing, then select your address from the suggestions
                </p>
              </div>
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
            © {new Date().getFullYear()} Impress Cleaning Services LLC. All rights reserved.
          </p>
        </div>
      </div>
    </>
  )
}