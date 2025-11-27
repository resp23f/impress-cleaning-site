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
      sent: 'info',
      pending: 'warning',
      overdue: 'danger',
      draft: 'default',
    }
    return <Badge variant={variants[status] || 'info'}>{status?.toUpperCase()}</Badge>
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-300 print:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Side Panel */}
      <div
        id="invoice-panel"
        className={`fixed top-0 right-0 h-full w-full sm:w-[750px] bg-white shadow-2xl z-50 transform transition-all duration-500 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } overflow-y-auto print:static print:w-full print:h-auto print:shadow-none print:transform-none`}
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
            <div className="sticky top-0 bg-gradient-to-r from-[#1C294E] to-[#2a3f5f] px-6 py-5 flex items-center justify-between z-10 shadow-md print:hidden">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">Invoice</h2>
{invoice && invoice.status !== 'draft' && getStatusBadge(invoice.status)}              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Action Buttons - Hidden on print */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex gap-3 print:hidden">
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

            {/* Invoice Content */}
            <div className="px-8 py-10 print:px-16 print:py-12 max-w-4xl mx-auto">
              
              {/* Professional Header */}
              <div className="flex items-start justify-between mb-12 pb-8 border-b-2 border-gray-900 print:border-b-4">
                <div>
                  <img
                    src="/ImpressLogoNoBackgroundBlue.png"
                    alt="Impress Cleaning Services"
                    className="h-14 mb-3 print:h-16"
                  />
                  <div className="text-xs text-gray-600 leading-relaxed space-y-0.5">
                    <p className="font-bold text-gray-900 text-sm">Impress Cleaning Services, LLC</p>
                    <p>1530 Sun City Blvd, Suite 120-403</p>
                    <p>Georgetown, TX 78633</p>
                    <p className="pt-1">notifications@impressyoucleaning.com</p>
                  </div>
                </div>
                <div className="text-right">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2 print:text-5xl">INVOICE</h1>
                  <div className="text-2xl font-bold text-[#079447] mb-1">
                    {invoice?.invoice_number || `INV-${invoice?.id}`}
                  </div>
                  {invoice && (
                    <div className="inline-block">
                      {getStatusBadge(invoice.status)}
                    </div>
                  )}
                </div>
              </div>

              {/* Bill To & Invoice Details Grid */}
              <div className="grid grid-cols-2 gap-8 mb-10">
                {/* Bill To */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                    Bill To
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-lg font-bold text-gray-900">
                      {customer?.name || 'Customer'}
                    </p>
                    {customer?.email && (
                      <p className="text-sm text-gray-600">{customer.email}</p>
                    )}
                    {customer?.phone && (
                      <p className="text-sm text-gray-600">{customer.phone}</p>
                    )}
                  </div>
                </div>

                {/* Invoice Details */}
                <div className="text-right">
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                        Issue Date
                      </div>
                      <div className="text-base font-semibold text-gray-900">
                        {invoice?.issue_date ? new Date(invoice.issue_date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        }) : '—'}
                      </div>
                    </div>
                    {invoice?.due_date && (
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                          Due Date
                        </div>
                        <div className="text-base font-semibold text-gray-900">
                          {new Date(invoice.due_date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Service Address */}
              {customer?.street && (
                <div className="mb-10 p-5 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Service Address
                  </div>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    <p>{customer.street}{customer.unit ? `, ${customer.unit}` : ''}</p>
                    <p>{customer.city}, {customer.state} {customer.zip}</p>
                  </div>
                </div>
              )}

              {/* Service Summary */}
              {invoice?.service_summary && (
                <div className="mb-10 p-5 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Service Description
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{invoice.service_summary}</p>
                </div>
              )}

              {/* Line Items Table */}
              <div className="mb-8">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-900">
                      <th className="text-left py-3 text-xs font-bold uppercase tracking-wider text-gray-700">
                        Description
                      </th>
                      <th className="text-center py-3 text-xs font-bold uppercase tracking-wider text-gray-700 w-20">
                        Qty
                      </th>
                      <th className="text-right py-3 text-xs font-bold uppercase tracking-wider text-gray-700 w-28">
                        Rate
                      </th>
                      <th className="text-right py-3 text-xs font-bold uppercase tracking-wider text-gray-700 w-32">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-200">
                        <td className="py-4 text-sm text-gray-800">
                          {item.description || 'Service'}
                        </td>
                        <td className="py-4 text-sm text-center text-gray-700">
                          {item.quantity ?? 1}
                        </td>
                        <td className="py-4 text-sm text-right text-gray-700">
                          {formatMoney(item.rate)}
                        </td>
                        <td className="py-4 text-base text-right font-semibold text-gray-900">
                          {formatMoney(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Section */}
              <div className="flex justify-end mb-10">
                <div className="w-80">
                  <div className="space-y-3 pb-4 border-b border-gray-300">
                    <div className="flex justify-between text-sm text-gray-700">
                      <span className="font-medium">Subtotal</span>
                      <span className="font-semibold">{formatMoney(invoice?.subtotal ?? invoice?.amount)}</span>
                    </div>
                    {invoice?.tax_rate > 0 && (
                      <div className="flex justify-between text-sm text-gray-700">
                        <span className="font-medium">Tax ({invoice.tax_rate}%)</span>
                        <span className="font-semibold">{formatMoney(invoice.tax_amount)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-baseline pt-4">
                    <span className="text-lg font-bold text-gray-900">AMOUNT DUE</span>
                    <span className="text-3xl font-bold text-[#079447]">
                      {formatMoney(invoice?.total ?? invoice?.amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoice?.notes && (
                <div className="mb-8 p-5 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Notes
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {invoice.notes}
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="mt-12 pt-6 border-t border-gray-300 text-center">
                <p className="text-sm font-semibold text-gray-900 mb-1">
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
            margin: 0.5in 0.75in;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          /* Hide everything except invoice panel */
          body * {
            visibility: hidden;
          }

          #invoice-panel,
          #invoice-panel * {
            visibility: visible;
          }

          #invoice-panel {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }

          /* Ensure backgrounds print */
          * {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          /* Force single page */
          #invoice-panel {
            page-break-after: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </>
  )
}