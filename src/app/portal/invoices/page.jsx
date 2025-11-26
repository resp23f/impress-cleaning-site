import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  Receipt,
  Download,
  CreditCard,
  Filter,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
export default async function InvoicesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }
  // Get all invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })
  // Categorize invoices
  const unpaidInvoices = invoices?.filter(inv =>
    inv.status !== 'paid' && inv.status !== 'cancelled'
  ) || []
  const paidInvoices = invoices?.filter(inv => inv.status === 'paid') || []
  const totalBalance = unpaidInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
  const getStatusBadge = (status) => {
    const variants = {
      paid: 'success',
      sent: 'info',
      overdue: 'danger',
      draft: 'default',
      cancelled: 'default',
    }
    return variants[status] || 'default'
  }
  const getStatusIcon = (status) => {
    if (status === 'paid') return <CheckCircle className="w-5 h-5 text-green-500" />
    if (status === 'overdue') return <AlertCircle className="w-5 h-5 text-red-500" />
    return <Receipt className="w-5 h-5 text-gray-400" />
  }
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1C294E] mb-2">
          Invoices & Payments
        </h1>
        <p className="text-gray-600">
          View and manage your invoices
        </p>
      </div>
      {/* Balance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card padding="lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Balance</p>
            <Receipt className="w-5 h-5 text-gray-400" />
          </div>
          <p className={`text-3xl font-bold ${totalBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
            ${totalBalance.toFixed(2)}
          </p>
          {totalBalance > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {unpaidInvoices.length} unpaid invoice{unpaidInvoices.length !== 1 ? 's' : ''}
            </p>
          )}
        </Card>
        <Card padding="lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Invoices</p>
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-[#1C294E]">
            {invoices?.length || 0}
          </p>
        </Card>
        <Card padding="lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Paid This Year</p>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-[#1C294E]">
            ${paidInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0).toFixed(2)}
          </p>
        </Card>
      </div>
      {/* Unpaid Invoices */}
      {unpaidInvoices.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#1C294E] mb-4">
            Unpaid Invoices
          </h2>
          <div className="space-y-4">
            {unpaidInvoices.map((invoice) => (
              <Card key={invoice.id} hover>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {getStatusIcon(invoice.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-[#1C294E]">
                          Invoice {invoice.invoice_number}
                        </h3>
                        <Badge variant={getStatusBadge(invoice.status)} size="sm">
                          {invoice.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Issued {format(new Date(invoice.created_at), 'MMMM d, yyyy')}
                        {invoice.due_date && (
                          <> • Due {format(new Date(invoice.due_date), 'MMM d, yyyy')}</>
                        )}
                      </p>
                      <p className="text-2xl font-bold text-[#1C294E]">
                        ${parseFloat(invoice.amount).toFixed(2)}
                      </p>
                      {invoice.notes && (
                        <p className="text-sm text-gray-600 mt-2">
                          {invoice.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Link href={`/portal/invoices/${invoice.id}/pay`}>
                      <Button variant="primary">
                        <CreditCard className="w-4 h-4" />
                        Pay Now
                      </Button>
                    </Link>
                    <Link href={`/portal/invoices/${invoice.id}`}>
                      <Button variant="secondary">
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/api/invoices/${invoice.id}/pdf`} target="_blank">
                      <Button variant="text">
                        <Download className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
      {/* All Invoices */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#1C294E]">
            {unpaidInvoices.length > 0 ? 'All Invoices' : 'Invoice History'}
          </h2>
          {/* Filter button placeholder */}
        </div>
        {invoices && invoices.length > 0 ? (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <Card key={invoice.id} hover>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {getStatusIcon(invoice.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-[#1C294E]">
                          Invoice {invoice.invoice_number}
                        </h3>
                        <Badge variant={getStatusBadge(invoice.status)} size="sm">
                          {invoice.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {format(new Date(invoice.created_at), 'MMMM d, yyyy')}
                        {invoice.paid_date && invoice.status === 'paid' && (
                          <> • Paid {format(new Date(invoice.paid_date), 'MMM d, yyyy')}</>
                        )}
                      </p>
                      <p className="text-lg font-bold text-[#1C294E] mt-1">
                        ${parseFloat(invoice.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/portal/invoices/${invoice.id}`}>
                      <Button variant="secondary" size="sm">
                        View
                      </Button>
                    </Link>
                    <Link href={`/api/invoices/${invoice.id}/pdf`} target="_blank">
                      <Button variant="text" size="sm">
                        <Download className="w-4 h-4" />
                        PDF
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-12">
              <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#1C294E] mb-2">
                No invoices yet
              </h3>
              <p className="text-gray-600">
                Your invoices will appear here after your first service
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}