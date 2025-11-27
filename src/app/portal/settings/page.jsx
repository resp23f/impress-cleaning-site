'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
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
  Loader2,
} from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
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
  const [savingProfile, setSavingProfile] = useState(false)
  const [passwordData, setPasswordData] = useState({ password: '', confirm: '' })
  const [addressModal, setAddressModal] = useState({ open: false, editing: null })
  const [addressForm, setAddressForm] = useState({
    street_address: '',
    unit: '',
    city: '',
    state: '',
    zip_code: '',
    is_primary: false,
  })
  const [processingCard, setProcessingCard] = useState(false)
  const [cardElementMounted, setCardElementMounted] = useState(false)
  const cardElementRef = useRef(null)
  const stripeCardRef = useRef(null)
  const [pref, setPref] = useState('both')
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
        setPref(profileData?.communication_preference || 'both')
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
    const mountCardElement = async () => {
      if (!cardElementRef.current || cardElementMounted) return
      const stripe = await stripePromise
      if (!stripe) return
      const elements = stripe.elements()
      const card = elements.create('card')
      card.mount(cardElementRef.current)
      stripeCardRef.current = { stripe, card }
      setCardElementMounted(true)
    }
    mountCardElement()
    return () => {
      if (stripeCardRef.current?.card) {
        stripeCardRef.current.card.unmount()
      }
    }
  }, [cardElementMounted])
