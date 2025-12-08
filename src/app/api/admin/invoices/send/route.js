import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { sanitizeText, sanitizeEmail } from '@/lib/sanitize'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
// Validated internal API base URL
const INTERNAL_API_URL = (() => {
  const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://impressyoucleaning.com'
  const allowed = ['https://impressyoucleaning.com', 'https://www.impressyoucleaning.com', 'http://localhost:3000']
  return allowed.some(domain => url.startsWith(domain)) ? url : 'https://impressyoucleaning.com'
})()
export async function POST(request) {
  try {
    const { invoiceId } = await request.json()

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'invoiceId is required' },
        { status: 400 }
      )
    }

    // 1. Get invoice details
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single()

    if (invoiceError || !invoice) {
      console.error('Invoice error:', invoiceError)
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Check if invoice is in draft status
    if (invoice.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft invoices can be sent' },
        { status: 400 }
      )
    }

    // 2. Get customer info - either from profiles or customer_email
    let customerEmail = null
    let customerName = null
    let customerId = null
    let stripeCustomerId = null

    if (invoice.customer_id) {
      const { data: customer, error: customerError } = await supabaseAdmin
        .from('profiles')
        .select('id, email, full_name, stripe_customer_id')
        .eq('id', invoice.customer_id)
        .single()

      if (customerError || !customer) {
        console.error('Customer error:', customerError)
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        )
      }

      customerEmail = sanitizeEmail(customer.email)
      customerName = sanitizeText(customer.full_name)?.slice(0, 100) || customer.email.split('@')[0]
      customerId = customer.id
      stripeCustomerId = customer.stripe_customer_id
    } else if (invoice.customer_email) {
      customerEmail = sanitizeEmail(invoice.customer_email)
      customerName = 'Customer'
    } else {
      return NextResponse.json(
        { error: 'No customer email associated with invoice' },
        { status: 400 }
      )
    }

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Invalid customer email' },
        { status: 400 }
      )
    }

    // 3. Create or retrieve Stripe customer
    if (!stripeCustomerId) {
      // Check if a Stripe customer already exists with this email
      const existingCustomers = await stripe.customers.list({
        email: customerEmail,
        limit: 1
      })

      if (existingCustomers.data.length > 0) {
        stripeCustomerId = existingCustomers.data[0].id
      } else {
        // Create new Stripe customer
        const stripeCustomer = await stripe.customers.create({
          email: customerEmail,
          name: customerName,
          metadata: {
            supabase_user_id: customerId || 'email_only',
            invoice_id: invoiceId
          }
        })
        stripeCustomerId = stripeCustomer.id
      }

      // Save stripe_customer_id to profile if we have a customer_id
      if (customerId) {
        await supabaseAdmin
          .from('profiles')
          .update({
            stripe_customer_id: stripeCustomerId,
            updated_at: new Date().toISOString()
          })
          .eq('id', customerId)
      }
    }

    // 4. Create invoice items FIRST (as pending items for the customer)
    const lineItems = invoice.line_items || []

    if (lineItems.length > 0) {
      for (const item of lineItems) {
        await stripe.invoiceItems.create({
          customer: stripeCustomerId,
          description: sanitizeText(item.description)?.slice(0, 200) || 'Service',
          amount: Math.round(parseFloat(item.rate) * (item.quantity || 1) * 100),
          currency: 'usd'
        })
      }
    } else {
      // Fallback: create single line item from invoice amount
      await stripe.invoiceItems.create({
        customer: stripeCustomerId,
        description: `Invoice ${invoice.invoice_number}`,
        amount: Math.round(parseFloat(invoice.amount) * 100),
        currency: 'usd'
      })
    }

    // Add tax if present
    if (invoice.tax_amount && parseFloat(invoice.tax_amount) > 0) {
      await stripe.invoiceItems.create({
        customer: stripeCustomerId,
        description: `Tax (${invoice.tax_rate || 0}%)`,
        amount: Math.round(parseFloat(invoice.tax_amount) * 100),
        currency: 'usd'
      })
    }

    // 5. Create Stripe Invoice (includes pending invoice items automatically)
    const stripeInvoice = await stripe.invoices.create({
      customer: stripeCustomerId,
      collection_method: 'send_invoice',
      days_until_due: invoice.due_date
        ? Math.max(1, Math.ceil((new Date(invoice.due_date) - new Date()) / (1000 * 60 * 60 * 24)))
        : 7,
      pending_invoice_items_behavior: 'include',
      metadata: {
        supabase_invoice_id: invoice.id,
        invoice_number: invoice.invoice_number
      }
    })

    // 6. Finalize and send the Stripe Invoice
    await stripe.invoices.finalizeInvoice(stripeInvoice.id)
    const sentInvoice = await stripe.invoices.sendInvoice(stripeInvoice.id)

    // 7. Update Supabase invoice with Stripe details
    const { error: updateError } = await supabaseAdmin
      .from('invoices')
      .update({
        stripe_invoice_id: sentInvoice.id,
        status: 'sent',
        updated_at: new Date().toISOString()
      })
      .eq('id', invoice.id)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update invoice status' },
        { status: 500 }
      )
    }

    // 8. Create customer notification
    if (customerId) {
      const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(invoice.total || invoice.amount)

      await supabaseAdmin
        .from('customer_notifications')
        .insert({
          user_id: customerId,
          type: 'invoice_sent',
          title: 'New Invoice Ready',
          message: `Invoice ${invoice.invoice_number} for ${formattedAmount} is ready for payment`,
          link: '/portal/invoices',
          reference_id: invoice.id,
          reference_type: 'invoice'
        })
    }

    // 9. Send email with payment link
await fetch(`${INTERNAL_API_URL}/api/email/invoice-payment-link`, {
       method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: customerEmail,
        name: customerName,
        invoiceNumber: invoice.invoice_number,
        amount: invoice.total || invoice.amount,
        dueDate: invoice.due_date,
        paymentUrl: sentInvoice.hosted_invoice_url
      })
    })

    return NextResponse.json({
      success: true,
      stripeInvoiceId: sentInvoice.id,
      hostedInvoiceUrl: sentInvoice.hosted_invoice_url
    })
  } catch (error) {
    console.error('Error sending invoice:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
