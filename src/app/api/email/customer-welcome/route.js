import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { sanitizeText, sanitizeEmail } from '@/lib/sanitize'
import { randomBytes, createHash } from 'crypto'

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
    // Verify admin
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()

    if (!body.email || !body.firstName) {
      return NextResponse.json({ error: 'email and firstName are required' }, { status: 422 })
    }

    const email = sanitizeEmail(body.email)
    const firstName = sanitizeText(body.firstName)?.slice(0, 50)

    if (!email) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 422 })
    }

    if (!firstName) {
      return NextResponse.json({ error: 'Invalid first name' }, { status: 422 })
    }

    // Create admin client
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Get the user ID for this email
    const { data: userProfile, error: userError } = await adminClient
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (userError || !userProfile) {
      console.error('User lookup error:', userError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Generate custom invite token (valid for 48 hours)
    const inviteToken = generateInviteToken()
    const tokenHash = hashToken(inviteToken)
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

    // Store token hash in database
    const { error: tokenError } = await adminClient
      .from('customer_invite_tokens')
      .insert({
        user_id: userProfile.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
      })

    if (tokenError) {
      console.error('Token storage error:', tokenError)
      return NextResponse.json({ error: 'Failed to generate invite token' }, { status: 500 })
    }

    // Build invite link using our custom token
    const inviteLink = `${SITE_URL}/api/auth/validate-invite?token=${inviteToken}`

    const emailHtml = generateWelcomeEmail(firstName, inviteLink)

    const { data, error } = await resend.emails.send({
      from: 'Impress Cleaning Services <notifications@impressyoucleaning.com>',
      to: email,
      subject: `${firstName}, Finish Setting Up Your Portal`,
      html: emailHtml,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, emailId: data?.id })
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
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
