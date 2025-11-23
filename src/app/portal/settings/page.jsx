'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import PasswordInput from '@/components/ui/PasswordInput'
import Modal from '@/components/ui/Modal'
import { User, MapPin, CreditCard, Lock, Bell, Mail, Phone, Plus, Edit2, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saveLoading, setSaveLoading] = useState(false)

  // Profile state
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    communication_preference: 'both',
  })

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Addresses state
  const [addresses, setAddresses] = useState([])
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [addressForm, setAddressForm] = useState({
    address_name: '',
    address: '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: '',
    is_default: false,
  })

  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchUserData()
  }, [])

  async function fetchUserData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile({
          full_name: profileData.full_name || '',
          email: profileData.email || user.email,
          phone: profileData.phone || '',
          communication_preference: profileData.communication_preference || 'both',
        })
      }

      // Fetch addresses
      const { data: addressData } = await supabase
        .from('service_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      setAddresses(addressData || [])

      // Fetch payment methods
      const { data: paymentData } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      setPaymentMethods(paymentData || [])

    } catch (error) {
      console.error('Error fetching user data:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveProfile() {
    setSaveLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          communication_preference: profile.communication_preference,
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaveLoading(false)
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setSaveLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      toast.success('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Failed to change password')
    } finally {
      setSaveLoading(false)
    }
  }

  async function handleSaveAddress() {
    if (!addressForm.address_name || !addressForm.address || !addressForm.city || !addressForm.state || !addressForm.zip_code) {
      toast.error('Please fill in all required fields')
      return
    }

    setSaveLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (editingAddress) {
        // Update existing address
        const { error } = await supabase
          .from('service_addresses')
          .update(addressForm)
          .eq('id', editingAddress.id)

        if (error) throw error
        toast.success('Address updated successfully!')
      } else {
        // Create new address
        const { error } = await supabase
          .from('service_addresses')
          .insert([{ ...addressForm, user_id: user.id }])

        if (error) throw error
        toast.success('Address added successfully!')
      }

      setShowAddressModal(false)
      setEditingAddress(null)
      resetAddressForm()
      fetchUserData()
    } catch (error) {
      console.error('Error saving address:', error)
      toast.error('Failed to save address')
    } finally {
      setSaveLoading(false)
    }
  }

  async function handleDeleteAddress(addressId) {
    if (!confirm('Are you sure you want to delete this address?')) return

    try {
      const { error } = await supabase
        .from('service_addresses')
        .delete()
        .eq('id', addressId)

      if (error) throw error

      toast.success('Address deleted successfully!')
      fetchUserData()
    } catch (error) {
      console.error('Error deleting address:', error)
      toast.error('Failed to delete address')
    }
  }

  async function handleDeletePaymentMethod(methodId) {
    if (!confirm('Are you sure you want to delete this payment method?')) return

    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', methodId)

      if (error) throw error

      toast.success('Payment method deleted successfully!')
      fetchUserData()
    } catch (error) {
      console.error('Error deleting payment method:', error)
      toast.error('Failed to delete payment method')
    }
  }

  function openAddAddressModal() {
    resetAddressForm()
    setEditingAddress(null)
    setShowAddressModal(true)
  }

  function openEditAddressModal(address) {
    setAddressForm({
      address_name: address.address_name || '',
      address: address.address || '',
      address_line2: address.address_line2 || '',
      city: address.city || '',
      state: address.state || '',
      zip_code: address.zip_code || '',
      is_default: address.is_default || false,
    })
    setEditingAddress(address)
    setShowAddressModal(true)
  }

  function resetAddressForm() {
    setAddressForm({
      address_name: '',
      address: '',
      address_line2: '',
      city: '',
      state: '',
      zip_code: '',
      is_default: false,
    })
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'payments', label: 'Payment Methods', icon: CreditCard },
  ]

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1C294E] mb-2">Account Settings</h1>
        <p className="text-gray-600">Manage your profile and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="whitespace-nowrap"
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          )
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card>
          <h2 className="text-xl font-bold text-[#1C294E] mb-6">Profile Information</h2>
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              icon={User}
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={profile.email}
              disabled
              icon={Mail}
              helperText="Email cannot be changed. Contact support if needed."
            />

            <Input
              label="Phone Number"
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              icon={Phone}
              placeholder="(555) 555-5555"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Bell className="w-4 h-4 inline mr-1" />
                Communication Preference
              </label>
              <div className="space-y-2">
                {['email', 'sms', 'both', 'none'].map((pref) => (
                  <label key={pref} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="communication_preference"
                      value={pref}
                      checked={profile.communication_preference === pref}
                      onChange={(e) => setProfile({ ...profile, communication_preference: e.target.value })}
                      className="w-4 h-4 text-[#079447] focus:ring-[#079447]"
                    />
                    <span className="capitalize">{pref}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <Button onClick={handleSaveProfile} loading={saveLoading}>
                Save Changes
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <Card>
          <h2 className="text-xl font-bold text-[#1C294E] mb-6">Change Password</h2>
          <div className="space-y-4">
            <PasswordInput
              label="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />

            <PasswordInput
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              helperText="Must be at least 8 characters"
              required
            />

            <PasswordInput
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <div className="pt-4">
              <Button onClick={handleChangePassword} loading={saveLoading}>
                Change Password
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Addresses Tab */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#1C294E]">Service Addresses</h2>
            <Button onClick={openAddAddressModal}>
              <Plus className="w-4 h-4 mr-2" />
              Add Address
            </Button>
          </div>

          {addresses.length === 0 ? (
            <Card className="text-center py-12">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No addresses saved</h3>
              <p className="text-gray-500 mb-6">Add a service address to get started</p>
              <Button onClick={openAddAddressModal}>
                <Plus className="w-4 h-4 mr-2" />
                Add Address
              </Button>
            </Card>
          ) : (
            addresses.map((address) => (
              <Card key={address.id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-[#1C294E]">{address.address_name}</h3>
                      {address.is_default && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700">{address.address}</p>
                    {address.address_line2 && <p className="text-gray-700">{address.address_line2}</p>}
                    <p className="text-gray-700">
                      {address.city}, {address.state} {address.zip_code}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openEditAddressModal(address)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteAddress(address.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Payment Methods Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#1C294E]">Payment Methods</h2>
            <Button onClick={() => setShowPaymentModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
          </div>

          {paymentMethods.length === 0 ? (
            <Card className="text-center py-12">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No payment methods saved</h3>
              <p className="text-gray-500 mb-6">Add a payment method for faster checkout</p>
              <Button onClick={() => setShowPaymentModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </Card>
          ) : (
            paymentMethods.map((method) => (
              <Card key={method.id}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <CreditCard className="w-6 h-6 text-[#079447]" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[#1C294E] capitalize">
                          {method.card_brand} •••• {method.last_four}
                        </span>
                        {method.is_default && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Expires {method.expiry_month}/{method.expiry_year}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeletePaymentMethod(method.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Address Modal */}
      {showAddressModal && (
        <Modal
          onClose={() => {
            setShowAddressModal(false)
            setEditingAddress(null)
          }}
          title={editingAddress ? 'Edit Address' : 'Add New Address'}
        >
          <div className="space-y-4">
            <Input
              label="Address Name"
              value={addressForm.address_name}
              onChange={(e) => setAddressForm({ ...addressForm, address_name: e.target.value })}
              placeholder="Home, Office, etc."
              required
            />

            <Input
              label="Street Address"
              value={addressForm.address}
              onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
              required
            />

            <Input
              label="Apartment, Suite, etc. (Optional)"
              value={addressForm.address_line2}
              onChange={(e) => setAddressForm({ ...addressForm, address_line2: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                value={addressForm.city}
                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                required
              />

              <Input
                label="State"
                value={addressForm.state}
                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                placeholder="TX"
                maxLength={2}
                required
              />
            </div>

            <Input
              label="ZIP Code"
              value={addressForm.zip_code}
              onChange={(e) => setAddressForm({ ...addressForm, zip_code: e.target.value })}
              placeholder="78701"
              maxLength={5}
              required
            />

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={addressForm.is_default}
                onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                className="w-4 h-4 text-[#079447] focus:ring-[#079447] rounded"
              />
              <span className="text-sm text-gray-700">Set as default address</span>
            </label>

            <div className="flex gap-2 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAddressModal(false)
                  setEditingAddress(null)
                }}
                fullWidth
                disabled={saveLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveAddress} fullWidth loading={saveLoading}>
                {editingAddress ? 'Update' : 'Add'} Address
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <Modal onClose={() => setShowPaymentModal(false)} title="Add Payment Method">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Payment method integration with Stripe will be completed in the next phase.
                For now, you can add payment methods when paying invoices.
              </p>
            </div>
            <Button onClick={() => setShowPaymentModal(false)} fullWidth>
              Close
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
