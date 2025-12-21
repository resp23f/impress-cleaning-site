'use client'
import { useState, useEffect, useMemo } from 'react'
import styles from '../shared-animations.module.css'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FileText, DollarSign, AlertCircle, RefreshCw, Check, Clock } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { InvoicesSkeleton } from '@/components/ui/SkeletonLoader'
import InvoiceSidePanel from './InvoiceSidePanel'
import Modal from '@/components/ui/Modal'
import PageTitle from '@/components/portal/PageTitle'
function CancellationTooltip() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
        className="w-9 h-9 rounded-full bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 flex items-center justify-center transition-colors duration-200 cursor-pointer"
      >
        <AlertCircle className="w-4 h-4 text-red-600" />
      </div>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Cancellation & Rescheduling Policy" maxWidth="sm" centered>
        <div className="space-y-5">
          <p className="text-sm text-gray-500">Changes made before your scheduled appointment:</p>

          <div className="space-y-3">
            {/* Free tier */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-green-200">
                <Check className="w-6 h-6 text-white" strokeWidth={3} />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900">48+ hours before</p>
                <p className="text-sm font-medium text-green-600">No fee</p>
              </div>
            </div>

            {/* $50 tier */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-100 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-200">
                <DollarSign className="w-6 h-6 text-white" strokeWidth={3} />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900">24–48 hours before</p>
                <p className="text-sm font-medium text-amber-600">$50 fee</p>
              </div>
            </div>

            {/* Full fee tier */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl border border-red-100 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-red-200">
                <Clock className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900">Less than 24 hours</p>
                <p className="text-sm font-medium text-red-600">Full service fee</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 pt-3 border-t border-gray-100">
            <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-400">
              No-shows incur the full service fee after a 15-minute grace period.
            </p>
          </div>
        </div>
      </Modal>
    </>
  )
}

function formatDateLocal(dateStr) {
  if (!dateStr) return '—'
  // Extract date portion and parse as local time
  const dateOnly = dateStr.slice(0, 10)
  return new Date(dateOnly + 'T00:00:00').toLocaleDateString()
}
export default function InvoicesPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('unpaid')
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 4

  useEffect(() => {
    loadInvoices()
  }, [])

  const loadInvoices = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setInvoices(data || [])
    } catch (error) {
      console.error('Error loading invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewInvoice = (invoiceId) => {
    setSelectedInvoiceId(invoiceId)
    setIsPanelOpen(true)
  }

  const handleCloseSidePanel = () => {
    setIsPanelOpen(false)
    setTimeout(() => setSelectedInvoiceId(null), 300)
  }

  const formatMoney = (amount) => {
    return typeof amount === 'number'
      ? `$${amount.toFixed(2)}`
      : amount || '$0.00'
  }

  const getStatusBadge = (status) => {
    // Don't show status badge for 'sent' or 'pending' - that's internal admin status
    if (status === 'sent' || status === 'pending') {
      return null
    }

    const variants = {
      paid: 'success',
      overdue: 'danger',
      cancelled: 'default',
    }

    const labels = {
      paid: 'Paid',
      overdue: 'Overdue',
      cancelled: 'Cancelled',
    }

    return <Badge variant={variants[status] || 'info'}>{labels[status] || status}</Badge>
  }
  const filteredInvoices = invoices.filter((invoice) => {
    // Hide drafts from customers completely
    if (invoice.status === 'draft') return false
    // Hide archived invoices
    if (invoice.archived) return false

    if (filter === 'all') return true
    if (filter === 'unpaid')
      return invoice.status === 'sent' || invoice.status === 'pending' || invoice.status === 'overdue'
    if (filter === 'paid') return invoice.status === 'paid'
    if (filter === 'overdue') return invoice.status === 'overdue'
    if (filter === 'cancelled') return invoice.status === 'cancelled'
    return true
  })
  const totalPages = Math.ceil(filteredInvoices.length / pageSize)
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const totalBalance = invoices
    .filter(
      (inv) =>
        inv.status === 'sent' ||
        inv.status === 'pending' ||
        inv.status === 'overdue'
    )
    .reduce((sum, inv) => sum + (inv.total || inv.amount || 0), 0)

  const overdueAmount = invoices
    .filter((inv) => inv.status === 'overdue')
    .reduce((sum, inv) => sum + (inv.total || inv.amount || 0), 0)

  return (
    <>
      <PageTitle title="Invoices" />
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 ${!loading ? styles.contentReveal : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
          {loading ? (
            <InvoicesSkeleton />
          ) : (
            <>
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-1 w-12 bg-gradient-to-r from-[#079447] to-emerald-400 rounded-full" />
                  <span className="text-sm font-medium text-[#079447] uppercase tracking-wider">Invoices</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-[#1C294E] tracking-tight">Billing & Payments</h1>
              </div>

              {/* Balance Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                <Card className="p-6 !rounded-2xl !shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] bg-gradient-to-br from-white to-slate-50">
                  <div className="flex items-center justify-between h-9 mb-4">
                    <span className="text-sm font-medium text-gray-500">Total Balance</span>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-[#1C294E] tracking-tight">
                    {formatMoney(totalBalance)}
                  </div>
                </Card>

                <Card className="p-6 !rounded-2xl !shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] bg-gradient-to-br from-white to-red-50/30">
                  <div className="flex items-center justify-between h-9 mb-4">
                    <span className="text-sm font-medium text-gray-500">Overdue</span>
                    <CancellationTooltip />
                  </div>
                  <div className="text-4xl font-bold text-red-600 tracking-tight">
                    {formatMoney(overdueAmount)}
                  </div>
                </Card>
              </div>

              {/* Filters */}
              <div className="flex justify-center mb-8">
                <div className="inline-flex flex-nowrap justify-center gap-2.5 sm:gap-3">
                  {['all', 'unpaid', 'paid', 'overdue', 'cancelled'].map((filterOption) => (
                    <button
                      key={filterOption}
                      onClick={() => {
                        setFilter(filterOption)
                        setCurrentPage(1)
                      }}
                      className={`px-2.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${filter === filterOption
                        ? 'bg-[#079447] text-white shadow-lg shadow-emerald-200'
                        : 'bg-white text-gray-600 shadow-md hover:shadow-lg hover:bg-gray-50 border border-gray-100'
                        } ${styles.smoothTransition}`}
                    >
                      {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Invoices List */}
              <div>
                {filteredInvoices.length === 0 ? (
                  <Card className="p-12 text-center !rounded-2xl !shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)]">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1C294E] mb-1">
                      No {filter} invoices
                    </h3>
                    <p className="text-gray-500">You're all caught up!</p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {paginatedInvoices.map((invoice, index) => (
                      <Card
                        key={invoice.id}
                        className="p-6 !rounded-2xl !shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.08)] hover:!shadow-[0_1px_3px_rgba(0,0,0,0.08),0_15px_40px_-10px_rgba(0,0,0,0.12)] border border-gray-100/50"

                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center ${invoice.status === 'paid'
                                ? 'bg-gradient-to-br from-green-50 to-emerald-100'
                                : invoice.status === 'overdue'
                                  ? 'bg-gradient-to-br from-red-50 to-red-100'
                                  : invoice.status === 'cancelled'
                                    ? 'bg-gradient-to-br from-gray-50 to-slate-100'
                                    : 'bg-gradient-to-br from-amber-50 to-yellow-100'
                                }`}
                            >
                              <FileText
                                className={`w-5 h-5 ${invoice.status === 'paid'
                                  ? 'text-emerald-600'
                                  : invoice.status === 'overdue'
                                    ? 'text-red-600'
                                    : invoice.status === 'cancelled'
                                      ? 'text-gray-500'
                                      : 'text-amber-600'
                                  }`}
                              />
                            </div>

                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900">
                                  {invoice.invoice_number || `INV-${invoice.id}`}
                                </h3>
                                {getStatusBadge(invoice.status)}                            {invoice.refund_amount > 0 && (
                                  <Badge variant="info" className="flex items-center gap-1">
                                    <RefreshCw className="w-3 h-3" />
                                    Refunded ${parseFloat(invoice.refund_amount).toFixed(2)}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                                {invoice.service_date && (
                                  <span>Service: {formatDateLocal(invoice.service_date)}</span>
                                )}
                                {invoice.due_date && (
                                  <span>Due: {formatDateLocal(invoice.due_date)}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-2xl font-bold text-[#1C294E]">
                                {formatMoney(invoice.total || invoice.amount)}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleViewInvoice(invoice.id)}
                                variant="secondary"
                                size="sm"
                                className={styles.smoothTransition}
                              >
                                View
                              </Button>
                              {(invoice.status === 'sent' ||
                                invoice.status === 'pending' ||
                                invoice.status === 'overdue') && (
                                  <Button
                                    onClick={() =>
                                      router.push(`/portal/invoices/${invoice.id}/pay`)
                                    }
                                    variant="primary"
                                    size="sm"
                                    className={styles.smoothTransition}
                                  >
                                    Pay Now
                                  </Button>
                                )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-3 pt-6">
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className={`px-4 py-2 rounded-xl font-medium ${currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 shadow-sm border border-gray-100 hover:bg-gray-50 hover:shadow-md'
                            } ${styles.smoothTransition}`}
                        >
                          ← Previous
                        </button>

                        <span className="px-4 py-2 text-sm font-semibold text-[#1C294E]">
                          {currentPage} / {totalPages}
                        </span>

                        <button
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className={`px-4 py-2 rounded-xl font-medium ${currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 shadow-sm border border-gray-100 hover:bg-gray-50 hover:shadow-md'
                            } ${styles.smoothTransition}`}
                        >
                          Next →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Side Panel - Outside conditional so it stays mounted */}
        <InvoiceSidePanel
          invoiceId={selectedInvoiceId}
          isOpen={isPanelOpen}
          onClose={handleCloseSidePanel}
        />
      </div>
    </>
  )
}
