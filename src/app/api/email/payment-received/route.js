import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = 'Impress Cleaning Services <notifications@impressyoucleaning.com>'

export async function POST(request) {
  try {
    const { 
      customerEmail, 
      customerName, 
      invoiceNumber,
      amount,
      paymentDate,
      paymentMethod // e.g., "Visa ending in 4242"
    } = await request.json()

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
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1C294E; margin: 0;">Impress Cleaning Services</h1>
            </div>
            
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 10px; padding: 30px; margin-bottom: 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">✓</div>
              <h2 style="color: white; margin: 0; font-size: 28px;">Payment Received!</h2>
            </div>

            <div style="background: #f8f9fa; border-radius: 10px; padding: 30px; margin-bottom: 30px;">
              <p style="font-size: 16px; margin-top: 0;">Hi ${customerName},</p>
              <p style="font-size: 16px;">Thank you! We've received your payment and your invoice has been marked as paid.</p>
              
              <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #1C294E; margin-top: 0; font-size: 18px;">Payment Details</h3>
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
                      <strong>Amount Paid:</strong>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #059669; font-weight: 600; font-size: 18px;">
                      $${formattedAmount}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                      <strong>Payment Date:</strong>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                      ${formattedDate}
                    </td>
                  </tr>
                  ${paymentMethod ? `
                    <tr>
                      <td style="padding: 10px 0;">
                        <strong>Payment Method:</strong>
                      </td>
                      <td style="padding: 10px 0; text-align: right;">
                        ${paymentMethod}
                      </td>
                    </tr>
                  ` : ''}
                </table>
              </div>

              <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p style="margin: 0; color: #065f46; font-size: 14px;">
                  <strong>Receipt confirmation:</strong> This email serves as your receipt. You can also view and download your invoice anytime from your customer portal.
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/portal/invoices" style="display: inline-block; background: #079447; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  View Invoice
                </a>
              </div>

              <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
                Questions about this payment? Reply to this email or contact us.
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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending payment received email:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}