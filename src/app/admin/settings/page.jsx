'use client'
import { useState, useEffect } from 'react'
import {
  Building2,
  Mail,
  Bell,
  Users,
  Clock,
  DollarSign,
  Save,
  Settings as SettingsIcon
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import AdminNav from '@/components/admin/AdminNav'
import toast from 'react-hot-toast'
export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('business')
  // Business Info
  const [businessInfo, setBusinessInfo] = useState({
    name: 'Impress Cleaning Services',
    email: 'support@impresscleaning.com',
    phone: '(555) 123-4567',
    address: '123 Main St, Fort Worth, TX 76104',
    website: 'https://impresscleaning.com',
  })
  // Service Pricing
  const [pricing, setPricing] = useState({
    standard: '150',
    deep: '250',
    move_in_out: '350',
    post_construction: '450',
    office: '200',
  })
  // Business Hours
  const [businessHours, setBusinessHours] = useState({
    monday: { open: '08:00', close: '18:00', closed: false },
    tuesday: { open: '08:00', close: '18:00', closed: false },
    wednesday: { open: '08:00', close: '18:00', closed: false },
    thursday: { open: '08:00', close: '18:00', closed: false },
    friday: { open: '08:00', close: '18:00', closed: false },
    saturday: { open: '09:00', close: '15:00', closed: false },
    sunday: { open: '09:00', close: '15:00', closed: true },
  })
  // Notification Settings
  const [notifications, setNotifications] = useState({
    newRegistration: true,
    serviceRequest: true,
    paymentReceived: true,
    appointmentCancelled: true,
    invoiceOverdue: true,
  })
  const supabase = createClient()
  useEffect(() => {
    loadSettings()
  }, [])
  const loadSettings = async () => {
    setLoading(true)
    try {
      // In a real app, you'd load these from a settings table
      // For now, we're using default values
      setLoading(false)
    } catch (error) {
      console.error('Error loading settings:', error)
      setLoading(false)
    }
  }
  const handleSaveBusinessInfo = async () => {
    setSaving(true)
    try {
      // In a real app, save to database
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      toast.success('Business information saved!')
    } catch (error) {
      console.error('Error saving business info:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }
  const handleSavePricing = async () => {
    setSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Pricing updated!')
    } catch (error) {
      console.error('Error saving pricing:', error)
      toast.error('Failed to save pricing')
    } finally {
      setSaving(false)
    }
  }
  const handleSaveHours = async () => {
    setSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Business hours saved!')
    } catch (error) {
      console.error('Error saving hours:', error)
      toast.error('Failed to save hours')
    } finally {
      setSaving(false)
    }
  }
  const handleSaveNotifications = async () => {
    setSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Notification preferences saved!')
    } catch (error) {
      console.error('Error saving notifications:', error)
      toast.error('Failed to save notifications')
    } finally {
      setSaving(false)
    }
  }
  const tabs = [
    { id: 'business', label: 'Business Info', icon: Building2 },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'hours', label: 'Business Hours', icon: Clock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AdminNav pendingCount={0} requestsCount={0} />
        <LoadingSpinner size="lg" />
      </div>
    )
  }
  return (
    <div className="min-h-screen">
      <AdminNav pendingCount={0} requestsCount={0} />
      <div className="lg:pl-64">
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1C294E] mb-2">
              Settings
            </h1>
            <p className="text-gray-600">
              Manage your business settings and preferences
            </p>
          </div>
          {/* Tabs */}
          <div className="mb-8 border-b border-gray-200">
            <div className="flex gap-6 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-[#1C294E] text-[#1C294E] font-semibold'
                        : 'border-transparent text-gray-600 hover:text-[#1C294E]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>
          {/* Business Info Tab */}
          {activeTab === 'business' && (
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#1C294E]">
                    Business Information
                  </h2>
                  <p className="text-sm text-gray-600">
                    Update your business details
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <Input
                  label="Business Name"
                  value={businessInfo.name}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="email"
                    label="Business Email"
                    value={businessInfo.email}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                  />
                  <Input
                    type="tel"
                    label="Phone Number"
                    value={businessInfo.phone}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                  />
                </div>
                <Input
                  label="Business Address"
                  value={businessInfo.address}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                />
                <Input
                  label="Website"
                  value={businessInfo.website}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, website: e.target.value })}
                />
                <div className="pt-4">
                  <Button
                    variant="primary"
                    onClick={handleSaveBusinessInfo}
                    loading={saving}
                  >
                    <Save className="w-5 h-5" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </Card>
          )}
          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#1C294E]">
                    Service Pricing
                  </h2>
                  <p className="text-sm text-gray-600">
                    Set default pricing for each service type
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="number"
                    label="Standard Cleaning"
                    value={pricing.standard}
                    onChange={(e) => setPricing({ ...pricing, standard: e.target.value })}
                    placeholder="150"
                  />
                  <Input
                    type="number"
                    label="Deep Cleaning"
                    value={pricing.deep}
                    onChange={(e) => setPricing({ ...pricing, deep: e.target.value })}
                    placeholder="250"
                  />
                  <Input
                    type="number"
                    label="Move In/Out Cleaning"
                    value={pricing.move_in_out}
                    onChange={(e) => setPricing({ ...pricing, move_in_out: e.target.value })}
                    placeholder="350"
                  />
                  <Input
                    type="number"
                    label="Post-Construction Cleaning"
                    value={pricing.post_construction}
                    onChange={(e) => setPricing({ ...pricing, post_construction: e.target.value })}
                    placeholder="450"
                  />
                  <Input
                    type="number"
                    label="Office Cleaning"
                    value={pricing.office}
                    onChange={(e) => setPricing({ ...pricing, office: e.target.value })}
                    placeholder="200"
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> These are starting prices. You can adjust pricing per customer when creating invoices.
                  </p>
                </div>
                <div className="pt-4">
                  <Button
                    variant="primary"
                    onClick={handleSavePricing}
                    loading={saving}
                  >
                    <Save className="w-5 h-5" />
                    Save Pricing
                  </Button>
                </div>
              </div>
            </Card>
          )}
          {/* Business Hours Tab */}
          {activeTab === 'hours' && (
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#1C294E]">
                    Business Hours
                  </h2>
                  <p className="text-sm text-gray-600">
                    Set your operating hours for each day
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {Object.entries(businessHours).map(([day, hours]) => (
                  <div key={day} className="flex flex-col md:flex-row md:items-center gap-4 pb-4 border-b border-gray-200 last:border-0">
                    <div className="md:w-32">
                      <label className="text-sm font-semibold text-gray-700 capitalize">
                        {day}
                      </label>
                    </div>
                    <div className="flex items-center gap-4 flex-1">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={hours.closed}
                          onChange={(e) => setBusinessHours({
                            ...businessHours,
                            [day]: { ...hours, closed: e.target.checked }
                          })}
                          className="w-4 h-4 text-[#1C294E] border-gray-300 rounded focus:ring-[#1C294E]"
                        />
                        <span className="text-sm text-gray-600">Closed</span>
                      </label>
                      {!hours.closed && (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="time"
                            value={hours.open}
                            onChange={(e) => setBusinessHours({
                              ...businessHours,
                              [day]: { ...hours, open: e.target.value }
                            })}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C294E] focus:border-transparent text-sm"
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="time"
                            value={hours.close}
                            onChange={(e) => setBusinessHours({
                              ...businessHours,
                              [day]: { ...hours, close: e.target.value }
                            })}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C294E] focus:border-transparent text-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div className="pt-4">
                  <Button
                    variant="primary"
                    onClick={handleSaveHours}
                    loading={saving}
                  >
                    <Save className="w-5 h-5" />
                    Save Hours
                  </Button>
                </div>
              </div>
            </Card>
          )}
          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#1C294E]">
                    Notification Preferences
                  </h2>
                  <p className="text-sm text-gray-600">
                    Choose which notifications you want to receive
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { key: 'newRegistration', label: 'New Customer Registration', description: 'Get notified when a new customer signs up' },
                  { key: 'serviceRequest', label: 'New Service Request', description: 'Alert when customers request new services' },
                  { key: 'paymentReceived', label: 'Payment Received', description: 'Notification when a payment is completed' },
                  { key: 'appointmentCancelled', label: 'Appointment Cancelled', description: 'Alert when customers cancel appointments' },
                  { key: 'invoiceOverdue', label: 'Invoice Overdue', description: 'Reminder when invoices become overdue' },
                ].map((notification) => (
                  <div key={notification.key} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={notifications[notification.key]}
                      onChange={(e) => setNotifications({
                        ...notifications,
                        [notification.key]: e.target.checked
                      })}
                      className="w-5 h-5 mt-0.5 text-[#1C294E] border-gray-300 rounded focus:ring-[#1C294E]"
                    />
                    <div className="flex-1">
                      <label className="text-sm font-semibold text-gray-700 block mb-1">
                        {notification.label}
                      </label>
                      <p className="text-sm text-gray-600">
                        {notification.description}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="pt-4">
                  <Button
                    variant="primary"
                    onClick={handleSaveNotifications}
                    loading={saving}
                  >
                    <Save className="w-5 h-5" />
                    Save Preferences
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}