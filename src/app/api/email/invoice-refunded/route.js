import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { customerEmail, customerName, invoiceNumber, refundAmount, refundReason } = await request.json()

    if (!customerEmail || !invoiceNumber || refundAmount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const formattedAmount = parseFloat(refundAmount).toFixed(2)

    const { data, error } = await resend.emails.send({
      from: 'Impress Cleaning Services <notifications@impressyoucleaning.com>',
      to: customerEmail,
      subject: `Refund processed for Invoice ${invoiceNumber}`,
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
            <div style="background: #ecfdf5; border-radius: 10px; padding: 30px; margin-bottom: 30px; border-left: 4px solid #10b981;">
              <h2 style="color: #065f46; margin-top: 0;">Refund Processed</h2>
              <p>Hi ${customerName || 'Valued Customer'},</p>
              <p>We have processed a refund for Invoice <strong>${invoiceNumber}</strong>.</p>
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
                      <strong>Refund Amount:</strong>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold; color: #10b981;">
                      $${formattedAmount}
                    </td>
                  </tr>
                  ${refundReason ? `
                    <tr>
                      <td style="padding: 10px 0;">
                        <strong>Reason:</strong>
                      </td>
                      <td style="padding: 10px 0; text-align: right;">
                        ${refundReason}
                      </td>
                    </tr>
                  ` : ''}
                </table>
              </div>
              <div style="background: #d1fae5; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #065f46;">
                  <strong>Expected Timeline:</strong> Refunds typically take 5-10 business days to appear on your statement, depending on your bank or card issuer.
                </p>
              </div>
              <p>If you have any questions about this refund, please don't hesitate to contact us.</p>
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
    console.error('Error sending refund email:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
