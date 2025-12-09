import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { sanitizeText, sanitizeEmail } from '@/lib/sanitize'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const body = await request.json()
    
    // Sanitize inputs
    const email = sanitizeEmail(body.email)
    const name = sanitizeText(body.name)?.slice(0, 100) || 'Customer'
    const invoiceNumber = sanitizeText(body.invoiceNumber)?.slice(0, 50) || ''
    const amount = parseFloat(body.amount) || 0
    const dueDate = body.dueDate
    const checkoutUrl = body.checkoutUrl || 'https://impressyoucleaning.com/portal/invoices'
    
    // Validate required fields
    if (!email || !invoiceNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const formattedAmount = amount.toFixed(2)
    const formattedDueDate = dueDate 
      ? new Date(dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : 'Upon Receipt'

    const { data, error } = await resend.emails.send({
      from: 'Impress Cleaning Services <notifications@impressyoucleaning.com>',
      to: email,
      subject: `Invoice ${invoiceNumber} - Payment Required`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Invoice from Impress Cleaning Services</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="width:100%;padding:32px 16px;">
    <div style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.06);">

      <!-- LOGO HEADER -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center" style="padding:0;">
            <div style="background:linear-gradient(135deg,#1e293b 0%,#334155 100%);padding:32px 0;">
              <img src="https://bzcdasbrdaonxpomzakh.supabase.co/storage/v1/object/public/public-assets/logo_impress_white.png" alt="Impress Cleaning Services" style="height:56px;width:auto;" />
            </div>
          </td>
        </tr>
      </table>

      <!-- INVOICE BADGE -->
      <div style="padding:32px 40px 0;text-align:center;">
        <div style="display:inline-block;background:linear-gradient(135deg,#ecfdf5 0%,#d1fae5 100%);border:1px solid #a7f3d0;border-radius:100px;padding:8px 20px;">
          <span style="font-size:12px;font-weight:600;color:#059669;letter-spacing:0.05em;text-transform:uppercase;">New Invoice</span>
        </div>
      </div>

      <!-- GREETING -->
      <div style="padding:24px 40px 0;text-align:center;">
        <h1 style="font-size:26px;font-weight:700;color:#0f172a;margin:0 0 8px;">Hi ${name},</h1>
        <p style="font-size:15px;color:#64748b;margin:0;line-height:1.6;">Here's your invoice from Impress Cleaning Services.</p>
      </div>

      <!-- INVOICE CARD -->
      <div style="padding:28px 40px;">
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
          
          <!-- Invoice Header -->
          <div style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td>
                  <p style="font-size:11px;color:#94a3b8;margin:0 0 2px;text-transform:uppercase;letter-spacing:0.08em;">Invoice Number</p>
                  <p style="font-size:15px;font-weight:600;color:#1e293b;margin:0;">${invoiceNumber}</p>
                </td>
                <td align="right">
                  <p style="font-size:11px;color:#94a3b8;margin:0 0 2px;text-transform:uppercase;letter-spacing:0.08em;">Due Date</p>
                  <p style="font-size:15px;font-weight:600;color:#1e293b;margin:0;">${formattedDueDate}</p>
                </td>
              </tr>
            </table>
          </div>

          <!-- Total -->
          <div style="padding:20px 24px;background:linear-gradient(135deg,#f1f5f9 0%,#e2e8f0 100%);">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td>
                  <p style="font-size:14px;font-weight:600;color:#475569;margin:0;">Amount Due</p>
                </td>
                <td align="right">
                  <p style="font-size:28px;font-weight:700;color:#0f172a;margin:0;">$${formattedAmount}</p>
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>

      <!-- PAY BUTTON -->
      <div style="padding:0 40px 32px;text-align:center;">
        <a href="${checkoutUrl}" style="display:inline-block;background:linear-gradient(135deg,#059669 0%,#10b981 100%);color:#ffffff;text-decoration:none;padding:16px 48px;border-radius:100px;font-size:15px;font-weight:600;letter-spacing:0.03em;box-shadow:0 8px 24px rgba(5,150,105,0.3);">Pay Now</a>
        <p style="margin-top:16px;font-size:13px;color:#94a3b8;">Secure payment powered by Stripe</p>
      </div>

      <!-- DIVIDER -->
      <div style="padding:0 40px;">
        <div style="height:1px;background:linear-gradient(90deg,transparent,#e2e8f0,transparent);"></div>
      </div>

      <!-- PAYMENT OPTIONS -->
      <div style="padding:28px 40px;text-align:center;">
        <p style="font-size:13px;color:#64748b;margin:0 0 12px;">Prefer another payment method?</p>
        <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
          <tr>
            <td style="padding:0 8px;">
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;">
                <p style="font-size:12px;font-weight:600;color:#475569;margin:0;">Zelle</p>
                <p style="font-size:11px;color:#94a3b8;margin:4px 0 0;">billing@impressyoucleaning.com</p>
              </div>
            </td>
          </tr>
        </table>
        <p style="font-size:11px;color:#94a3b8;margin:12px 0 0;">Include invoice number ${invoiceNumber} in your payment memo</p>
      </div>

      <!-- HELP BOX -->
      <div style="padding:0 40px 32px;">
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;text-align:center;">
          <p style="font-size:13px;font-weight:600;color:#475569;margin:0 0 4px;">Questions about this invoice?</p>
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
      <a href="https://impressyoucleaning.com/portal/invoices" style="font-size:12px;color:#64748b;text-decoration:none;">View in Portal</a>
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

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error sending invoice email:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}