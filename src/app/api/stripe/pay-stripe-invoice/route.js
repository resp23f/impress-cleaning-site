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
  const stripeInvoice = await stripe.invoices.retrieve(stripeInvoiceId)
  
  if (!stripeInvoice) {
   return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
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
  if (supabaseInvoiceId) {
   await supabaseAdmin
    .from('invoices')
    .update({
     status: 'paid',
     paid_date: new Date().toISOString().split('T')[0],
     payment_method: 'stripe',
     stripe_payment_intent_id: paidInvoice.payment_intent,
     updated_at: new Date().toISOString(),
    })
    .eq('id', supabaseInvoiceId)
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