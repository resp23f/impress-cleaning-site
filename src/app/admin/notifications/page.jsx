'use client'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  Bell,
  Eye,
  EyeOff,
  User,
  Calendar,
  FileText,
  CheckCircle,
  Filter
} from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import AdminNav from '@/components/admin/AdminNav'

export default function AdminNotificationsPage() {
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [filteredNotifications, setFilteredNotifications] = useState([])
  const [customerProfiles, setCustomerProfiles] = useState({})
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all, read, unread
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    loadNotifications()
  }, [])

  useEffect(() => {
    filterNotifications()
  }, [notifications, searchQuery, statusFilter, typeFilter])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      // Get all customer notifications
      const { data: notificationsData, error } = await supabaseAdmin
        .from('customer_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      setNotifications(notificationsData || [])

      // Load customer profiles for display
      const userIds = [...new Set(notificationsData?.map(n => n.user_id))]
      if (userIds.length > 0) {
        const { data: profiles } = await supabaseAdmin
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds)

        const profilesMap = {}
        profiles?.forEach(p => {
          profilesMap[p.id] = p
        })
        setCustomerProfiles(profilesMap)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterNotifications = () => {
    let filtered = [...notifications]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(notif => {
        const customer = customerProfiles[notif.user_id]
        return (
          customer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notif.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notif.message?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })
    }

    // Status filter
    if (statusFilter === 'read') {
      filtered = filtered.filter(n => n.is_read)
    } else if (statusFilter === 'unread') {
      filtered = filtered.filter(n => !n.is_read)
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(n => n.type === typeFilter)
    }

    setFilteredNotifications(filtered)
  }

  const getTypeLabel = (type) => {
    const types = {
      appointment_updated: 'Appointment Updated',
      appointment_confirmed: 'Appointment Confirmed',
      invoice_sent: 'Invoice Sent',
      payment_received: 'Payment Received',
      service_completed: 'Service Completed',
      account_approved: 'Account Approved',
    }
    return types[type] || type
  }

  const getTypeColor = (type) => {
    const colors = {
      appointment_updated: 'info',
      appointment_confirmed: 'success',
      invoice_sent: 'warning',
      payment_received: 'success',
      service_completed: 'success',
      account_approved: 'primary',
    }
    return colors[type] || 'default'
  }

  const getIcon = (type) => {
    switch (type) {
      case 'appointment_updated':
      case 'appointment_confirmed':
        return <Calendar className="w-5 h-5 text-blue-600" />
      case 'invoice_sent':
      case 'payment_received':
        return <FileText className="w-5 h-5 text-green-600" />
      case 'service_completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'account_approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  // Calculate stats
  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.is_read).length,
    read: notifications.filter(n => n.is_read).length,
    today: notifications.filter(n => {
      const today = new Date().toDateString()
      return new Date(n.created_at).toDateString() === today
    }).length,
  }

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
              Customer Notifications
            </h1>
            <p className="text-gray-600">
              Track customer notification engagement and delivery status
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Sent</p>
                  <p className="text-3xl font-bold text-[#1C294E]">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Unread</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.unread}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <EyeOff className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Read</p>
                  <p className="text-3xl font-bold text-green-600">{stats.read}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Today</p>
                  <p className="text-3xl font-bold text-[#079447]">{stats.today}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-[#079447]" />
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Search by customer or message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<User className="w-5 h-5" />}
              />
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C294E] focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C294E] focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="appointment_updated">Appointment Updated</option>
                <option value="appointment_confirmed">Appointment Confirmed</option>
                <option value="invoice_sent">Invoice Sent</option>
                <option value="payment_received">Payment Received</option>
                <option value="service_completed">Service Completed</option>
                <option value="account_approved">Account Approved</option>
              </select>
            </div>
          </Card>

          {/* Notifications List */}
          {filteredNotifications.length > 0 ? (
            <div className="space-y-4">
              {filteredNotifications.map((notif) => {
                const customer = customerProfiles[notif.user_id]
                return (
                  <Card key={notif.id} hover>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {getIcon(notif.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-semibold text-[#1C294E]">
                                {customer?.full_name || 'Unknown Customer'}
                              </h3>
                              <Badge variant={getTypeColor(notif.type)} size="sm">
                                {getTypeLabel(notif.type)}
                              </Badge>
                              {notif.is_read ? (
                                <Badge variant="success" size="sm">
                                  <Eye className="w-3 h-3 mr-1" />
                                  Read
                                </Badge>
                              ) : (
                                <Badge variant="warning" size="sm">
                                  <EyeOff className="w-3 h-3 mr-1" />
                                  Unread
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mb-2">
                              {customer?.email}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-gray-500">
                              Sent {format(new Date(notif.created_at), 'MMM d, h:mm a')}
                            </p>
                            {notif.is_read && notif.read_at && (
                              <p className="text-xs text-green-600 font-medium">
                                Read {format(new Date(notif.read_at), 'MMM d, h:mm a')}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3 mb-2">
                          <p className="text-sm font-medium text-[#1C294E] mb-1">
                            {notif.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            {notif.message}
                          </p>
                        </div>

                        {notif.link && (
                          <p className="text-xs text-gray-500">
                            Link: <span className="text-[#079447] font-mono">{notif.link}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#1C294E] mb-2">
                  No Notifications Found
                </h3>
                <p className="text-gray-600">
                  {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'No notifications sent yet'}
                </p>
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}