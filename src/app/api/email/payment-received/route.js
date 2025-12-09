import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { sanitizeText, sanitizeEmail } from '@/lib/sanitize'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = 'Impress Cleaning Services <notifications@impressyoucleaning.com>'

export async function POST(request) {
  try {
    const body = await request.json()

    // Sanitize inputs
    const customerEmail = sanitizeEmail(body.customerEmail)
    const customerName = sanitizeText(body.customerName)?.slice(0, 100) || 'Customer'
    const invoiceNumber = sanitizeText(body.invoiceNumber)?.slice(0, 50) || ''
    const amount = parseFloat(body.amount) || 0
    const paymentDate = body.paymentDate
    const paymentMethod = sanitizeText(body.paymentMethod)?.slice(0, 50) || 'Card'

    // Validate required fields
    if (!customerEmail || !invoiceNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const formattedAmount = parseFloat(amount).toFixed(2)
    const formattedDate = paymentDate 
      ? new Date(paymentDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
      : new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `Payment Received - Invoice ${invoiceNumber}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Payment Received - Impress Cleaning Services</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="width:100%;padding:32px 16px;">
    <div style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.06);">

      <!-- LOGO HEADER -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center" style="padding:0;">
            <div style="background:linear-gradient(135deg,#059669 0%,#10b981 100%);padding:32px 0;">
<img src="https://impressyoucleaning.com/logo_impress_white.png" alt="Impress Cleaning Services" style="height:56px;width:auto;" />            </div>
          </td>
        </tr>
      </table>

      <!-- SUCCESS ICON -->
      <div style="padding:32px 40px 0;text-align:center;">
        <div style="display:inline-block;width:72px;height:72px;background:linear-gradient(135deg,#ecfdf5 0%,#d1fae5 100%);border-radius:50%;line-height:72px;">
          <span style="font-size:36px;">✓</span>
        </div>
      </div>

      <!-- THANK YOU MESSAGE -->
      <div style="padding:24px 40px 0;text-align:center;">
        <h1 style="font-size:28px;font-weight:700;color:#0f172a;margin:0 0 8px;">Payment Received!</h1>
        <p style="font-size:15px;color:#64748b;margin:0;line-height:1.6;">Thank you, ${customerName}. Your payment has been confirmed.</p>
      </div>

      <!-- AMOUNT DISPLAY -->
      <div style="padding:28px 40px;text-align:center;">
        <div style="display:inline-block;background:linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%);border:2px solid #86efac;border-radius:16px;padding:24px 48px;">
          <p style="font-size:11px;color:#16a34a;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Amount Paid</p>
          <p style="font-size:42px;font-weight:700;color:#15803d;margin:0;">$${formattedAmount}</p>
        </div>
      </div>

      <!-- RECEIPT DETAILS -->
      <div style="padding:0 40px 28px;">
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
          
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding:16px 24px;border-bottom:1px solid #e2e8f0;">
                <p style="font-size:11px;color:#94a3b8;margin:0 0 2px;text-transform:uppercase;letter-spacing:0.08em;">Invoice Number</p>
                <p style="font-size:15px;font-weight:600;color:#1e293b;margin:0;">${invoiceNumber}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;border-bottom:1px solid #e2e8f0;">
                <p style="font-size:11px;color:#94a3b8;margin:0 0 2px;text-transform:uppercase;letter-spacing:0.08em;">Payment Date</p>
                <p style="font-size:15px;font-weight:600;color:#1e293b;margin:0;">${formattedDate}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;">
                <p style="font-size:11px;color:#94a3b8;margin:0 0 2px;text-transform:uppercase;letter-spacing:0.08em;">Payment Method</p>
                <p style="font-size:15px;font-weight:600;color:#1e293b;margin:0;">${paymentMethod}</p>
              </td>
            </tr>
          </table>

        </div>
      </div>

      <!-- VIEW RECEIPT BUTTON -->
      <div style="padding:0 40px 32px;text-align:center;">
        <a href="https://impressyoucleaning.com/portal/invoices" style="display:inline-block;background:#1e293b;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:100px;font-size:14px;font-weight:600;letter-spacing:0.02em;">View Receipt in Portal</a>
      </div>

      <!-- DIVIDER -->
      <div style="padding:0 40px;">
        <div style="height:1px;background:linear-gradient(90deg,transparent,#e2e8f0,transparent);"></div>
      </div>

      <!-- THANK YOU NOTE -->
      <div style="padding:28px 40px;text-align:center;">
        <p style="font-size:15px;color:#475569;margin:0;line-height:1.7;">We truly appreciate your business and trust in us.<br/>Looking forward to making your space shine! ✨</p>
      </div>

      <!-- HELP BOX -->
      <div style="padding:0 40px 32px;">
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;text-align:center;">
          <p style="font-size:13px;font-weight:600;color:#475569;margin:0 0 4px;">Need help with anything?</p>
          <p style="font-size:13px;color:#64748b;margin:0;">Reply to this email or call <a href="tel:5129989658" style="color:#059669;text-decoration:none;font-weight:500;">(512) 998-9658</a></p>
        </div>
      </div>

      <!-- FOOTER -->
      <div style="padding:24px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;">
        <p style="font-size:12px;font-weight:600;color:#64748b;margin:0 0 4px;">Impress Cleaning Services, LLC</p>
        <p style="font-size:11px;color:#94a3b8;margin:0 0 2px;">1530 Sun City Blvd, Suite 120-403, Georgetown, TX 78633</p>
        <p style="font-size:11px;color:#94a3b8;margin:0;">© 2025 Impress Cleaning Services, LLC. All rights reserved.</p>
      </div>

    </div>

    <!-- FOOTER LINKS -->
    <div style="text-align:center;padding:24px 0;">
      <a href="https://impressyoucleaning.com/portal/dashboard" style="font-size:12px;color:#64748b;text-decoration:none;">Go to Dashboard</a>
      <span style="color:#cbd5e1;margin:0 12px;">•</span>
      <a href="https://impressyoucleaning.com/portal/settings" style="font-size:12px;color:#64748b;text-decoration:none;">Manage Preferences</a>
    </div>

  </div>
</body>
</html>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending payment received email:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}