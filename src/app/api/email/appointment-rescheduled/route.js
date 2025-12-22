import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { sanitizeText, sanitizeEmail } from '@/lib/sanitize'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = 'Impress Cleaning Services <notifications@impressyoucleaning.com>'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://impressyoucleaning.com'

export async function POST(request) {
  try {
    const body = await request.json()

    const customerEmail = sanitizeEmail(body.customerEmail)
    const customerName = sanitizeText(body.customerName)?.slice(0, 100) || 'Customer'
    const firstName = customerName.split(' ')[0]

    if (!customerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const loginLink = `${SITE_URL}/auth/login`

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `${firstName}, Your Appointment Has Been Rescheduled`,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Appointment Rescheduled</title>
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
              <p style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6b7280;margin:0 0 8px;">APPOINTMENT RESCHEDULED</p>
              <h1 style="font-size:28px;line-height:1.2;font-weight:700;color:#111827;margin:0 0 12px;">Hi ${firstName}, Your Appointment Has Been Rescheduled</h1>
              <p style="font-size:15px;line-height:1.6;color:#4b5563;margin:0;">Your cleaning appointment has been rescheduled. Sign in to your customer portal to view the updated details.</p>
            </td>
          </tr>
          <!-- BUTTON -->
          <tr>
            <td style="padding:24px 32px 8px;text-align:center;">
              <a href="${loginLink}" style="display:inline-block;background-color:#079447;color:#ffffff !important;text-decoration:none;padding:18px 48px;border-radius:999px;font-size:16px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">LOG IN NOW</a>
            </td>
          </tr>
          <!-- HELP BOX -->
          <tr>
            <td style="padding:32px;">
              <table role="presentation" width="320" cellspacing="0" cellpadding="0" align="center" style="background-color:#f3f4f6;border-radius:10px;">
                <tr>
                  <td style="padding:18px 24px;text-align:center;">
                    <p style="margin:0 0 4px 0;font-weight:600;font-size:12px;color:#374151;">Have a question?</p>
                    <p style="margin:4px 0 0;font-size:12px;"><a href="mailto:scheduling@impressyoucleaning.com" style="color:#079447;text-decoration:none;border-bottom:1px solid #079447;">Reach out to our team</a></p>
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
</html>`,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending appointment reschedule email:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
