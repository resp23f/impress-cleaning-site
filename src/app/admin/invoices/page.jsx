'use client'
import { useState, useEffect, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import {
  FileText,
  DollarSign,
  Send,
  CheckCircle,
  XCircle,
  Plus,
  Eye,
  Search,
  CreditCard,
  AlertCircle,
  Clock,
  Archive,
  ChevronRight,
  X,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import AdminNav from '@/components/admin/AdminNav'
import toast from 'react-hot-toast'
import { sanitizeText } from '@/lib/sanitize'

const STATUS_CONFIG = {
  draft: { color: 'warning', bg: 'bg-amber-100', text: 'text-amber-600', label: 'Draft' },
  sent: { color: 'primary', bg: 'bg-blue-100', text: 'text-blue-600', label: 'Sent' },
  paid: { color: 'success', bg: 'bg-green-100', text: 'text-green-600', label: 'Paid' },
  overdue: { color: 'danger', bg: 'bg-red-100', text: 'text-red-600', label: 'Overdue' },
  cancelled: { color: 'default', bg: 'bg-gray-100', text: 'text-gray-600', label: 'Cancelled' },
}

export default function InvoicesPage() {
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState([])
  const [customers, setCustomers] = useState([])
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCreateCustomerModal, setShowCreateCustomerModal] = useState(false)
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false)
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [processing, setProcessing] = useState(false)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Create invoice form
  const [newInvoice, setNewInvoice] = useState({
    customer_id: '',
    due_date: '',
    notes: '',
    tax_rate: '8.25',
    line_items: [{ description: '', quantity: 1, rate: '', amount: 0 }],
  })
  const [taxMode, setTaxMode] = useState('8.25')

  // Create customer form
  const [newCustomer, setNewCustomer] = useState({
    full_name: '',
    email: '',
    phone: '',
  })

  // Payment modals
  const [paymentMethod, setPaymentMethod] = useState('zelle')
  const [creditAmount, setCreditAmount] = useState('')

  // Edit draft mode
  const [editingInvoice, setEditingInvoice] = useState(null)
  // Load data
  useEffect(() => {
    loadInvoices()
    loadCustomers()
  }, [])

  const loadInvoices = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`*, profiles!customer_id(full_name, email)`)
        .order('created_at', { ascending: false })

      if (error) throw error
      setInvoices(data || [])
    } catch (error) {
      toast.error('Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }

  const loadCustomers = async () => {
    try {
      const res = await fetch('/api/admin/get-all-customers')
      if (!res.ok) throw new Error('Failed to load customers')
      const { data } = await res.json()
      setCustomers(data || [])
    } catch (error) {
      // Silent fail - customers list is supplementary
    }
  }

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    let filtered = [...invoices]

    // Handle archived filter
    if (statusFilter === 'archived') {
      filtered = filtered.filter((inv) => inv.archived)
    } else {
      filtered = filtered.filter((inv) => !inv.archived)
      if (statusFilter !== 'all') {
        filtered = filtered.filter((inv) => inv.status === statusFilter)
      }
    }

    // Search filter with sanitization
    if (searchQuery) {
      const q = sanitizeText(searchQuery)?.toLowerCase() || ''
      filtered = filtered.filter(
        (inv) =>
          inv.invoice_number?.toLowerCase().includes(q) ||
          inv.profiles?.full_name?.toLowerCase().includes(q) ||
          inv.profiles?.email?.toLowerCase().includes(q)
      )
    }

    return filtered
  }, [invoices, searchQuery, statusFilter])

  // Stats
  const stats = useMemo(() => {
    const activeInvoices = invoices.filter((i) => !i.archived)
    return {
      total: activeInvoices.length,
      paid: activeInvoices.filter((i) => i.status === 'paid').length,
      pending: activeInvoices.filter((i) => i.status === 'sent' || i.status === 'draft').length,
      overdue: activeInvoices.filter((i) => i.status === 'overdue').length,
      revenue: activeInvoices
        .filter((i) => i.status === 'paid')
        .reduce((sum, i) => sum + parseFloat(i.total || i.amount || 0), 0),
    }
  }, [invoices])

  // Extract unique descriptions from past invoices
  const previousDescriptions = useMemo(() => {
    const descriptions = new Set()
    invoices.forEach(inv => {
      inv.line_items?.forEach(item => {
        if (item.description?.trim()) {
          descriptions.add(item.description.trim())
        }
      })
    })
    return Array.from(descriptions).sort()
  }, [invoices])

  // Handlers
  const handleStatClick = (filter) => {
    setStatusFilter(filter)
    setSearchQuery('')
  }

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
  }

  const hasActiveFilters = searchQuery || statusFilter !== 'all'

  const openViewModal = (invoice) => {
    setSelectedInvoice(invoice)
    setShowViewModal(true)
  }

  const openCreateModal = () => {
    setEditingInvoice(null)
    setNewInvoice({
      customer_id: '',
      due_date: '',
      notes: '',
      tax_rate: '8.25',
      line_items: [{ description: '', quantity: 1, rate: '', amount: 0 }],
    })
    setTaxMode('8.25')
    setShowCreateModal(true)
  }

  const openEditModal = (invoice) => {
    setEditingInvoice(invoice)
    setNewInvoice({
      customer_id: invoice.customer_id || '',
      due_date: invoice.due_date || '',
      notes: invoice.notes || '',
      tax_rate: invoice.tax_rate?.toString() || '0',
      line_items: invoice.line_items?.length > 0
        ? invoice.line_items.map(item => ({
          description: item.description || '',
          quantity: item.quantity || 1,
          rate: item.rate?.toString() || '',
          amount: parseFloat(item.amount) || 0,
        }))
        : [{ description: '', quantity: 1, rate: '', amount: 0 }],
    })

    // Set tax mode based on existing rate
    const rate = parseFloat(invoice.tax_rate) || 0
    if (rate === 8.25) setTaxMode('8.25')
    else if (rate === 0) setTaxMode('none')
    else setTaxMode('custom')

    setShowViewModal(false)
    setShowCreateModal(true)
  }
  // Line item handlers
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
      line_items: [...newInvoice.line_items, { description: '', quantity: 1, rate: '', amount: 0 }],
    })
  }

  const removeLineItem = (index) => {
    const items = newInvoice.line_items.filter((_, i) => i !== index)
    setNewInvoice({ ...newInvoice, line_items: items })
  }

  const calculateTotal = () => {
    return newInvoice.line_items.reduce((sum, item) => sum + (item.amount || 0), 0)
  }

  // Create invoice
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
      const { data: invoiceNumber, error: numberError } = await supabase.rpc('generate_invoice_number')
      if (numberError) throw numberError

      const subtotal = calculateTotal()
      const taxRate = parseFloat(newInvoice.tax_rate) || 0
      const taxAmount = subtotal * (taxRate / 100)
      const total = subtotal + taxAmount

      const { error } = await supabase.from('invoices').insert({
        invoice_number: invoiceNumber,
        customer_id: newInvoice.customer_id,
        amount: subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total,
        due_date: newInvoice.due_date || null,
        notes: newInvoice.notes ? sanitizeText(newInvoice.notes.trim()) : null,
        line_items: newInvoice.line_items.map((item) => ({
          ...item,
          description: sanitizeText(item.description?.trim()),
        })),
        status: 'draft',
      })

      if (error) throw error

      toast.success('Invoice created successfully!')
      setShowCreateModal(false)
      loadInvoices()
    } catch (error) {
      toast.error('Failed to create invoice')
    } finally {
      setProcessing(false)
    }
  }

  // Update existing draft invoice
  const handleUpdateInvoice = async () => {
    if (!editingInvoice) return

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
      const subtotal = calculateTotal()
      const taxRate = parseFloat(newInvoice.tax_rate) || 0
      const taxAmount = subtotal * (taxRate / 100)
      const total = subtotal + taxAmount

      const { error } = await supabase
        .from('invoices')
        .update({
          customer_id: newInvoice.customer_id,
          amount: subtotal,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          total,
          due_date: newInvoice.due_date || null,
          notes: newInvoice.notes ? sanitizeText(newInvoice.notes.trim()) : null,
          line_items: newInvoice.line_items.map((item) => ({
            ...item,
            description: sanitizeText(item.description?.trim()),
          })),
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingInvoice.id)

      if (error) throw error

      toast.success('Invoice updated successfully!')
      setShowCreateModal(false)
      setEditingInvoice(null)
      loadInvoices()
    } catch (error) {
      toast.error('Failed to update invoice')
    } finally {
      setProcessing(false)
    }
  }

  // Create customer
  const handleCreateCustomer = async () => {
    if (!newCustomer.full_name && !newCustomer.email) {
      toast.error('Name or email is required')
      return
    }

    setProcessing(true)
    try {
      const sanitizedCustomer = {
        full_name: sanitizeText(newCustomer.full_name?.trim())?.slice(0, 100),
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

      await loadCustomers()
      setNewInvoice((prev) => ({ ...prev, customer_id: customer.id }))
    } catch (error) {
      toast.error(error.message || 'Failed to create customer')
    } finally {
      setProcessing(false)
    }
  }

  // Send invoice
  const handleSendInvoice = async () => {
    if (!selectedInvoice) return

    setProcessing(true)
    try {
      const response = await fetch('/api/admin/invoices/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: selectedInvoice.id }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send invoice')
      }

      toast.success('Invoice sent successfully!')
      setShowViewModal(false)
      loadInvoices()
    } catch (error) {
      toast.error(error.message || 'Failed to send invoice')
    } finally {
      setProcessing(false)
    }
  }

  // Resend invoice
  const handleResendInvoice = async () => {
    if (!selectedInvoice) return

    setProcessing(true)
    try {
      const response = await fetch('/api/admin/invoices/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: selectedInvoice.id }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to resend invoice')
      }

      toast.success('Invoice resent successfully!')
      setShowViewModal(false)
      loadInvoices()
    } catch (error) {
      toast.error(error.message || 'Failed to resend invoice')
    } finally {
      setProcessing(false)
    }
  }

  // Cancel invoice
  const handleCancelInvoice = async () => {
    if (!selectedInvoice) return

    setProcessing(true)
    try {
      const response = await fetch('/api/admin/invoices/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: selectedInvoice.id }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to cancel invoice')
      }

      toast.success('Invoice cancelled successfully!')
      setShowViewModal(false)
      loadInvoices()
    } catch (error) {
      toast.error(error.message || 'Failed to cancel invoice')
    } finally {
      setProcessing(false)
    }
  }

  // Archive invoice
  const handleArchiveInvoice = async () => {
    if (!selectedInvoice) return

    setProcessing(true)
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ archived: true, updated_at: new Date().toISOString() })
        .eq('id', selectedInvoice.id)

      if (error) throw error

      toast.success('Invoice archived successfully!')
      setShowViewModal(false)
      loadInvoices()
    } catch (error) {
      toast.error('Failed to archive invoice')
    } finally {
      setProcessing(false)
    }
  }

  // Mark as paid
  const handleMarkPaid = async () => {
    if (!selectedInvoice) return

    setProcessing(true)
    try {
      const response = await fetch('/api/admin/invoices/mark-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          paymentMethod: paymentMethod,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to mark invoice as paid')
      }

      toast.success('Invoice marked as paid!')
      setShowMarkPaidModal(false)
      setShowViewModal(false)
      loadInvoices()
    } catch (error) {
      toast.error(error.message || 'Failed to mark invoice as paid')
    } finally {
      setProcessing(false)
    }
  }
  // Mark as overdue manually
  const handleMarkOverdue = async () => {
    if (!selectedInvoice) return

    setProcessing(true)
    try {
      // Check if late fee already exists
      const existingLineItems = selectedInvoice.line_items || []
      const hasLateFee = existingLineItems.some(item => 
        item.description?.toLowerCase().includes('late fee')
      )

      if (hasLateFee) {
        // Just update status if late fee already applied
        const { error } = await supabase
          .from('invoices')
          .update({
            status: 'overdue',
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedInvoice.id)

        if (error) throw error
        toast.success('Invoice marked as overdue')
      } else {
        // Calculate 5% late fee on current total
        const currentTotal = parseFloat(selectedInvoice.total) || parseFloat(selectedInvoice.amount) || 0
        const lateFee = Math.round(currentTotal * 0.05 * 100) / 100
        const newTotal = currentTotal + lateFee

        // Add late fee as a line item
        const updatedLineItems = [
          ...existingLineItems,
          {
            description: 'Late Fee (5%)',
            quantity: 1,
            rate: lateFee,
            amount: lateFee
          }
        ]

        const { error } = await supabase
          .from('invoices')
          .update({
            status: 'overdue',
            line_items: updatedLineItems,
            total: newTotal,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedInvoice.id)

        if (error) throw error
        toast.success('Invoice marked as overdue with 5% late fee applied')
      }

      setShowViewModal(false)
      loadInvoices()
    } catch (error) {
      toast.error('Failed to mark invoice as overdue')
    } finally {
      setProcessing(false)
    }
  }
  // Apply credit
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
          creditAmount: amount,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to apply credit')
      }

      const result = await response.json()
      toast.success(
        result.isFullyPaid
          ? 'Credit applied - Invoice is now paid!'
          : `Credit applied - Remaining balance: $${result.remainingBalance.toFixed(2)}`
      )
      setShowCreditModal(false)
      setCreditAmount('')
      setShowViewModal(false)
      loadInvoices()
    } catch (error) {
      toast.error(error.message || 'Failed to apply credit')
    } finally {
      setProcessing(false)
    }
  }

  // Zelle verification
  const handleVerifyZelle = async () => {
    setPaymentMethod('zelle')
    setProcessing(true)
    try {
      const response = await fetch('/api/admin/invoices/mark-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          paymentMethod: 'zelle',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to verify payment')
      }

      toast.success('Zelle payment verified!')
      setShowViewModal(false)
      loadInvoices()
    } catch (error) {
      toast.error(error.message || 'Failed to verify payment')
    } finally {
      setProcessing(false)
    }
  }

  const handleRejectZelle = async () => {
    if (!selectedInvoice) return

    setProcessing(true)
    try {
      const { error } = await supabase
        .from('invoices')
        .update({
          payment_method: null,
          notes:
            (selectedInvoice.notes || '') +
            `\nZelle payment claim rejected on ${new Date().toLocaleDateString()}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedInvoice.id)

      if (error) throw error

      if (selectedInvoice.customer_id) {
        await supabase.from('customer_notifications').insert({
          user_id: selectedInvoice.customer_id,
          type: 'zelle_rejected',
          title: 'Zelle Payment Not Found',
          message: `We could not verify your Zelle payment for Invoice ${selectedInvoice.invoice_number}. Please contact us.`,
          link: '/portal/invoices',
          reference_id: selectedInvoice.id,
          reference_type: 'invoice',
        })
      }

      toast.success('Zelle claim rejected - customer notified')
      setShowViewModal(false)
      loadInvoices()
    } catch (error) {
      toast.error('Failed to reject Zelle claim')
    } finally {
      setProcessing(false)
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
        <AdminNav pendingCount={0} requestsCount={0} />
        <div className="lg:pl-64">
          <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-10 bg-gray-200 rounded-lg w-48" />
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
                ))}
              </div>
              <div className="h-16 bg-gray-200 rounded-2xl" />
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <AdminNav pendingCount={stats.pending} requestsCount={0} />

      <div className="lg:pl-64">
        <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-1 w-12 bg-gradient-to-r from-[#079447] to-emerald-400 rounded-full" />
                <span className="text-sm font-medium text-[#079447] uppercase tracking-wider">Admin</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#1C294E] tracking-tight">Invoices</h1>
              <p className="text-gray-500 mt-1">Create and manage customer invoices</p>
            </div>
            <Button variant="primary" onClick={openCreateModal} className="shadow-lg shadow-[#079447]/20">
              <Plus className="w-5 h-5" />
              Create Invoice
            </Button>
          </div>

          {/* Stats Cards - Clickable */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {[
              { key: 'all', label: 'Total', value: stats.total, icon: FileText, gradient: 'from-blue-500 to-indigo-500' },
              { key: 'paid', label: 'Paid', value: stats.paid, icon: CheckCircle, gradient: 'from-green-500 to-emerald-500' },
              { key: 'sent', label: 'Pending', value: stats.pending, icon: Clock, gradient: 'from-amber-500 to-yellow-500' },
              { key: 'overdue', label: 'Overdue', value: stats.overdue, icon: AlertCircle, gradient: 'from-red-500 to-rose-500' },
              { key: 'revenue', label: 'Revenue', value: `$${stats.revenue.toFixed(0)}`, icon: TrendingUp, gradient: 'from-emerald-500 to-teal-500', isRevenue: true },
            ].map((stat) => {
              const Icon = stat.icon
              const isActive = statusFilter === stat.key && !stat.isRevenue
              return (
                <button
                  key={stat.key}
                  onClick={() => !stat.isRevenue && handleStatClick(stat.key)}
                  disabled={stat.isRevenue}
                  className={`
                    relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300
                    ${stat.isRevenue ? 'cursor-default' : 'cursor-pointer'}
                    ${isActive
                      ? `bg-gradient-to-br ${stat.gradient} text-white shadow-lg scale-[1.02]`
                      : 'bg-white hover:shadow-lg hover:scale-[1.01] border border-gray-100'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs font-medium mb-1 ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                        {stat.label}
                      </p>
                      <p className={`text-2xl sm:text-3xl font-bold ${isActive ? 'text-white' : 'text-[#1C294E]'}`}>
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${isActive ? 'bg-white/20' : 'bg-gray-100'
                        }`}
                    >
                      <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                  </div>
                  {isActive && (
                    <div className="absolute bottom-2 right-2">
                      <div className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">Active</div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by invoice number or customer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#079447] focus:ring-2 focus:ring-[#079447]/20 transition-all"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 focus:border-[#079447] focus:ring-2 focus:ring-[#079447]/20 transition-all bg-white min-w-[160px]"
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

            {hasActiveFilters && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-[#1C294E]">{filteredInvoices.length}</span> of{' '}
                  {invoices.filter((i) => !i.archived).length} invoices
                </p>
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Invoices List */}
          {filteredInvoices.length > 0 ? (
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => {
                const statusConfig = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.draft
                return (
                  <div
                    key={invoice.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Left side */}
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`w-14 h-14 rounded-2xl ${statusConfig.bg} flex items-center justify-center flex-shrink-0`}>
                            <FileText className={`w-7 h-7 ${statusConfig.text}`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap mb-2">
                              <h3 className="text-lg font-bold text-[#1C294E]">{invoice.invoice_number}</h3>
                              <Badge variant={statusConfig.color}>{statusConfig.label}</Badge>
                              {invoice.payment_method === 'zelle' && invoice.status !== 'paid' && (
                                <Badge variant="warning">Zelle Pending</Badge>
                              )}
                            </div>

                            <p className="text-gray-600 font-medium mb-3">
                              {invoice.profiles?.full_name || invoice.profiles?.email || 'Unknown Customer'}
                            </p>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                              <div>
                                <p className="text-gray-400 text-xs mb-0.5">Amount</p>
                                <p className="font-bold text-[#1C294E]">
                                  ${parseFloat(invoice.total ?? invoice.amount ?? 0).toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-xs mb-0.5">Created</p>
                                <p className="font-semibold text-gray-700">
                                  {format(parseISO(invoice.created_at), 'MMM d, yyyy')}
                                </p>
                              </div>
                              {invoice.due_date && (
                                <div>
                                  <p className="text-gray-400 text-xs mb-0.5">Due Date</p>
                                  <p className={`font-semibold ${invoice.status === 'overdue' ? 'text-red-600' : 'text-gray-700'}`}>
                                    {format(parseISO(invoice.due_date), 'MMM d, yyyy')}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-3 lg:flex-shrink-0">
                          {invoice.status === 'draft' && (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={async (e) => {
                                e.stopPropagation()
                                setProcessing(true)
                                try {
                                  const response = await fetch('/api/admin/invoices/send', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ invoiceId: invoice.id }),
                                  })
                                  if (!response.ok) {
                                    const data = await response.json()
                                    throw new Error(data.error || 'Failed to send invoice')
                                  }
                                  toast.success('Invoice sent!')
                                  loadInvoices()
                                } catch (error) {
                                  toast.error(error.message || 'Failed to send invoice')
                                } finally {
                                  setProcessing(false)
                                }
                              }}
                              disabled={processing}
                            >
                              <Send className="w-4 h-4" />
                              Send
                            </Button>
                          )}
                          <Button variant="secondary" size="sm" onClick={() => openViewModal(invoice)}>
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-[#1C294E] mb-2">No Invoices Found</h3>
              <p className="text-gray-500 mb-6">
                {hasActiveFilters ? 'Try adjusting your filters' : 'Create your first invoice to get started'}
              </p>
              {hasActiveFilters ? (
                <Button variant="secondary" onClick={clearFilters}>
                  Clear Filters
                </Button>
              ) : (
                <Button variant="primary" onClick={openCreateModal}>
                  <Plus className="w-5 h-5" />
                  Create Invoice
                </Button>
              )}
            </div>
          )}
        </main>
      </div>

      {/* View Invoice Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Invoice Details" maxWidth="lg">
        {selectedInvoice && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start pb-4 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-[#1C294E]">{selectedInvoice.invoice_number}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Created {format(parseISO(selectedInvoice.created_at), 'MMMM d, yyyy')}
                </p>
              </div>
              <Badge variant={STATUS_CONFIG[selectedInvoice.status]?.color || 'default'} size="lg">
                {STATUS_CONFIG[selectedInvoice.status]?.label || selectedInvoice.status}
              </Badge>
            </div>

            {/* Customer Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Bill To</h3>
              <p className="font-bold text-[#1C294E]">{selectedInvoice.profiles?.full_name}</p>
              <p className="text-sm text-gray-600">{selectedInvoice.profiles?.email}</p>
            </div>

            {/* Line Items */}
            {selectedInvoice.line_items?.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Items</h3>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Description</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Qty</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Rate</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
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
                      {selectedInvoice.tax_amount > 0 && (
                        <>
                          <tr>
                            <td colSpan="3" className="px-4 py-2 text-right text-sm text-gray-600">
                              Subtotal:
                            </td>
                            <td className="px-4 py-2 text-right font-medium text-gray-900">
                              ${parseFloat(selectedInvoice.amount).toFixed(2)}
                            </td>
                          </tr>
                          <tr>
                            <td colSpan="3" className="px-4 py-2 text-right text-sm text-gray-600">
                              Tax ({selectedInvoice.tax_rate}%):
                            </td>
                            <td className="px-4 py-2 text-right font-medium text-gray-900">
                              ${parseFloat(selectedInvoice.tax_amount).toFixed(2)}
                            </td>
                          </tr>
                        </>
                      )}
                      <tr>
                        <td colSpan="3" className="px-4 py-3 text-right font-bold text-gray-900">
                          Total:
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-[#1C294E] text-xl">
                          ${parseFloat(selectedInvoice.total ?? selectedInvoice.amount ?? 0).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Due Date */}
            {selectedInvoice.due_date && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Due Date</p>
                  <p className="font-semibold text-[#1C294E]">
                    {format(parseISO(selectedInvoice.due_date), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedInvoice.notes && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs font-semibold text-amber-700 mb-1">Notes</p>
                <p className="text-sm text-amber-900">{selectedInvoice.notes}</p>
              </div>
            )}

            {/* Zelle Verification */}
            {selectedInvoice.payment_method === 'zelle' && selectedInvoice.status !== 'paid' && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-800">Zelle Payment Claimed</h3>
                </div>
                <p className="text-sm text-purple-700 mb-4">
                  Customer claims to have sent payment via Zelle. Please verify in your Zelle account.
                </p>
                <div className="flex gap-3">
                  <Button variant="success" fullWidth onClick={handleVerifyZelle} loading={processing}>
                    <CheckCircle className="w-4 h-4" />
                    Verify Payment
                  </Button>
                  <Button variant="danger" fullWidth onClick={handleRejectZelle} loading={processing}>
                    <XCircle className="w-4 h-4" />
                    Reject Claim
                  </Button>
                </div>
              </div>
            )}

            {/* Refund Info */}
            {selectedInvoice.refund_amount > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
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
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
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
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="secondary" fullWidth onClick={() => openEditModal(selectedInvoice)}>
                      <FileText className="w-5 h-5" />
                      Edit Draft
                    </Button>
                    <Button variant="primary" fullWidth onClick={handleSendInvoice} loading={processing}>
                      <Send className="w-5 h-5" />
                      Send Invoice
                    </Button>
                  </div>
                </>
              )}

              {(selectedInvoice.status === 'sent' || selectedInvoice.status === 'overdue') && (
                <Button variant="secondary" fullWidth onClick={handleResendInvoice} loading={processing}>
                  <Send className="w-5 h-5" />
                  Resend Invoice
                </Button>
              )}
              {(selectedInvoice.status === 'sent' || selectedInvoice.status === 'overdue') && (
                <>
                  <Button variant="success" fullWidth onClick={() => setShowMarkPaidModal(true)}>
                    <CheckCircle className="w-5 h-5" />
                    Mark as Paid
                  </Button>
                  <Button variant="outline" fullWidth onClick={() => setShowCreditModal(true)}>
                    <CreditCard className="w-5 h-5" />
                    Apply Credit
                  </Button>
                </>
              )}

              {selectedInvoice.status === 'sent' && (
                <Button
                  variant="warning"
                  fullWidth
                  onClick={handleMarkOverdue}
                  loading={processing}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  <AlertCircle className="w-5 h-5" />
                  Mark as Overdue (+5% Fee)
                </Button>
              )}
              {selectedInvoice.status !== 'cancelled' && selectedInvoice.status !== 'paid' && (
                <Button variant="danger" fullWidth onClick={handleCancelInvoice} loading={processing}>
                  <XCircle className="w-5 h-5" />
                  Cancel Invoice
                </Button>
              )}

              {!selectedInvoice.archived && (
                <Button variant="outline" fullWidth onClick={handleArchiveInvoice} loading={processing}>
                  <Archive className="w-5 h-5" />
                  Archive Invoice
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Create/Edit Invoice Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setEditingInvoice(null)
        }}
        title={editingInvoice ? `Edit Invoice ${editingInvoice.invoice_number}` : 'Create New Invoice'}
        maxWidth="2xl"
      >    <div className="space-y-6">
          {/* Customer Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-[#1C294E]">
                Customer <span className="text-red-500">*</span>
              </label>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateCustomerModal(true)}>
                <Plus className="w-4 h-4" />
                Add Customer
              </Button>
            </div>
            <select
              value={newInvoice.customer_id}
              onChange={(e) => setNewInvoice({ ...newInvoice, customer_id: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#079447] focus:ring-2 focus:ring-[#079447]/20 transition-all"
            >
              <option value="">Select a customer...</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.full_name || customer.email}
                </option>
              ))}
            </select>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-semibold text-[#1C294E]">
                Line Items <span className="text-red-500">*</span>
              </label>
              <Button variant="ghost" size="sm" onClick={addLineItem}>
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </div>
            <div className="space-y-3">
              {newInvoice.line_items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-5">
                    <div className={index === 0 ? '' : ''}>
                      {index === 0 && (
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      )}
                      <input
                        list={`descriptions-${index}`}
                        placeholder="Service description"
                        value={item.description}
                        onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#079447] focus:ring-2 focus:ring-[#079447]/20 transition-all"
                      />
                      <datalist id={`descriptions-${index}`}>
                        {previousDescriptions.map((desc, i) => (
                          <option key={i} value={desc} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Input
                      label={index === 0 ? 'Qty' : ''}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      label={index === 0 ? 'Rate' : ''}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={item.rate}
                      onChange={(e) => handleLineItemChange(index, 'rate', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input label={index === 0 ? 'Amount' : ''} value={`$${item.amount.toFixed(2)}`} readOnly disabled />
                  </div>
                  {newInvoice.line_items.length > 1 && (
                    <div className="col-span-1">
                      <Button variant="danger" size="sm" onClick={() => removeLineItem(index)}>
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Totals Preview */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              {(() => {
                const subtotal = calculateTotal()
                const taxRate = parseFloat(newInvoice.tax_rate) || 0
                const taxAmount = subtotal * (taxRate / 100)
                const total = subtotal + taxAmount

                return (
                  <div className="space-y-2 text-right">
                    <div className="flex justify-end items-center gap-4">
                      <span className="text-sm text-gray-600">Subtotal:</span>
                      <span className="font-bold text-[#1C294E] w-24">${subtotal.toFixed(2)}</span>
                    </div>
                    {taxRate > 0 && (
                      <div className="flex justify-end items-center gap-4">
                        <span className="text-sm text-gray-600">Tax ({taxRate}%):</span>
                        <span className="font-bold text-[#1C294E] w-24">${taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-end items-center gap-4 pt-2 border-t border-gray-200">
                      <span className="text-lg font-semibold text-gray-700">Total:</span>
                      <span className="text-2xl font-bold text-[#079447] w-24">${total.toFixed(2)}</span>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>

          {/* Tax Selection */}
          <div>
            <label className="block text-sm font-semibold text-[#1C294E] mb-2">Sales Tax</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: '8.25', label: '8.25%' },
                { value: 'none', label: 'No Tax' },
                { value: 'custom', label: 'Custom' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setTaxMode(option.value)
                    if (option.value === '8.25') setNewInvoice((prev) => ({ ...prev, tax_rate: '8.25' }))
                    else if (option.value === 'none') setNewInvoice((prev) => ({ ...prev, tax_rate: '' }))
                  }}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${taxMode === option.value
                    ? 'border-[#079447] bg-[#079447]/5 text-[#079447]'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {taxMode === 'custom' && (
              <div className="mt-3">
                <Input
                  type="number"
                  placeholder="Enter tax rate %"
                  value={newInvoice.tax_rate}
                  onChange={(e) => setNewInvoice({ ...newInvoice, tax_rate: e.target.value })}
                  step="0.01"
                  min="0"
                />
              </div>
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
            <label className="block text-sm font-semibold text-[#1C294E] mb-2">Notes (Optional)</label>
            <textarea
              value={newInvoice.notes}
              onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#079447] focus:ring-2 focus:ring-[#079447]/20 transition-all resize-none"
              rows="3"
              placeholder="Additional notes or payment instructions..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button
              variant="ghost"
              fullWidth
              onClick={() => {
                setShowCreateModal(false)
                setEditingInvoice(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={editingInvoice ? handleUpdateInvoice : handleCreateInvoice}
              loading={processing}
              disabled={!newInvoice.customer_id || !newInvoice.line_items[0]?.description}
            >
              {editingInvoice ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Save Changes
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Create Invoice
                </>
              )}
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
            onChange={(e) => setNewCustomer({ ...newCustomer, full_name: e.target.value })}
            placeholder="Customer name"
          />
          <Input
            label="Email"
            type="email"
            value={newCustomer.email}
            onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
            placeholder="customer@example.com"
          />
          <Input
            label="Phone"
            value={newCustomer.phone}
            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
            placeholder="(555) 123-4567"
          />

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button variant="ghost" fullWidth onClick={() => setShowCreateCustomerModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" fullWidth onClick={handleCreateCustomer} loading={processing}>
              Save Customer
            </Button>
          </div>
        </div>
      </Modal>

      {/* Mark Paid Modal */}
      <Modal isOpen={showMarkPaidModal} onClose={() => setShowMarkPaidModal(false)} title="Mark Invoice as Paid" maxWidth="sm">
        <div className="space-y-4">
          <p className="text-gray-600">Select the payment method used:</p>
          <div className="space-y-2">
            {['zelle', 'cash', 'check'].map((method) => (
              <label
                key={method}
                className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === method ? 'border-[#079447] bg-[#079447]/5' : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
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
            <Button variant="ghost" fullWidth onClick={() => setShowMarkPaidModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" fullWidth onClick={handleMarkPaid} loading={processing}>
              Confirm Payment
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
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">Invoice Balance</p>
              <p className="text-2xl font-bold text-[#1C294E]">
                ${parseFloat(selectedInvoice.total || selectedInvoice.amount || 0).toFixed(2)}
              </p>
            </div>
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
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-800">
              Credit will be deducted from the customer's account and applied to this invoice.
            </p>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              fullWidth
              onClick={() => {
                setShowCreditModal(false)
                setCreditAmount('')
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" fullWidth onClick={handleApplyCredit} loading={processing}>
              Apply Credit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}