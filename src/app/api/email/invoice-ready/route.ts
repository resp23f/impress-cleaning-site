import { NextResponse, NextRequest } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://impressyoucleaning.com'

interface InvoiceReadyRequest {
  customerId?: string
  customerEmail: string
  firstName: string
}

export async function POST(request: NextRequest) {
  try {
    const body: InvoiceReadyRequest = await request.json()
    const { customerId, customerEmail, firstName } = body

    if (!customerEmail || !firstName) {
      return NextResponse.json({ error: 'customerEmail and firstName are required' }, { status: 422 })
    }

    const emailHtml = generateInvoiceReadyEmail(firstName)

    const { data, error } = await resend.emails.send({
      from: 'Impress Cleaning Services <notifications@impressyoucleaning.com>',
      to: customerEmail,
      subject: `${firstName}, You Have a New Invoice`,
      html: emailHtml,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, emailId: data?.id })
  } catch (error: unknown) {
    console.error('Error sending invoice ready email:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

function generateInvoiceReadyEmail(firstName: string): string {
  const loginLink = `${SITE_URL}/auth/login`
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>New Invoice Ready</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#ffffff;">
    <tr>
      <td style="padding:24px 0 0 0;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" align="center" style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
          <!-- LOGO HEADER -->
          <tr>
            <td align="center" style="background:linear-gradient(180deg,#d5d8dc 0%,#cdd0d4 50%,#d5d8dc 100%);padding:50px 0;">
              <img src="https://bzcdasbrdaonxpomzakh.supabase.co/storage/v1/object/public/public-assets/logo_impress_white.png" alt="Impress Cleaning Services" width="200" style="display:block;width:200px;height:auto;" />
            </td>
          </tr>
          <!-- TITLE / COPY -->
          <tr>
            <td style="padding:32px 32px 8px;">
              <p style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6b7280;margin:0 0 8px;">NEW INVOICE</p>
              <h1 style="font-size:28px;line-height:1.2;font-weight:700;color:#111827;margin:0 0 12px;">Hi ${firstName}, You Have a New Invoice</h1>
              <p style="font-size:15px;line-height:1.6;color:#4b5563;margin:0;">A new invoice has been added to your account. Sign in to your customer portal to view the details and make a payment.</p>
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
              <table role="presentation" width="240" cellspacing="0" cellpadding="0" align="center" style="background-color:#f3f4f6;border-radius:10px;">
                <tr>
                  <td style="padding:18px 20px;text-align:center;">
                    <p style="margin:0 0 4px 0;font-weight:600;font-size:12px;color:#374151;">Have a question?</p>
                    <p style="margin:4px 0 0;font-size:12px;"><a href="mailto:billing@impressyoucleaning.com" style="color:#079447;text-decoration:none;border-bottom:1px solid #079447;">Reach out to our team</a></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- FOOTER -->
          <tr>
            <td style="padding:28px 32px;border-top:1px solid #e5e7eb;">
              <p style="font-size:11px;font-weight:600;color:#6b7280;margin:2px 0;">Impress Cleaning Services, LLC</p>
              <p style="font-size:10px;color:#6b7280;margin:2px 0;">1530 Sun City Blvd, Suite 120-403, Georgetown, TX 78633</p>
              <p style="font-size:10px;color:#6b7280;margin:2px 0;">© 2025 Impress Cleaning Services, LLC. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
