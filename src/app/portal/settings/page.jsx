'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from '../shared-animations.module.css'
import {
  User,
  Phone,
  Mail,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Star,
  KeyRound,
  Bell,
  CreditCard,
  Shield,
  Lock,
  Loader2,
  AlertTriangle,
  Gift,
  Home,
} from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import { SettingsSkeleton } from '@/components/ui/SkeletonLoader'
import toast from 'react-hot-toast'
import PageTitle from '@/components/portal/PageTitle'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
)

import { sanitizeText, sanitizePhone, sanitizeEmail, validateName, validatePhone } from '@/lib/sanitize'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [user, setUser] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [payments, setPayments] = useState([])

  // Profile form (name, phone, birthday, communication)
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    birth_month: '',
    birth_day: '',
    communication_preference: 'both',
  })
  const [savingProfile, setSavingProfile] = useState(false)

  // Password form (with current password verification)
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  const [savingPassword, setSavingPassword] = useState(false)

  // Email change (separate from profile)
  const [newEmail, setNewEmail] = useState('')
  const [sendingEmailLink, setSendingEmailLink] = useState(false)

  // Address modal
  const [addressModal, setAddressModal] = useState({ open: false, editing: null })
  const [addressForm, setAddressForm] = useState({
    street_address: '',
    unit: '',
    city: '',
    state: '',
    zip_code: '',
    is_primary: false,
  })

  // Payment methods
  const [processingCard, setProcessingCard] = useState(false)
  const [cardState, setCardState] = useState({
    numberComplete: false,
    expiryComplete: false,
    cvcComplete: false,
    numberError: '',
    expiryError: '',
    cvcError: '',
  })
  const cardNumberRef = useRef(null)
  const cardExpiryRef = useRef(null)
  const cardCvcRef = useRef(null)
  const stripeElementsRef = useRef(null)
  
  // Computed validation state
  const cardComplete = cardState.numberComplete && cardState.expiryComplete && cardState.cvcComplete
  const cardError = cardState.numberError || cardState.expiryError || cardState.cvcError

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }
        setUser(user)

        const [{ data: profileData }, { data: addressData }, { data: paymentData }] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', user.id).single(),
          supabase.from('service_addresses').select('*').eq('user_id', user.id).order('is_primary', { ascending: false }),
          supabase.from('payment_methods').select('*').eq('user_id', user.id).order('is_default', { ascending: false }),
        ])

        setProfile(profileData || null)
        setProfileForm({
          first_name: profileData?.first_name || '',
          last_name: profileData?.last_name || '',
          phone: profileData?.phone || '',
          birth_month: profileData?.birth_month ? String(profileData.birth_month) : '',
          birth_day: profileData?.birth_day ? String(profileData.birth_day) : '',
          communication_preference: profileData?.communication_preference || 'both',
        })
        setAddresses(addressData || [])
        setPayments(paymentData || [])
      } catch (err) {
        console.error('Error loading settings', err)
        toast.error('Failed to load settings')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router, supabase])

  useEffect(() => {
    if (loading) return
    
    const mountCardElements = async () => {
      // Don't remount if already mounted
      if (stripeElementsRef.current) return
      if (!cardNumberRef.current || !cardExpiryRef.current || !cardCvcRef.current) return
      
      const stripe = await stripePromise
      if (!stripe) return
      
      const elements = stripe.elements()
      
      const baseStyle = {
        base: {
          fontSize: '16px',
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
          fontSmoothing: 'antialiased',
          color: '#1C294E',
          '::placeholder': { color: '#9ca3af' },
          iconColor: '#6b7280',
        },
        invalid: {
          color: '#dc2626',
          iconColor: '#dc2626',
        },
      }
      
      // Create individual elements
      const cardNumber = elements.create('cardNumber', { 
        style: baseStyle,
        showIcon: true,
      })
      const cardExpiry = elements.create('cardExpiry', { style: baseStyle })
      const cardCvc = elements.create('cardCvc', { style: baseStyle })
      
      // Listen for changes on each element
      cardNumber.on('change', (event) => {
        setCardState(prev => ({
          ...prev,
          numberComplete: event.complete,
          numberError: event.error ? event.error.message : '',
        }))
      })
      
      cardExpiry.on('change', (event) => {
        setCardState(prev => ({
          ...prev,
          expiryComplete: event.complete,
          expiryError: event.error ? event.error.message : '',
        }))
      })
      
      cardCvc.on('change', (event) => {
        setCardState(prev => ({
          ...prev,
          cvcComplete: event.complete,
          cvcError: event.error ? event.error.message : '',
        }))
      })
      
      // Mount elements
      cardNumber.mount(cardNumberRef.current)
      cardExpiry.mount(cardExpiryRef.current)
      cardCvc.mount(cardCvcRef.current)
      
      stripeElementsRef.current = { stripe, cardNumber, cardExpiry, cardCvc }
    }
    
    const timer = setTimeout(mountCardElements, 150)
    return () => clearTimeout(timer)
  }, [loading])

  useEffect(() => {
    return () => {
      if (stripeElementsRef.current) {
        stripeElementsRef.current.cardNumber?.unmount()
        stripeElementsRef.current.cardExpiry?.unmount()
        stripeElementsRef.current.cardCvc?.unmount()
      }
    }
  }, [])

  // ============================================
  // PROFILE SAVE (name, phone, birthday, communication)
  // ============================================
  const handleProfileSave = async () => {
    if (!user) return

    // Validate first name
    const firstNameValidation = validateName(profileForm.first_name, 'First name')
    if (!firstNameValidation.valid) {
      toast.error(firstNameValidation.error)
      return
    }

    // Validate last name
    const lastNameValidation = validateName(profileForm.last_name, 'Last name')
    if (!lastNameValidation.valid) {
      toast.error(lastNameValidation.error)
      return
    }

    // Validate phone
    const phoneValidation = validatePhone(profileForm.phone)
    if (!phoneValidation.valid) {
      toast.error(phoneValidation.error)
      return
    }

    // Validate birthday if partially filled
    if ((profileForm.birth_month && !profileForm.birth_day) || (!profileForm.birth_month && profileForm.birth_day)) {
      toast.error('Please select both month and day for your birthday, or leave both empty')
      return
    }

    setSavingProfile(true)
    try {
      const updateData = {
        first_name: sanitizeText(profileForm.first_name),
        last_name: sanitizeText(profileForm.last_name),
        full_name: sanitizeText(`${profileForm.first_name} ${profileForm.last_name}`), // Keep in sync
        phone: sanitizePhone(profileForm.phone),
        communication_preference: profileForm.communication_preference,
        updated_at: new Date().toISOString(),
      }

      // Add birthday if provided
      if (profileForm.birth_month && profileForm.birth_day) {
        updateData.birth_month = parseInt(profileForm.birth_month, 10)
        updateData.birth_day = parseInt(profileForm.birth_day, 10)
      } else {
        // Clear birthday if removed
        updateData.birth_month = null
        updateData.birth_day = null
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)

      if (error) throw error
      toast.success('Profile updated successfully')
    } catch (err) {
      console.error('Profile update error', err)
      toast.error(err.message || 'Could not update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  // ============================================
  // PASSWORD CHANGE
  // ============================================
  const handlePasswordChange = async () => {
    const { newPassword, confirmPassword } = passwordForm

    // Validation
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    setSavingPassword(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) throw updateError

      toast.success('Password updated successfully. Please log in again.')
      setPasswordForm({ newPassword: '', confirmPassword: '' })

      // Sign out and redirect to login
      await supabase.auth.signOut()
      router.push('/auth/login')
    } catch (err) {
      console.error('Password change error', err)
      toast.error(err.message || 'Could not change password')
    } finally {
      setSavingPassword(false)
    }
  }
  // ============================================
  // EMAIL CHANGE (sends confirmation link)
  // ============================================
  const handleEmailChange = async () => {
    if (!newEmail) {
      toast.error('Please enter a new email address')
      return
    }

    const sanitizedEmail = sanitizeEmail(newEmail)
    if (!sanitizedEmail) {
      toast.error('Please enter a valid email address')
      return
    }

    if (sanitizedEmail.toLowerCase() === user.email.toLowerCase()) {
      toast.error('New email must be different from current email')
      return
    }

    setSendingEmailLink(true)
    try {
      const { error } = await supabase.auth.updateUser({
        email: sanitizedEmail,
      })

      if (error) throw error

      toast.success('Confirmation link sent! Check your new email inbox to confirm the change.')
      setNewEmail('')
    } catch (err) {
      console.error('Email change error', err)
      toast.error(err.message || 'Could not send email change link')
    } finally {
      setSendingEmailLink(false)
    }
  }

  // ============================================
  // ADDRESS FUNCTIONS
  // ============================================
  const openAddressModal = (addr) => {
    setAddressForm(
      addr || {
        street_address: '',
        unit: '',
        city: '',
        state: '',
        zip_code: '',
        is_primary: false,
      }
    )
    setAddressModal({ open: true, editing: addr?.id || null })
  }

  const saveAddress = async () => {
    if (!user) return
    try {
      // Safeguard: prevent editing registration addresses
      if (addressModal.editing) {
        const existingAddr = addresses.find(a => a.id === addressModal.editing)
        if (existingAddr?.is_registration_address) {
          toast.error('Your primary service address cannot be edited. Contact us if you need to change it.')
          setAddressModal({ open: false, editing: null })
          return
        }
      } else {
        // Adding new address - check limit (max 3 total)
        if (addresses.length >= 3) {
          toast.error('You can only have up to 3 saved addresses')
          setAddressModal({ open: false, editing: null })
          return
        }
      }

      const sanitizedAddress = {
        street_address: sanitizeText(addressForm.street_address)?.slice(0, 200),
        unit: sanitizeText(addressForm.unit)?.slice(0, 50) || null,
        city: sanitizeText(addressForm.city)?.slice(0, 100),
        state: sanitizeText(addressForm.state)?.slice(0, 2),
        zip_code: sanitizeText(addressForm.zip_code)?.slice(0, 10),
        is_primary: addressForm.is_primary,
      }

      if (addressModal.editing) {
        const { error } = await supabase
          .from('service_addresses')
          .update(sanitizedAddress)
          .eq('id', addressModal.editing)
          .eq('user_id', user.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('service_addresses')
          .insert({ ...sanitizedAddress, user_id: user.id })
        if (error) throw error
      }

      const { data: addressData } = await supabase
        .from('service_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false })

      setAddresses(addressData || [])
      toast.success('Address saved')
      setAddressModal({ open: false, editing: null })
    } catch (err) {
      console.error('Address save error', err)
      toast.error(err.message || 'Could not save address')
    }
  }

  const deleteAddress = async (id) => {
    if (!user) return
    try {
      // Check if we're trying to delete a registration address (should never happen via UI, but safeguard)
      const addressToDelete = addresses.find(a => a.id === id)
      if (addressToDelete?.is_registration_address) {
        toast.error('Your primary service address cannot be deleted. Contact us if you need to change it.')
        return
      }
      const wasPrimary = addressToDelete?.is_primary

      const { error } = await supabase
        .from('service_addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
      if (error) throw error

      // If we deleted the primary, promote the next available address
      if (wasPrimary) {
        const remainingAddresses = addresses.filter(a => a.id !== id)
        if (remainingAddresses.length > 0) {
          const newPrimary = remainingAddresses[0]
          await supabase
            .from('service_addresses')
            .update({ is_primary: true })
            .eq('id', newPrimary.id)
            .eq('user_id', user.id)

          // Refresh addresses from DB
          const { data: addressData } = await supabase
            .from('service_addresses')
            .select('*')
            .eq('user_id', user.id)
            .order('is_primary', { ascending: false })
          setAddresses(addressData || [])
          toast.success('Address deleted. New primary address set.')
          return
        }
      }

      setAddresses((prev) => prev.filter((a) => a.id !== id))
      toast.success('Address deleted')
    } catch (err) {
      console.error('Delete address error', err)
      toast.error(err.message || 'Could not delete address')
    }
  }
    // setPrimaryAddress removed - customers must contact support to change default address

  // ============================================
  // PAYMENT METHODS
  // ============================================
  const handleAddCard = async () => {
    // Check payment method limit (max 3)
    if (payments.length >= 3) {
      toast.error('Maximum 3 payment methods allowed. Please remove a payment method to add a new one.')
      return
    }
    
    if (!stripeElementsRef.current?.stripe || !stripeElementsRef.current?.cardNumber) {
      toast.error('Payment form not ready')
      return
    }
    setProcessingCard(true)
    try {
      const createRes = await fetch('/api/stripe/create-setup-intent', { method: 'POST' })
      const { clientSecret, error: createError } = await createRes.json()
      if (createError || !clientSecret) throw new Error(createError || 'Unable to start card setup')

      const { stripe, cardNumber } = stripeElementsRef.current
      const result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: { card: cardNumber },
      })
      if (result.error) throw new Error(result.error.message)

      const pmId = result.setupIntent.payment_method
      const saveRes = await fetch('/api/stripe/save-payment-method', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId: pmId, makeDefault: payments.length === 0 }),
      })
      const saveJson = await saveRes.json()
      if (saveJson.error) throw new Error(saveJson.error)

      const { data: paymentData } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
      setPayments(paymentData || [])
      
      // Clear all card elements for next entry
      stripeElementsRef.current?.cardNumber?.clear()
      stripeElementsRef.current?.cardExpiry?.clear()
      stripeElementsRef.current?.cardCvc?.clear()
      setCardState({
        numberComplete: false,
        expiryComplete: false,
        cvcComplete: false,
        numberError: '',
        expiryError: '',
        cvcError: '',
      })
      
      toast.success('Card saved successfully!')
    } catch (err) {
      console.error('Add card error', err)
      toast.error(err.message || 'Could not save card')
    } finally {
      setProcessingCard(false)
    }
  }

  const deletePaymentMethod = async (id) => {
    if (!user) return
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
      if (error) throw error
      setPayments((prev) => prev.filter((p) => p.id !== id))
      toast.success('Payment method removed')
    } catch (err) {
      console.error('Delete card error', err)
      toast.error(err.message || 'Could not remove card')
    }
  }

  const makeDefaultCard = async (paymentMethodId) => {
    if (!user) return
    try {
      await fetch('/api/stripe/save-payment-method', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId, makeDefault: true }),
      })
      const { data: paymentData } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
      setPayments(paymentData || [])
      toast.success('Default payment method updated')
    } catch (err) {
      console.error('Default card error', err)
      toast.error(err.message || 'Could not update default card')
    }
  }

  // ============================================
  // DELETE ACCOUNT
  // ============================================
  const handleDeleteAccount = async () => {
    if (!window.confirm('This will permanently delete your account. Continue?')) return
    try {
      const res = await fetch('/api/customer-portal/delete-account', {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to delete account')
      }
      toast.success('Your account has been deleted')
      await supabase.auth.signOut()
      router.push('/auth/login')
    } catch (err) {
      console.error('Delete account failed', err)
      toast.error(err.message || 'Could not delete account')
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 ${!loading ? styles.contentReveal : ''}`}>
      <PageTitle title="Settings" />
      <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
        {loading ? (
          <SettingsSkeleton />
        ) : (
          <>
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-1 w-12 bg-gradient-to-r from-[#079447] to-emerald-400 rounded-full" />
                <span className="text-sm font-medium text-[#079447] uppercase tracking-wider">Settings</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#1C294E] tracking-tight mb-2">Account Settings</h1>
              <p className="text-gray-600">Manage your profile, security, addresses, and payments</p>
            </div>

            {/* ============================================ */}
            {/* PROFILE INFORMATION (Name, Phone, Comm Pref) */}
            {/* ============================================ */}
            <Card padding="lg" className={`space-y-6 !rounded-2xl !shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100/80 `}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1C294E]">Profile Information</h2>
                  <p className="text-sm text-gray-500">Update your name, phone, and communication preferences</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={profileForm.first_name}
                  onChange={(e) => setProfileForm((p) => ({ ...p, first_name: e.target.value }))}
                  placeholder="John"
                  icon={<User className="w-4 h-4" />}
                />
                <Input
                  label="Last Name"
                  value={profileForm.last_name}
                  onChange={(e) => setProfileForm((p) => ({ ...p, last_name: e.target.value }))}
                  placeholder="Smith"
                />
                <Input
                  label="Phone Number"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                  icon={<Phone className="w-4 h-4" />}
                  placeholder="(512) 555-1234"
                />
                <div>
                  <label className="block text-sm font-medium text-[#1C294E] mb-2 flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-[#079447]" />
                    Birthday
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={profileForm.birth_month}
                      onChange={(e) => setProfileForm((p) => ({ ...p, birth_month: e.target.value }))}
                      disabled={profile?.birth_month && profile?.birth_day}
                      className={`w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#079447] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#079447]/20 transition-colors duration-200 text-[#1C294E] bg-white ${profile?.birth_month && profile?.birth_day ? 'bg-gray-50 cursor-not-allowed opacity-60' : ''}`}
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
                      value={profileForm.birth_day}
                      onChange={(e) => setProfileForm((p) => ({ ...p, birth_day: e.target.value }))}
                      disabled={profile?.birth_month && profile?.birth_day}
                      className={`w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#079447] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#079447]/20 transition-colors duration-200 text-[#1C294E] bg-white ${profile?.birth_month && profile?.birth_day ? 'bg-gray-50 cursor-not-allowed opacity-60' : ''}`}
                    >
                      <option value="">Day</option>
                      {[...Array(31)].map((_, i) => (
                        <option key={i + 1} value={String(i + 1)}>{i + 1}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Communication Preference</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['text', 'email', 'both'].map((value) => (
                      <button
                        key={value}
                        onClick={() => setProfileForm((p) => ({ ...p, communication_preference: value }))}
                        className={`border-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${profileForm.communication_preference === value
                          ? 'border-[#079447] bg-[#079447]/5 text-[#079447] shadow-sm'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                          } ${styles.smoothTransition}`}
                      >
                        {value === 'text' ? 'SMS' : value === 'email' ? 'Email' : 'Both'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button variant="primary" onClick={handleProfileSave} loading={savingProfile} className={styles.smoothTransition}>
                Save Profile
              </Button>
            </Card>

            {/* ============================================ */}
            {/* SECURITY & PASSWORD */}
            {/* ============================================ */}
            <Card padding="lg" className={`space-y-6 !rounded-2xl !shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100/80 `}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1C294E]">Security & Password</h2>
                  <p className="text-sm text-gray-500">Change your password (you'll be signed out after)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="password"
                  label="New Password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                  placeholder="Min 8 characters"
                  icon={<Lock className="w-4 h-4" />}
                />
                <Input
                  type="password"
                  label="Confirm New Password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password"
                />
              </div>
              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-xl border border-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-amber-700">Important:</span> After changing your password, you will be signed out and need to log in again with your new password.
                </p>
              </div>

              <Button variant="primary" onClick={handlePasswordChange} loading={savingPassword} className={styles.smoothTransition}>
                <KeyRound className="w-4 h-4" />
                Update Password
              </Button>
            </Card>

            {/* ============================================ */}
            {/* EMAIL CHANGE (Separate Section) */}
            {/* ============================================ */}
            <Card padding="lg" className={`space-y-6 !rounded-2xl !shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100/80 3`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1C294E]">Change Email Address</h2>
                  <p className="text-sm text-gray-500">Update the email you use to sign in</p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Current Email</p>
                <p className="font-semibold text-[#1C294E]">{user?.email}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <Input
                  label="New Email Address"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter new email address"
                  icon={<Mail className="w-4 h-4" />}
                />
                <Button variant="secondary" onClick={handleEmailChange} loading={sendingEmailLink} className={styles.smoothTransition}>
                  <Mail className="w-4 h-4" />
                  Send Confirmation Link
                </Button>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-xl border border-blue-100">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-700">
                  <p className="font-semibold text-[#1C294E] mb-1">How email change works:</p>
                  <ol className="list-decimal list-inside space-y-1 text-gray-600">
                    <li>Enter your new email and click "Send Confirmation Link"</li>
                    <li>Check your <strong>new</strong> email inbox for the confirmation link</li>
                    <li>Click the link to confirm - your login email will be updated immediately</li>
                    <li>Your old email will no longer work for signing in</li>
                  </ol>
                </div>
              </div>
            </Card>

            {/* ============================================ */}
            {/* SERVICE ADDRESSES */}
            {/* ============================================ */}
            <Card padding="lg" className={`space-y-4 !rounded-2xl !shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100/80 4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#1C294E]">Service Addresses</h2>
                    <p className="text-sm text-gray-500">{addresses.length} of 3 addresses used</p>
                  </div>
                </div>
                {addresses.length < 3 ? (
                  <Button variant="secondary" size="sm" onClick={() => openAddressModal(null)} className={styles.smoothTransition}>
                    <Plus className="w-4 h-4" />
                    Add Address
                  </Button>
                ) : (
                  <span className="text-xs text-gray-400 px-3 py-1.5 bg-gray-100 rounded-full">Maximum reached</span>
                )}
              </div>

              <div className="space-y-3">
                {addresses.length === 0 && (
                  <p className="text-gray-600 text-sm">No addresses yet. Add one to get started.</p>
                )}
                {addresses.map((addr) => {
                  // Registration address is locked - cannot be edited or deleted
                  const isLocked = addr.is_registration_address
                  
                  return (
                    <div key={addr.id} className={`border rounded-xl p-5 transition-all duration-200 ${
                      isLocked 
                        ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-green-50/30' 
                        : 'border-gray-200 bg-gradient-to-br from-white to-gray-50/50 hover:shadow-md'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 text-sm text-gray-700 flex-1 min-w-0">
                          <p className="font-bold text-[#1C294E] text-base">
                            {addr.street_address}{addr.unit ? `, ${addr.unit}` : ''}
                          </p>
                          <p className="text-gray-600">{addr.city}, {addr.state} {addr.zip_code}</p>
                          <div className="flex flex-wrap gap-2">
                            {isLocked && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                                <Home className="w-3.5 h-3.5" /> Primary Service Address
                              </span>
                            )}
                            {!isLocked && addr.is_primary && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                                <Star className="w-3.5 h-3.5 fill-emerald-600" /> Default for Appointments
                              </span>
                            )}
                            {!isLocked && !addr.is_primary && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                Additional Address
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Only show edit/delete buttons for non-registration addresses */}
                        {!isLocked && (
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <Button size="sm" variant="ghost" onClick={() => openAddressModal(addr)} className={`!p-2 ${styles.smoothTransition}`}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => deleteAddress(addr.id)} className={`!p-2 ${styles.smoothTransition}`}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                        {isLocked && (
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-400">
                              <Lock className="w-3 h-3" /> Locked
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Show "Make Primary" only for non-locked, non-primary addresses */}
                      {/* REMOVED: Users cannot change default address - must contact support */}
                    </div>
                  )
                })}
              </div>
              
              {/* Help text about addresses */}
              <p className="text-xs text-gray-500 mt-3 flex items-start gap-1.5">
                <Lock className="w-3 h-3 mt-0.5 flex-shrink-0" />
                Your primary service address is set during registration and cannot be changed. You can add up to 2 additional addresses for different service locations.
              </p>
            </Card>

            {/* ============================================ */}
            {/* PAYMENT METHODS */}
            {/* ============================================ */}
            <Card padding="lg" className={`space-y-5 !rounded-2xl !shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100/80 5`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-amber-600" />
                  </div>
                  <h2 className="text-xl font-bold text-[#1C294E]">Payment Methods</h2>
                </div>
              </div>

              <div className={`grid grid-cols-1 ${payments.length > 0 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-4`}>
                <div className={payments.length > 0 ? 'lg:col-span-2 space-y-3' : ''}>
                  {payments.length === 0 ? (
                    <div className="flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border-2 border-dashed border-slate-200 h-full min-h-[180px]">
                      <div className="text-center">
                        <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-600 font-semibold mb-1">No saved cards yet</p>
                        <p className="text-sm text-slate-400">Add a card for faster checkout</p>
                      </div>
                    </div>
                  ) : (
                    payments.map((pm) => {
                      // Show default badge if is_default OR if it's the only card
                      const showDefaultBadge = pm.is_default || payments.length === 1
                      // Only show "Make Default" if there are multiple cards and this one isn't default
                      const showMakeDefault = payments.length > 1 && !pm.is_default
                      
                      return (
                        <div key={pm.id} className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-white to-gray-50/50 hover:shadow-md transition-all duration-200">
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <p className="font-bold text-[#1C294E] text-base">
                                {pm.card_brand?.toUpperCase()} •••• {pm.card_last4}
                              </p>
                              <p className="text-sm text-gray-600">
                                Expires {pm.card_exp_month}/{pm.card_exp_year}
                              </p>
                              {showDefaultBadge && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                                  <CreditCard className="w-3.5 h-3.5" /> Default Payment
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <Button size="sm" variant="danger" onClick={() => deletePaymentMethod(pm.id)} className={`!p-2 ${styles.smoothTransition}`}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          {showMakeDefault && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <Button size="sm" variant="ghost" onClick={() => makeDefaultCard(pm.stripe_payment_method_id)} className={`text-xs ${styles.smoothTransition}`}>
                                Make Default
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-5 space-y-4 bg-gradient-to-br from-gray-50/80 to-slate-50/80">
                  <p className="text-sm font-bold text-[#1C294E] flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-blue-600" />
                    </div>
                    Add New Card
                  </p>
                  
                  {/* Card Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Card Number</label>
                    <div 
                      ref={cardNumberRef} 
                      className={`border-2 rounded-xl px-4 py-3.5 bg-white min-h-[48px] transition-all duration-200 ${
                        cardState.numberError 
                          ? 'border-red-300 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100' 
                          : cardState.numberComplete 
                            ? 'border-emerald-300 focus-within:border-emerald-400' 
                            : 'border-gray-200 focus-within:border-[#079447] focus-within:ring-2 focus-within:ring-[#079447]/10'
                      }`} 
                    />
                    {cardState.numberError && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {cardState.numberError}
                      </p>
                    )}
                  </div>
                  
                  {/* Expiry and CVC Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Expiry</label>
                      <div 
                        ref={cardExpiryRef} 
                        className={`border-2 rounded-xl px-4 py-3.5 bg-white min-h-[48px] transition-all duration-200 ${
                          cardState.expiryError 
                            ? 'border-red-300 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100' 
                            : cardState.expiryComplete 
                              ? 'border-emerald-300 focus-within:border-emerald-400' 
                              : 'border-gray-200 focus-within:border-[#079447] focus-within:ring-2 focus-within:ring-[#079447]/10'
                        }`} 
                      />
                      {cardState.expiryError && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {cardState.expiryError}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">CVC</label>
                      <div 
                        ref={cardCvcRef} 
                        className={`border-2 rounded-xl px-4 py-3.5 bg-white min-h-[48px] transition-all duration-200 ${
                          cardState.cvcError 
                            ? 'border-red-300 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100' 
                            : cardState.cvcComplete 
                              ? 'border-emerald-300 focus-within:border-emerald-400' 
                              : 'border-gray-200 focus-within:border-[#079447] focus-within:ring-2 focus-within:ring-[#079447]/10'
                        }`} 
                      />
                      {cardState.cvcError && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {cardState.cvcError}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Validation Status */}
                  {cardComplete && !cardError && (
                    <div className="flex items-center gap-2 p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                      <Shield className="w-4 h-4 text-emerald-600" />
                      <p className="text-xs text-emerald-700 font-medium">Card details complete - ready to save</p>
                    </div>
                  )}

                  <Button 
                    variant="primary" 
                    fullWidth 
                    onClick={handleAddCard} 
                    disabled={processingCard || !cardComplete} 
                    className={`${styles.smoothTransition} ${!cardComplete && !processingCard ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {processingCard ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        {cardComplete ? 'Save Card' : 'Enter Card Details'}
                      </>
                    )}
                  </Button>
                  
                  <div className="flex items-start gap-2 pt-1">
                    <Lock className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-500">
                      Your card is securely encrypted and stored with Stripe.
                    </p>
                  </div>
                </div>
              </div>

              {/* Security Trust Badge */}
              <div className="mt-6 pt-5 border-t border-gray-100">
                <div className="flex items-center justify-center gap-3 sm:gap-6 overflow-x-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-[11px] font-semibold text-slate-700">256-bit SSL</p>
                      <p className="text-[9px] text-slate-400">Encryption</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-[11px] font-semibold text-slate-700">Stripe Secure</p>
                      <p className="text-[9px] text-slate-400">PCI Compliant</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-[11px] font-semibold text-slate-700">Bank-Level</p>
                      <p className="text-[9px] text-slate-400">Security</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* ============================================ */}
            {/* SUPPORT & HELP */}
            {/* ============================================ */}
            <Card padding="lg" className={`space-y-4 !rounded-2xl !shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100/80 6`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-teal-600" />
                </div>
                <h2 className="text-xl font-bold text-[#1C294E]">Support & Help</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Bell className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1C294E] mb-1">Business Hours</p>
                      <p className="text-sm text-gray-700 font-medium">7:00 AM - 6:30 PM</p>
                      <p className="text-xs text-gray-600 mt-0.5">Monday - Saturday</p>
                    </div>
                  </div>
                </div>
                <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1C294E] mb-1">Contact Support</p>
                      <a href="tel:5122775364" className="text-sm text-[#079447] hover:text-emerald-700 font-semibold block transition-colors">
                        (512) 277-5364
                      </a>
                      <a href="mailto:admin@impressyoucleaning.com" className="text-xs text-[#079447] hover:text-emerald-700 font-semibold transition-colors">
                        Email Us
                      </a>
                    </div>
                  </div>
                </div>
                <div className="p-5 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 border border-red-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1C294E] mb-1">Emergency Contact</p>
                      <a href="tel:5127382642" className="text-sm text-[#079447] hover:text-emerald-700 font-semibold block transition-colors">
                        (512) 738-2642
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* ============================================ */}
            {/* DANGER ZONE - DELETE ACCOUNT */}
            {/* ============================================ */}
            <Card padding="lg" className={`space-y-4 !rounded-2xl !shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border-2 border-red-100 bg-gradient-to-br from-red-50/30 to-white 7`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-red-600">Danger Zone</h2>
              </div>
              <div className="p-4 bg-red-50 rounded-xl border border-red-200 w-fit">
                <p className="text-sm text-gray-700 font-medium mb-1">
                  <span className="font-bold text-red-700">Warning:</span> This action is permanent
                </p>
                <p className="text-sm text-gray-600">
                  Permanently delete your account. This action cannot be undone.
                </p>
              </div>
              <Button variant="danger" onClick={handleDeleteAccount} className={styles.smoothTransition}>
                <Trash2 className="w-4 h-4" />
                Delete My Account
              </Button>
            </Card>
          </>
        )}

        {/* Address Modal - Outside conditional so it stays mounted */}
        <Modal
          isOpen={addressModal.open}
          onClose={() => setAddressModal({ open: false, editing: null })}
          title={addressModal.editing ? 'Edit Address' : 'Add Address'}
        >
          <div className="space-y-3">
            <Input
              label="Street Address"
              value={addressForm.street_address}
              onChange={(e) => setAddressForm((p) => ({ ...p, street_address: e.target.value }))}
            />
            <Input
              label="Unit / Apt (optional)"
              value={addressForm.unit}
              onChange={(e) => setAddressForm((p) => ({ ...p, unit: e.target.value }))}
            />
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="City"
                value={addressForm.city}
                onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))}
              />
              <Input
                label="State"
                value={addressForm.state}
                onChange={(e) => setAddressForm((p) => ({ ...p, state: e.target.value }))}
                maxLength={2}
              />
              <Input
                label="ZIP"
                value={addressForm.zip_code}
                onChange={(e) => setAddressForm((p) => ({ ...p, zip_code: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="ghost" onClick={() => setAddressModal({ open: false, editing: null })} className={styles.smoothTransition}>
                Cancel
              </Button>
              <Button variant="primary" onClick={saveAddress} className={styles.smoothTransition}>
                Save
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}
