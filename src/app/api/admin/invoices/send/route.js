import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { sanitizeText, sanitizeEmail } from '@/lib/sanitize'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

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
    // First, verify existing stripe_customer_id is still valid
    if (stripeCustomerId) {
      try {
        await stripe.customers.retrieve(stripeCustomerId)
      } catch (err) {
        console.log(`Stripe customer ${stripeCustomerId} not found, will create new one`)
        stripeCustomerId = null
        // Clear invalid ID from profile
        if (customerId) {
          await supabaseAdmin
            .from('profiles')
            .update({ stripe_customer_id: null })
            .eq('id', customerId)
        }
      }
    }

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
    // Calculate days until due with timezone-safe date handling
    let daysUntilDue = 7 // default
    if (invoice.due_date) {
      // Parse due_date as local date (YYYY-MM-DD -> local midnight)
      const dueDate = new Date(invoice.due_date + 'T00:00:00')
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset to local midnight for accurate day diff
      const diffTime = dueDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      daysUntilDue = Math.max(1, diffDays) // Stripe requires at least 1 day
    }
    
    const stripeInvoice = await stripe.invoices.create({
      customer: stripeCustomerId,
      number: invoice.invoice_number,
      collection_method: 'send_invoice',
      days_until_due: daysUntilDue,
      pending_invoice_items_behavior: 'include',
      metadata: {
        supabase_invoice_id: invoice.id,
        invoice_number: invoice.invoice_number
      }
    })
    
// 6. Finalize and send the Stripe Invoice (triggers Stripe email)
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(stripeInvoice.id)
    const sentInvoice = await stripe.invoices.sendInvoice(finalizedInvoice.id)
    
// 7. Update Supabase invoice with Stripe details
    // Check if webhook already updated it (race condition)
    const { data: currentInvoice } = await supabaseAdmin
      .from('invoices')
      .select('stripe_invoice_id, status, due_date')
      .eq('id', invoice.id)
      .single()

    // Calculate the actual due date that was set in Stripe
    const actualDueDate = invoice.due_date || new Date(Date.now() + daysUntilDue * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Only update if webhook hasn't already done it
    if (!currentInvoice?.stripe_invoice_id) {
      const { error: updateError } = await supabaseAdmin
        .from('invoices')
        .update({
          stripe_invoice_id: sentInvoice.id,
          status: 'sent',
          due_date: actualDueDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', invoice.id)

      if (updateError) {
        console.error('Update error:', updateError)
        // Don't fail - invoice was sent successfully
      }
    } else {
      // Still update due_date if it wasn't set
      if (!currentInvoice.due_date) {
        await supabaseAdmin
          .from('invoices')
          .update({ due_date: actualDueDate, updated_at: new Date().toISOString() })
          .eq('id', invoice.id)
      }
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
          link: `/portal/invoices/${invoice.id}/pay`,
          reference_id: invoice.id,
          reference_type: 'invoice'
        })
            }

    
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
