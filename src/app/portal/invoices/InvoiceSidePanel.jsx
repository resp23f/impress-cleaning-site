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
  className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 print:hidden ${
   isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
  }`}
  onClick={onClose}
  />
  {/* Side Panel */}
  <div
  id="invoice-panel"
  className={`fixed top-0 right-0 h-full w-full sm:w-[720px] bg-gradient-to-b from-white to-slate-50/80 shadow-2xl z-50 transform transition-transform duration-500 ease-out ${
   isOpen ? 'translate-x-0' : 'translate-x-full'
  } overflow-y-auto print:static print:w-full print:h-auto print:shadow-none print:transform-none print:bg-white`}
  >
  {loading ? (
   /* Skeleton Loader */
   <div className="animate-pulse">
   {/* Header Skeleton */}
   <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
   <div className="flex items-center gap-3">
   <div className="w-10 h-10 rounded-xl bg-slate-200" />
   <div>
   <div className="h-5 w-32 bg-slate-200 rounded mb-1" />
   <div className="h-3 w-20 bg-slate-100 rounded" />
   </div>
   </div>
   <div className="w-9 h-9 rounded-xl bg-slate-100" />
   </div>
   {/* Action Buttons Skeleton */}
   <div className="px-6 py-4 bg-slate-50/50 flex gap-3">
   <div className="flex-1 h-11 bg-slate-200 rounded-xl" />
   <div className="flex-1 h-11 bg-emerald-100 rounded-xl" />
   </div>
   {/* Content Skeleton */}
   <div className="px-8 py-10">
   {/* Header */}
   <div className="flex items-start justify-between mb-10 pb-8 border-b border-slate-200">
   <div>
   <div className="h-12 w-40 bg-slate-200 rounded mb-4" />
   <div className="space-y-2">
   <div className="h-4 w-48 bg-slate-100 rounded" />
   <div className="h-3 w-40 bg-slate-100 rounded" />
   <div className="h-3 w-32 bg-slate-100 rounded" />
   </div>
   </div>
   <div className="text-right">
   <div className="h-10 w-32 bg-slate-700 rounded-lg mb-3" />
   <div className="h-6 w-28 bg-emerald-100 rounded" />
   </div>
   </div>
   {/* Cards */}
   <div className="grid grid-cols-2 gap-8 mb-8">
   <div className="p-5 rounded-2xl bg-white border border-slate-100">
   <div className="h-3 w-16 bg-slate-100 rounded mb-3" />
   <div className="h-5 w-32 bg-slate-200 rounded mb-2" />
   <div className="h-4 w-40 bg-slate-100 rounded mb-1" />
   <div className="h-4 w-28 bg-slate-100 rounded" />
   </div>
   <div className="p-5 rounded-2xl bg-white border border-slate-100">
   <div className="h-3 w-20 bg-slate-100 rounded mb-2" />
   <div className="h-5 w-36 bg-slate-200 rounded mb-4" />
   <div className="h-3 w-16 bg-slate-100 rounded mb-2" />
   <div className="h-5 w-36 bg-slate-200 rounded" />
   </div>
   </div>
   {/* Service Address */}
   <div className="mb-8 p-5 rounded-2xl bg-slate-50 border border-slate-100">
   <div className="h-3 w-28 bg-slate-200 rounded mb-3" />
   <div className="h-4 w-48 bg-slate-100 rounded mb-1" />
   <div className="h-4 w-36 bg-slate-100 rounded" />
   </div>
   {/* Table */}
   <div className="mb-8 rounded-2xl bg-white border border-slate-100 overflow-hidden">
   <div className="bg-slate-50 p-4 flex">
   <div className="flex-1 h-3 w-24 bg-slate-200 rounded" />
   <div className="w-20 h-3 bg-slate-200 rounded mx-4" />
   <div className="w-20 h-3 bg-slate-200 rounded mx-4" />
   <div className="w-24 h-3 bg-slate-200 rounded" />
   </div>
   <div className="p-4 border-t border-slate-100 flex">
   <div className="flex-1 h-4 bg-slate-100 rounded" />
   <div className="w-16 h-4 bg-slate-100 rounded mx-4" />
   <div className="w-16 h-4 bg-slate-100 rounded mx-4" />
   <div className="w-20 h-4 bg-slate-200 rounded" />
   </div>
   </div>
   {/* Totals */}
   <div className="flex justify-end mb-10">
   <div className="w-80 p-5 rounded-2xl bg-slate-800">
   <div className="space-y-3 pb-4 border-b border-slate-700">
   <div className="flex justify-between">
   <div className="h-4 w-16 bg-slate-600 rounded" />
   <div className="h-4 w-20 bg-slate-600 rounded" />
   </div>
   <div className="flex justify-between">
   <div className="h-4 w-20 bg-slate-600 rounded" />
   <div className="h-4 w-16 bg-slate-600 rounded" />
   </div>
   </div>
   <div className="flex justify-between pt-4">
   <div className="h-4 w-24 bg-slate-600 rounded" />
   <div className="h-7 w-24 bg-emerald-500/50 rounded" />
   </div>
   </div>
   </div>
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
   {/* Invoice Content - with staggered fade in */}
   <div className="px-8 py-10 print:px-12 print:py-6 max-w-4xl mx-auto">
   {/* Professional Header */}
   <div 
   className="flex items-start justify-between mb-10 pb-8 border-b border-slate-200 print:mb-6 print:pb-4 print:border-slate-300 animate-fadeIn"
   style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
   >
   <div>
   <img
   src="/ImpressLogoNoBackgroundBlue.png"
   alt="Impress Cleaning Services"
   className="h-12 mb-4 print:h-10 print:mb-2"
   />
   <div className="text-xs text-slate-500 leading-relaxed space-y-0.5 print:text-[10px]">
   <p className="font-semibold text-slate-700 text-sm print:text-xs">Impress Cleaning Services, LLC</p>
   <p>1530 Sun City Blvd, Suite 120-403</p>
   <p>Georgetown, TX 78633</p>
   <p className="pt-1 text-emerald-600 print:text-slate-600">notifications@impressyoucleaning.com</p>
   </div>
   </div>
   <div className="text-right">
   <div className="inline-block px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg mb-3 print:bg-slate-800 print:px-3 print:py-1">
   <h1 className="text-2xl font-bold text-white tracking-wide print:text-xl">INVOICE</h1>
   </div>
   <div className="text-xl font-bold text-emerald-600 mb-2 print:text-lg print:text-slate-800">
   {invoice?.invoice_number || `INV-${invoice?.id}`}
   </div>
   {invoice && (
    <div className="inline-block print:hidden">
    {getStatusBadge(invoice.status)}
    </div>
   )}
   </div>
   </div>
   {/* Bill To & Invoice Details Grid */}
   <div 
   className="grid grid-cols-2 gap-8 mb-8 print:gap-4 print:mb-4 animate-fadeIn"
   style={{ animationDelay: '0.15s', animationFillMode: 'both' }}
   >
   {/* Bill To */}
   <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm print:p-3 print:rounded-none print:shadow-none print:border-slate-200">
   <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 print:mb-2 print:text-[10px]">
   Bill To
   </div>
   <div className="space-y-2 print:space-y-1">
   <p className="text-lg font-bold text-slate-800 print:text-base">
   {customer?.name || 'Customer'}
   </p>
   {customer?.email && (
    <div className="flex items-center gap-2 text-sm text-slate-500 print:text-xs">
    <Mail className="w-3.5 h-3.5 print:hidden" />
    {customer.email}
    </div>
   )}
   {customer?.phone && (
    <div className="flex items-center gap-2 text-sm text-slate-500 print:text-xs">
    <Phone className="w-3.5 h-3.5 print:hidden" />
    {customer.phone}
    </div>
   )}
   </div>
   </div>
   {/* Invoice Details */}
   <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm print:p-3 print:rounded-none print:shadow-none print:border-slate-200">
   <div className="space-y-4 print:space-y-2">
   <div>
   <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 print:text-[10px]">
   Issue Date
   </div>
   <div className="flex items-center gap-2 text-base font-semibold text-slate-800 print:text-sm">
   <Calendar className="w-4 h-4 text-slate-400 print:hidden" />
   {invoice?.issue_date ? new Date(invoice.issue_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
   }) : '—'}
   </div>
   </div>
   {invoice?.due_date && (
    <div>
    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 print:text-[10px]">
    Due Date
    </div>
    <div className="flex items-center gap-2 text-base font-semibold text-slate-800 print:text-sm">
    <Calendar className="w-4 h-4 text-slate-400 print:hidden" />
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
    <div 
    className="mb-8 p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 print:mb-4 print:p-3 print:rounded-none print:bg-slate-50 animate-fadeIn"
    style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
    >
    <div className="flex items-center gap-2 mb-2">
    <MapPin className="w-4 h-4 text-emerald-500 print:text-slate-600" />
    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 print:text-[10px]">
    Service Address
    </span>
    </div>
    <div className="text-sm text-slate-600 leading-relaxed pl-6 print:pl-0 print:text-xs">
    <p>{customer.street}{customer.unit ? `, ${customer.unit}` : ''}</p>
    <p>{customer.city}, {customer.state} {customer.zip}</p>
    </div>
    </div>
   )}
   {/* Service Summary */}
   {invoice?.service_summary && (
    <div 
    className="mb-8 p-5 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-teal-50/30 border border-emerald-100/50 print:mb-4 print:p-3 print:rounded-none print:bg-slate-50 print:border-slate-200 animate-fadeIn"
    style={{ animationDelay: '0.25s', animationFillMode: 'both' }}
    >
    <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-2 print:text-slate-600 print:text-[10px]">
    Service Description
    </div>
    <p className="text-sm text-slate-600 leading-relaxed print:text-xs">{invoice.service_summary}</p>
    </div>
   )}
   {/* Line Items Table */}
   <div 
   className="mb-8 rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden print:mb-4 print:rounded-none print:shadow-none print:border-slate-300 animate-fadeIn"
   style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
   >
   <table className="w-full">
   <thead>
   <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 print:bg-slate-100">
   <th className="text-left py-4 px-5 text-xs font-semibold uppercase tracking-wider text-slate-500 print:py-2 print:px-3 print:text-[10px]">
   Description
   </th>
   <th className="text-center py-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 w-20 print:py-2 print:text-[10px]">
   Qty
   </th>
   <th className="text-right py-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 w-28 print:py-2 print:text-[10px]">
   Rate
   </th>
   <th className="text-right py-4 px-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-32 print:py-2 print:px-3 print:text-[10px]">
   Amount
   </th>
   </tr>
   </thead>
   <tbody>
   {lineItems.map((item, idx) => (
    <tr
    key={idx}
    className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors duration-150 print:border-slate-200"
    >
    <td className="py-4 px-5 text-sm text-slate-700 print:py-2 print:px-3 print:text-xs">
    {item.description || 'Service'}
    </td>
    <td className="py-4 px-3 text-sm text-center text-slate-500 print:py-2 print:text-xs">
    {item.quantity ?? 1}
    </td>
    <td className="py-4 px-3 text-sm text-right text-slate-500 print:py-2 print:text-xs">
    {formatMoney(item.rate)}
    </td>
    <td className="py-4 px-5 text-base text-right font-semibold text-slate-800 print:py-2 print:px-3 print:text-sm">
    {formatMoney(item.amount)}
    </td>
    </tr>
   ))}
   </tbody>
   </table>
   </div>
   {/* Totals Section */}
   <div 
   className="flex justify-end mb-10 print:mb-6 animate-fadeIn"
   style={{ animationDelay: '0.35s', animationFillMode: 'both' }}
   >
   <div className="w-80 p-5 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white print:w-64 print:p-4 print:rounded-lg print:bg-slate-800">
   <div className="space-y-3 pb-4 border-b border-slate-700 print:space-y-2 print:pb-3">
   <div className="flex justify-between text-sm print:text-xs">
   <span className="text-slate-400">Subtotal</span>
   <span className="font-medium">{formatMoney(invoice?.subtotal ?? invoice?.amount)}</span>
   </div>
   {invoice?.tax_rate > 0 && (
    <div className="flex justify-between text-sm print:text-xs">
    <span className="text-slate-400">Tax ({invoice.tax_rate}%)</span>
    <span className="font-medium">{formatMoney(invoice.tax_amount)}</span>
    </div>
   )}
   </div>
   <div className="flex justify-between items-baseline pt-4 print:pt-3">
   <span className="text-sm font-medium text-slate-300 print:text-xs">Amount Due</span>
   <span className="text-2xl font-bold text-emerald-400 print:text-xl print:text-emerald-300">
   {formatMoney(invoice?.total ?? invoice?.amount)}
   </span>
   </div>
   </div>
   </div>
   {/* Notes */}
   {invoice?.notes && (
    <div 
    className="mb-8 p-5 rounded-2xl bg-gradient-to-br from-amber-50/50 to-orange-50/30 border border-amber-100/50 print:mb-4 print:p-3 print:rounded-none print:bg-amber-50 print:border-amber-200 animate-fadeIn"
    style={{ animationDelay: '0.4s', animationFillMode: 'both' }}
    >
    <div className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-2 print:text-[10px]">
    Notes
    </div>
    <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed print:text-xs">
    {invoice.notes}
    </p>
    </div>
   )}
   {/* Footer */}
   <div 
   className="mt-12 pt-6 border-t border-slate-200 text-center print:mt-6 print:pt-4 animate-fadeIn"
   style={{ animationDelay: '0.45s', animationFillMode: 'both' }}
   >
   <div className="inline-flex items-center gap-2 mb-2">
   <div className="h-0.5 w-6 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full print:hidden" />
   <p className="text-sm font-semibold text-slate-700 print:text-xs">
   Thank you for choosing Impress Cleaning Services
   </p>
   <div className="h-0.5 w-6 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full print:hidden" />
   </div>
   <p className="text-xs text-slate-400 print:text-[10px]">
   Questions? Contact us at notifications@impressyoucleaning.com
   </p>
   </div>
   </div>
   </>
  )}
  </div>
  {/* Styles */}
  <style jsx global>{`
@keyframes fadeIn {
from {
opacity: 0;
transform: translateY(10px);
}
to {
opacity: 1;
transform: translateY(0);
}
}
.animate-fadeIn {
animation: fadeIn 0.4s ease-out forwards;
opacity: 0;
}
@media print {
@page {
size: letter;
margin: 0.4in 0.5in;
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
/* Prevent page breaks inside elements */
#invoice-panel > div {
page-break-inside: avoid;
}
/* Reset animations for print */
.animate-fadeIn {
animation: none !important;
opacity: 1 !important;
transform: none !important;
}
* {
print-color-adjust: exact;
-webkit-print-color-adjust: exact;
}
}
`}</style>
   </>
  )
 }