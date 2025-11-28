'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FileText, DollarSign, AlertCircle, Calendar } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import InvoiceSidePanel from './InvoiceSidePanel'
function CancellationTooltip() {
 const [open, setOpen] = useState(false)
 
 // Auto-close after 5 seconds when opened by click
 useEffect(() => {
  if (!open) return
  const timer = setTimeout(() => setOpen(false), 5000)
  return () => clearTimeout(timer)
 }, [open])
 
 return (
  <div className="relative group inline-block">
  <AlertCircle
  className="w-5 h-5 text-red-500 cursor-pointer"
  onClick={() => setOpen((prev) => !prev)}
  />
  
  <div
  className={`
          absolute left-1/2 -translate-x-1/2 -top-14 w-56 px-3 py-2 
          rounded bg-black text-white text-xs text-center z-50
          pointer-events-none
          opacity-0 scale-95
          transition-opacity transition-transform duration-200 ease-out
          ${open ? 'opacity-100 scale-100' : ''}
          group-hover:opacity-100 group-hover:scale-100
        `}
   >
   <p className="mb-1">
   Please provide 48 hours’ notice to cancel or reschedule.
   </p>
   <p className="mb-1">
   Cancellations within 48 hours may incur a $50 late-cancellation fee.
   </p>
   <p>
   Cancellations within 24 hours or no access may be charged the full
   service fee.
   </p>
   </div>
   </div>
  )
 }
 
 function formatDateLocal(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString()
 }
 
 export default function InvoicesPage() {
  const router = useRouter()
  const supabase = createClient()
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
   // Don't show status badge for 'sent' - that's internal admin status
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
  
  const filteredInvoices = invoices.filter((invoice) => {
   // Hide drafts from customers completely
   if (invoice.status === 'draft') return false
   
   if (filter === 'unpaid')
    return invoice.status === 'sent' || invoice.status === 'pending'
   if (filter === 'paid') return invoice.status === 'paid'
   if (filter === 'overdue') return invoice.status === 'overdue'
   if (filter === 'cancelled') return invoice.status === 'cancelled'
   return false
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
  
  if (loading) {
   return (
    <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
    </div>
   )
  }
  
  return (
   <>
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
   {/* Header */}
   <div className="mb-8">
   <h1 className="text-3xl font-bold text-[#1C294E] mb-2">Invoices</h1>
   <p className="text-gray-600">View and pay your invoices</p>
   </div>
   
   {/* Balance Summary */}
   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
   <Card className="p-6">
   <div className="flex items-center justify-between mb-2">
   <span className="text-sm font-medium text-gray-600">
   Total Balance
   </span>
   <DollarSign className="w-5 h-5 text-gray-400" />
   </div>
   <div className="text-3xl font-bold text-[#1C294E]">
   {formatMoney(totalBalance)}
   </div>
   </Card>
   
   <Card className="p-6">
   <div className="flex items-center justify-between mb-2">
   <span className="text-sm font-medium text-gray-600">Overdue</span>
   <CancellationTooltip />
   </div>
   <div className="text-3xl font-bold text-red-600">
   {formatMoney(overdueAmount)}
   </div>
   </Card>
   </div>
   
   {/* Filters */}
   <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
   {['unpaid', 'paid', 'overdue', 'cancelled'].map((filterOption) => (
    <button
    key={filterOption}
    onClick={() => {
     setFilter(filterOption)
     setCurrentPage(1) // reset to first page when filter changes
    }}
    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
     filter === filterOption
     ? 'bg-[#079447] text-white'
     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
    >
    {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
    </button>
   ))}
   </div>
   
   {/* Invoices List */}
   <div>
   {filteredInvoices.length === 0 ? (
    <Card className="p-12 text-center">
    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
    No invoices found
    </h3>
    <p className="text-gray-600">No {filter} invoices found.</p>
    </Card>
   ) : (
    <div className="space-y-4">
    {paginatedInvoices.map((invoice) => (
     <Card
     key={invoice.id}
     className="p-6 hover:shadow-lg transition-shadow"
     >
     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
     <div className="flex items-start gap-4">
     <div
     className={`p-3 rounded-lg ${
      invoice.status === 'paid'
      ? 'bg-green-50'
      : invoice.status === 'overdue'
      ? 'bg-red-50'
      : invoice.status === 'cancelled'
      ? 'bg-gray-50'
      : 'bg-yellow-50'
     }`}
     >
     <FileText
     className={`w-6 h-6 ${
      invoice.status === 'paid'
      ? 'text-green-600'
      : invoice.status === 'overdue'
      ? 'text-red-600'
      : invoice.status === 'cancelled'
      ? 'text-gray-600'
      : 'text-yellow-600'
     }`}
     />
     </div>
     
     <div>
     <div className="flex items-center gap-2 mb-1">
     <div className="flex items-center gap-1">
     <h3 className="font-semibold text-gray-900">
     {invoice.invoice_number || `INV-${invoice.id}`}
     </h3>
     
     {invoice.status === 'overdue' && (
      <CancellationTooltip />
     )}
     </div>
     {invoice.status !== 'overdue' && getStatusBadge(invoice.status)}
     </div>
     <p className="text-sm text-gray-600">
     Issued:{' '}
     {formatDateLocal(
      invoice.created_at.slice(0, 10)
     )}
     </p>
     {invoice.due_date && (
      <p className="text-sm text-gray-600">
      Due: {formatDateLocal(invoice.due_date)}
      </p>
     )}
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
     >
     View
     </Button>
     {(invoice.status === 'sent' ||
      invoice.status === 'pending' ||
      invoice.status === 'overdue') && (
       <Button
       onClick={() =>
        router.push(
         `/portal/invoices/${invoice.id}/pay`
        )
       }
       variant="primary"
       size="sm"
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
      <div className="flex items-center justify-center gap-4 pt-4">
      <button
      onClick={() =>
       setCurrentPage((p) => Math.max(1, p - 1))
      }
      disabled={currentPage === 1}
      className={`px-3 py-1 rounded bg-gray-100 text-gray-700 ${
       currentPage === 1
       ? 'opacity-40 cursor-not-allowed'
       : 'hover:bg-gray-200'
      }`}
      >
      ← Previous
      </button>
      
      <span className="text-sm font-medium text-gray-700">
      Page {currentPage} of {totalPages}
      </span>
      
      <button
      onClick={() =>
       setCurrentPage((p) =>
        Math.min(totalPages, p + 1)
      )
     }
     disabled={currentPage === totalPages}
     className={`px-3 py-1 rounded bg-gray-100 text-gray-700 ${
      currentPage === totalPages
      ? 'opacity-40 cursor-not-allowed'
      : 'hover:bg-gray-200'
     }`}
     >
     Next →
     </button>
     </div>
    )}
    </div>
   )}
   </div>
   </div>
   
   {/* Side Panel */}
   <InvoiceSidePanel
   invoiceId={selectedInvoiceId}
   isOpen={isPanelOpen}
   onClose={handleCloseSidePanel}
   />
   </>
  )
 }
 