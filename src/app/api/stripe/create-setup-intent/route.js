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

    // Try to reuse a customer from an existing payment method
    const { data: existingPaymentMethod } = await supabase
      .from('payment_methods')
      .select('stripe_payment_method_id')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    if (existingPaymentMethod?.stripe_payment_method_id) {
      const pm = await stripe.paymentMethods.retrieve(existingPaymentMethod.stripe_payment_method_id)
      stripeCustomerId = pm?.customer
    }

    if (!stripeCustomerId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single()

      const customer = await stripe.customers.create({
        email: profile?.email || undefined,
        name: profile?.full_name || undefined,
        metadata: { supabase_user_id: user.id },
      })

      stripeCustomerId = customer.id
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
