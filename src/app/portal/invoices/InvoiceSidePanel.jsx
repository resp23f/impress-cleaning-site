'use client'
import { useEffect, useState } from 'react'
import { X, CreditCard, Download } from 'lucide-react'
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

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 :hidden"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        id="invoice-panel"
        className={`fixed top-0 right-0 h-full w-full sm:w-[600px] bg-white z-50 transform transition-transform duration-300 ease-out overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {loading ? (
          <InvoiceSkeleton />
        ) : (
          <>
            {/* Action Bar */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-end">
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>            {/* Invoice Content */}
            <div className="px-8 py-8" id="invoice-content">

              {/* Header */}
              <div className="flex items-start justify-between mb-10 mb-8">
                <div>
                  <img
                    src="/ImpressLogoNoBackgroundBlue.png"
                    alt="Impress Cleaning Services"
                    className="h-10 mb-4 h-8"
                  />
                  <div className="text-xs text-gray-500 space-y-0.5">
                    <p className="font-medium text-gray-700">Impress Cleaning Services, LLC</p>
                    <p>1530 Sun City Blvd, Suite 120-403</p>
                    <p>Georgetown, TX 78633</p>
                  </div>
                </div>
                <div className="text-right">
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
              <div className="grid grid-cols-2 gap-x-8 gap-y-6 mb-8 pb-8 border-b border-gray-100 mb-6 pb-6">
                <div>
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Bill To</div>
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900">{customer?.name || 'Customer'}</p>
                    {customer?.email && <p className="text-gray-600">{customer.email}</p>}
                    {customer?.phone && <p className="text-gray-600">{customer.phone}</p>}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Details</div>
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
                  <div className="col-span-2">
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Service Address</div>
                    <p className="text-sm text-gray-700">
                      {customer.street}{customer.unit ? `, ${customer.unit}` : ''}, {customer.city}, {customer.state} {customer.zip}
                    </p>
                  </div>
                )}
              </div>

              {/* Line Items */}
              <div className="mb-8 mb-6">
                <table className="w-full text-sm">
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
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-10">
                <div className="w-64">
                  <div className="space-y-2 pb-3 border-b border-gray-100">
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
                  <div className="flex justify-between pt-3 mb-4">
                    <span className="font-medium text-gray-900">Amount Due</span>
                    <span className={`text-xl font-bold ${invoice?.status === 'paid' ? 'text-emerald-600' : 'text-[#079447]'}`}>
                      {invoice?.status === 'paid' ? '$0.00' : formatMoney(invoice?.total ?? invoice?.amount)}
                    </span>
                  </div>
                  {invoice?.status !== 'paid' && invoice?.status !== 'cancelled' && (
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={handlePayNow}
                      className="shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300"
                    >
                      <CreditCard className="w-4 h-4" />
                      Pay Now
                    </Button>
                  )}
                </div>
              </div>
              {/* Notes */}
              {invoice?.notes && (
                <div className="mb-8 p-4 bg-amber-50/50 rounded-lg border border-amber-100 mb-6">
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
            </div>
          </>
        )}
      </div>
    </>
  )
}

function InvoiceSkeleton() {
  return (
    <div className="animate-pulse px-8 py-8">
      {/* Action bar skeleton */}
      <div className="flex gap-3 mb-8 pb-4 border-b border-gray-100">
        <div className="flex-1 h-10 bg-gray-100 rounded-lg" />
        <div className="flex-1 h-10 bg-gray-100 rounded-lg" />
        <div className="w-10 h-10 bg-gray-100 rounded-lg" />
      </div>

      {/* Header skeleton */}
      <div className="flex justify-between mb-10">
        <div>
          <div className="h-10 w-32 bg-gray-100 rounded mb-4" />
          <div className="space-y-2">
            <div className="h-3 w-40 bg-gray-100 rounded" />
            <div className="h-3 w-36 bg-gray-100 rounded" />
            <div className="h-3 w-32 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="text-right">
          <div className="h-3 w-16 bg-gray-100 rounded mb-2 ml-auto" />
          <div className="h-6 w-28 bg-gray-100 rounded mb-2 ml-auto" />
          <div className="h-5 w-16 bg-gray-100 rounded ml-auto" />
        </div>
      </div>

      {/* Info grid skeleton */}
      <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-100">
        <div>
          <div className="h-3 w-16 bg-gray-100 rounded mb-3" />
          <div className="h-4 w-32 bg-gray-100 rounded mb-2" />
          <div className="h-3 w-40 bg-gray-100 rounded" />
        </div>
        <div>
          <div className="h-3 w-16 bg-gray-100 rounded mb-3" />
          <div className="h-3 w-full bg-gray-100 rounded mb-2" />
          <div className="h-3 w-full bg-gray-100 rounded" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="mb-8">
        <div className="flex border-b border-gray-200 pb-3 mb-3">
          <div className="flex-1 h-3 bg-gray-100 rounded" />
          <div className="w-16 h-3 bg-gray-100 rounded mx-4" />
          <div className="w-24 h-3 bg-gray-100 rounded" />
        </div>
        <div className="flex py-3">
          <div className="flex-1 h-4 bg-gray-100 rounded" />
          <div className="w-16 h-4 bg-gray-100 rounded mx-4" />
          <div className="w-24 h-4 bg-gray-100 rounded" />
        </div>
      </div>

      {/* Totals skeleton */}
      <div className="flex justify-end">
        <div className="w-64">
          <div className="space-y-2 pb-3 border-b border-gray-100">
            <div className="flex justify-between">
              <div className="h-3 w-16 bg-gray-100 rounded" />
              <div className="h-3 w-20 bg-gray-100 rounded" />
            </div>
          </div>
          <div className="flex justify-between pt-3">
            <div className="h-4 w-24 bg-gray-100 rounded" />
            <div className="h-6 w-24 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}