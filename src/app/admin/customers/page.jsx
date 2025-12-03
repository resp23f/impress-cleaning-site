'use client'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  Eye,
  Edit2,
  UserCheck,
  UserX,
  Calendar,
  Receipt,
  Plus,
  X,
  Save
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import AdminNav from '@/components/admin/AdminNav'
import toast from 'react-hot-toast'
import { sanitizeText } from '@/lib/sanitize'
import Link from 'next/link'

export default function CustomersPage() {
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    communication_preference: 'both'
  })

  const [showCreateCustomerModal, setShowCreateCustomerModal] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    full_name: '',
    email: '',
    phone: '',
  })
  const [processing, setProcessing] = useState(false)

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    suspended: 0,
  })

  const supabase = createClient()

  useEffect(() => {
    loadCustomers()
  }, [])

  useEffect(() => {
    filterCustomers()
  }, [customers, searchQuery, statusFilter])

  const loadCustomers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/get-all-customers')
      if (!response.ok) throw new Error('Failed to load customers')
      
      const { data, error } = await response.json()
      if (error) throw new Error(error)
      
      setCustomers(data || [])
      
      const total = data?.length || 0
      const active = data?.filter(c => c.account_status === 'active').length || 0
      const suspended = data?.filter(c => c.account_status === 'suspended').length || 0
      
      setStats({ total, active, suspended })
    } catch (error) {
      console.error('Error loading customers:', error)
      toast.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const filterCustomers = () => {
    let filtered = customers

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.account_status === statusFilter)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(c =>
        c.full_name?.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.phone?.toLowerCase().includes(query)
      )
    }

    setFilteredCustomers(filtered)
  }

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer)
    setEditForm({
      full_name: customer.full_name || '',
      phone: customer.phone || '',
      communication_preference: customer.communication_preference || 'both'
    })
    setIsEditing(false)
    setShowModal(true)
  }

  const getStatusBadge = (status) => {
    const variants = {
      active: 'success',
      pending: 'warning',
      suspended: 'danger',
    }
    return variants[status] || 'default'
  }

  const handleCreateCustomer = async () => {
    if (!newCustomer.full_name && !newCustomer.email) {
      toast.error('Name or email is required')
      return
    }

    setProcessing(true)
    try {
      const sanitizedCustomer = {
        full_name: sanitizeText(newCustomer.full_name)?.slice(0, 100),
        email: newCustomer.email?.trim().toLowerCase().slice(0, 254),
        phone: newCustomer.phone?.replace(/[^\d+\-() ]/g, '').slice(0, 20),
      }

      const res = await fetch('/api/admin/customers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedCustomer),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to create customer')
      }

      toast.success('Customer created!')
      setShowCreateCustomerModal(false)
      setNewCustomer({ full_name: '', email: '', phone: '' })
      await loadCustomers()
    } catch (error) {
      console.error('Error creating customer:', error)
      toast.error(error.message || 'Failed to create customer')
    } finally {
      setProcessing(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!selectedCustomer) return

    setProcessing(true)
    try {
      const sanitizedData = {
        full_name: sanitizeText(editForm.full_name)?.slice(0, 100),
        phone: editForm.phone?.replace(/[^\d+\-() ]/g, '').slice(0, 20),
        communication_preference: editForm.communication_preference,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('profiles')
        .update(sanitizedData)
        .eq('id', selectedCustomer.id)

      if (error) throw error

      toast.success('Customer updated!')
      setIsEditing(false)
      await loadCustomers()
      
      // Update selected customer with new data
      setSelectedCustomer(prev => ({ ...prev, ...sanitizedData }))
    } catch (error) {
      console.error('Error updating customer:', error)
      toast.error('Failed to update customer')
    } finally {
      setProcessing(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!selectedCustomer) return

    const newStatus = selectedCustomer.account_status === 'active' ? 'suspended' : 'active'
    const action = newStatus === 'suspended' ? 'suspend' : 'reactivate'

    if (!confirm(`Are you sure you want to ${action} this customer?`)) return

    setProcessing(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          account_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedCustomer.id)

      if (error) throw error

      toast.success(`Customer ${newStatus === 'active' ? 'reactivated' : 'suspended'}!`)
      await loadCustomers()
      setSelectedCustomer(prev => ({ ...prev, account_status: newStatus }))
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update customer status')
    } finally {
      setProcessing(false)
    }
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
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#1C294E] mb-2">
                Customer Management
              </h1>
              <p className="text-gray-600">
                View and manage all customer accounts
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowCreateCustomerModal(true)}
            >
              <Plus className="w-5 h-5" />
              Add Customer
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <Card padding="lg" className="border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Customers</p>
                  <p className="text-3xl font-bold text-[#1C294E]">{stats.total}</p>
                </div>
                <Users className="w-10 h-10 text-blue-500" />
              </div>
            </Card>
            <Card padding="lg" className="border-l-4 border-l-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active</p>
                  <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                </div>
                <UserCheck className="w-10 h-10 text-green-500" />
              </div>
            </Card>
            <Card padding="lg" className="border-l-4 border-l-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Suspended</p>
                  <p className="text-3xl font-bold text-red-600">{stats.suspended}</p>
                </div>
                <UserX className="w-10 h-10 text-red-500" />
              </div>
            </Card>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-5 h-5" />}
              />
            </div>
            
            {/* Mobile: Dropdown filter */}
            <div className="md:hidden">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C294E] focus:border-transparent"
              >
                <option value="all">All Customers ({stats.total})</option>
                <option value="active">Active ({stats.active})</option>
                <option value="suspended">Suspended ({stats.suspended})</option>
              </select>
            </div>

            {/* Desktop: Button filters */}
            <div className="hidden md:flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All ({stats.total})
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setStatusFilter('active')}
              >
                Active ({stats.active})
              </Button>
              <Button
                variant={statusFilter === 'suspended' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setStatusFilter('suspended')}
              >
                Suspended ({stats.suspended})
              </Button>
            </div>
          </div>

          {/* Customers List */}
          {filteredCustomers.length > 0 ? (
            <div className="space-y-4">
              {filteredCustomers.map((customer) => (
                <Card key={customer.id} hover>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-[#079447]/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Users className="w-6 h-6 text-[#079447]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-[#1C294E] truncate">
                              {customer.full_name || 'No name provided'}
                            </h3>
                            <Badge variant={getStatusBadge(customer.account_status)} size="sm">
                              {customer.account_status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Joined {format(new Date(customer.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 truncate">
                          <Mail className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{customer.email}</span>
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4 flex-shrink-0" />
                            {customer.phone}
                          </div>
                        )}
                        {customer.service_addresses && customer.service_addresses[0] && (
                          <div className="flex items-start gap-2 text-sm text-gray-600 sm:col-span-2">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span className="truncate">
                              {customer.service_addresses[0].street_address}, {customer.service_addresses[0].city}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewCustomer(customer)}
                      >
                        <Eye className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#1C294E] mb-2">
                  No customers found
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery
                    ? 'Try adjusting your search or filters'
                    : 'No customers registered yet'}
                </p>
                {!searchQuery && (
                  <Button
                    variant="primary"
                    onClick={() => setShowCreateCustomerModal(true)}
                  >
                    <Plus className="w-5 h-5" />
                    Add First Customer
                  </Button>
                )}
              </div>
            </Card>
          )}
        </main>
      </div>

      {/* Customer Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setIsEditing(false)
        }}
        title={isEditing ? 'Edit Customer' : 'Customer Details'}
        maxWidth="lg"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            {/* Personal Info */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  Personal Information
                </h3>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="px-4 py-3 bg-gray-100 rounded-lg text-gray-600 text-sm">
                      {selectedCustomer.email}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  <Input
                    label="Phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Communication Preference
                    </label>
                    <select
                      value={editForm.communication_preference}
                      onChange={(e) => setEditForm({ ...editForm, communication_preference: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C294E] focus:border-transparent"
                    >
                      <option value="email">Email Only</option>
                      <option value="text">Text Only</option>
                      <option value="both">Email & Text</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Full Name:</span>
                    <span className="text-sm font-medium text-[#1C294E]">
                      {selectedCustomer.full_name || 'Not provided'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm font-medium text-[#1C294E]">
                      {selectedCustomer.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Phone:</span>
                    <span className="text-sm font-medium text-[#1C294E]">
                      {selectedCustomer.phone || 'Not provided'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge variant={getStatusBadge(selectedCustomer.account_status)}>
                      {selectedCustomer.account_status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Communication:</span>
                    <span className="text-sm font-medium text-[#1C294E] capitalize">
                      {selectedCustomer.communication_preference || 'Not set'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Service Addresses */}
            {!isEditing && selectedCustomer.service_addresses && selectedCustomer.service_addresses.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Service Addresses
                </h3>
                <div className="space-y-3">
                  {selectedCustomer.service_addresses.map((addr, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-[#1C294E]">
                        Address {idx + 1}{addr.is_primary && ' (Primary)'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {addr.street_address}
                        {addr.unit && `, ${addr.unit}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {addr.city}, {addr.state} {addr.zip_code}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            {!isEditing && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link href={`/admin/appointments?customer=${selectedCustomer.id}`}>
                    <Button variant="outline" fullWidth size="sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      Appointments
                    </Button>
                  </Link>
                  <Link href={`/admin/invoices?customer=${selectedCustomer.id}`}>
                    <Button variant="outline" fullWidth size="sm">
                      <Receipt className="w-4 h-4 mr-2" />
                      Invoices
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Account Info */}
            {!isEditing && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Account Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Customer ID:</span>
                    <span className="text-sm font-mono text-gray-500">
                      {selectedCustomer.id.substring(0, 8)}...
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Joined:</span>
                    <span className="text-sm font-medium text-[#1C294E]">
                      {format(new Date(selectedCustomer.created_at), 'MMM d, yyyy \'at\' h:mm a')}
                    </span>
                  </div>
                  {selectedCustomer.updated_at && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Updated:</span>
                      <span className="text-sm font-medium text-[#1C294E]">
                        {format(new Date(selectedCustomer.updated_at), 'MMM d, yyyy \'at\' h:mm a')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setIsEditing(false)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleSaveEdit}
                    loading={processing}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </Button>
                  <Button
                    variant={selectedCustomer.account_status === 'active' ? 'danger' : 'success'}
                    fullWidth
                    onClick={handleToggleStatus}
                    loading={processing}
                  >
                    {selectedCustomer.account_status === 'active' ? (
                      <>
                        <UserX className="w-4 h-4 mr-2" />
                        Suspend Account
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4 mr-2" />
                        Reactivate Account
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Create Customer Modal */}
      <Modal
        isOpen={showCreateCustomerModal}
        onClose={() => setShowCreateCustomerModal(false)}
        title="Add New Customer"
        maxWidth="md"
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={newCustomer.full_name}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, full_name: e.target.value })
            }
          />
          <Input
            label="Email"
            type="email"
            value={newCustomer.email}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, email: e.target.value })
            }
          />
          <Input
            label="Phone"
            value={newCustomer.phone}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, phone: e.target.value })
            }
          />

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowCreateCustomerModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={handleCreateCustomer}
              loading={processing}
            >
              Save Customer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}