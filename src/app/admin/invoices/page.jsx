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
 Search,
 RefreshCw,
 CreditCard,
 AlertCircle
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
  tax_rate: '8.25', // default 8.25%
  line_items: [{ description: '', quantity: 1, rate: '', amount: 0 }]
 })
 
 const [taxMode, setTaxMode] = useState('8.25') // '8.25' | 'none' | 'custom'
 
 // Create customer modal
 const [showCreateCustomerModal, setShowCreateCustomerModal] = useState(false)
 const [newCustomer, setNewCustomer] = useState({
  full_name: '',
  email: '',
  phone: '',
 })

 // Refund modal state
 const [showRefundModal, setShowRefundModal] = useState(false)
 const [refundAmount, setRefundAmount] = useState('')
 const [refundReason, setRefundReason] = useState('')

 // Apply credit modal state
 const [showCreditModal, setShowCreditModal] = useState(false)
 const [creditAmount, setCreditAmount] = useState('')

 // Mark paid modal state
 const [showMarkPaidModal, setShowMarkPaidModal] = useState(false)
 const [paymentMethod, setPaymentMethod] = useState('zelle')

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
   
   if (statusFilter === 'archived') {
    // Only archived invoices
    filtered = filtered.filter(inv => inv.archived)
   } else {
    // For all other views, hide archived
    filtered = filtered.filter(inv => !inv.archived)
    
    // Status filter
    if (statusFilter !== 'all') {
     filtered = filtered.filter(inv => inv.status === statusFilter)
    }
   }
   
   // Search filter (applies after status/archive filter)
   if (searchQuery) {
    const q = searchQuery.toLowerCase()
    filtered = filtered.filter(inv =>
     inv.invoice_number?.toLowerCase().includes(q) ||
     inv.profiles?.full_name?.toLowerCase().includes(q) ||
     inv.profiles?.email?.toLowerCase().includes(q)
    )
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
  
  const handleUpdateStatus = async (newStatus) => {
   if (!selectedInvoice) return
   
   setProcessing(true)
   try {
    const { error } = await supabase
    .from('invoices')
    .update({
     status: newStatus,
     updated_at: new Date().toISOString()
    })
    .eq('id', selectedInvoice.id)
    
    if (error) throw error
    
    toast.success(`Invoice ${newStatus === 'paid' ? 'marked as paid' : 'cancelled'} successfully!`)
    setShowModal(false)
    loadInvoices()
   } catch (error) {
    console.error('Error updating invoice:', error)
    toast.error('Failed to update invoice status')
   } finally {
    setProcessing(false)
   }
  }
  
  const handleArchiveInvoice = async () => {
   if (!selectedInvoice) return
   
   setProcessing(true)
   try {
    const { error } = await supabase
    .from('invoices')
    .update({
     archived: true,
     updated_at: new Date().toISOString(),
    })
    .eq('id', selectedInvoice.id)
    
    if (error) throw error
    
    toast.success('Invoice archived successfully!')
    setShowModal(false)
    loadInvoices()
   } catch (error) {
    console.error('Error archiving invoice:', error)
    toast.error('Failed to archive invoice')
   } finally {
    setProcessing(false)
   }
  }

  // Cancel invoice via API
  const handleCancelInvoice = async () => {
   if (!selectedInvoice) return

   setProcessing(true)
   try {
    const response = await fetch('/api/admin/invoices/cancel', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ invoiceId: selectedInvoice.id })
    })

    if (!response.ok) {
     const data = await response.json()
     throw new Error(data.error || 'Failed to cancel invoice')
    }

    toast.success('Invoice cancelled successfully!')
    setShowModal(false)
    loadInvoices()
   } catch (error) {
    console.error('Error cancelling invoice:', error)
    toast.error(error.message || 'Failed to cancel invoice')
   } finally {
    setProcessing(false)
   }
  }

  // Mark paid via API (for Zelle, cash, check)
  const handleMarkPaid = async () => {
   if (!selectedInvoice) return

   setProcessing(true)
   try {
    const response = await fetch('/api/admin/invoices/mark-paid', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
      invoiceId: selectedInvoice.id,
      paymentMethod: paymentMethod
     })
    })

    if (!response.ok) {
     const data = await response.json()
     throw new Error(data.error || 'Failed to mark invoice as paid')
    }

    toast.success('Invoice marked as paid!')
    setShowMarkPaidModal(false)
    setShowModal(false)
    loadInvoices()
   } catch (error) {
    console.error('Error marking invoice as paid:', error)
    toast.error(error.message || 'Failed to mark invoice as paid')
   } finally {
    setProcessing(false)
   }
  }

  // Process refund via API
  const handleRefund = async () => {
   if (!selectedInvoice || !refundAmount) return

   const amount = parseFloat(refundAmount)
   if (isNaN(amount) || amount <= 0) {
    toast.error('Please enter a valid refund amount')
    return
   }

   setProcessing(true)
   try {
    const response = await fetch('/api/admin/invoices/refund', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
      invoiceId: selectedInvoice.id,
      amount: amount,
      reason: refundReason || 'Refund processed by admin'
     })
    })

    if (!response.ok) {
     const data = await response.json()
     throw new Error(data.error || 'Failed to process refund')
    }

    toast.success('Refund processed successfully!')
    setShowRefundModal(false)
    setRefundAmount('')
    setRefundReason('')
    setShowModal(false)
    loadInvoices()
   } catch (error) {
    console.error('Error processing refund:', error)
    toast.error(error.message || 'Failed to process refund')
   } finally {
    setProcessing(false)
   }
  }

  // Apply credit via API
  const handleApplyCredit = async () => {
   if (!selectedInvoice || !creditAmount) return

   const amount = parseFloat(creditAmount)
   if (isNaN(amount) || amount <= 0) {
    toast.error('Please enter a valid credit amount')
    return
   }

   setProcessing(true)
   try {
    const response = await fetch('/api/admin/invoices/apply-credit', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
      invoiceId: selectedInvoice.id,
      creditAmount: amount
     })
    })

    if (!response.ok) {
     const data = await response.json()
     throw new Error(data.error || 'Failed to apply credit')
    }

    const result = await response.json()
    toast.success(result.isFullyPaid
     ? 'Credit applied - Invoice is now paid!'
     : `Credit applied - Remaining balance: $${result.remainingBalance.toFixed(2)}`
    )
    setShowCreditModal(false)
    setCreditAmount('')
    setShowModal(false)
    loadInvoices()
   } catch (error) {
    console.error('Error applying credit:', error)
    toast.error(error.message || 'Failed to apply credit')
   } finally {
    setProcessing(false)
   }
  }

  // Verify Zelle payment (marks as paid)
  const handleVerifyZelle = async () => {
   setPaymentMethod('zelle')
   await handleMarkPaid()
  }

  // Reject Zelle claim
  const handleRejectZelle = async () => {
   if (!selectedInvoice) return

   setProcessing(true)
   try {
    // Update invoice to remove Zelle claim
    const { error } = await supabase
     .from('invoices')
     .update({
      payment_method: null,
      notes: (selectedInvoice.notes || '') + `\nZelle payment claim rejected on ${new Date().toLocaleDateString()}`,
      updated_at: new Date().toISOString()
     })
     .eq('id', selectedInvoice.id)

    if (error) throw error

    // Create rejection notification for customer
    if (selectedInvoice.customer_id) {
     await supabase
      .from('customer_notifications')
      .insert({
       user_id: selectedInvoice.customer_id,
       type: 'zelle_rejected',
       title: 'Zelle Payment Not Found',
       message: `We could not verify your Zelle payment for Invoice ${selectedInvoice.invoice_number}. Please contact us.`,
       link: '/portal/invoices',
       reference_id: selectedInvoice.id,
       reference_type: 'invoice'
      })
    }

    toast.success('Zelle claim rejected - customer notified')
    setShowModal(false)
    loadInvoices()
   } catch (error) {
    console.error('Error rejecting Zelle:', error)
    toast.error('Failed to reject Zelle claim')
   } finally {
    setProcessing(false)
   }
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
    
    const { customer } = await res.json()
    
    toast.success('Customer created!')
    setShowCreateCustomerModal(false)
    setNewCustomer({ full_name: '', email: '', phone: '' })
    
    // Reload customers and pre-select the new one
    await loadCustomers()
    setNewInvoice((prev) => ({
     ...prev,
     customer_id: customer.id,
    }))
   } catch (error) {
    console.error('Error creating customer:', error)
    toast.error(error.message || 'Failed to create customer')
   } finally {
    setProcessing(false)
   }
  }
  
  const handleLineItemChange = (index, field, value) => {
   const items = [...newInvoice.line_items]
   items[index][field] = value
   
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
    
    const subtotal = calculateTotal()
    const taxRate = parseFloat(newInvoice.tax_rate) || 0
    const taxAmount = subtotal * (taxRate / 100)
    const total = subtotal + taxAmount
    
    const { error } = await supabase
    .from('invoices')
    .insert({
     invoice_number: invoiceNumber,
     customer_id: newInvoice.customer_id,
     amount: subtotal,              // base price (pre-tax)
     tax_rate: taxRate,             // %
     tax_amount: taxAmount,         // $
     total,                         // subtotal + tax
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
     tax_rate: '8.25',
     line_items: [{ description: '', quantity: 1, rate: '', amount: 0 }]
    })
    setTaxMode('8.25')
    
    loadInvoices()
   } catch (error) {
    console.error('Error creating invoice:', error)
    toast.error('Failed to create invoice')
   } finally {
    setProcessing(false)
   }
  }
  
  // Stats
  const stats = {
   total: invoices.length,
   paid: invoices.filter(i => i.status === 'paid').length,
   pending: invoices.filter(i => i.status === 'sent' || i.status === 'draft').length,
   revenue: invoices
   .filter(i => i.status === 'paid')
   .reduce((sum, i) => sum + parseFloat(i.amount), 0),
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
   <option value="archived">Archived</option>
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
     ${parseFloat(invoice.total ?? invoice.amount ?? 0).toFixed(2)}
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
       <td className="px-4 py-3 text-sm text-right text-gray-900">
       ${parseFloat(item.rate).toFixed(2)}
       </td>
       <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
       ${parseFloat(item.amount).toFixed(2)}
       </td>
       </tr>
      ))}
      </tbody>
      <tfoot className="bg-gray-50">
      <tr>
      <td colSpan="3" className="px-4 py-3 text-right font-semibold text-gray-900">
      Total:
      </td>
      <td className="px-4 py-3 text-right font-bold text-[#1C294E] text-lg">
      ${parseFloat(selectedInvoice.total ?? selectedInvoice.amount ?? 0).toFixed(2)}
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
     
     {/* Zelle Verification Section */}
     {selectedInvoice.payment_method === 'zelle' && selectedInvoice.status !== 'paid' && (
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
       <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-purple-800">Zelle Payment Claimed</h3>
       </div>
       <p className="text-sm text-purple-700 mb-4">
        Customer claims to have sent payment via Zelle. Please verify in your Zelle account.
       </p>
       <div className="flex gap-3">
        <Button
         variant="success"
         fullWidth
         onClick={handleVerifyZelle}
         loading={processing}
        >
         <CheckCircle className="w-4 h-4" />
         Verify Payment
        </Button>
        <Button
         variant="danger"
         fullWidth
         onClick={handleRejectZelle}
         loading={processing}
        >
         <XCircle className="w-4 h-4" />
         Reject Claim
        </Button>
       </div>
      </div>
     )}

     {/* Refund Info */}
     {selectedInvoice.refund_amount > 0 && (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
       <div className="flex items-center gap-2 mb-2">
        <RefreshCw className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-blue-800">Refund Issued</h3>
       </div>
       <p className="text-sm text-blue-700">
        Amount: ${parseFloat(selectedInvoice.refund_amount).toFixed(2)}
        {selectedInvoice.refund_reason && ` - ${selectedInvoice.refund_reason}`}
       </p>
      </div>
     )}

     {/* Dispute Warning */}
     {selectedInvoice.disputed && (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
       <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <h3 className="font-semibold text-red-800">DISPUTE ACTIVE</h3>
       </div>
       <p className="text-sm text-red-700">
        This invoice has an active payment dispute. Check your Stripe Dashboard for details.
       </p>
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
      Send Invoice
      </Button>
     )}

     {(selectedInvoice.status === 'sent' || selectedInvoice.status === 'overdue') && (
      <>
       <Button
        variant="success"
        fullWidth
        onClick={() => setShowMarkPaidModal(true)}
        loading={processing}
       >
        <CheckCircle className="w-5 h-5" />
        Mark as Paid
       </Button>

       <Button
        variant="outline"
        fullWidth
        onClick={() => setShowCreditModal(true)}
       >
        <CreditCard className="w-5 h-5" />
        Apply Credit
       </Button>
      </>
     )}

     {selectedInvoice.status === 'paid' && !selectedInvoice.disputed && (
      <Button
       variant="outline"
       fullWidth
       onClick={() => {
        setRefundAmount((selectedInvoice.total || selectedInvoice.amount || 0).toString())
        setShowRefundModal(true)
       }}
      >
       <RefreshCw className="w-5 h-5" />
       Issue Refund
      </Button>
     )}

     {selectedInvoice.status !== 'cancelled' && selectedInvoice.status !== 'paid' && (
      <Button
      variant="danger"
      fullWidth
      onClick={handleCancelInvoice}
      loading={processing}
      >
      <XCircle className="w-5 h-5" />
      Cancel Invoice
      </Button>
     )}

     {!selectedInvoice.archived && (
      <Button
      variant="outline"
      fullWidth
      onClick={handleArchiveInvoice}
      loading={processing}
      >
      Archive Invoice
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
    <div className="flex items-center justify-between mb-2">
    <label className="block text-sm font-semibold text-gray-700">
    Customer *
    </label>
    <Button
    variant="outline"
    size="sm"
    onClick={() => setShowCreateCustomerModal(true)}
    >
    + Add Customer
    </Button>
    </div>
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
    
    {/* Subtotal / Tax / Total Preview */}
    <div className="mt-4 pt-4 border-t border-gray-200">
    {(() => {
     const subtotal = calculateTotal()
     const taxRate = parseFloat(newInvoice.tax_rate) || 0
     const taxAmount = subtotal * (taxRate / 100)
     const estimatedTotal = subtotal + taxAmount
     
     return (
      <div className="w-full space-y-1">
      <div className="flex justify-between items-center">
      <span className="text-sm font-semibold text-gray-700">Subtotal:</span>
      <span className="text-lg font-bold text-[#1C294E]">
      ${subtotal.toFixed(2)}
      </span>
      </div>
      {taxRate > 0 && (
       <>
       <div className="flex justify-between items-center">
       <span className="text-sm font-semibold text-gray-700">
       Tax ({taxRate.toFixed(2)}%):
       </span>
       <span className="text-sm font-bold text-[#1C294E]">
       ${taxAmount.toFixed(2)}
       </span>
       </div>
       <div className="flex justify-between items-center">
       <span className="text-lg font-semibold text-gray-700">Total:</span>
       <span className="text-2xl font-bold text-[#1C294E]">
       ${estimatedTotal.toFixed(2)}
       </span>
       </div>
       </>
      )}
      {taxRate === 0 && (
       <div className="flex justify-between items-center">
       <span className="text-lg font-semibold text-gray-700">Total:</span>
       <span className="text-2xl font-bold text-[#1C294E]">
       ${subtotal.toFixed(2)}
       </span>
       </div>
      )}
      </div>
     )
    })()}
    </div>
    </div>
    
    {/* Sales Tax */}
    <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-700">
    Sales Tax
    </label>
    <select
    value={taxMode}
    onChange={(e) => {
     const value = e.target.value
     setTaxMode(value)
     if (value === '8.25') {
      setNewInvoice(prev => ({ ...prev, tax_rate: '8.25' }))
     } else if (value === 'none') {
      setNewInvoice(prev => ({ ...prev, tax_rate: '' }))
     }
     // 'custom' -> keep whatever is currently in tax_rate, or blank
    }}
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C294E] focus:border-transparent"
    >
    <option value="8.25">8.25%</option>
    <option value="none">No Tax</option>
    <option value="custom">Custom Rate</option>
    </select>
    
    {taxMode === 'custom' && (
     <Input
     type="number"
     label="Custom Tax Rate (%)"
     value={newInvoice.tax_rate}
     onChange={(e) =>
      setNewInvoice({ ...newInvoice, tax_rate: e.target.value })
     }
     step="0.01"
     min="0"
     />
    )}
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

    {/* Mark Paid Modal */}
    <Modal
     isOpen={showMarkPaidModal}
     onClose={() => setShowMarkPaidModal(false)}
     title="Mark Invoice as Paid"
     maxWidth="sm"
    >
     <div className="space-y-4">
      <p className="text-gray-600">
       Select the payment method used:
      </p>
      <div className="space-y-2">
       {['zelle', 'cash', 'check'].map((method) => (
        <label key={method} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
         <input
          type="radio"
          name="paymentMethod"
          value={method}
          checked={paymentMethod === method}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-4 h-4 text-[#079447] focus:ring-[#079447]"
         />
         <span className="font-medium capitalize">{method}</span>
        </label>
       ))}
      </div>
      <div className="flex gap-3 pt-4 border-t border-gray-200">
       <Button
        variant="outline"
        fullWidth
        onClick={() => setShowMarkPaidModal(false)}
       >
        Cancel
       </Button>
       <Button
        variant="primary"
        fullWidth
        onClick={handleMarkPaid}
        loading={processing}
       >
        Confirm Payment
       </Button>
      </div>
     </div>
    </Modal>

    {/* Refund Modal */}
    <Modal
     isOpen={showRefundModal}
     onClose={() => {
      setShowRefundModal(false)
      setRefundAmount('')
      setRefundReason('')
     }}
     title="Issue Refund"
     maxWidth="sm"
    >
     <div className="space-y-4">
      {selectedInvoice && (
       <p className="text-gray-600">
        Maximum refundable: ${parseFloat(
         (selectedInvoice.total || selectedInvoice.amount || 0) -
         (selectedInvoice.refund_amount || 0)
        ).toFixed(2)}
       </p>
      )}
      <Input
       label="Refund Amount"
       type="number"
       step="0.01"
       min="0"
       value={refundAmount}
       onChange={(e) => setRefundAmount(e.target.value)}
       placeholder="0.00"
      />
      <div>
       <label className="block text-sm font-semibold text-gray-700 mb-2">
        Reason (Optional)
       </label>
       <textarea
        value={refundReason}
        onChange={(e) => setRefundReason(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C294E] focus:border-transparent"
        rows="2"
        placeholder="Reason for refund..."
       />
      </div>
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
       <p className="text-sm text-yellow-800">
        <strong>Note:</strong> If paid via Stripe, the refund will be processed automatically.
       </p>
      </div>
      <div className="flex gap-3 pt-4 border-t border-gray-200">
       <Button
        variant="outline"
        fullWidth
        onClick={() => {
         setShowRefundModal(false)
         setRefundAmount('')
         setRefundReason('')
        }}
       >
        Cancel
       </Button>
       <Button
        variant="danger"
        fullWidth
        onClick={handleRefund}
        loading={processing}
       >
        Process Refund
       </Button>
      </div>
     </div>
    </Modal>

    {/* Apply Credit Modal */}
    <Modal
     isOpen={showCreditModal}
     onClose={() => {
      setShowCreditModal(false)
      setCreditAmount('')
     }}
     title="Apply Credit"
     maxWidth="sm"
    >
     <div className="space-y-4">
      {selectedInvoice && (
       <p className="text-gray-600">
        Invoice balance: ${parseFloat(selectedInvoice.total || selectedInvoice.amount || 0).toFixed(2)}
       </p>
      )}
      <Input
       label="Credit Amount"
       type="number"
       step="0.01"
       min="0"
       value={creditAmount}
       onChange={(e) => setCreditAmount(e.target.value)}
       placeholder="0.00"
      />
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
       <p className="text-sm text-blue-800">
        Credit will be deducted from the customer's account and applied to this invoice.
       </p>
      </div>
      <div className="flex gap-3 pt-4 border-t border-gray-200">
       <Button
        variant="outline"
        fullWidth
        onClick={() => {
         setShowCreditModal(false)
         setCreditAmount('')
        }}
       >
        Cancel
       </Button>
       <Button
        variant="primary"
        fullWidth
        onClick={handleApplyCredit}
        loading={processing}
       >
        Apply Credit
       </Button>
      </div>
     </div>
    </Modal>
    </div>
   )
  }
  