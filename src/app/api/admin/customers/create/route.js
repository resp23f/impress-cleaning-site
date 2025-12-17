import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sanitizeText, sanitizeEmail, sanitizePhone } from '@/lib/sanitize'
import Stripe from 'stripe'
import { Resend } from 'resend'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const resend = new Resend(process.env.RESEND_API_KEY)

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
    const { full_name, email, phone, sendWelcomeEmail = true } = body

    if (!full_name && !email) {
      return NextResponse.json({ error: 'Name or email is required' }, { status: 400 })
    }

    const sanitizedName = sanitizeText(full_name)?.slice(0, 100) || ''
    const sanitizedEmail = email ? sanitizeEmail(email) : null
    const sanitizedPhone = phone ? sanitizePhone(phone) : null

    // Validate email format if provided (sanitizeEmail returns '' for invalid emails)
    if (email && !sanitizedEmail) {
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

    // 9. Send welcome email if requested and email is real (not placeholder)
    let welcomeEmailSent = false
    const isRealEmail = sanitizedEmail && !sanitizedEmail.includes('@placeholder.')
    
    if (sendWelcomeEmail && isRealEmail && sanitizedName) {
      try {
        const { error: emailError } = await resend.emails.send({
          from: 'Impress Cleaning Services <notifications@impressyoucleaning.com>',
          to: sanitizedEmail,
          subject: `Your Customer Portal is Ready, ${sanitizedName}!`,
          html: generateWelcomeEmail(sanitizedName),
        })
        
        if (!emailError) {
          welcomeEmailSent = true
        } else {
          console.error('Welcome email error:', emailError)
        }
      } catch (emailErr) {
        console.error('Failed to send welcome email:', emailErr)
        // Non-fatal - customer was created successfully
      }
    }

    return NextResponse.json({
      success: true,
      customer,
      stripeCustomerId: stripeCustomerId,
      welcomeEmailSent
    })

  } catch (error) {
    console.error('Create customer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateWelcomeEmail(firstName) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Your Portal is Ready</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="width:100%;padding:24px 0;">
    <div style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;box-shadow:0 2px 8px rgba(15,23,42,0.05);">
      <!-- LOGO HEADER -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center" style="padding:0;">
            <div style="background:linear-gradient(180deg,#d5d8dc 0%,#cdd0d4 50%,#d5d8dc 100%);background-image:url('https://bzcdasbrdaonxpomzakh.supabase.co/storage/v1/object/public/public-assets/logo_impress_white.png'),linear-gradient(180deg,#d5d8dc 0%,#cdd0d4 50%,#d5d8dc 100%);background-repeat:no-repeat,no-repeat;background-position:center,center;background-size:200px auto,cover;width:100%;height:150px;text-align:center;">&nbsp;</div>
          </td>
        </tr>
      </table>
      <!-- TITLE / COPY -->
      <div style="padding:32px 32px 8px;">
        <p style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6b7280;margin:0 0 8px;">YOUR PORTAL IS READY</p>
        <h1 style="font-size:28px;line-height:1.2;font-weight:700;color:#111827;margin:0 0 12px;">Hi ${firstName}, Your Customer Portal is Live!</h1>
        <p style="font-size:15px;line-height:1.6;color:#4b5563;margin:0;">As a valued customer, you now have access to your own customer portal. View your upcoming appointments, pay invoices online, and manage your cleaning services—all in one place.</p>
      </div>
      <!-- BUTTON -->
      <div style="padding:24px 32px 8px;text-align:center;">
        <a href="https://impressyoucleaning.com/auth/signup" style="display:inline-block;background-color:#079447;color:#ffffff !important;text-decoration:none;padding:18px 48px;border-radius:999px;font-size:16px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;box-shadow:0 8px 18px rgba(7,148,71,0.28);">CREATE MY ACCOUNT</a>
        <p style="margin-top:16px;font-size:12px;color:#6b7280;">Use the same email address where you received this message to link your account.</p>
      </div>
      <!-- ALT LINK -->
      <div style="padding:16px 32px 0;text-align:center;font-size:13px;color:#6b7280;">
        <p style="margin:0 0 8px 0;">If the button above doesn't work, you can sign up using <a href="https://impressyoucleaning.com/auth/signup" style="color:#079447;text-decoration:underline;">this link</a>.</p>
      </div>
      <!-- HELP BOX -->
      <div style="margin:20px auto 36px;padding:18px 20px;max-width:240px;background-color:#f3f4f6;border-radius:10px;font-size:12px;color:#374151;text-align:center;">
        <p style="margin:0 0 4px 0;font-weight:600;">Have a question?</p>
        <p style="margin:4px 0 0;"><a href="mailto:notifications@impressyoucleaning.com" style="color:#079447;text-decoration:underline;">Reach out to our team</a></p>
      </div>
      <!-- FOOTER -->
      <div style="padding:28px 32px;border-top:1px solid #e5e7eb;">
        <p style="font-size:11px;font-weight:600;color:#6b7280;margin:2px 0;">Impress Cleaning Services, LLC</p>
        <p style="font-size:10px;color:#6b7280;margin:2px 0;">1530 Sun City Blvd, Suite 120-403, Georgetown, TX 78633</p>
        <p style="font-size:10px;color:#6b7280;margin:2px 0;">© 2025 Impress Cleaning Services, LLC. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`
}