const handleProfileSave = async () => {
  if (!user || !profile) return
  setSavingProfile(true)
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: sanitizeText(profile.full_name),
        phone: sanitizePhone(profile.phone),
        communication_preference: pref,
      })
      .eq('id', user.id)
    
    if (error) throw error
    toast.success('Profile updated')
  } catch (err) {
    console.error('Profile update error', err)
    toast.error(err.message || 'Could not update profile')
  } finally {
    setSavingProfile(false)
  }
}
  const handleEmailUpdate = async () => {
    if (!user || !profile?.email) {
      toast.error('Email is required')
      return
    }
    try {
      const { error } = await supabase.auth.updateUser({ email: profile.email })
      if (error) throw error
      toast.success('Email update requested. Check your inbox to confirm.')
    } catch (err) {
      console.error('Email update error', err)
      toast.error(err.message || 'Could not update email')
    }
  }
  const handlePasswordChange = async () => {
    if (passwordData.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (passwordData.password !== passwordData.confirm) {
      toast.error('Passwords do not match')
      return
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordData.password })
      if (error) throw error
      toast.success('Password updated')
      setPasswordData({ password: '', confirm: '' })
    } catch (err) {
      console.error('Password change error', err)
      toast.error(err.message || 'Could not change password')
    }
  }
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
      if (addressModal.editing) {
        const { error } = await supabase
          .from('service_addresses')
          .update(addressForm)
          .eq('id', addressModal.editing)
          .eq('user_id', user.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('service_addresses')
          .insert({ ...addressForm, user_id: user.id })
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
      const { error } = await supabase
        .from('service_addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
      if (error) throw error
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
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1C294E]">Settings</h1>
        <p className="text-gray-600">Manage your profile, addresses, and payments</p>
      </div>
      {/* Profile */}
      <Card padding="lg" className="space-y-6">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-[#079447]" />
          <h2 className="text-xl font-semibold text-[#1C294E]">Profile</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full name"
            value={profile?.full_name || ''}
            onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
          />
          <Input
            label="Phone"
            value={profile?.phone || ''}
            onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
            icon={<Phone className="w-4 h-4" />}
          />
          <Input
            label="Email"
            value={profile?.email || user?.email || ''}
            onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
            icon={<Mail className="w-4 h-4" />}
          />
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Communication</label>
            <div className="grid grid-cols-3 gap-2">
              {['text', 'email', 'both'].map((value) => (
                <button
                  key={value}
                  onClick={() => setPref(value)}
                  className={`border rounded-md px-3 py-2 text-sm ${pref === value ? 'border-[#079447] text-[#079447]' : 'border-gray-200 text-gray-700'}`}
                >
                  {value === 'text' ? 'SMS' : value === 'email' ? 'Email' : 'Both'}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" onClick={handleProfileSave} loading={savingProfile}>
            Save profile
          </Button>
          <Button variant="secondary" onClick={handleEmailUpdate}>
            Send email update link
          </Button>
        </div>
      </Card>
      {/* Addresses */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#079447]" />
            <h2 className="text-xl font-semibold text-[#1C294E]">Service addresses</h2>
          </div>
          <Button variant="secondary" size="sm" onClick={() => openAddressModal(null)}>
            <Plus className="w-4 h-4" />
            Add address
          </Button>
        </div>
        <div className="space-y-3">
          {addresses.length === 0 && (
            <p className="text-gray-600 text-sm">No addresses yet. Add one to get started.</p>
          )}
          {addresses.map((addr) => (
            <div key={addr.id} className="border border-gray-200 rounded-lg p-4 flex items-start justify-between">
              <div className="space-y-1 text-sm text-gray-700">
                <p className="font-semibold text-[#1C294E]">
                  {addr.street_address}{addr.unit ? `, ${addr.unit}` : ''}
                </p>
                <p>{addr.city}, {addr.state} {addr.zip_code}</p>
                {addr.is_primary && (
                  <span className="inline-flex items-center gap-1 text-[#079447] text-xs font-medium">
                    <Star className="w-4 h-4" /> Primary
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {!addr.is_primary && (
                  <Button size="sm" variant="ghost" onClick={() => setPrimaryAddress(addr.id)}>
                    Make primary
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => openAddressModal(addr)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="danger" onClick={() => deleteAddress(addr.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      {/* Password */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-[#079447]" />
          <h2 className="text-xl font-semibold text-[#1C294E]">Security</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            type="password"
            label="New password"
            value={passwordData.password}
            onChange={(e) => setPasswordData((p) => ({ ...p, password: e.target.value }))}
          />
          <Input
            type="password"
            label="Confirm password"
            value={passwordData.confirm}
            onChange={(e) => setPasswordData((p) => ({ ...p, confirm: e.target.value }))}
          />
          <div className="flex items-end">
            <Button variant="primary" onClick={handlePasswordChange}>
              Update password
            </Button>
          </div>
        </div>
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <Shield className="w-4 h-4 text-gray-400" />
          Changing your password will sign you out of active sessions.
        </div>
      </Card>
      {/* Payment methods */}
      <Card padding="lg" className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#079447]" />
            <h2 className="text-xl font-semibold text-[#1C294E]">Payment methods</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            {payments.length === 0 && (
              <p className="text-sm text-gray-600">No saved cards yet.</p>
            )}
            {payments.map((pm) => (
              <div key={pm.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[#1C294E]">
                    {pm.card_brand?.toUpperCase()} •••• {pm.card_last4}
                  </p>
                  <p className="text-sm text-gray-600">
                    Expires {pm.card_exp_month}/{pm.card_exp_year}
                  </p>
                  {pm.is_default && (
                    <span className="inline-flex items-center gap-1 text-xs text-[#079447] font-medium">
                      <Star className="w-4 h-4" /> Default
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {!pm.is_default && (
                    <Button size="sm" variant="ghost" onClick={() => makeDefaultCard(pm.stripe_payment_method_id)}>
                      Make default
                    </Button>
                  )}
                  <Button size="sm" variant="danger" onClick={() => deletePaymentMethod(pm.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="border border-gray-200 rounded-lg p-4 space-y-3">
            <p className="text-sm font-semibold text-[#1C294E] flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-500" />
              Add a new card
            </p>
            <div ref={cardElementRef} className="border border-dashed border-gray-300 rounded-md p-3 bg-white" />
            <Button variant="primary" fullWidth onClick={handleAddCard} disabled={processingCard}>
              {processingCard ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              Save card
            </Button>
            <p className="text-xs text-gray-500">
              Cards are securely stored with Stripe. We never see your full card number.
            </p>
          </div>
        </div>
      </Card>
      {/* Account deletion */}
      <Card padding="lg" className="space-y-3 border border-red-100">
        <div className="flex items-center gap-2 text-red-600">
          <Trash2 className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Delete account</h2>
        </div>
        <p className="text-sm text-gray-700">
          Permanently delete your account and data. This action cannot be undone.
        </p>
        <Button variant="danger" onClick={() => router.push('/auth/support')}>
          Request deletion
        </Button>
      </Card>
      <Modal
        open={addressModal.open}
        onClose={() => setAddressModal({ open: false, editing: null })}
        title={addressModal.editing ? 'Edit address' : 'Add address'}
      >
        <div className="space-y-3">
          <Input
            label="Street address"
            value={addressForm.street_address}
            onChange={(e) => setAddressForm((p) => ({ ...p, street_address: e.target.value }))}
          />
          <Input
            label="Unit"
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
  )
}
