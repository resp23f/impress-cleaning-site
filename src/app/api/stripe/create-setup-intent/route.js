import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
let stripeCustomerId = null
    
    // FIRST: Check profiles table (single source of truth)
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email, stripe_customer_id')
      .eq('id', user.id)
      .single()
    
    if (profile?.stripe_customer_id) {
      // Validate customer still exists in Stripe
      try {
        await stripe.customers.retrieve(profile.stripe_customer_id)
        stripeCustomerId = profile.stripe_customer_id
      } catch (err) {
        console.log(`Stripe customer ${profile.stripe_customer_id} not found, will create new one`)
      }
    }
    
    // FALLBACK: Try to reuse a customer from an existing payment method
    const { data: existingPaymentMethod } = await supabase
      .from('payment_methods')
      .select('stripe_payment_method_id')
      .eq('user_id', user.id)
      .limit(1)
      .single()
      
            
if (existingPaymentMethod?.stripe_payment_method_id) {
      try {
        const pm = await stripe.paymentMethods.retrieve(existingPaymentMethod.stripe_payment_method_id)
        if (pm?.customer) {
          // Validate customer still exists
          try {
            await stripe.customers.retrieve(pm.customer)
            stripeCustomerId = pm.customer
          } catch (custErr) {
            console.log(`Stripe customer ${pm.customer} not found`)
          }
        }
      } catch (pmErr) {
        console.log('Payment method not found in Stripe, will create new customer')
      }
    }
if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: profile?.email || undefined,
        name: profile?.full_name || undefined,
        metadata: { supabase_user_id: user.id },
      })
      stripeCustomerId = customer.id
      
      // Save to profiles (single source of truth)
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id)
    }
        const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
    })
    return NextResponse.json({ clientSecret: setupIntent.client_secret })
  } catch (error) {
    console.error('create-setup-intent error', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
