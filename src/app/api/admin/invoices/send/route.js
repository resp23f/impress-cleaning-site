import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

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

    // Get invoice details
const { data: invoice, error: invoiceError } = await supabase
  .from('invoices')
  .select(`
    *,
    profiles!invoices_customer_id_fkey(id, email, full_name)
  `)
  .eq('id', invoiceId)
  .single()
    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Create line items for Stripe
    const lineItems = invoice.line_items?.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.description,
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
      line_items: lineItems,
      mode: 'payment',
      customer_email: invoice.profiles.email,
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
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        stripe_payment_intent_id: session.id,
        status: 'sent',
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoice.id)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update invoice status' },
        { status: 500 }
      )
    }

    // Send email with payment link
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/email/invoice-payment-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: invoice.profiles.email,
        name: invoice.profiles.full_name || invoice.profiles.email.split('@')[0],
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