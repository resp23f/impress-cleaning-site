import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sanitizeText, sanitizeEmail, sanitizePhone } from '@/lib/sanitize'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  try {
    // 1. Verify admin authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // 2. Parse and sanitize input
    const body = await request.json()
    const { full_name, email, phone } = body

    if (!full_name && !email) {
      return NextResponse.json({ error: 'Name or email is required' }, { status: 400 })
    }

    const sanitizedName = sanitizeText(full_name)?.slice(0, 100) || ''
    const sanitizedEmail = email ? sanitizeEmail(email) : null
    const sanitizedPhone = phone ? sanitizePhone(phone) : null

    // Validate email format if provided
    if (sanitizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // 3. Create admin client for user creation
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 4. Check if email already exists (if email provided)
    if (sanitizedEmail) {
      const { data: existingUser } = await adminClient
        .from('profiles')
        .select('id')
        .eq('email', sanitizedEmail)
        .single()

      if (existingUser) {
        return NextResponse.json({ error: 'A customer with this email already exists' }, { status: 409 })
      }
    }

    // 5. Create auth user (this triggers profile creation)
    // Generate a placeholder email if none provided
    const userEmail = sanitizedEmail || `customer-${Date.now()}@placeholder.impressyoucleaning.com`
    
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: userEmail,
      email_confirm: true, // Auto-confirm since admin is creating
      user_metadata: {
        full_name: sanitizedName,
      },
    })

    if (createError) {
      console.error('Error creating user:', createError)
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    // 6. Create Stripe customer
    let stripeCustomerId = null
    try {
      const stripeCustomer = await stripe.customers.create({
        email: sanitizedEmail || undefined,
        name: sanitizedName || undefined,
        phone: sanitizedPhone || undefined,
        metadata: {
          supabase_user_id: newUser.user.id
        }
      })
      stripeCustomerId = stripeCustomer.id
    } catch (stripeError) {
      console.error('Error creating Stripe customer:', stripeError)
      // Non-fatal - customer was created in Supabase, Stripe can be added later
    }

    // 7. Update profile with phone and stripe_customer_id
    const profileUpdate = {
      updated_at: new Date().toISOString()
    }
    if (sanitizedPhone) {
      profileUpdate.phone = sanitizedPhone
    }
    if (stripeCustomerId) {
      profileUpdate.stripe_customer_id = stripeCustomerId
    }

    if (Object.keys(profileUpdate).length > 1) {
      const { error: updateError } = await adminClient
        .from('profiles')
        .update(profileUpdate)
        .eq('id', newUser.user.id)

      if (updateError) {
        console.error('Error updating profile:', updateError)
        // Non-fatal - customer was created, just additional fields weren't saved
      }
    }

    // 8. Fetch the complete customer profile
    const { data: customer, error: fetchError } = await adminClient
      .from('profiles')
      .select('id, full_name, email, phone, account_status, stripe_customer_id, created_at')
      .eq('id', newUser.user.id)
      .single()

    if (fetchError) {
      console.error('Error fetching customer:', fetchError)
      return NextResponse.json({ error: 'Customer created but failed to fetch details' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      customer,
      stripeCustomerId: stripeCustomerId
    })

  } catch (error) {
    console.error('Create customer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}