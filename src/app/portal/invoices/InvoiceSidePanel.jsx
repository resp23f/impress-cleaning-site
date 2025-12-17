'use client'
import { useEffect, useState } from 'react'
import { X, CreditCard, ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

export default function InvoiceSidePanel({ invoiceId, isOpen, onClose }) {
  const router = useRouter()
  const [invoice, setInvoice] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [lineItems, setLineItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen && invoiceId) {
      loadInvoice()
    }
  }, [isOpen, invoiceId])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const loadInvoice = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/customer-portal/invoice/${invoiceId}`)
      if (!response.ok) throw new Error('Failed to load invoice')
      const data = await response.json()
      setInvoice(data.invoice)
      setCustomer(data.customer)
      setLineItems(data.lineItems)
    } catch (error) {
      console.error('Error loading invoice:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayNow = () => {
    router.push(`/portal/invoices/${invoiceId}/pay`)
    onClose()
  }

  const formatMoney = (value) =>
    typeof value === 'number' ? `$${value.toFixed(2)}` : value || '$0.00'

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusStyle = (status) => {
    const styles = {
      paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      overdue: 'bg-red-50 text-red-700 border-red-200',
      cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
      sent: 'bg-amber-50 text-amber-700 border-amber-200',
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
    }
    return styles[status] || 'bg-gray-100 text-gray-600 border-gray-200'
  }

  const canPay = invoice?.status !== 'paid' && invoice?.status !== 'cancelled'

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`
          fixed inset-0 sm:inset-y-0 sm:right-0 sm:left-auto
          w-full sm:w-[540px] md:w-[600px]
          bg-white z-[60]
          transform transition-transform duration-300 ease-out
          flex flex-col
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {loading ? (
          <InvoiceSkeleton onClose={onClose} />
        ) : (
          <>
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-100 safe-area-top">
              <div className="flex items-center justify-between px-4 sm:px-6 h-14 sm:h-16">
                {/* Mobile: Back button with text */}
                <button
                  onClick={onClose}
                  className="sm:hidden flex items-center gap-1 -ml-2 px-2 py-2 text-gray-600 hover:text-gray-900 active:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close invoice"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="text-sm font-medium">Back</span>
                </button>

                {/* Invoice number - centered on mobile, left on desktop */}
                <div className="absolute left-1/2 -translate-x-1/2 sm:relative sm:left-0 sm:translate-x-0">
                  <span className="text-sm font-semibold text-gray-900">
                    {invoice?.invoice_number || `INV-${invoice?.id}`}
                  </span>
                </div>

                {/* Desktop: X button */}
                <button
                  onClick={onClose}
                  className="hidden sm:flex p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close invoice"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Mobile: Status badge */}
                <span className={`sm:hidden inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusStyle(invoice?.status)}`}>
                  {invoice?.status === 'sent' || invoice?.status === 'pending' ? 'Unpaid' : invoice?.status?.charAt(0).toUpperCase() + invoice?.status?.slice(1)}
                </span>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="px-4 sm:px-8 py-6 sm:py-8">

                {/* Header - Company & Invoice Info */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
                  <div>
                    <img
                      src="/ImpressLogoNoBackgroundBlue.png"
                      alt="Impress Cleaning Services"
                      className="h-8 sm:h-10 mb-3 sm:mb-4"
                    />
                    <div className="text-xs text-gray-500 space-y-0.5">
                      <p className="font-medium text-gray-700">Impress Cleaning Services, LLC</p>
                      <p>1530 Sun City Blvd, Suite 120-403</p>
                      <p>Georgetown, TX 78633</p>
                    </div>
                  </div>

                  {/* Desktop: Invoice number & status */}
                  <div className="hidden sm:block text-right">
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Invoice</div>
                    <div className="text-xl font-bold text-gray-900 mb-2">
                      {invoice?.invoice_number || `INV-${invoice?.id}`}
                    </div>
                    <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusStyle(invoice?.status)}`}>
                      {invoice?.status === 'sent' || invoice?.status === 'pending' ? 'Unpaid' : invoice?.status?.charAt(0).toUpperCase() + invoice?.status?.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-8 sm:gap-y-6 mb-6 pb-6 border-b border-gray-100">
                  <div className="p-3 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg">
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 sm:mb-2">Bill To</div>
                    <div className="text-sm">
                      <p className="font-semibold text-gray-900">{customer?.name || 'Customer'}</p>
                      {customer?.email && <p className="text-gray-600 truncate">{customer.email}</p>}
                      {customer?.phone && <p className="text-gray-600">{customer.phone}</p>}
                    </div>
                  </div>
                  <div className="p-3 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg">
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 sm:mb-2">Details</div>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Issue Date</span>
                        <span className="font-medium text-gray-900">{formatDate(invoice?.issue_date)}</span>
                      </div>
                      {invoice?.due_date && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Due Date</span>
                          <span className="font-medium text-gray-900">{formatDate(invoice.due_date)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {customer?.street && (
                    <div className="sm:col-span-2 p-3 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg">
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 sm:mb-2">Service Address</div>
                      <p className="text-sm text-gray-700">
                        {customer.street}{customer.unit ? `, ${customer.unit}` : ''}, {customer.city}, {customer.state} {customer.zip}
                      </p>
                    </div>
                  )}
                </div>

                {/* Line Items - Card style on mobile, table on desktop */}
                <div className="mb-6">
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 sm:hidden">Services</div>

                  {/* Desktop Table */}
                  <table className="hidden sm:table w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                        <th className="text-center py-3 text-xs font-medium text-gray-400 uppercase tracking-wider w-16">Qty</th>
                        <th className="text-right py-3 text-xs font-medium text-gray-400 uppercase tracking-wider w-24">Price</th>
                        <th className="text-right py-3 text-xs font-medium text-gray-400 uppercase tracking-wider w-24">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.filter(item => !item.description?.toLowerCase().includes('tax')).map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-50">
                          <td className="py-3 text-gray-900">{item.description || 'Service'}</td>
                          <td className="py-3 text-center text-gray-600">{item.quantity ?? 1}</td>
                          <td className="py-3 text-right text-gray-600">{formatMoney(item.rate)}</td>
                          <td className="py-3 text-right font-medium text-gray-900">{formatMoney(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Mobile Cards */}
                  <div className="sm:hidden space-y-2">
                    {lineItems.filter(item => !item.description?.toLowerCase().includes('tax')).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0 pr-3">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.description || 'Service'}</p>
                          <p className="text-xs text-gray-500">
                            {item.quantity ?? 1} × {formatMoney(item.rate)}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{formatMoney(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-gray-50 sm:bg-transparent rounded-xl p-4 sm:p-0 sm:flex sm:justify-end mb-6">
                  <div className="sm:w-64">
                    <div className="space-y-2 pb-3 border-b border-gray-200 sm:border-gray-100">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="text-gray-900">
                          {formatMoney(
                            lineItems
                              ?.filter(item => !item.description?.toLowerCase().includes('tax'))
                              .reduce((sum, item) => sum + (item.amount || 0), 0) || invoice?.amount
                          )}
                        </span>
                      </div>
                      {(() => {
                        const taxItem = lineItems.find(item => item.description?.toLowerCase().includes('tax'))
                        if (taxItem) {
                          return (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">{taxItem.description}</span>
                              <span className="text-gray-900">{formatMoney(taxItem.amount)}</span>
                            </div>
                          )
                        }
                        if (invoice?.tax_rate > 0) {
                          return (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Tax ({invoice.tax_rate}%)</span>
                              <span className="text-gray-900">{formatMoney(invoice.tax_amount)}</span>
                            </div>
                          )
                        }
                        return null
                      })()}
                    </div>
                    <div className="flex justify-between pt-3">
                      <span className="font-medium text-gray-900">Amount Due</span>
                      <span className={`text-xl font-bold ${invoice?.status === 'paid' ? 'text-emerald-600' : 'text-[#079447]'}`}>
                        {invoice?.status === 'paid' ? '$0.00' : formatMoney(invoice?.total ?? invoice?.amount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {invoice?.notes && (
                  <div className="mb-6 p-4 bg-amber-50/50 rounded-lg border border-amber-100">
                    <div className="text-xs font-medium text-amber-700 uppercase tracking-wider mb-1">Notes</div>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{invoice.notes}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="pt-6 border-t border-gray-100 text-center">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Thank you for choosing Impress Cleaning Services!
                  </p>
                  <p className="text-xs text-gray-400">
                    Questions? Contact us at billing@impressyoucleaning.com
                  </p>
                </div>

                {/* Bottom spacing for sticky button */}
                {canPay && <div className="h-24 sm:hidden" />}
              </div>
            </div>

            {/* Sticky Pay Button - Mobile Only */}
            {canPay && (
              <div className="sm:hidden sticky bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 safe-area-bottom">
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  onClick={handlePayNow}
                  className="shadow-lg shadow-emerald-200"
                >
                  <CreditCard className="w-5 h-5" />
                  Pay {formatMoney(invoice?.total ?? invoice?.amount)}
                </Button>
              </div>
            )}

            {/* Desktop Pay Button - Inline */}
            {canPay && (
              <div className="hidden sm:block px-8 pb-8">
                <div className="flex justify-end">
                  <div className="w-64">
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={handlePayNow}
                      className="shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300"
                    >
                      <CreditCard className="w-4 h-4" />
                      Pay Now
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

function InvoiceSkeleton({ onClose }) {
  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 sm:px-6 h-14 sm:h-16">
          <button
            onClick={onClose}
            className="sm:hidden flex items-center gap-1 -ml-2 px-2 py-2 text-gray-600 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mx-auto sm:mx-0" />
          <button
            onClick={onClose}
            className="hidden sm:flex p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="sm:hidden h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-6">
            <div>
              <div className="h-8 w-32 bg-gray-200 rounded mb-3" />
              <div className="space-y-2">
                <div className="h-3 w-40 bg-gray-100 rounded" />
                <div className="h-3 w-36 bg-gray-100 rounded" />
              </div>
            </div>
          </div>

          {/* Info grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="h-3 w-16 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-32 bg-gray-200 rounded mb-1" />
              <div className="h-3 w-40 bg-gray-100 rounded" />
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="h-3 w-16 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-full bg-gray-100 rounded mb-1" />
              <div className="h-3 w-full bg-gray-100 rounded" />
            </div>
          </div>

          {/* Line items skeleton */}
          <div className="space-y-2 mb-6">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="h-4 w-32 bg-gray-200 rounded mb-1" />
                  <div className="h-3 w-20 bg-gray-100 rounded" />
                </div>
                <div className="h-4 w-16 bg-gray-200 rounded" />
              </div>
            ))}
          </div>

          {/* Totals skeleton */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="space-y-2 pb-3 border-b border-gray-200">
              <div className="flex justify-between">
                <div className="h-3 w-16 bg-gray-200 rounded" />
                <div className="h-3 w-20 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="flex justify-between pt-3">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-6 w-24 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}