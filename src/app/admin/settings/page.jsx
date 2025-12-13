'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Building2,
  Mail,
  Bell,
  Clock,
  DollarSign,
  Save,
  Settings as SettingsIcon,
  Phone,
  Globe,
  MapPin,
  Sparkles,
  Check,
  AlertCircle,
  Percent,
  Receipt,
  Calendar,
  RefreshCw,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import AdminNav from '@/components/admin/AdminNav'
import toast from 'react-hot-toast'
import { sanitizeText, sanitizePhone, sanitizeEmail } from '@/lib/sanitize'

export default function SettingsPage() {
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('business')
  const [lastSaved, setLastSaved] = useState(null)

  // Business Info
  const [businessInfo, setBusinessInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
  })

  // Service Pricing
  const [pricing, setPricing] = useState({
    standard: '',
    deep: '',
    move_in_out: '',
    post_construction: '',
    office: '',
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

  // Load settings from database
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('admin_settings')
          .select('*')
          .eq('id', 1)
          .single()

        if (error) throw error

        if (data) {
          setBusinessInfo({
            name: data.business_name || '',
            email: data.business_email || '',
            phone: data.business_phone || '',
            address: data.business_address || '',
            website: data.business_website || '',
          })

          setPricing({
            standard: String(data.price_standard || 150),
            deep: String(data.price_deep || 250),
            move_in_out: String(data.price_move_in_out || 350),
            post_construction: String(data.price_post_construction || 450),
            office: String(data.price_office || 200),
          })

          if (data.business_hours) {
            setBusinessHours(data.business_hours)
          }

          if (data.notifications) {
            setNotifications(data.notifications)
          }

          if (data.updated_at) {
            setLastSaved(new Date(data.updated_at))
          }
        }
      } catch (error) {
        toast.error('Failed to load settings')
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [supabase])

  // Save Business Info
  const handleSaveBusinessInfo = async () => {
    setSaving(true)
    try {
      const sanitizedData = {
        business_name: sanitizeText(businessInfo.name)?.slice(0, 100) || '',
        business_email: sanitizeEmail(businessInfo.email) || '',
        business_phone: sanitizePhone(businessInfo.phone) || '',
        business_address: sanitizeText(businessInfo.address)?.slice(0, 300) || '',
        business_website: sanitizeText(businessInfo.website)?.slice(0, 200) || '',
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('admin_settings')
        .update(sanitizedData)
        .eq('id', 1)

      if (error) throw error
      
      setLastSaved(new Date())
      toast.success('Business information saved!')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  // Save Pricing
  const handleSavePricing = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('admin_settings')
        .update({
          price_standard: Math.max(0, parseInt(pricing.standard) || 0),
          price_deep: Math.max(0, parseInt(pricing.deep) || 0),
          price_move_in_out: Math.max(0, parseInt(pricing.move_in_out) || 0),
          price_post_construction: Math.max(0, parseInt(pricing.post_construction) || 0),
          price_office: Math.max(0, parseInt(pricing.office) || 0),
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1)

      if (error) throw error
      
      setLastSaved(new Date())
      toast.success('Pricing updated!')
    } catch (error) {
      toast.error('Failed to save pricing')
    } finally {
      setSaving(false)
    }
  }

  // Save Business Hours
  const handleSaveHours = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('admin_settings')
        .update({
          business_hours: businessHours,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1)

      if (error) throw error
      
      setLastSaved(new Date())
      toast.success('Business hours saved!')
    } catch (error) {
      toast.error('Failed to save hours')
    } finally {
      setSaving(false)
    }
  }

  // Save Notifications
  const handleSaveNotifications = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('admin_settings')
        .update({
          notifications: notifications,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1)

      if (error) throw error
      
      setLastSaved(new Date())
      toast.success('Notification preferences saved!')
    } catch (error) {
      toast.error('Failed to save notifications')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'business', label: 'Business Info', icon: Building2, color: 'blue' },
    { id: 'pricing', label: 'Pricing', icon: DollarSign, color: 'emerald' },
    { id: 'hours', label: 'Hours', icon: Clock, color: 'purple' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'amber' },
  ]

  const getTabColors = (color) => {
    const colors = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', activeBg: 'bg-blue-500' },
      emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', activeBg: 'bg-emerald-500' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', activeBg: 'bg-purple-500' },
      amber: { bg: 'bg-amber-100', text: 'text-amber-600', activeBg: 'bg-amber-500' },
    }
    return colors[color] || colors.blue
  }

  const formatTimeDisplay = (time24) => {
    if (!time24) return ''
    const [hours, minutes] = time24.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
        <AdminNav />
        <div className="lg:pl-64">
          <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-10 bg-gray-200 rounded-lg w-48" />
              <div className="h-14 bg-gray-200 rounded-xl" />
              <div className="h-96 bg-gray-200 rounded-2xl" />
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <AdminNav />

      <div className="lg:pl-64">
        <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-1 w-12 bg-gradient-to-r from-[#079447] to-emerald-400 rounded-full" />
              <span className="text-sm font-medium text-[#079447] uppercase tracking-wider">Admin</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-[#1C294E] tracking-tight">Settings</h1>
                <p className="text-gray-500 mt-1">Manage your business settings and preferences</p>
              </div>
              {lastSaved && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Last saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 p-1.5 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              const colors = getTabColors(tab.color)
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium 
                    transition-all duration-300 whitespace-nowrap flex-1 justify-center
                    ${isActive
                      ? 'bg-[#1C294E] text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Business Info Tab */}
          {activeTab === 'business' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#1C294E]">Business Information</h2>
                    <p className="text-sm text-gray-500">Your business details appear on invoices and emails</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Business Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={businessInfo.name}
                      onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#079447] focus:border-transparent transition-all"
                      placeholder="Impress Cleaning Services"
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={businessInfo.email}
                        onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#079447] focus:border-transparent transition-all"
                        placeholder="hello@impressyoucleaning.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={businessInfo.phone}
                        onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#079447] focus:border-transparent transition-all"
                        placeholder="(512) 277-5364"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={businessInfo.address}
                      onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#079447] focus:border-transparent transition-all"
                      placeholder="123 Main St, Fort Worth, TX 76104"
                    />
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      value={businessInfo.website}
                      onChange={(e) => setBusinessInfo({ ...businessInfo, website: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#079447] focus:border-transparent transition-all"
                      placeholder="https://impressyoucleaning.com"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleSaveBusinessInfo}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#079447] text-white rounded-xl font-medium hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#079447]/20"
                  >
                    {saving ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#1C294E]">Service Pricing</h2>
                    <p className="text-sm text-gray-500">Set default starting prices for each service type</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Pricing Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'standard', label: 'Standard Cleaning', description: 'Regular maintenance cleaning', icon: Sparkles },
                    { key: 'deep', label: 'Deep Cleaning', description: 'Thorough top-to-bottom clean', icon: Sparkles },
                    { key: 'move_in_out', label: 'Move In/Out', description: 'Empty home deep cleaning', icon: Building2 },
                    { key: 'post_construction', label: 'Post-Construction', description: 'After renovation cleanup', icon: Building2 },
                    { key: 'office', label: 'Office Cleaning', description: 'Commercial workspace cleaning', icon: Building2 },
                  ].map((service) => {
                    const Icon = service.icon
                    return (
                      <div 
                        key={service.key} 
                        className="p-4 border border-gray-200 rounded-xl hover:border-emerald-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-[#1C294E]">{service.label}</p>
                            <p className="text-xs text-gray-500">{service.description}</p>
                          </div>
                        </div>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                          <input
                            type="number"
                            min="0"
                            value={pricing[service.key]}
                            onChange={(e) => setPricing({ ...pricing, [service.key]: e.target.value })}
                            className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#079447] focus:border-transparent transition-all text-lg font-semibold"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Info Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">These are starting prices</p>
                    <p className="text-sm text-blue-700 mt-1">
                      You can adjust the final price per customer when creating invoices based on square footage, specific requirements, and other factors.
                    </p>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleSavePricing}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#079447] text-white rounded-xl font-medium hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#079447]/20"
                  >
                    {saving ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    Save Pricing
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Business Hours Tab */}
          {activeTab === 'hours' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#1C294E]">Business Hours</h2>
                    <p className="text-sm text-gray-500">Set your operating hours for each day of the week</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-3">
                {Object.entries(businessHours).map(([day, hours]) => (
                  <div 
                    key={day} 
                    className={`
                      flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border transition-all
                      ${hours.closed 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-white border-gray-200 hover:border-purple-300'
                      }
                    `}
                  >
                    {/* Day Name */}
                    <div className="sm:w-28 flex-shrink-0">
                      <span className={`text-sm font-semibold capitalize ${hours.closed ? 'text-gray-400' : 'text-[#1C294E]'}`}>
                        {day}
                      </span>
                    </div>

                    {/* Closed Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={hours.closed}
                          onChange={(e) => setBusinessHours({
                            ...businessHours,
                            [day]: { ...hours, closed: e.target.checked }
                          })}
                          className="sr-only"
                        />
                        <div className={`w-10 h-6 rounded-full transition-colors ${hours.closed ? 'bg-gray-300' : 'bg-purple-500'}`}>
                          <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform mt-1 ${hours.closed ? 'ml-1' : 'ml-5'}`} />
                        </div>
                      </div>
                      <span className={`text-sm ${hours.closed ? 'text-gray-500' : 'text-purple-600 font-medium'}`}>
                        {hours.closed ? 'Closed' : 'Open'}
                      </span>
                    </label>

                    {/* Time Inputs */}
                    {!hours.closed && (
                      <div className="flex items-center gap-2 flex-1 sm:justify-end">
                        <input
                          type="time"
                          value={hours.open}
                          onChange={(e) => setBusinessHours({
                            ...businessHours,
                            [day]: { ...hours, open: e.target.value }
                          })}
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        />
                        <span className="text-gray-400">to</span>
                        <input
                          type="time"
                          value={hours.close}
                          onChange={(e) => setBusinessHours({
                            ...businessHours,
                            [day]: { ...hours, close: e.target.value }
                          })}
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        />
                      </div>
                    )}
                  </div>
                ))}

                {/* Save Button */}
                <div className="pt-6 flex justify-end">
                  <button
                    onClick={handleSaveHours}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#079447] text-white rounded-xl font-medium hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#079447]/20"
                  >
                    {saving ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    Save Hours
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Bell className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#1C294E]">Notification Preferences</h2>
                    <p className="text-sm text-gray-500">Choose which admin notifications you want to receive</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {[
                  { 
                    key: 'newRegistration', 
                    label: 'New Customer Registration', 
                    description: 'Get notified when a new customer signs up and needs approval',
                    icon: Users,
                    color: 'blue'
                  },
                  { 
                    key: 'serviceRequest', 
                    label: 'New Service Request', 
                    description: 'Alert when customers request new cleaning services',
                    icon: Calendar,
                    color: 'indigo'
                  },
                  { 
                    key: 'paymentReceived', 
                    label: 'Payment Received', 
                    description: 'Notification when a payment is successfully completed',
                    icon: DollarSign,
                    color: 'emerald'
                  },
                  { 
                    key: 'appointmentCancelled', 
                    label: 'Appointment Cancelled', 
                    description: 'Alert when customers cancel their scheduled appointments',
                    icon: Calendar,
                    color: 'red'
                  },
                  { 
                    key: 'invoiceOverdue', 
                    label: 'Invoice Overdue', 
                    description: 'Reminder when customer invoices become past due',
                    icon: Receipt,
                    color: 'amber'
                  },
                ].map((notification) => {
                  const Icon = notification.icon
                  const colorClasses = {
                    blue: 'bg-blue-100 text-blue-600',
                    indigo: 'bg-indigo-100 text-indigo-600',
                    emerald: 'bg-emerald-100 text-emerald-600',
                    red: 'bg-red-100 text-red-600',
                    amber: 'bg-amber-100 text-amber-600',
                  }
                  
                  return (
                    <label 
                      key={notification.key} 
                      className={`
                        flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all
                        ${notifications[notification.key] 
                          ? 'bg-emerald-50 border-emerald-200' 
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className={`w-10 h-10 rounded-lg ${colorClasses[notification.color]} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-[#1C294E]">{notification.label}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{notification.description}</p>
                      </div>
                      <div className="relative flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={notifications[notification.key]}
                          onChange={(e) => setNotifications({
                            ...notifications,
                            [notification.key]: e.target.checked
                          })}
                          className="sr-only"
                        />
                        <div className={`w-12 h-7 rounded-full transition-colors ${notifications[notification.key] ? 'bg-[#079447]' : 'bg-gray-300'}`}>
                          <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform mt-1 ${notifications[notification.key] ? 'ml-6' : 'ml-1'}`} />
                        </div>
                      </div>
                    </label>
                  )
                })}

                {/* Save Button */}
                <div className="pt-6 flex justify-end">
                  <button
                    onClick={handleSaveNotifications}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#079447] text-white rounded-xl font-medium hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#079447]/20"
                  >
                    {saving ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}