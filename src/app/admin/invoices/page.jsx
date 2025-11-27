'use client'
import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import {
  FileText,
  DollarSign,
  Send,
  CheckCircle,
  XCircle,
  Plus,
  Eye,
  Download,
  Search
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

export default function InvoicesPage() {
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState([])
  const [filteredInvoices, setFilteredInvoices] = useState([])
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [processing, setProcessing] = useState(false)
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  // Create invoice form
  const [customers, setCustomers] = useState([])
  const [newInvoice, setNewInvoice] = useState({
    customer_id: '',
    amount: '',
    due_date: '',
    notes: '',
    line_items: [{ description: '', quantity: 1, rate: '', amount: 0 }]
  })
  const supabase = createClient()
  useEffect(() => {
    loadInvoices()
    loadCustomers()
  }, [])
  useEffect(() => {
    filterInvoices()
  }, [invoices, searchQuery, statusFilter])
  const loadInvoices = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          profiles!customer_id(full_name, email)
        `)
        .order('created_at', { ascending: false })
      if (error) throw error
      setInvoices(data || [])
    } catch (error) {
      console.error('Error loading invoices:', error)
      toast.error('Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }
  const loadCustomers = async () => {
    try {
      const res = await fetch('/api/admin/get-all-customers')
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load customers')
      }
      const { data } = await res.json()
      setCustomers(data || [])
    } catch (error) {
      console.error('Error loading customers:', error)
    }
  }
  const filterInvoices = () => {
    let filtered = [...invoices]
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(inv =>
        inv.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(inv => inv.status === statusFilter)
    }
    setFilteredInvoices(filtered)
  }
  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success'
      case 'sent':
        return 'primary'
      case 'draft':
        return 'warning'
      case 'overdue':
        return 'danger'
      case 'cancelled':
        return 'default'
      default:
        return 'default'
    }
  }
  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice)
    setShowModal(true)
  }
const handleSendInvoice = async () => {
  if (!selectedInvoice) return
  
  setProcessing(true)
  try {
    const response = await fetch('/api/admin/invoices/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId: selectedInvoice.id })
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to send invoice')
    }

    const data = await response.json()
    console.log('Invoice sent successfully:', data)

    if (!data.notificationId) {
      console.warn('Invoice sent but no notification ID returned')
    } else {
      console.log('Customer notification created with ID:', data.notificationId)
    }
    
    toast.success('Invoice sent successfully!')
    setShowModal(false)
    loadInvoices()
  } catch (error) {
    console.error('Error sending invoice:', error)
    toast.error(error.message || 'Failed to send invoice')
  } finally {
    setProcessing(false)
  }
}
  const handleLineItemChange = (index, field, value) => {
    const items = [...newInvoice.line_items]
    items[index][field] = value
    // Calculate amount for this line item
    if (field === 'quantity' || field === 'rate') {
      const qty = parseFloat(items[index].quantity) || 0
      const rate = parseFloat(items[index].rate) || 0
      items[index].amount = qty * rate
    }
    setNewInvoice({ ...newInvoice, line_items: items })
  }
  const addLineItem = () => {
    setNewInvoice({
      ...newInvoice,
      line_items: [...newInvoice.line_items, { description: '', quantity: 1, rate: '', amount: 0 }]
    })
  }
  const removeLineItem = (index) => {
    const items = newInvoice.line_items.filter((_, i) => i !== index)
    setNewInvoice({ ...newInvoice, line_items: items })
  }
  const calculateTotal = () => {
    return newInvoice.line_items.reduce((sum, item) => sum + (item.amount || 0), 0)
  }
const handleCreateInvoice = async () => {
  if (!newInvoice.customer_id) {
    toast.error('Please select a customer')
    return
  }
  if (newInvoice.line_items.length === 0 || !newInvoice.line_items[0].description) {
    toast.error('Please add at least one line item')
    return
  }
  setProcessing(true)
  try {
    // Generate invoice number
    const { data: invoiceNumber, error: numberError } = await supabase
      .rpc('generate_invoice_number')
    if (numberError) throw numberError
    const total = calculateTotal()
    const { error } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        customer_id: newInvoice.customer_id,
        amount: total,
        due_date: newInvoice.due_date || null,
        notes: sanitizeText(newInvoice.notes) || null,
        line_items: newInvoice.line_items.map(item => ({
          ...item,
          description: sanitizeText(item.description),
        })),
        status: 'draft',
      })
    if (error) throw error
    toast.success('Invoice created successfully!')
    setShowCreateModal(false)
    setNewInvoice({
      customer_id: '',
      amount: '',
      due_date: '',
      notes: '',
      line_items: [{ description: '', quantity: 1, rate: '', amount: 0 }]
    })
    loadInvoices()
  } catch (error) {
    console.error('Error creating invoice:', error)
    toast.error('Failed to create invoice')
  } finally {
    setProcessing(false)
  }
}  // Calculate stats
  const stats = {
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'paid').length,
    pending: invoices.filter(i => i.status === 'sent' || i.status === 'draft').length,
    revenue: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + parseFloat(i.amount), 0),
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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#1C294E] mb-2">
                Invoices
              </h1>
              <p className="text-gray-600">
                Create and manage customer invoices
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-5 h-5" />
              Create Invoice
            </Button>
          </div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Invoices</p>
                  <p className="text-3xl font-bold text-[#1C294E]">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Paid</p>
                  <p className="text-3xl font-bold text-green-600">{stats.paid}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Send className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Revenue</p>
                  <p className="text-3xl font-bold text-[#079447]">
                    ${stats.revenue.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-[#079447]" />
                </div>
              </div>
            </Card>
          </div>
          {/* Filters */}
          <Card className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Search by invoice number or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-5 h-5" />}
              />
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C294E] focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </Card>
          {/* Invoices List */}
          {filteredInvoices.length > 0 ? (
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => (
                <Card key={invoice.id} hover>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-[#1C294E]">
                              {invoice.invoice_number}
                            </h3>
                            <Badge variant={getStatusColor(invoice.status)}>
                              {invoice.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {invoice.profiles?.full_name || invoice.profiles?.email}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                        <div>
                          <p className="text-xs text-gray-500">Amount</p>
                          <p className="text-sm font-semibold text-[#1C294E]">
                            ${parseFloat(invoice.amount).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Created</p>
                          <p className="text-sm font-semibold text-[#1C294E]">
                            {format(parseISO(invoice.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                        {invoice.due_date && (
                          <div>
                            <p className="text-xs text-gray-500">Due Date</p>
                            <p className="text-sm font-semibold text-[#1C294E]">
                              {format(parseISO(invoice.due_date), 'MMM d, yyyy')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 lg:min-w-[200px]">
                      <Button
                        variant="primary"
                        onClick={() => handleViewInvoice(invoice)}
                        fullWidth
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#1C294E] mb-2">
                  No Invoices Found
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Get started by creating your first invoice'}
                </p>
                {!searchQuery && statusFilter === 'all' && (
                  <Button
                    variant="primary"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <Plus className="w-5 h-5" />
                    Create Invoice
                  </Button>
                )}
              </div>
            </Card>
          )}
        </main>
      </div>
      {/* View Invoice Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Invoice Details"
        maxWidth="lg"
      >
        {selectedInvoice && (
          <div className="space-y-6">
            {/* Invoice Header */}
            <div className="flex justify-between items-start pb-4 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-[#1C294E]">
                  {selectedInvoice.invoice_number}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Created {format(parseISO(selectedInvoice.created_at), 'MMMM d, yyyy')}
                </p>
              </div>
              <Badge variant={getStatusColor(selectedInvoice.status)} size="lg">
                {selectedInvoice.status}
              </Badge>
            </div>
            {/* Customer Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Bill To:</h3>
              <p className="text-[#1C294E] font-medium">
                {selectedInvoice.profiles?.full_name}
              </p>
              <p className="text-sm text-gray-600">
                {selectedInvoice.profiles?.email}
              </p>
            </div>
            {/* Line Items */}
            {selectedInvoice.line_items && selectedInvoice.line_items.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Items:</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Description</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Qty</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Rate</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedInvoice.line_items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">${parseFloat(item.rate).toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">${parseFloat(item.amount).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="3" className="px-4 py-3 text-right font-semibold text-gray-900">Total:</td>
                        <td className="px-4 py-3 text-right font-bold text-[#1C294E] text-lg">
                          ${parseFloat(selectedInvoice.amount).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
            {/* Additional Info */}
            {selectedInvoice.due_date && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700">Due Date:</h3>
                <p className="text-sm text-gray-900">
                  {format(parseISO(selectedInvoice.due_date), 'MMMM d, yyyy')}
                </p>
              </div>
            )}
            {selectedInvoice.notes && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700">Notes:</h3>
                <p className="text-sm text-gray-900">{selectedInvoice.notes}</p>
              </div>
            )}
            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              {selectedInvoice.status === 'draft' && (
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleSendInvoice}
                  loading={processing}
                >
                  <Send className="w-5 h-5" />
                  Mark as Sent
                </Button>
              )}
              {(selectedInvoice.status === 'sent' || selectedInvoice.status === 'overdue') && (
                <Button
                  variant="success"
                  fullWidth
                  onClick={() => handleUpdateStatus('paid')}
                  loading={processing}
                >
                  <CheckCircle className="w-5 h-5" />
                  Mark as Paid
                </Button>
              )}
              {selectedInvoice.status !== 'cancelled' && selectedInvoice.status !== 'paid' && (
                <Button
                  variant="danger"
                  fullWidth
                  onClick={() => handleUpdateStatus('cancelled')}
                  loading={processing}
                >
                  <XCircle className="w-5 h-5" />
                  Cancel Invoice
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
      {/* Create Invoice Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Invoice"
        maxWidth="2xl"
      >
        <div className="space-y-6">
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Customer *
            </label>
            <select
              value={newInvoice.customer_id}
              onChange={(e) => setNewInvoice({ ...newInvoice, customer_id: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C294E] focus:border-transparent"
              required
            >
              <option value="">Select a customer</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.full_name || customer.email}
                </option>
              ))}
            </select>
          </div>
          {/* Line Items */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-semibold text-gray-700">
                Line Items *
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={addLineItem}
              >
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </div>
            <div className="space-y-3">
              {newInvoice.line_items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-5">
                    <Input
                      label={index === 0 ? "Description" : ""}
                      placeholder="Service description"
                      value={item.description}
                      onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      label={index === 0 ? "Qty" : ""}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      label={index === 0 ? "Rate" : ""}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={item.rate}
                      onChange={(e) => handleLineItemChange(index, 'rate', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      label={index === 0 ? "Amount" : ""}
                      value={`$${item.amount.toFixed(2)}`}
                      readOnly
                      disabled
                    />
                  </div>
                  {newInvoice.line_items.length > 1 && (
                    <div className="col-span-1">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeLineItem(index)}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">Total:</span>
                <span className="text-2xl font-bold text-[#1C294E]">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          {/* Due Date */}
          <Input
            type="date"
            label="Due Date (Optional)"
            value={newInvoice.due_date}
            onChange={(e) => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
          />
          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={newInvoice.notes}
              onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C294E] focus:border-transparent"
              rows="3"
              placeholder="Additional notes or payment instructions..."
            />
          </div>
          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={handleCreateInvoice}
              loading={processing}
            >
              Create Invoice
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
