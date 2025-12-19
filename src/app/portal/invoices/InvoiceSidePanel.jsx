'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, CreditCard } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

export default function InvoiceSidePanel({ invoiceId, isOpen, onClose }) {
  const router = useRouter()
  const [invoice, setInvoice] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [lineItems, setLineItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Portal mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle open/close animations
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure DOM is ready, then trigger animation
      requestAnimationFrame(() => {
        setIsAnimating(true)
      })
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && invoiceId) {
      loadInvoice()
    }
  }, [isOpen, invoiceId])

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

  const handleClose = () => {
    setIsAnimating(false)
    document.body.style.overflow = 'unset'
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const handlePayNow = () => {
    router.push(`/portal/invoices/${invoiceId}/pay`)
    handleClose()
  }

  const formatMoney = (value) =>
    typeof value === 'number' ? `$${value.toFixed(2)}` : value || '$0.00'

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    // Add T00:00:00 to treat as local date, not UTC
    const date = dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', {
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

  // Don't render until mounted (for portal) or if not open
  if (!mounted || !isOpen) return null

  const panelContent = (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={`
          absolute inset-y-0 right-0 w-full sm:w-[540px] md:w-[600px]
          bg-white shadow-2xl
          flex flex-col
          transition-transform duration-300 ease-out
          ${isAnimating ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {loading ? (
          <InvoiceSkeleton onClose={handleClose} />
        ) : (
          <>
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 h-16 bg-white border-b border-gray-100">
              {/* Left: Invoice number and status */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900">
                  {invoice?.invoice_number || `INV-${invoice?.id}`}
                </span>
                <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusStyle(invoice?.status)}`}>
                  {invoice?.status === 'sent' || invoice?.status === 'pending' ? 'Unpaid' : invoice?.status?.charAt(0).toUpperCase() + invoice?.status?.slice(1)}
                </span>
              </div>

              {/* Right: X button */}
              <button
                onClick={handleClose}
                className="p-2.5 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 active:bg-gray-200 rounded-xl transition-colors"
                aria-label="Close invoice"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="px-4 sm:px-8 py-6 sm:py-8">

                {/* Header - Company Info */}
                <div className="mb-6 sm:mb-8">
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

                {/* Line Items */}
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
                      {lineItems
                        .filter(item => 
                          !item.description?.toLowerCase().includes('tax') &&
                          !item.description?.toLowerCase().includes('late fee')
                        )
                        .map((item, idx) => (
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
                    {lineItems
                      .filter(item => 
                        !item.description?.toLowerCase().includes('tax') &&
                        !item.description?.toLowerCase().includes('late fee')
                      )
                      .map((item, idx) => (
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
                    {(() => {
                      const taxItem = lineItems.find(item => item.description?.toLowerCase().includes('tax'))
                      const lateFeeItem = lineItems.find(item => item.description?.toLowerCase().includes('late fee'))
                      const subtotal = lineItems
                        ?.filter(item => 
                          !item.description?.toLowerCase().includes('tax') &&
                          !item.description?.toLowerCase().includes('late fee')
                        )
                        .reduce((sum, item) => sum + (item.amount || 0), 0) || invoice?.amount
                      const taxAmount = taxItem?.amount || (invoice?.tax_rate > 0 ? invoice.tax_amount : 0)
                      const hasLateFee = !!lateFeeItem
                      
                      return (
                        <div className="space-y-2 pb-3 border-b border-gray-200 sm:border-gray-100">
                          {/* Subtotal */}
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="text-gray-900">{formatMoney(subtotal)}</span>
                          </div>
                          {/* Tax */}
                          {(taxItem || invoice?.tax_rate > 0) && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">{taxItem?.description || `Tax (${invoice.tax_rate}%)`}</span>
                              <span className="text-gray-900">{formatMoney(taxAmount)}</span>
                            </div>
                          )}
                          {/* Original Total - only show if there's a late fee */}
                          {hasLateFee && (
                            <>
                              <div className="flex justify-between text-sm pt-1 border-t border-gray-100">
                                <span className="text-gray-500">Original Total</span>
                                <span className="text-gray-900">{formatMoney(subtotal + taxAmount)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-red-600 font-medium">Late Fee (5%)</span>
                                <span className="text-red-600 font-medium">{formatMoney(lateFeeItem.amount)}</span>
                              </div>
                            </>
                          )}
                        </div>
                      )
                    })()}
                    <div className="flex justify-between pt-3 mb-4">
                      <span className="font-medium text-gray-900">Amount Due</span>
                      <span className={`text-xl font-bold ${invoice?.status === 'paid' ? 'text-emerald-600' : 'text-[#079447]'}`}>
                        {invoice?.status === 'paid' ? '$0.00' : formatMoney(invoice?.total ?? invoice?.amount)}
                      </span>
                    </div>
                    {/* Pay Button - Desktop (inside totals) */}
                    {canPay && (
                      <Button
                        variant="primary"
                        fullWidth
                        onClick={handlePayNow}
                        className="hidden sm:flex shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300"
                      >
                        <CreditCard className="w-4 h-4" />
                        Pay Now
                      </Button>
                    )}
                  </div>
                </div>

                {/* Late Payment Policy - shown for overdue invoices with late fee */}
                {invoice?.status === 'overdue' && lineItems.some(item => item.description?.toLowerCase().includes('late fee')) && (
                  <div className="mb-6 p-4 bg-red-50/50 rounded-lg border border-red-100">
                    <div className="text-xs font-medium text-red-700 uppercase tracking-wider mb-2">Late Payment Policy</div>
                    <p className="text-sm text-gray-700">
                      A 5% late fee has been applied to this invoice as payment was not received within the 7-day grace period after the due date.
                    </p>
                  </div>
                )}

                {/* Notes - only show if there are actual customer-facing notes (not system-generated) */}
                {invoice?.notes && !invoice.notes.includes('Manually marked overdue') && !invoice.notes.includes('late fee applied') && (
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

                {/* Bottom spacing for mobile pay button */}
                {canPay && <div className="h-24 sm:hidden" />}
              </div>
            </div>

            {/* Fixed Pay Button - Mobile Only */}
            {canPay && (
              <div className="sm:hidden flex-shrink-0 p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] bg-white border-t border-gray-100">
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
          </>
        )}
      </div>
    </div>
  )

  // Render via portal to escape any parent stacking contexts
  return createPortal(panelContent, document.body)
}

function InvoiceSkeleton({ onClose }) {
  return (
    <>
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 h-16 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
        </div>
        <button
          onClick={onClose}
          className="p-2.5 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="animate-pulse">
          {/* Logo skeleton */}
          <div className="mb-6">
            <div className="h-8 w-32 bg-gray-200 rounded mb-3" />
            <div className="space-y-2">
              <div className="h-3 w-40 bg-gray-100 rounded" />
              <div className="h-3 w-36 bg-gray-100 rounded" />
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
