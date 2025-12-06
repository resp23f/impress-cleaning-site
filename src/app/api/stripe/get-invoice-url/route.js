import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { stripeInvoiceId } = await request.json()
    
    if (!stripeInvoiceId) {
      return NextResponse.json({ error: 'Missing Stripe invoice ID' }, { status: 400 })
    }
    
    // Get the invoice from Stripe
    const invoice = await stripe.invoices.retrieve(stripeInvoiceId)
    
    // Return the hosted invoice URL
    if (invoice.hosted_invoice_url) {
      return NextResponse.json({ url: invoice.hosted_invoice_url })
    }
    
    return NextResponse.json({ error: 'No payment URL available' }, { status: 400 })
  } catch (error) {
    console.error('Error getting invoice URL:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}