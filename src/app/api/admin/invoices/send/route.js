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

    const supabase = await createClient()

    // Get invoice details using admin client to bypass RLS
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

    // Get customer profile separately
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', invoice.customer_id)
      .single()

    if (customerError || !customer) {
      console.error('Customer error:', customerError)
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Sanitize customer data before using
    const sanitizedEmail = sanitizeEmail(customer.email)
    const sanitizedName = sanitizeText(customer.full_name)?.slice(0, 100) || customer.email.split('@')[0]

    if (!sanitizedEmail) {
      return NextResponse.json(
        { error: 'Invalid customer email' },
        { status: 400 }
      )
    }

    // Sanitize line item descriptions
    const sanitizedLineItems = invoice.line_items?.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: sanitizeText(item.description)?.slice(0, 200) || 'Service',
        },
        unit_amount: Math.round(parseFloat(item.rate) * 100),
      },
      quantity: item.quantity,
    })) || [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `Invoice ${invoice.invoice_number}`,
        },
        unit_amount: Math.round(parseFloat(invoice.amount) * 100),
      },
      quantity: 1,
    }]

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: sanitizedLineItems,
      mode: 'payment',
      customer_email: sanitizedEmail,
      client_reference_id: invoice.id,
      metadata: {
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        customer_id: invoice.customer_id,
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/portal/invoices?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/portal/invoices?payment=cancelled`,
    })

    // Update invoice status to sent
    const { error: updateError } = await supabaseAdmin
      .from('invoices')
      .update({
        stripe_payment_intent_id: session.id,
        status: 'sent',
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoice.id)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update invoice status' },
        { status: 500 }
      )
    }

    // Send email with payment link (using sanitized data)
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/email/invoice-payment-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: sanitizedEmail,
        name: sanitizedName,
        invoiceNumber: invoice.invoice_number,
        amount: invoice.amount,
        dueDate: invoice.due_date,
        checkoutUrl: session.url,
      }),
    })

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    console.error('Error sending invoice:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}