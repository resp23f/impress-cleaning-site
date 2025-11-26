import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import InvoiceTemplate from './InvoiceTemplate'

export default async function PortalInvoicePage({ params }) {
  const supabase = await createClient()
  const invoiceId = params.id

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const { data: invoiceRow, error: invoiceError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .eq('customer_id', user.id)
    .single()

  if (invoiceError || !invoiceRow) {
    console.error('Portal invoice load error', invoiceError)
    notFound()
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, phone, street_address, city, state, zip_code')
    .eq('id', invoiceRow.customer_id)
    .single()

  const invoice = {
    id: invoiceRow.id,
    invoice_number: invoiceRow.invoice_number,
    status: invoiceRow.status,
    issue_date: invoiceRow.created_at?.slice(0, 10),
    due_date: invoiceRow.due_date,
    subtotal: invoiceRow.subtotal ?? invoiceRow.amount,
    tax_rate: invoiceRow.tax_rate,
    tax_amount: invoiceRow.tax_amount,
    total: invoiceRow.total ?? invoiceRow.amount,
    notes: invoiceRow.notes,
    service_summary: invoiceRow.service_summary,
  }

  const customer = {
    name: profile?.full_name,
    email: profile?.email,
    phone: profile?.phone,
    street: profile?.street_address,
    city: profile?.city,
    state: profile?.state,
    zip: profile?.zip_code,
  }

  const lineItems = (invoiceRow.line_items || []).map((item, idx) => ({
    id: item.id ?? idx,
    description: item.description,
    quantity: item.quantity,
    rate: item.rate,
    amount: item.amount,
  }))

  return <InvoiceTemplate invoice={invoice} customer={customer} lineItems={lineItems} />
}
