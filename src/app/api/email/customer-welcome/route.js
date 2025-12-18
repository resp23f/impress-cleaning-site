import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { sanitizeText, sanitizeEmail } from '@/lib/sanitize'

const resend = new Resend(process.env.RESEND_API_KEY)

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

    // Create admin client for generating magic link
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Generate magic link for the customer
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://impressyoucleaning.com'}/auth/callback?next=/auth/admin-invited-set-password`,
      },
    })

    if (linkError) {
      console.error('Magic link generation error:', linkError)
    }

    const magicLink = linkData?.properties?.action_link || 'https://impressyoucleaning.com/auth/login'

    const emailHtml = generateWelcomeEmail(firstName, magicLink)

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

function generateWelcomeEmail(firstName, magicLink) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Finish Setting Up Your Portal</title>
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
        <p style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6b7280;margin:0 0 8px;">ALMOST READY</p>
        <h1 style="font-size:28px;line-height:1.2;font-weight:700;color:#111827;margin:0 0 12px;">Hi ${firstName}, Finish Setting Up Your Portal</h1>
        <p style="font-size:15px;line-height:1.6;color:#4b5563;margin:0;">You're just one step away from accessing your customer portal. Complete your profile to view upcoming appointments, pay invoices online, and manage your cleaning services—all in one place.</p>
      </div>
      <!-- BUTTON -->
      <div style="padding:24px 32px 8px;text-align:center;">
        <a href="${magicLink}" style="display:inline-block;background-color:#079447;color:#ffffff !important;text-decoration:none;padding:18px 48px;border-radius:999px;font-size:16px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;box-shadow:0 8px 18px rgba(7,148,71,0.28);">FINISH SETTING UP</a>
        <p style="margin-top:16px;font-size:12px;color:#6b7280;">This link will sign you in automatically and take you to complete your profile.</p>
      </div>
      <!-- ALT LINK -->
      <div style="padding:16px 32px 0;text-align:center;font-size:13px;color:#6b7280;">
        <p style="margin:0 0 8px 0;">If the button above doesn't work, <a href="${magicLink}" style="color:#079447;text-decoration:underline;">click here</a>.</p>
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
