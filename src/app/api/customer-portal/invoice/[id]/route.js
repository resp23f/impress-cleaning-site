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

    // Fetch invoice
    const { data: invoiceRow, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .eq('customer_id', user.id)
      .single()

    if (invoiceError || !invoiceRow) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Fetch customer profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email, phone, street_address, city, state, zip_code')
      .eq('id', invoiceRow.customer_id)
      .single()

    // Format response
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