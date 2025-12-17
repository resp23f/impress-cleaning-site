import { NextResponse } from 'next/server'
import { Resend } from 'resend'
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

    const emailHtml = generateWelcomeEmail(firstName)

    const { data, error } = await resend.emails.send({
      from: 'Impress Cleaning Services <notifications@impressyoucleaning.com>',
      to: email,
      subject: `Your Customer Portal is Ready, ${firstName}!`,
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

function generateWelcomeEmail(firstName) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Your Portal is Ready</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        "Helvetica Neue", Arial, sans-serif;
    }
    .wrapper {
      width: 100%;
      padding: 24px 0;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
    }
    .hero {
      padding: 32px 32px 8px;
    }
    .eyebrow {
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #6b7280;
      margin: 0 0 8px;
    }
    .title {
      font-size: 28px;
      line-height: 1.2;
      font-weight: 700;
      color: #111827;
      margin: 0 0 12px;
    }
    .subtitle {
      font-size: 15px;
      line-height: 1.6;
      color: #4b5563;
      margin: 0;
    }
    .footer {
      padding: 28px 32px;
      border-top: 1px solid #e5e7eb;
    }
    .footer-line {
      margin: 2px 0;
    }
    @media (max-width: 640px) {
      .email-container {
        border-radius: 0;
      }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="email-container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);">

      <!-- LOGO HEADER -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center" style="padding:0;">
            <div style="background: linear-gradient(180deg,#d5d8dc 0%,#cdd0d4 50%,#d5d8dc 100%); background-image: url('https://bzcdasbrdaonxpomzakh.supabase.co/storage/v1/object/public/public-assets/logo_impress_white.png'), linear-gradient(180deg,#d5d8dc 0%,#cdd0d4 50%,#d5d8dc 100%); background-repeat: no-repeat, no-repeat; background-position: center, center; background-size: 200px auto, cover; width: 100%; height: 150px; text-align: center;">&nbsp;</div>
          </td>
        </tr>
      </table>

      <!-- TITLE / COPY -->
      <div class="hero">
        <p class="eyebrow">YOUR PORTAL IS READY</p>
        <h1 class="title">Hi ${firstName}, Your Customer Portal is Live!</h1>
        <p class="subtitle">As a valued customer, you now have access to your own customer portal. View your upcoming appointments, pay invoices online, and manage your cleaning services—all in one place.</p>
      </div>

      <!-- BUTTON -->
      <div style="padding: 24px 32px 8px; text-align: center;">
        <a href="https://impressyoucleaning.com/auth/signup" style="display: inline-block; background-color: #079447; color: #ffffff !important; text-decoration: none; padding: 18px 48px; border-radius: 999px; font-size: 16px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; box-shadow: 0 8px 18px rgba(7, 148, 71, 0.28);">CREATE MY ACCOUNT</a>
        <p style="margin-top: 16px; font-size: 12px; color: #6b7280;">Use the same email address where you received this message to link your account.</p>
      </div>

      <!-- ALT LINK -->
      <div style="padding: 16px 32px 0; text-align: center; font-size: 13px; color: #6b7280;">
        <p style="margin: 0 0 8px 0;">If the button above doesn't work, you can sign up using <a href="https://impressyoucleaning.com/auth/signup" style="color: #079447; text-decoration: underline;">this link</a>.</p>
      </div>

      <!-- HELP BOX -->
      <div style="margin: 20px auto 36px; padding: 18px 20px; max-width: 240px; background-color: #f3f4f6; border-radius: 10px; font-size: 12px; color: #374151; text-align: center;">
        <div style="margin-bottom: 8px;">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="#374151" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
        </div>
        <p style="margin: 0 0 4px 0; font-weight: 600;">Have a question?</p>
        <p style="margin: 4px 0 0;"><a href="mailto:notifications@impressyoucleaning.com" style="color: #079447; text-decoration: underline;">Reach out to our team</a></p>
      </div>

      <!-- FOOTER -->
      <div class="footer">
        <p class="footer-line" style="font-size: 11px; font-weight: 600; color: #6b7280;">Impress Cleaning Services, LLC</p>
        <p class="footer-line" style="font-size: 10px; color: #6b7280;">1530 Sun City Blvd, Suite 120-403, Georgetown, TX 78633</p>
        <p class="footer-line" style="font-size: 10px; color: #6b7280;">© 2025 Impress Cleaning Services, LLC. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`
}