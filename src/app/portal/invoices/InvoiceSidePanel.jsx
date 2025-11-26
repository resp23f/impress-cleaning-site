'use client'
import { useEffect, useState } from 'react'
import { X, Download, CreditCard } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

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

  const handlePrint = () => {
    window.print()
  }

  const handlePayNow = () => {
    router.push(`/portal/invoices/${invoiceId}/pay`)
    onClose()
  }

  const formatMoney = (value) =>
    typeof value === 'number' ? `$${value.toFixed(2)}` : value || '$0.00'

  const getStatusBadge = (status) => {
    const variants = {
      paid: 'success',
      pending: 'warning',
      overdue: 'danger',
    }
    return <Badge variant={variants[status] || 'info'}>{status}</Badge>
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
        style={{ opacity: isOpen ? 1 : 0 }}
      />

      {/* Side Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[600px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } overflow-y-auto`}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#079447]"></div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-[#1C294E]">Invoice Details</h2>
                {invoice && getStatusBadge(invoice.status)}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-4 border-b border-gray-200 flex gap-3">
              <Button
                onClick={handlePrint}
                variant="secondary"
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Print / Save PDF
              </Button>
              {invoice?.status !== 'paid' && (
                <Button
                  onClick={handlePayNow}
                  variant="primary"
                  className="flex-1"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay Now
                </Button>
              )}
            </div>

            {/* Invoice Content */}
            <div className="p-6">
              {/* Company Header */}
              <div className="mb-8">
                <img
                  src="/ImpressLogoNoBackgroundBlue.png"
                  alt="Impress Cleaning Services"
                  className="h-10 mb-3"
                />
                <p className="text-sm text-gray-600">Impress Cleaning Services, LLC</p>
                <p className="text-xs text-gray-500">
                  1530 Sun City Blvd, Suite 120-403
                  <br />
                  Georgetown, TX 78633
                </p>
              </div>

              {/* Invoice Info */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Invoice Number
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {invoice?.invoice_number || `INV-${invoice?.id}`}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Issue Date
                  </div>
                  <div className="text-sm text-gray-700">
                    {invoice?.issue_date || '—'}
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="mb-8">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Bill To
                </div>
                <div className="text-sm font-semibold text-gray-900 mb-1">
                  {customer?.name || 'Customer'}
                </div>
                {customer?.email && (
                  <div className="text-sm text-gray-600">{customer.email}</div>
                )}
                {customer?.phone && (
                  <div className="text-sm text-gray-600">{customer.phone}</div>
                )}
                {customer?.street && (
                  <div className="text-sm text-gray-600 mt-2">
                    {customer.street}
                    <br />
                    {customer.city}, {customer.state} {customer.zip}
                  </div>
                )}
              </div>

              {/* Service Summary */}
              {invoice?.service_summary && (
                <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Service Details
                  </div>
                  <p className="text-sm text-gray-700">{invoice.service_summary}</p>
                </div>
              )}

              {/* Line Items */}
              <div className="mb-8">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Description
                      </th>
                      <th className="text-center py-3 text-xs font-semibold uppercase tracking-wider text-gray-600 w-16">
                        Qty
                      </th>
                      <th className="text-right py-3 text-xs font-semibold uppercase tracking-wider text-gray-600 w-24">
                        Rate
                      </th>
                      <th className="text-right py-3 text-xs font-semibold uppercase tracking-wider text-gray-600 w-24">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-3 text-sm text-gray-800">
                          {item.description || 'Service'}
                        </td>
                        <td className="py-3 text-sm text-center text-gray-700">
                          {item.quantity ?? 1}
                        </td>
                        <td className="py-3 text-sm text-right text-gray-700">
                          {formatMoney(item.rate)}
                        </td>
                        <td className="py-3 text-sm text-right font-semibold text-gray-900">
                          {formatMoney(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="border-t-2 border-gray-200 pt-4">
                <div className="flex justify-between text-sm text-gray-700 mb-2">
                  <span>Subtotal</span>
                  <span>{formatMoney(invoice?.subtotal ?? invoice?.amount)}</span>
                </div>
                {invoice?.tax_rate && (
                  <div className="flex justify-between text-sm text-gray-700 mb-2">
                    <span>Tax ({invoice.tax_rate}%)</span>
                    <span>{formatMoney(invoice.tax_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-[#079447] mt-4 pt-4 border-t border-gray-200">
                  <span>Amount Due</span>
                  <span>{formatMoney(invoice?.total ?? invoice?.amount)}</span>
                </div>
              </div>

              {/* Notes */}
              {invoice?.notes && (
                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                    Notes
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {invoice.notes}
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="mt-12 pt-6 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-500">
                  Thank you for choosing Impress Cleaning Services
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Questions? Contact us at notifications@impressyoucleaning.com
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed.right-0 * {
            visibility: visible;
          }
          .fixed.right-0 {
            position: static;
            width: 100%;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </>
  )
}