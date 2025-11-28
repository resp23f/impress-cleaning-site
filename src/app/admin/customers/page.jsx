'use client'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Eye,
  Edit2,
  Filter
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

export default function CustomersPage() {
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all, active, pending, suspended
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // NEW: create-customer modal + form state
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
    pending: 0,
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
      // Use the admin API route instead of direct query
      const response = await fetch('/api/admin/get-all-customers')
      if (!response.ok) throw new Error('Failed to load customers')
      
      const { data, error } = await response.json()
      if (error) throw new Error(error)
      
      setCustomers(data || [])
      
      // Calculate stats
      const total = data?.length || 0
      const active = data?.filter(c => c.account_status === 'active').length || 0
      const pending = data?.filter(c => c.account_status === 'pending').length || 0
      const suspended = data?.filter(c => c.account_status === 'suspended').length || 0
      
      setStats({ total, active, pending, suspended })
    } catch (error) {
      console.error('Error loading customers:', error)
      toast.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const filterCustomers = () => {
    let filtered = customers

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.account_status === statusFilter)
    }

    // Search by name, email, or phone
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
    setShowModal(true)
  }

  const getStatusBadge = (status) => {
    const variants = {
      active: 'success',
      pending: 'yellow',
      suspended: 'gray',
    }
    return variants[status] || 'gray'
  }

  // NEW: create customer handler (uses same API as invoices page)
  const handleCreateCustomer = async () => {
    if (!newCustomer.full_name && !newCustomer.email) {
      toast.error('Name or email is required')
      return
    }

    setProcessing(true)
    try {
      const res = await fetch('/api/admin/customers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to create customer')
      }

      const { customer } = await res.json()

      toast.success('Customer created!')
      setShowCreateCustomerModal(false)
      setNewCustomer({ full_name: '', email: '', phone: '' })

      // Reload customers so they appear in the list
      await loadCustomers()
    } catch (error) {
      console.error('Error creating customer:', error)
      toast.error(error.message || 'Failed to create customer')
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
      <AdminNav pendingCount={stats.pending} requestsCount={0} />
      <div className="lg:pl-64">
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#1C294E] mb-2">
                Customer Management
              </h1>
              <p className="text-gray-600">
                View and manage all customer accounts
              </p>
            </div>
            {/* NEW: Add Customer button */}
            <Button
              variant="primary"
              onClick={() => setShowCreateCustomerModal(true)}
            >
              + Add Customer
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                <Users className="w-10 h-10 text-green-500" />
              </div>
            </Card>
            <Card padding="lg" className="border-l-4 border-l-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Users className="w-10 h-10 text-yellow-500" />
              </div>
            </Card>
            <Card padding="lg" className="border-l-4 border-l-gray-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Suspended</p>
                  <p className="text-3xl font-bold text-gray-600">{stats.suspended}</p>
                </div>
                <Users className="w-10 h-10 text-gray-500" />
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
            <div className="flex gap-2">
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
                variant={statusFilter === 'pending' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setStatusFilter('pending')}
              >
                Pending ({stats.pending})
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
                        <div className="w-12 h-12 bg-[#079447]/10 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-[#079447]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-[#1C294E]">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            {customer.phone}
                          </div>
                        )}
                        {customer.service_addresses && customer.service_addresses[0] && (
                          <div className="flex items-start gap-2 text-sm text-gray-600 md:col-span-2">
                            <MapPin className="w-4 h-4 mt-0.5" />
                            <span>
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
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
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
                <p className="text-gray-600">
                  {searchQuery
                    ? 'Try adjusting your search or filters'
                    : 'No customers registered yet'}
                </p>
              </div>
            </Card>
          )}
        </main>
      </div>

      {/* Customer Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Customer Details"
        maxWidth="lg"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            {/* Personal Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Personal Information
              </h3>
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
                  <span className="text-sm font-medium text-[#1C294E]">
                    {selectedCustomer.communication_preference || 'Not set'}
                  </span>
                </div>
              </div>
            </div>

            {/* Service Addresses */}
            {selectedCustomer.service_addresses && selectedCustomer.service_addresses.length > 0 && (
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

            {/* Account Info */}
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

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setShowModal(false)}
              >
                Close
              </Button>
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
