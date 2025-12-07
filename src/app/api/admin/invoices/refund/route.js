import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  try {
    const { invoiceId, amount, reason } = await request.json()

    if (!invoiceId) {
      return NextResponse.json({ error: 'invoiceId is required' }, { status: 400 })
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valid refund amount is required' }, { status: 400 })
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

    // Check if invoice is paid
    if (invoice.status !== 'paid') {
      return NextResponse.json({ error: 'Can only refund paid invoices' }, { status: 400 })
    }

    // Get payment intent ID - try local first, then fetch from Stripe invoice
    let paymentIntentId = invoice.stripe_payment_intent_id

    // Fallback: get payment_intent from Stripe invoice if missing locally
    if (!paymentIntentId && invoice.stripe_invoice_id) {
      try {
        const stripeInvoice = await stripe.invoices.retrieve(invoice.stripe_invoice_id)
        paymentIntentId = stripeInvoice.payment_intent

        // Save it for future use
        if (paymentIntentId) {
          await supabaseAdmin
            .from('invoices')
            .update({
              stripe_payment_intent_id: paymentIntentId,
              updated_at: new Date().toISOString()
            })
            .eq('id', invoice.id)
          console.log(`Saved payment_intent_id ${paymentIntentId} to invoice ${invoice.invoice_number}`)
        }
      } catch (err) {
        console.error('Error retrieving Stripe invoice:', err)
      }
    }

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Cannot refund - no payment found' }, { status: 400 })
    }

    const invoiceTotal = parseFloat(invoice.total || invoice.amount)
    const existingRefund = parseFloat(invoice.refund_amount || 0)
    const maxRefundable = invoiceTotal - existingRefund

    if (amount > maxRefundable) {
      return NextResponse.json({
        error: `Refund amount exceeds maximum refundable amount of $${maxRefundable.toFixed(2)}`
      }, { status: 400 })
    }

    let stripeRefundId = null

    // 3. Process Stripe refund
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: Math.round(amount * 100) // Convert to cents
      })
      stripeRefundId = refund.id
    } catch (stripeError) {
      console.error('Stripe refund error:', stripeError)
      return NextResponse.json({
        error: `Stripe refund failed: ${stripeError.message}`
      }, { status: 500 })
    }

    // 4. Update invoice with refund info (keep status as 'paid')
    const newRefundTotal = existingRefund + amount
    const isFullRefund = newRefundTotal >= invoiceTotal

    const updateData = {
      refund_amount: newRefundTotal,
      refund_reason: reason || 'Refund processed by admin',
      updated_at: new Date().toISOString()
      // Status stays 'paid' - refunded invoices are still considered paid
    }

    const { error: updateError } = await supabaseAdmin
      .from('invoices')
      .update(updateData)
      .eq('id', invoiceId)

    if (updateError) {
      console.error('Error updating invoice:', updateError)
      return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
    }

    // 5. Get customer info
    const customerEmail = invoice.profiles?.email || invoice.customer_email
    const customerName = invoice.profiles?.full_name || 'Customer'
    const customerId = invoice.customer_id

    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)

    // 6. Create customer notification
    if (customerId) {
      await supabaseAdmin
        .from('customer_notifications')
        .insert({
          user_id: customerId,
          type: 'refund_processed',
          title: 'Refund Processed',
          message: `A refund of ${formattedAmount} has been issued for Invoice ${invoice.invoice_number}`,
          link: '/portal/invoices',
          reference_id: invoiceId,
          reference_type: 'invoice'
        })
    }

    // 7. Create admin notification
    await supabaseAdmin
      .from('admin_notifications')
      .insert({
        type: 'refund_processed',
        title: 'Refund Issued',
        message: `Refund of ${formattedAmount} issued for Invoice ${invoice.invoice_number}`,
        link: '/admin/invoices'
      })

    // 8. Send refund email
    if (customerEmail) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/email/invoice-refunded`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerEmail,
            customerName,
            invoiceNumber: invoice.invoice_number,
            refundAmount: amount,
            refundReason: reason || 'Refund processed'
          })
        })
      } catch (emailError) {
        console.error('Error sending refund email:', emailError)
        // Non-fatal
      }
    }

    return NextResponse.json({
      success: true,
      stripeRefundId,
      totalRefunded: newRefundTotal,
      isFullRefund
    })
  } catch (error) {
    console.error('Error processing refund:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
