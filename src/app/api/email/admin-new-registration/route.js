import { Resend } from 'resend'
import { NextResponse } from 'next/server'
const resend = new Resend(process.env.RESEND_API_KEY)
export async function POST(request) {
  try {
    const { customerName, customerEmail, customerId } = await request.json()
    const { data, error } = await resend.emails.send({
      from: 'Impress Cleaning Services <notifications@impressyoucleaning.com>',
      to: 'admin@impressyoucleaning.com',
      subject: '🎉 New Customer Registration',
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
              <p style="color: #079447; font-size: 18px; margin: 10px 0;">Admin Dashboard</p>
            </div>
            <div style="background: #f8f9fa; border-radius: 10px; padding: 30px; margin-bottom: 30px; border-left: 4px solid #079447;">
              <h2 style="color: #1C294E; margin-top: 0;">New Customer Registration</h2>
              <p>A new customer has signed up and is pending approval.</p>
              <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                      <strong>Customer Name:</strong>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                      ${customerName || 'Not provided'}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                      <strong>Email:</strong>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                      ${customerEmail}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0;">
                      <strong>Status:</strong>
                    </td>
                    <td style="padding: 10px 0; text-align: right;">
                      <span style="background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 12px; font-size: 14px; font-weight: 600;">
                        Pending Approval
                      </span>
                    </td>
                  </tr>
                </table>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/registrations" style="display: inline-block; background: #1C294E; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Review & Approve
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                <strong>Action Required:</strong> Please review this registration and approve or decline the customer account.
              </p>
            </div>
            <div style="text-align: center; color: #6b7280; font-size: 14px;">
              <p style="margin: 10px 0;">This is an automated notification from your Impress Cleaning Services admin panel.</p>
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
    console.error('Error sending admin notification email:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}