import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { email, name, invoiceNumber, amount, dueDate, checkoutUrl } = await request.json()

    const { data, error } = await resend.emails.send({
      from: 'Impress Cleaning Services <noreply@impressyoucleaning.com>',
      to: email,
      subject: `Invoice ${invoiceNumber} - Payment Required`,
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

            <div style="background: #f8f9fa; border-radius: 10px; padding: 30px; margin-bottom: 30px;">
              <h2 style="color: #1C294E; margin-top: 0;">Invoice Payment Required</h2>
              
              <p>Hi ${name},</p>
              
              <p>Your invoice is ready for payment.</p>

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
                      $${parseFloat(amount).toFixed(2)}
                    </td>
                  </tr>
                  ${dueDate ? `
                    <tr>
                      <td style="padding: 10px 0;">
                        <strong>Due Date:</strong>
                      </td>
                      <td style="padding: 10px 0; text-align: right;">
                        ${new Date(dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ` : ''}
                </table>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${checkoutUrl}" style="display: inline-block; background: #079447; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Pay Invoice
                </a>
              </div>

              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                You can also view and pay this invoice by logging into your customer portal.
              </p>
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
    console.error('Error sending invoice email:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}