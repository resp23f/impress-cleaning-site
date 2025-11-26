import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
export async function POST(request) {
  try {
    const { invoiceId, amount, paymentMethodId } = await request.json()
    if (!invoiceId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    const supabase = await createClient()
    // Verify user authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    // Verify invoice belongs to user
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .eq('customer_id', user.id)
      .single()
    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }
    if (invoice.status === 'paid') {
      return NextResponse.json(
        { error: 'Invoice already paid' },
        { status: 400 }
      )
    }
    // Create or retrieve Stripe customer
    let stripeCustomerId = invoice.stripe_customer_id
    if (!stripeCustomerId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single()
      const customer = await stripe.customers.create({
        email: profile.email,
        name: profile.full_name,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      stripeCustomerId = customer.id
      // Update invoice with Stripe customer ID
      await supabase
        .from('invoices')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', invoiceId)
    }
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      customer: stripeCustomerId,
      payment_method: paymentMethodId || undefined,
      confirm: paymentMethodId ? true : false,
      metadata: {
        invoice_id: invoiceId,
        invoice_number: invoice.invoice_number,
      },
      description: `Payment for Invoice ${invoice.invoice_number}`,
    })
    // If payment succeeded immediately
    if (paymentIntent.status === 'succeeded') {
      // Update invoice status
      await supabase
        .from('invoices')
        .update({
          status: 'paid',
          paid_date: new Date().toISOString().split('T')[0],
          payment_method: 'stripe',
          stripe_payment_intent_id: paymentIntent.id,
        })
        .eq('id', invoiceId)
      return NextResponse.json({
        success: true,
        paymentIntent,
      })
    }
    // If requires additional action (like 3D Secure)
    if (paymentIntent.status === 'requires_action') {
      // Update invoice with payment intent ID
      await supabase
        .from('invoices')
        .update({
          stripe_payment_intent_id: paymentIntent.id,
        })
        .eq('id', invoiceId)
      return NextResponse.json({
        requiresAction: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntent,
      })
    }
    // If requires payment method (new card)
    if (paymentIntent.status === 'requires_payment_method') {
      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntent,
      })
    }
    return NextResponse.json({
      error: 'Unexpected payment status',
    }, { status: 500 })
  } catch (error) {
    console.error('Stripe payment error:', error)
    return NextResponse.json(
      { error: error.message || 'Payment failed' },
      { status: 500 }
    )
  }
}