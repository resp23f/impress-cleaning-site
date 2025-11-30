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
  Loader2,
} from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import { DashboardSkeleton } from '@/components/ui/SkeletonLoader'
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

      // sign out and send them away
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
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
     <DashboardSkeleton />
    </div>
   </div>
  )
 }
   return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
     <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      <div className={styles.animateFadeIn}>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-1 w-12 bg-gradient-to-r from-[#079447] to-emerald-400 rounded-full" />
          <span className="text-sm font-medium text-[#079447] uppercase tracking-wider">Settings</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1C294E] tracking-tight mb-2">Account Settings</h1>
        <p className="text-gray-600">Manage your profile, addresses, and payments</p>
      </div>
      {/* Profile */}
      <Card padding="lg" className={`space-y-6 !rounded-2xl !shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100/80 ${styles.animateFadeInUp} ${styles.stagger1}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-[#1C294E]">Profile Information</h2>
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
            <label className="text-sm font-medium text-gray-700 mb-2 block">Communication Preference</label>
            <div className="grid grid-cols-3 gap-2">
              {['text', 'email', 'both'].map((value) => (
                <button
                  key={value}
                  onClick={() => setPref(value)}
                  className={`border-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    pref === value
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
      <Card padding="lg" className={`space-y-4 !rounded-2xl !shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100/80 ${styles.animateFadeInUp} ${styles.stagger2}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-[#1C294E]">Service Addresses</h2>
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
            <div key={addr.id} className="border border-gray-200 rounded-xl p-5 flex items-start justify-between bg-gradient-to-br from-white to-gray-50/50 hover:shadow-md transition-all duration-200">
              <div className="space-y-1.5 text-sm text-gray-700">
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
      <Card padding="lg" className={`space-y-4 !rounded-2xl !shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100/80 ${styles.animateFadeInUp} ${styles.stagger3}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-xl font-bold text-[#1C294E]">Security & Password</h2>
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
        <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-xl border border-blue-100">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-[#1C294E]">Security Notice:</span> Changing your password will sign you out of all active sessions on other devices.
          </p>
        </div>
      </Card>
      {/* Payment methods */}
      <Card padding="lg" className={`space-y-5 !rounded-2xl !shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100/80 ${styles.animateFadeInUp} ${styles.stagger4}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-[#1C294E]">Payment Methods</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            {payments.length === 0 && (
              <p className="text-sm text-gray-600">No saved cards yet.</p>
            )}
            {payments.map((pm) => (
              <div key={pm.id} className="border border-gray-200 rounded-xl p-5 flex items-center justify-between bg-gradient-to-br from-white to-gray-50/50 hover:shadow-md transition-all duration-200">
                <div className="space-y-1.5">
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
      </Card>
      {/* Support & Help */}
<Card padding="lg" className={`space-y-4 !rounded-2xl !shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100/80 ${styles.animateFadeInUp} ${styles.stagger5}`}>
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center">
      <Phone className="w-5 h-5 text-teal-600" />
    </div>
    <h2 className="text-xl font-bold text-[#1C294E]">Support & Help</h2>
  </div>
  
  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
    <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
      <div className="flex items-start gap-3 mb-3">
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
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Phone className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#1C294E] mb-1">Contact Support</p>
          <a href="tel:5122775364" className="text-sm text-[#079447] hover:text-emerald-700 font-semibold block transition-colors">
            (512) 277-5364
          </a>
        </div>
      </div>
    </div>

    <div className="p-5 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 border border-red-100">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#1C294E] mb-1">Emergency Contact</p>
          <a href="tel:5127382642" className="text-sm text-[#079447] hover:text-emerald-700 font-semibold block mb-1 transition-colors">
            (512) 738-2642
          </a>
          <a href="mailto:notifications@impressyoucleaning.com" className="text-xs text-gray-600 hover:text-[#079447] font-medium transition-colors">
            notifications@impressyoucleaning.com
          </a>
        </div>
      </div>
    </div>
  </div>
</Card>
      {/* Account deletion */}
      <Card padding="lg" className={`space-y-4 !rounded-2xl !shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] border-2 border-red-100 bg-gradient-to-br from-red-50/30 to-white ${styles.animateFadeInUp} ${styles.stagger6}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-red-600">Danger Zone</h2>
        </div>
        <div className="p-4 bg-red-50 rounded-xl border border-red-200">
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
      <Modal
        isOpen={addressModal.open}
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
    </div>
  )
}
