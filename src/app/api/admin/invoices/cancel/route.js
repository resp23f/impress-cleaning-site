import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  try {
    const { invoiceId } = await request.json()

    if (!invoiceId) {
      return NextResponse.json({ error: 'invoiceId is required' }, { status: 400 })
    }

    // 1. Verify admin authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // 2. Get invoice details
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .select('*, profiles:customer_id(id, email, full_name)')
      .eq('id', invoiceId)
      .single()

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Check if invoice can be cancelled (not already paid or cancelled)
    if (invoice.status === 'paid') {
      return NextResponse.json({ error: 'Cannot cancel a paid invoice. Use refund instead.' }, { status: 400 })
    }

    if (invoice.status === 'cancelled') {
      return NextResponse.json({ error: 'Invoice is already cancelled' }, { status: 400 })
    }

    // 3. Void Stripe invoice if exists
    if (invoice.stripe_invoice_id) {
      try {
        await stripe.invoices.voidInvoice(invoice.stripe_invoice_id)
      } catch (stripeError) {
        console.error('Error voiding Stripe invoice:', stripeError)
        // Continue anyway - Stripe invoice may already be voided or in uncancellable state
      }
    }

    // 4. Update Supabase invoice status
    const { error: updateError } = await supabaseAdmin
      .from('invoices')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', invoiceId)

    if (updateError) {
      console.error('Error updating invoice:', updateError)
      return NextResponse.json({ error: 'Failed to cancel invoice' }, { status: 500 })
    }

    // 5. Get customer info for notification
    const customerEmail = invoice.profiles?.email || invoice.customer_email
    const customerName = invoice.profiles?.full_name || 'Customer'
    const customerId = invoice.customer_id

    // 6. Create customer notification
    if (customerId) {
      await supabaseAdmin
        .from('customer_notifications')
        .insert({
          user_id: customerId,
          type: 'invoice_cancelled',
          title: 'Invoice Cancelled',
          message: `Invoice ${invoice.invoice_number} has been cancelled`,
          link: '/portal/invoices',
          reference_id: invoiceId,
          reference_type: 'invoice'
        })
    }


    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error cancelling invoice:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
