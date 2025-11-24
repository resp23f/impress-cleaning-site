import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { email, name } = await request.json()

    const { data, error } = await resend.emails.send({
      from: 'Impress Cleaning Services <notifications@impressyoucleaning.com>',
      to: email,
      subject: '✅ Your Account Has Been Approved!',
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

            <div style="background: #f8f9fa; border-radius: 10px; padding: 30px; margin-bottom: 30px; border-left: 4px solid #079447;">
              <h2 style="color: #079447; margin-top: 0;">🎉 Welcome! Your Account is Ready</h2>
              
              <p>Hi ${name},</p>
              
              <p>Great news! Your Impress Cleaning Services account has been approved and is now active.</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/login" style="display: inline-block; background: #079447; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Access Your Portal
                </a>
              </div>

              <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #1C294E; margin-top: 0; font-size: 16px;">What You Can Do Now:</h3>
                <ul style="margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 10px;">Request cleaning services</li>
                  <li style="margin-bottom: 10px;">View and manage your appointments</li>
                  <li style="margin-bottom: 10px;">Pay invoices online</li>
                  <li style="margin-bottom: 10px;">Track your service history</li>
                </ul>
              </div>

              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                <strong>Login Details:</strong><br>
                Email: ${email}<br>
                Use the password you created during signup.
              </p>
            </div>

            <div style="text-align: center; color: #6b7280; font-size: 14px;">
              <p>Need help getting started? Just reply to this email.</p>
              <p style="margin: 10px 0;">Impress Cleaning Services</p>
              <p style="margin: 10px 0;">
                Questions? Contact us at support@impressyoucleaning.com
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
    console.error('Error sending approval email:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}