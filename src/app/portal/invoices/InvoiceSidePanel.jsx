'use client'
import { useEffect, useState } from 'react'
import { X, Download, CreditCard, Printer } from 'lucide-react'
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

  // Prevent body scroll when panel is open
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
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Side Panel */}
      <div
        id="invoice-panel"
        className={`fixed top-0 right-0 h-full w-full sm:w-[700px] bg-gradient-to-br from-white to-gray-50 shadow-2xl z-50 transform transition-all duration-500 ease-out print:shadow-none print:transform-none print:w-full print:h-auto print:relative ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } overflow-y-auto print:overflow-visible`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#079447]"></div>
          </div>
        ) : (
          <>
            {/* Header - Hidden on print */}
            <div className="sticky top-0 bg-gradient-to-r from-[#1C294E] to-[#2a3f5f] border-b border-gray-200 px-6 py-5 flex items-center justify-between z-10 shadow-md print:hidden">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">Invoice Details</h2>
                {invoice && getStatusBadge(invoice.status)}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Action Buttons - Hidden on print */}
            <div className="px-6 py-4 border-b border-gray-200 bg-white flex gap-3 print:hidden">
              <Button
                onClick={handlePrint}
                variant="secondary"
                className="flex-1"
              >
                <Printer className="w-4 h-4 mr-2" />
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

            {/* Invoice Content - Print optimized */}
            <div className="p-8 print:p-12 print:max-w-none">
              {/* Company Header with gradient background */}
              <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 print:border-none print:bg-white print:p-0">
                <img
                  src="/ImpressLogoNoBackgroundBlue.png"
                  alt="Impress Cleaning Services"
                  className="h-12 mb-4 print:h-16"
                />
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-semibold text-[#1C294E]">Impress Cleaning Services, LLC</p>
                  <p>1530 Sun City Blvd, Suite 120-403</p>
                  <p>Georgetown, TX 78633</p>
                  <p className="pt-2 border-t border-gray-200 mt-2">notifications@impressyoucleaning.com</p>
                </div>
              </div>

              {/* Invoice Info Grid */}
              <div className="grid grid-cols-2 gap-6 mb-8 print:mb-12">
                <div className="bg-white p-5 rounded-lg border border-gray-200 print:border print:shadow-none">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Invoice Number
                  </div>
                  <div className="text-xl font-bold text-[#1C294E]">
                    {invoice?.invoice_number || `INV-${invoice?.id}`}
                  </div>
                </div>
                <div className="bg-white p-5 rounded-lg border border-gray-200 print:border print:shadow-none">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Issue Date
                  </div>
                  <div className="text-base font-semibold text-gray-900">
                    {invoice?.issue_date || '—'}
                  </div>
                </div>
              </div>

              {/* Bill To Section */}
              <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200 print:border print:shadow-none print:mb-12">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                  Bill To
                </div>
                <div className="space-y-1">
                  <div className="text-base font-bold text-gray-900">
                    {customer?.name || 'Customer'}
                  </div>
                  {customer?.email && (
                    <div className="text-sm text-gray-600">{customer.email}</div>
                  )}
                  {customer?.phone && (
                    <div className="text-sm text-gray-600">{customer.phone}</div>
                  )}
                  {customer?.street && (
                    <div className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100">
                      {customer.street}
                      <br />
                      {customer.city}, {customer.state} {customer.zip}
                    </div>
                  )}
                </div>
              </div>

              {/* Service Summary */}
              {invoice?.service_summary && (
                <div className="mb-8 p-5 bg-blue-50 rounded-lg border border-blue-100 print:bg-gray-50 print:border-gray-200">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                    Service Details
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{invoice.service_summary}</p>
                </div>
              )}

              {/* Line Items Table */}
              <div className="mb-8 print:mb-12">
                <div className="overflow-hidden rounded-lg border border-gray-200 print:border">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 print:bg-gray-100">
                      <tr>
                        <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wider text-gray-700">
                          Description
                        </th>
                        <th className="text-center py-4 px-4 text-xs font-semibold uppercase tracking-wider text-gray-700 w-20">
                          Qty
                        </th>
                        <th className="text-right py-4 px-4 text-xs font-semibold uppercase tracking-wider text-gray-700 w-28">
                          Rate
                        </th>
                        <th className="text-right py-4 px-4 text-xs font-semibold uppercase tracking-wider text-gray-700 w-32">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {lineItems.map((item, idx) => (
                        <tr key={idx} className="border-t border-gray-100">
                          <td className="py-4 px-4 text-sm text-gray-800">
                            {item.description || 'Service'}
                          </td>
                          <td className="py-4 px-4 text-sm text-center text-gray-700">
                            {item.quantity ?? 1}
                          </td>
                          <td className="py-4 px-4 text-sm text-right text-gray-700">
                            {formatMoney(item.rate)}
                          </td>
                          <td className="py-4 px-4 text-base text-right font-semibold text-gray-900">
                            {formatMoney(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 print:border print:shadow-none">
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-base text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-medium">{formatMoney(invoice?.subtotal ?? invoice?.amount)}</span>
                  </div>
                  {invoice?.tax_rate && (
                    <div className="flex justify-between text-base text-gray-700">
                      <span>Tax ({invoice.tax_rate}%)</span>
                      <span className="font-medium">{formatMoney(invoice.tax_amount)}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between text-xl font-bold pt-4 border-t-2 border-gray-200">
                  <span className="text-[#079447] uppercase tracking-wide">Amount Due</span>
                  <span className="text-[#1C294E]">{formatMoney(invoice?.total ?? invoice?.amount)}</span>
                </div>
              </div>

              {/* Notes */}
              {invoice?.notes && (
                <div className="mt-8 p-5 bg-yellow-50 rounded-lg border border-yellow-100 print:bg-gray-50 print:border-gray-200">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                    Notes
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {invoice.notes}
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="mt-12 pt-8 border-t-2 border-gray-200 text-center print:mt-16">
                <p className="text-sm font-semibold text-[#1C294E] mb-2">
                  Thank you for choosing Impress Cleaning Services
                </p>
                <p className="text-xs text-gray-500">
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
          @page {
            size: letter;
            margin: 0.75in;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          /* Hide EVERYTHING first */
          body * {
            visibility: hidden;
          }

          /* Show only the invoice panel and its children */
          #invoice-panel,
          #invoice-panel * {
            visibility: visible;
          }

          /* Position the panel for print */
          #invoice-panel {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }

          /* Hide buttons and backdrop */
          button,
          [class*="backdrop"],
          [class*="z-40"] {
            display: none !important;
            visibility: hidden !important;
          }

          /* Adjust font sizes for print */
          body {
            font-size: 11pt;
            line-height: 1.4;
          }

          /* Ensure backgrounds print */
          * {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>    </>
  )
}