import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { invoiceId, customerEmail, customerName, invoiceNumber, amount, dueDate, paymentUrl } = await request.json()

    if (!customerEmail || !invoiceNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const formattedAmount = parseFloat(amount).toFixed(2)
    const formattedDate = dueDate
      ? new Date(dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : 'Today'

    const portalUrl = paymentUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/portal/invoices`

    const { data, error } = await resend.emails.send({
      from: 'Impress Cleaning Services <notifications@impressyoucleaning.com>',
      to: customerEmail,
      subject: `Reminder: Invoice ${invoiceNumber} is due today`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1C294E; margin: 0;">Impress Cleaning Services</h1>
            </div>
            <div style="background: #fef3c7; border-radius: 10px; padding: 30px; margin-bottom: 30px; border-left: 4px solid #f59e0b;">
              <h2 style="color: #92400e; margin-top: 0;">Payment Reminder</h2>
              <p>Hi ${customerName || 'Valued Customer'},</p>
              <p>This is a friendly reminder that your invoice is due today.</p>
              <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                      <strong>Invoice Number:</strong>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                      ${invoiceNumber}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                      <strong>Amount Due:</strong>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                      $${formattedAmount}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0;">
                      <strong>Due Date:</strong>
                    </td>
                    <td style="padding: 10px 0; text-align: right; color: #f59e0b; font-weight: bold;">
                      ${formattedDate}
                    </td>
                  </tr>
                </table>
              </div>
              <p>Please submit your payment at your earliest convenience to avoid any late fees.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${portalUrl}" style="display: inline-block; background: #079447; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Pay Now
                </a>
              </div>
            </div>
            <div style="text-align: center; color: #6b7280; font-size: 14px;">
              <p>Thank you for your business!</p>
              <p style="margin: 10px 0;">Impress Cleaning Services</p>
              <p style="margin: 10px 0;">
                Questions? Reply to this email or contact us at support@impressyoucleaning.com
              </p>
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
    console.error('Error sending reminder email:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
