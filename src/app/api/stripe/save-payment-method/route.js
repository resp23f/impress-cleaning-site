import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
export async function POST(request) {
  try {
    const { paymentMethodId, makeDefault } = await request.json()
    if (!paymentMethodId) {
      return NextResponse.json({ error: 'paymentMethodId is required' }, { status: 400 })
    }
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const pm = await stripe.paymentMethods.retrieve(paymentMethodId)
    if (!pm) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 })
    }
// FIRST: Check profiles table for existing Stripe customer (single source of truth)
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email, stripe_customer_id')
      .eq('id', user.id)
      .single()
    
    let customerId = null
    
    // Try profile's stripe_customer_id first
    if (profile?.stripe_customer_id) {
      try {
        await stripe.customers.retrieve(profile.stripe_customer_id)
        customerId = profile.stripe_customer_id
      } catch (err) {
        console.log(`Stripe customer ${profile.stripe_customer_id} not found`)
      }
    }
    
    // Fallback: check if PM is already attached to a customer
    if (!customerId && pm.customer) {
      try {
        await stripe.customers.retrieve(pm.customer)
        customerId = pm.customer
        // Save this customer to profile for future use
        await supabase
          .from('profiles')
          .update({ stripe_customer_id: customerId })
          .eq('id', user.id)
      } catch (err) {
        console.log(`Stripe customer ${pm.customer} not found`)
      }
    }
    
    // Create new customer if none found
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email || undefined,
        name: profile?.full_name || undefined,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
      
      // Save to profiles (single source of truth)
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
      
      await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId })
    } else if (!pm.customer) {
      // Attach payment method if not already attached
      await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId })
    }
            if (makeDefault) {
      await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      })
      await supabase.from('payment_methods').update({ is_default: false }).eq('user_id', user.id)
    }
    await supabase.from('payment_methods').upsert({
      user_id: user.id,
      stripe_payment_method_id: paymentMethodId,
      card_brand: pm.card?.brand,
      card_last4: pm.card?.last4,
      card_exp_month: pm.card?.exp_month,
      card_exp_year: pm.card?.exp_year,
      is_default: makeDefault ?? false,
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('save-payment-method error', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
