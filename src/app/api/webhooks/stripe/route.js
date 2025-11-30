import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
export async function POST(request) {
 const body = await request.text()
 const signature = request.headers.get('stripe-signature')
 let event
 try {
  event = stripe.webhooks.constructEvent(
   body,
   signature,
   process.env.STRIPE_WEBHOOK_SECRET
  )
 } catch (err) {
  console.error('Webhook signature verification failed:', err.message)
  return NextResponse.json(
   { error: 'Webhook signature verification failed' },
   { status: 400 }
  )
 }
 const supabase = await createClient()
 // Handle the event
 switch (event.type) {
  case 'checkout.session.completed': {
   const session = event.data.object
   // Check if this is an invoice payment
   if (session.metadata?.invoice_id) {
    const { error } = await supabase
    .from('invoices')
    .update({
     status: 'paid',
     paid_date: new Date().toISOString().split('T')[0],
     payment_method: 'stripe',
     updated_at: new Date().toISOString(),
    })
    .eq('id', session.metadata.invoice_id)
    if (error) {
     console.error('Error updating invoice:', error)
    } else {
     console.log(`Invoice ${session.metadata.invoice_number} marked as paid`)
     
     // Get invoice and customer details for email
     const { data: invoice } = await supabase
     .from('invoices')
     .select(`
              *,
              profiles (email, full_name)
            `)
      .eq('id', session.metadata.invoice_id)
      .single()
      
      // Send payment received email
      if (invoice && invoice.profiles) {
       try {
        // Determine payment method from session
        let paymentMethod = 'Card'
        if (session.payment_method_types?.[0]) {
         paymentMethod = session.payment_method_types[0] === 'card' ? 'Card' : session.payment_method_types[0]
        }
        
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/email/payment-received`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
          customerEmail: invoice.profiles.email,
          customerName: invoice.profiles.full_name || invoice.profiles.email.split('@')[0],
          invoiceNumber: invoice.invoice_number,
          amount: invoice.amount,
          paymentDate: new Date().toISOString(),
          paymentMethod: paymentMethod,
         }),
        })
       } catch (emailError) {
        console.error('Failed to send payment received email', emailError)
       }
      }
     }
    }
    break
   }
   case 'payment_intent.succeeded': {
    const paymentIntent = event.data.object
    console.log('Payment succeeded:', paymentIntent.id)
    break
   }
   case 'payment_intent.payment_failed': {
    const paymentIntent = event.data.object
    console.log('Payment failed:', paymentIntent.id)
    break
   }
   default:
   console.log(`Unhandled event type: ${event.type}`)
  }
  return NextResponse.json({ received: true })
 }