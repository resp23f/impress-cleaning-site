import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
 try {
  const supabase = await createClient()
  
  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { stripeInvoiceId, paymentMethodId, saveCard, invoiceId } = await request.json()

  if (!stripeInvoiceId || !paymentMethodId) {
   return NextResponse.json(
    { error: 'Missing required fields' },
    { status: 400 }
   )
  }

// Get the Stripe invoice to find/create customer
  let stripeInvoice
  try {
    stripeInvoice = await stripe.invoices.retrieve(stripeInvoiceId)
  } catch (retrieveError) {
    if (retrieveError.code === 'resource_missing' || retrieveError.message?.includes('No such invoice')) {
      // Invoice doesn't exist in Stripe - tell frontend to use PaymentIntent flow
      return NextResponse.json(
        { error: 'Stripe invoice not found', usePaymentIntent: true },
        { status: 404 }
      )
    }
    throw retrieveError
  }
  // Get Supabase invoice ID from metadata if not provided
  const supabaseInvoiceId = invoiceId || stripeInvoice.metadata?.supabase_invoice_id

  // Attach payment method to customer if not already attached
  try {
   await stripe.paymentMethods.attach(paymentMethodId, {
    customer: stripeInvoice.customer,
   })
  } catch (attachError) {
   // Payment method might already be attached, that's OK
   if (!attachError.message.includes('already been attached')) {
    console.error('Error attaching payment method:', attachError)
   }
  }

  // Pay the invoice
  const paidInvoice = await stripe.invoices.pay(stripeInvoiceId, {
   payment_method: paymentMethodId,
  })

  // If saveCard is true, store the payment method in our database
  if (saveCard && invoiceId) {
   const pm = await stripe.paymentMethods.retrieve(paymentMethodId)
   
   // Check if this payment method already exists
   const { data: existingPM } = await supabaseAdmin
    .from('payment_methods')
    .select('id')
    .eq('stripe_payment_method_id', paymentMethodId)
    .single()

   if (!existingPM) {
    await supabaseAdmin.from('payment_methods').insert({
     user_id: user.id,
     stripe_payment_method_id: paymentMethodId,
     card_brand: pm.card?.brand || 'card',
     card_last4: pm.card?.last4 || '****',
     card_exp_month: pm.card?.exp_month,
     card_exp_year: pm.card?.exp_year,
     is_default: false,
    })
   }
  }

// Update our invoice record
  console.log('Payment successful. payment_intent:', paidInvoice.payment_intent)
  console.log('supabaseInvoiceId:', supabaseInvoiceId, '| invoiceId from request:', invoiceId, '| metadata:', stripeInvoice.metadata)

  if (supabaseInvoiceId) {
   const { error: updateError } = await supabaseAdmin
    .from('invoices')
    .update({
     status: 'paid',
     paid_date: new Date().toISOString().split('T')[0],
     payment_method: 'stripe',
     stripe_payment_intent_id: paidInvoice.payment_intent,
     updated_at: new Date().toISOString(),
    })
    .eq('id', supabaseInvoiceId)
   
   if (updateError) {
    console.error('Failed to update invoice by ID:', updateError)
   } else {
    console.log('Updated invoice by supabaseInvoiceId:', supabaseInvoiceId)
   }
  } else {
   // FALLBACK: Update by stripe_invoice_id since we definitely have that
   console.log('No supabaseInvoiceId, updating by stripe_invoice_id:', stripeInvoiceId)
   const { error: fallbackError } = await supabaseAdmin
    .from('invoices')
    .update({
     status: 'paid',
     paid_date: new Date().toISOString().split('T')[0],
     payment_method: 'stripe',
     stripe_payment_intent_id: paidInvoice.payment_intent,
     updated_at: new Date().toISOString(),
    })
    .eq('stripe_invoice_id', stripeInvoiceId)
   
   if (fallbackError) {
    console.error('Failed to update invoice by stripe_invoice_id:', fallbackError)
   } else {
    console.log('Updated invoice by stripe_invoice_id:', stripeInvoiceId)
   }
  }
  
  return NextResponse.json({
   success: true,
   invoiceStatus: paidInvoice.status,
  })

 } catch (error) {
  console.error('Pay Stripe invoice error:', error)

  // Handle card errors specifically
  if (error.type === 'StripeCardError') {
   return NextResponse.json(
    { error: error.message },
    { status: 400 }
   )
  }

  // Handle requires_action (3D Secure)
  if (error.code === 'invoice_payment_intent_requires_action') {
   const invoice = await stripe.invoices.retrieve(error.raw?.payment_intent?.invoice || '')
   const paymentIntent = await stripe.paymentIntents.retrieve(invoice.payment_intent)
   
   return NextResponse.json({
    requiresAction: true,
    clientSecret: paymentIntent.client_secret,
   })
  }

  return NextResponse.json(
   { error: error.message || 'Payment failed' },
   { status: 500 }
  )
 }
}