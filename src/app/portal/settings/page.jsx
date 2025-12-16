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
  ShieldCheck,
  Lock,
  Fingerprint,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import { SettingsSkeleton } from '@/components/ui/SkeletonLoader'
import toast from 'react-hot-toast'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
)

import { sanitizeText, sanitizePhone, sanitizeEmail } from '@/lib/sanitize'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [user, setUser] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [payments, setPayments] = useState([])

  // Profile form (name, phone, communication only)
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
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
  const cardElementRef = useRef(null)
  const stripeCardRef = useRef(null)

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
          full_name: profileData?.full_name || '',
          phone: profileData?.phone || '',
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
    const mountCardElement = async () => {
      if (!cardElementRef.current || stripeCardRef.current) return
      const stripe = await stripePromise
      if (!stripe) return
      const elements = stripe.elements()
      const card = elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#1C294E',
            '::placeholder': { color: '#9ca3af' },
          },
        },
      })
      card.mount(cardElementRef.current)
      stripeCardRef.current = { stripe, card }
    }
    const timer = setTimeout(mountCardElement, 150)
    return () => clearTimeout(timer)
  }, [loading])

  useEffect(() => {
    return () => {
      if (stripeCardRef.current?.card) {
        stripeCardRef.current.card.unmount()
      }
    }
  }, [])

  // ============================================
  // PROFILE SAVE (name, phone, communication only)
  // ============================================
  const handleProfileSave = async () => {
    if (!user) return
    setSavingProfile(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: sanitizeText(profileForm.full_name),
          phone: sanitizePhone(profileForm.phone),
          communication_preference: profileForm.communication_preference,
          updated_at: new Date().toISOString(),
        })
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
      // Check if we're deleting the primary address
      const addressToDelete = addresses.find(a => a.id === id)
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
  const setPrimaryAddress = async (id) => {
    if (!user) return
    try {
      await supabase.from('service_addresses').update({ is_primary: false }).eq('user_id', user.id)
      await supabase.from('service_addresses').update({ is_primary: true }).eq('id', id).eq('user_id', user.id)
      const { data: addressData } = await supabase
        .from('service_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false })
      setAddresses(addressData || [])
      toast.success('Primary address updated')
    } catch (err) {
      console.error('Primary address error', err)
      toast.error(err.message || 'Could not set primary address')
    }
  }

  // ============================================
  // PAYMENT METHODS
  // ============================================
  const handleAddCard = async () => {
    if (!stripeCardRef.current?.stripe || !stripeCardRef.current?.card) {
      toast.error('Payment form not ready')
      return
    }
    setProcessingCard(true)
    try {
      const createRes = await fetch('/api/stripe/create-setup-intent', { method: 'POST' })
      const { clientSecret, error: createError } = await createRes.json()
      if (createError || !clientSecret) throw new Error(createError || 'Unable to start card setup')

      const { stripe, card } = stripeCardRef.current
      const result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: { card },
      })
      if (result.error) throw new Error(result.error.message)

      const pmId = result.setupIntent.payment_method
      const saveRes = await fetch('/api/stripe/save-payment-method', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId: pmId, makeDefault: true }),
      })
      const saveJson = await saveRes.json()
      if (saveJson.error) throw new Error(saveJson.error)

      const { data: paymentData } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
      setPayments(paymentData || [])
      toast.success('Card saved')
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
        <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <SettingsSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 ${styles.contentReveal}`}>
      <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className={styles.cardReveal}>
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
        <Card padding="lg" className={`space-y-6 !rounded-2xl !shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100/80 ${styles.cardReveal1}`}>
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
              label="Full Name"
              value={profileForm.full_name}
              onChange={(e) => setProfileForm((p) => ({ ...p, full_name: e.target.value }))}
              placeholder="Your full name"
            />
            <Input
              label="Phone Number"
              value={profileForm.phone}
              onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
              icon={<Phone className="w-4 h-4" />}
              placeholder="(512) 555-1234"
            />
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
                      }`}
                  >
                    {value === 'text' ? 'SMS' : value === 'email' ? 'Email' : 'Both'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button variant="primary" onClick={handleProfileSave} loading={savingProfile}>
            Save Profile
          </Button>
        </Card>

        {/* ============================================ */}
        {/* SECURITY & PASSWORD */}
        {/* ============================================ */}
        <Card padding="lg" className={`space-y-6 !rounded-2xl !shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100/80 ${styles.cardReveal2}`}>
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

          <Button variant="primary" onClick={handlePasswordChange} loading={savingPassword}>
            <KeyRound className="w-4 h-4" />
            Update Password
          </Button>
        </Card>

        {/* ============================================ */}
        {/* EMAIL CHANGE (Separate Section) */}
        {/* ============================================ */}
        <Card padding="lg" className={`space-y-6 !rounded-2xl !shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100/80 ${styles.cardReveal3}`}>
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
            <Button variant="secondary" onClick={handleEmailChange} loading={sendingEmailLink}>
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
        <Card padding="lg" className={`space-y-4 !rounded-2xl !shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100/80 ${styles.cardReveal4}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-[#1C294E]">Service Addresses</h2>
            </div>
            <Button variant="secondary" size="sm" onClick={() => openAddressModal(null)}>
              <Plus className="w-4 h-4" />
              Add Address
            </Button>
          </div>

          <div className="space-y-3">
            {addresses.length === 0 && (
              <p className="text-gray-600 text-sm">No addresses yet. Add one to get started.</p>
            )}
            {addresses.map((addr) => (
              <div key={addr.id} className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-white to-gray-50/50 hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 text-sm text-gray-700 flex-1 min-w-0">
                    <p className="font-bold text-[#1C294E] text-base">
                      {addr.street_address}{addr.unit ? `, ${addr.unit}` : ''}
                    </p>
                    <p className="text-gray-600">{addr.city}, {addr.state} {addr.zip_code}</p>
                    {addr.is_primary && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                        <Star className="w-3.5 h-3.5 fill-emerald-600" /> Primary Address
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => openAddressModal(addr)} className="!p-2">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => deleteAddress(addr.id)} className="!p-2">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {!addr.is_primary && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <Button size="sm" variant="ghost" onClick={() => setPrimaryAddress(addr.id)} className="text-xs">
                      Make Primary
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* ============================================ */}
        {/* PAYMENT METHODS */}
        {/* ============================================ */}
        <Card padding="lg" className={`space-y-5 !rounded-2xl !shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100/80 ${styles.cardReveal5}`}>
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
                payments.map((pm) => (
                  <div key={pm.id} className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-white to-gray-50/50 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <p className="font-bold text-[#1C294E] text-base">
                          {pm.card_brand?.toUpperCase()} •••• {pm.card_last4}
                        </p>
                        <p className="text-sm text-gray-600">
                          Expires {pm.card_exp_month}/{pm.card_exp_year}
                        </p>
                        {pm.is_default && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                            <Star className="w-3.5 h-3.5 fill-amber-600" /> Default Card
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Button size="sm" variant="danger" onClick={() => deletePaymentMethod(pm.id)} className="!p-2">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {!pm.is_default && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <Button size="sm" variant="ghost" onClick={() => makeDefaultCard(pm.stripe_payment_method_id)} className="text-xs">
                          Make Default
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 space-y-4 bg-gradient-to-br from-gray-50 to-slate-50">
              <p className="text-sm font-bold text-[#1C294E] flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                </div>
                Add New Card
              </p>
              <div ref={cardElementRef} className="border-2 border-gray-200 rounded-xl p-3 bg-white" />
              <Button variant="primary" fullWidth onClick={handleAddCard} disabled={processingCard}>
                {processingCard ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                Save Card
              </Button>
              <div className="flex items-start gap-2 pt-2">
                <Shield className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600">
                  Cards are securely stored with Stripe. We never see your full card number.
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
        <Card padding="lg" className={`space-y-4 !rounded-2xl !shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100/80 ${styles.cardReveal6}`}>
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
        <Card padding="lg" className={`space-y-4 !rounded-2xl !shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border-2 border-red-100 bg-gradient-to-br from-red-50/30 to-white ${styles.cardReveal7}`}>
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
          <Button variant="danger" onClick={handleDeleteAccount}>
            <Trash2 className="w-4 h-4" />
            Delete My Account
          </Button>
        </Card>

        {/* Address Modal */}
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
              <Button variant="ghost" onClick={() => setAddressModal({ open: false, editing: null })}>
                Cancel
              </Button>
              <Button variant="primary" onClick={saveAddress}>
                Save
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}