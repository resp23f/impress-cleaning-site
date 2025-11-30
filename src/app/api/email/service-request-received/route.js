import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = 'Impress Cleaning Services <notifications@impressyoucleaning.com>'

export async function POST(request) {
  try {
    const { 
      customerEmail, 
      customerName, 
      serviceType,
      preferredDate,
      preferredTime,
      address 
    } = await request.json()

    const serviceLabelMap = {
      standard: 'Standard Cleaning',
      deep: 'Deep Cleaning',
      move_in_out: 'Move In/Out Cleaning',
      post_construction: 'Post-Construction Cleaning',
      office: 'Office Cleaning',
    }

    const timeLabelMap = {
      morning: 'Morning (9 AM - 12 PM)',
      afternoon: 'Afternoon (12 PM - 4 PM)',
      evening: 'Evening (4 PM - 7 PM)',
    }

    const serviceLabel = serviceLabelMap[serviceType] || serviceType || 'Cleaning Service'
    const formattedDate = preferredDate 
      ? new Date(preferredDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
      : 'Flexible'
    const timeLabel = timeLabelMap[preferredTime] || preferredTime || 'Flexible'

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `We Received Your Service Request!`,
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
            
            <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); border-radius: 10px; padding: 30px; margin-bottom: 30px; text-align: center;">
              <h2 style="color: white; margin: 0; font-size: 28px;">📋 Request Received!</h2>
            </div>

            <div style="background: #f8f9fa; border-radius: 10px; padding: 30px; margin-bottom: 30px;">
              <p style="font-size: 16px; margin-top: 0;">Hi ${customerName},</p>
              <p style="font-size: 16px;">Thank you for requesting a cleaning service! We've received your request and our team is reviewing it now.</p>
              
              <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #1C294E; margin-top: 0; font-size: 18px;">Your Request Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                      <strong>Service Type:</strong>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                      ${serviceLabel}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                      <strong>Preferred Date:</strong>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                      ${formattedDate}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                      <strong>Preferred Time:</strong>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                      ${timeLabel}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0;">
                      <strong>Location:</strong>
                    </td>
                    <td style="padding: 10px 0; text-align: right;">
                      ${address}
                    </td>
                  </tr>
                </table>
              </div>

              <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p style="margin: 0; color: #1e3a8a; font-size: 14px;">
                  <strong>What happens next?</strong> Our team will review your request and confirm your appointment within 24 hours. You'll receive an email once it's confirmed!
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/portal/appointments" style="display: inline-block; background: #079447; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  View Request Status
                </a>
              </div>

              <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
                Need to make changes? Visit your portal or reply to this email.
              </p>
            </div>

            <div style="text-align: center; color: #6b7280; font-size: 14px;">
              <p>We're excited to clean for you!</p>
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
    console.error('Error sending service request received email:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}