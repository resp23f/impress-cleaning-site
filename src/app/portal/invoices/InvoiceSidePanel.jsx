'use client'
import { useEffect, useState } from 'react'
import { X, CreditCard, Printer, FileText, Calendar, MapPin, Mail, Phone } from 'lucide-react'
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
    if (status === 'sent' || status === 'pending') {
      return null
    }

    const variants = {
      paid: 'success',
      overdue: 'danger',
      cancelled: 'default',
    }
    return <Badge variant={variants[status] || 'info'}>{status}</Badge>
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-all duration-300 print:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Side Panel */}
      <div
        id="invoice-panel"
        className={`fixed top-0 right-0 h-full w-full sm:w-[720px] bg-gradient-to-b from-white to-slate-50/80 shadow-2xl z-50 transform transition-all duration-500 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } overflow-y-auto print:static print:w-full print:h-auto print:shadow-none print:transform-none`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center animate-pulse">
                <FileText className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-sm text-slate-400">Loading invoice...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10 border-b border-slate-100 print:hidden">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Invoice Details</h2>
                  <p className="text-xs text-slate-400">{invoice?.invoice_number || `INV-${invoice?.id}`}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-xl transition-all duration-200"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-4 bg-slate-50/50 flex gap-3 print:hidden">
              <Button
                onClick={handlePrint}
                variant="secondary"
                className="flex-1 !bg-white !border-slate-200 hover:!border-slate-300 hover:!bg-slate-50 transition-all duration-200"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print / Save PDF
              </Button>
              {invoice?.status !== 'paid' && (
                <Button
                  onClick={handlePayNow}
                  variant="primary"
                  className="flex-1 !bg-gradient-to-r !from-emerald-500 !to-teal-500 hover:!from-emerald-600 hover:!to-teal-600 shadow-lg shadow-emerald-500/20 transition-all duration-200"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay Now
                </Button>
              )}
            </div>

            {/* Invoice Content */}
            <div className="px-8 py-10 print:px-16 print:py-12 max-w-4xl mx-auto">

              {/* Professional Header */}
              <div className="flex items-start justify-between mb-10 pb-8 border-b border-slate-200">
                <div>
                  <img
                    src="/ImpressLogoNoBackgroundBlue.png"
                    alt="Impress Cleaning Services"
                    className="h-12 mb-4 print:h-14"
                  />
                  <div className="text-xs text-slate-500 leading-relaxed space-y-0.5">
                    <p className="font-semibold text-slate-700 text-sm">Impress Cleaning Services, LLC</p>
                    <p>1530 Sun City Blvd, Suite 120-403</p>
                    <p>Georgetown, TX 78633</p>
                    <p className="pt-1 text-emerald-600">notifications@impressyoucleaning.com</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-block px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg mb-3">
                    <h1 className="text-2xl font-bold text-white tracking-wide">INVOICE</h1>
                  </div>
                  <div className="text-xl font-bold text-emerald-600 mb-2">
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
              <div className="grid grid-cols-2 gap-8 mb-8">
                {/* Bill To */}
                <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    Bill To
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-bold text-slate-800">
                      {customer?.name || 'Customer'}
                    </p>
                    {customer?.email && (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Mail className="w-3.5 h-3.5" />
                        {customer.email}
                      </div>
                    )}
                    {customer?.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Phone className="w-3.5 h-3.5" />
                        {customer.phone}
                      </div>
                    )}
                  </div>
                </div>

                {/* Invoice Details */}
                <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Issue Date
                      </div>
                      <div className="flex items-center gap-2 text-base font-semibold text-slate-800">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {invoice?.issue_date ? new Date(invoice.issue_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : '—'}
                      </div>
                    </div>
                    {invoice?.due_date && (
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          Due Date
                        </div>
                        <div className="flex items-center gap-2 text-base font-semibold text-slate-800">
                          <Calendar className="w-4 h-4 text-slate-400" />
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
                <div className="mb-8 p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Service Address
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 leading-relaxed pl-6">
                    <p>{customer.street}{customer.unit ? `, ${customer.unit}` : ''}</p>
                    <p>{customer.city}, {customer.state} {customer.zip}</p>
                  </div>
                </div>
              )}

              {/* Service Summary */}
              {invoice?.service_summary && (
                <div className="mb-8 p-5 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-teal-50/30 border border-emerald-100/50">
                  <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-2">
                    Service Description
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{invoice.service_summary}</p>
                </div>
              )}

              {/* Line Items Table */}
              <div className="mb-8 rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50">
                      <th className="text-left py-4 px-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Description
                      </th>
                      <th className="text-center py-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 w-20">
                        Qty
                      </th>
                      <th className="text-right py-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 w-28">
                        Rate
                      </th>
                      <th className="text-right py-4 px-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-32">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, idx) => (
                      <tr 
                        key={idx} 
                        className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors duration-150"
                      >
                        <td className="py-4 px-5 text-sm text-slate-700">
                          {item.description || 'Service'}
                        </td>
                        <td className="py-4 px-3 text-sm text-center text-slate-500">
                          {item.quantity ?? 1}
                        </td>
                        <td className="py-4 px-3 text-sm text-right text-slate-500">
                          {formatMoney(item.rate)}
                        </td>
                        <td className="py-4 px-5 text-base text-right font-semibold text-slate-800">
                          {formatMoney(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Section */}
              <div className="flex justify-end mb-10">
                <div className="w-80 p-5 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white">
                  <div className="space-y-3 pb-4 border-b border-slate-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Subtotal</span>
                      <span className="font-medium">{formatMoney(invoice?.subtotal ?? invoice?.amount)}</span>
                    </div>
                    {invoice?.tax_rate > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Tax ({invoice.tax_rate}%)</span>
                        <span className="font-medium">{formatMoney(invoice.tax_amount)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-baseline pt-4">
                    <span className="text-sm font-medium text-slate-300">Amount Due</span>
                    <span className="text-2xl font-bold text-emerald-400">
                      {formatMoney(invoice?.total ?? invoice?.amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoice?.notes && (
                <div className="mb-8 p-5 rounded-2xl bg-gradient-to-br from-amber-50/50 to-orange-50/30 border border-amber-100/50">
                  <div className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-2">
                    Notes
                  </div>
                  <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                    {invoice.notes}
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="mt-12 pt-6 border-t border-slate-200 text-center">
                <div className="inline-flex items-center gap-2 mb-2">
                  <div className="h-0.5 w-6 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" />
                  <p className="text-sm font-semibold text-slate-700">
                    Thank you for choosing Impress Cleaning Services
                  </p>
                  <div className="h-0.5 w-6 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full" />
                </div>
                <p className="text-xs text-slate-400">
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
            background: white !important;
          }

          * {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          #invoice-panel {
            page-break-after: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </>
  )
}