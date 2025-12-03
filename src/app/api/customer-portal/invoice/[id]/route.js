import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request, { params }) {
 try {
  const supabase = await createClient()
  const invoiceId = params.id
  
  // Get authenticated user
  const {
   data: { user },
   error: authError,
  } = await supabase.auth.getUser()
  
  if (authError || !user) {
   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Fetch invoice with customer profile
  const { data: invoiceRow, error: invoiceError } = await supabase
  .from('invoices')
  .select(`
        *,
        profiles!customer_id (
          full_name,
          email,
          phone
        )
      `)
   .eq('id', invoiceId)
   .eq('customer_id', user.id)
   .single()
   
   if (invoiceError || !invoiceRow) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
   }
   
   // Fetch customer's primary service address
   const { data: addressData } = await supabase
   .from('service_addresses')
   .select('street_address, unit, city, state, zip_code')
   .eq('user_id', invoiceRow.customer_id)
   .eq('is_primary', true)
   .maybeSingle()
   
   // Format response
   const invoice = {
    id: invoiceRow.id,
    invoice_number: invoiceRow.invoice_number,
    status: invoiceRow.status || 'draft',
    
    // Use created_at as issue date, normalized to YYYY-MM-DD
    issue_date: invoiceRow.created_at
    ? invoiceRow.created_at.slice(0, 10)
    : null,
    
    // Always pass due_date directly from DB, also normalized to YYYY-MM-DD
    due_date: invoiceRow.due_date
    ? invoiceRow.due_date.slice(0, 10)
    : null,
    
    // Money fields
    subtotal: invoiceRow.subtotal ?? invoiceRow.amount,
    tax_rate: invoiceRow.tax_rate || 0,
    tax_amount: invoiceRow.tax_amount || 0,
    total: invoiceRow.total ?? invoiceRow.amount,
    
    notes: invoiceRow.notes,
    service_summary: invoiceRow.service_summary,
   }
   
   const customer = {
    name: invoiceRow.profiles?.full_name || 'Customer',
    email: invoiceRow.profiles?.email || '',
    phone: invoiceRow.profiles?.phone || '',
    street: addressData?.street_address || '',
    unit: addressData?.unit || '',
    city: addressData?.city || '',
    state: addressData?.state || '',
    zip: addressData?.zip_code || '',
   }
   const lineItems = (invoiceRow.line_items || []).map((item, idx) => ({
    id: item.id ?? idx,
    description: item.description,
    quantity: item.quantity,
    rate: item.rate,
    amount: item.amount,
   }))
   
   return NextResponse.json({
    invoice,
    customer,
    lineItems,
   })
  } catch (error) {
   console.error('Error fetching invoice:', error)
   return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
   )
  }
 }