import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { customerEmail, customerName, invoiceNumber } = await request.json()

    if (!customerEmail || !invoiceNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from: 'Impress Cleaning Services <notifications@impressyoucleaning.com>',
      to: customerEmail,
      subject: `Invoice ${invoiceNumber} has been cancelled`,
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
            <div style="background: #f3f4f6; border-radius: 10px; padding: 30px; margin-bottom: 30px; border-left: 4px solid #6b7280;">
              <h2 style="color: #374151; margin-top: 0;">Invoice Cancelled</h2>
              <p>Hi ${customerName || 'Valued Customer'},</p>
              <p>This is to confirm that Invoice <strong>${invoiceNumber}</strong> has been cancelled.</p>
              <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 10px;">
                  <span style="color: #6b7280;">&#10005;</span>
                </div>
                <p style="color: #6b7280; margin: 0;">
                  Invoice ${invoiceNumber}
                </p>
                <p style="color: #6b7280; font-weight: 600; margin: 5px 0 0 0;">
                  Status: Cancelled
                </p>
              </div>
              <p>No payment is required for this invoice. If you have already made a payment, please contact us immediately so we can process a refund.</p>
              <p>If you have any questions about why this invoice was cancelled, please don't hesitate to reach out.</p>
            </div>
            <div style="text-align: center; color: #6b7280; font-size: 14px;">
              <p>Thank you for your understanding.</p>
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
    console.error('Error sending cancellation email:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
