import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sanitizeText, sanitizeEmail, sanitizePhone } from '@/lib/sanitize'
import Stripe from 'stripe'

// Format phone to (XXX) XXX-XXXX
function formatPhoneNumber(phone) {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length !== 10) return phone // Return as-is if not 10 digits
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
}
import { Resend } from 'resend'
import { randomBytes, createHash } from 'crypto'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const resend = new Resend(process.env.RESEND_API_KEY)
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://impressyoucleaning.com'

function generateInviteToken() {
  return randomBytes(32).toString('hex')
}

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex')
}

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
    const sanitizedPhone = phone ? formatPhoneNumber(sanitizePhone(phone)) : null

    // Parse first_name and last_name from full_name for new schema
    let firstName = ''
    let lastName = ''
    if (sanitizedName) {
      const nameParts = sanitizedName.trim().split(' ')
      firstName = nameParts[0] || ''
      lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''
    }

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
        admin_invited: true, // Flag for callback routing
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

    // 7. Update profile with phone, stripe_customer_id, and parsed name fields
    const profileUpdate = {
      updated_at: new Date().toISOString()
    }
    if (firstName) {
      profileUpdate.first_name = firstName
    }
    if (lastName) {
      profileUpdate.last_name = lastName
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
      .select('id, full_name, first_name, last_name, email, phone, account_status, stripe_customer_id, created_at')
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
        // Generate custom invite token (valid for 48 hours)
        const inviteToken = generateInviteToken()
        const tokenHash = hashToken(inviteToken)
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

        // Store token hash in database
        const { error: tokenError } = await adminClient
          .from('customer_invite_tokens')
          .insert({
            user_id: newUser.user.id,
            token_hash: tokenHash,
            expires_at: expiresAt,
          })

        if (tokenError) {
          console.error('Token storage error:', tokenError)
          throw new Error('Failed to generate invite token')
        }

        // Build invite link using our custom token
        const inviteLink = `${SITE_URL}/api/auth/validate-invite?token=${inviteToken}`

        const { error: emailError } = await resend.emails.send({
          from: 'Impress Cleaning Services <notifications@impressyoucleaning.com>',
          to: sanitizedEmail,
          subject: `${firstName}, Finish Setting Up Your Portal`,
          html: generateWelcomeEmail(firstName, inviteLink),
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

function generateWelcomeEmail(firstName, inviteLink) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Finish Setting Up Your Portal</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#ffffff;">
    <tr>
      <td style="padding:24px 0 0 0;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" align="center" style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
          <!-- LOGO HEADER -->
          <tr>
            <td align="center" style="background:linear-gradient(180deg,#d5d8dc 0%,#cdd0d4 50%,#d5d8dc 100%);padding:35px 0;">
              <img src="https://bzcdasbrdaonxpomzakh.supabase.co/storage/v1/object/public/public-assets/logo_impress_white.png" alt="Impress Cleaning Services" width="200" style="display:block;width:200px;height:auto;" />
            </td>
          </tr>
          <!-- TITLE / COPY -->
          <tr>
            <td style="padding:32px 32px 8px;">
              <p style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6b7280;margin:0 0 8px;">WELCOME</p>
              <h1 style="font-size:28px;line-height:1.2;font-weight:700;color:#111827;margin:0 0 12px;">Hi ${firstName}, Finish Setting Up Your Portal</h1>
              <p style="font-size:15px;line-height:1.6;color:#4b5563;margin:0;">You're just one step away from accessing your customer portal. Complete your profile to view upcoming appointments, pay invoices online, and manage your cleaning services—all in one place.</p>
            </td>
          </tr>
          <!-- BUTTON -->
          <tr>
            <td style="padding:24px 32px 8px;text-align:center;">
              <a href="${inviteLink}" style="display:inline-block;background-color:#079447;color:#ffffff !important;text-decoration:none;padding:18px 48px;border-radius:999px;font-size:16px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">FINISH SETTING UP</a>
              <p style="margin:16px 0 0;font-size:12px;color:#6b7280;">This link expires in 48 hours.</p>
            </td>
          </tr>
          <!-- HELP BOX -->
          <tr>
            <td style="padding:32px;">
              <table role="presentation" width="320" cellspacing="0" cellpadding="0" align="center" style="background-color:#f3f4f6;border-radius:10px;">
                <tr>
                  <td style="padding:18px 24px;text-align:center;">
                    <p style="margin:0 0 4px 0;font-weight:600;font-size:12px;color:#374151;">Have a question?</p>
                    <p style="margin:4px 0 0;font-size:12px;"><a href="mailto:admin@impressyoucleaning.com" style="color:#079447;text-decoration:none;border-bottom:1px solid #079447;">Reach out to our team</a></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- FOOTER -->
          <tr>
            <td style="padding:28px 32px;border-top:1px solid #e5e7eb;">
              <p style="font-size:11px;font-weight:600;color:#6b7280;margin:2px 0;">Impress Cleaning Services, LLC</p>
              <p style="font-size:10px;color:#6b7280;margin:2px 0;"><a style="color:#6b7280;text-decoration:none;pointer-events:none;">1530 Sun City Blvd, Suite 120-403, Georgetown, TX 78633</a></p>
              <p style="font-size:10px;color:#6b7280;margin:2px 0;">&copy; 2025 Impress Cleaning Services, LLC. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}