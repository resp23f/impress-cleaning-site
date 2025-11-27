import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createCustomerNotification } from '@/lib/createCustomerNotification'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  try {
    const { invoiceId } = await request.json()
    console.log('📨 Send invoice request received for invoiceId:', invoiceId)

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
        profiles!customer_id(id, email, full_name)
      `)
      .eq('id', invoiceId)
      .single()

    if (invoiceError || !invoice) {
      console.error('❌ Invoice lookup failed:', invoiceError)
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    console.log('🧾 Invoice found for notification:', {
      invoiceId: invoice.id,
      customerId: invoice.customer_id,
      customerEmail: invoice.profiles?.email,
    })

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

    console.log('💳 Stripe Checkout session created:', {
      sessionId: session.id,
      invoiceId: invoice.id,
    })

    // Update invoice with Stripe session ID and mark as sent
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        stripe_payment_intent_id: session.id,
        status: 'sent',
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoice.id)

    if (updateError) {
      console.error('❌ Failed to mark invoice as sent:', updateError)
      return NextResponse.json(
        { error: 'Failed to update invoice status' },
        { status: 500 }
      )
    }

    console.log('📧 About to create notification for customer:', invoice.customer_id)

    // CREATE CUSTOMER NOTIFICATION - ADD THIS PART!
    const notificationResult = await createCustomerNotification({
      userId: invoice.customer_id,
      type: 'invoice_sent',
      title: 'New Invoice Received',
      message: `Invoice ${invoice.invoice_number} for $${parseFloat(invoice.amount).toFixed(2)} is ready for payment`,
      link: `/portal/invoices/${invoiceId}`,
      referenceId: invoiceId,
      referenceType: 'invoice',
    })

    if (!notificationResult?.success) {
      console.error(
        '❌ Customer notification creation failed:',
        notificationResult?.error
      )
      return NextResponse.json(
        {
          error: 'Failed to create customer notification',
          details: notificationResult?.error?.message,
        },
        { status: 500 }
      )
    }

    console.log('✅ Notification created:', notificationResult?.data?.id)

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
      notificationId: notificationResult?.data?.id,
    })
  } catch (error) {
    console.error('Error sending invoice:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
