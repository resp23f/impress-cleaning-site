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
    const serviceType = body.serviceType
    const scheduledDate = body.scheduledDate
    const scheduledTimeStart = body.scheduledTimeStart
    const scheduledTimeEnd = body.scheduledTimeEnd
    const address = sanitizeText(body.address)?.slice(0, 300) || 'N/A'
    const cancelledBy = body.cancelledBy // 'customer' or 'admin'

    // Validate required fields
    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const serviceLabelMap = {
      standard: 'Standard Cleaning',
      deep: 'Deep Cleaning',
      move_in_out: 'Move In/Out Cleaning',
      post_construction: 'Post-Construction Cleaning',
      office: 'Office Cleaning',
    }

    const serviceLabel = serviceLabelMap[serviceType] || serviceType || 'Cleaning Service'
    
    const formattedDate = scheduledDate 
      ? new Date(scheduledDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
      : 'N/A'
    const timeRange = scheduledTimeStart && scheduledTimeEnd 
      ? `${scheduledTimeStart} - ${scheduledTimeEnd}` 
      : 'N/A'

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `Appointment Cancelled - ${serviceLabel}`,
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
            
            <div style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); border-radius: 10px; padding: 30px; margin-bottom: 30px; text-align: center;">
              <h2 style="color: white; margin: 0; font-size: 28px;">Appointment Cancelled</h2>
            </div>

            <div style="background: #f8f9fa; border-radius: 10px; padding: 30px; margin-bottom: 30px;">
              <p style="font-size: 16px; margin-top: 0;">Hi ${customerName},</p>
              <p style="font-size: 16px;">
                ${cancelledBy === 'customer' 
                  ? 'Your cancellation request has been processed. Your appointment has been cancelled.' 
                  : 'We\'re writing to inform you that your upcoming appointment has been cancelled.'}
              </p>
              
              <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #1C294E; margin-top: 0; font-size: 18px;">Cancelled Appointment</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                      <strong>Service:</strong>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                      ${serviceLabel}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                      <strong>Date:</strong>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                      ${formattedDate}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                      <strong>Time:</strong>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                      ${timeRange}
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

              ${cancelledBy === 'customer' 
                ? `
                  <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
                    <p style="margin: 0; color: #1e3a8a; font-size: 14px;">
                      <strong>We're sorry to see you go!</strong> We hope to serve you again in the future. Feel free to book a new appointment anytime.
                    </p>
                  </div>
                ` 
                : `
                  <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                      <strong>We apologize for any inconvenience.</strong> If you have questions about this cancellation, please contact us and we'll be happy to help.
                    </p>
                  </div>
                `
              }

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/portal/request-service" style="display: inline-block; background: #079447; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Book a New Service
                </a>
              </div>

              <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
                Have questions? Reply to this email or contact us anytime.
              </p>
            </div>

            <div style="text-align: center; color: #6b7280; font-size: 14px;">
              <p>We hope to serve you again soon!</p>
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
    console.error('Error sending appointment cancellation email:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}