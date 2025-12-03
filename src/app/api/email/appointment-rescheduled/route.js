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
    const oldDate = body.oldDate
    const oldTimeStart = body.oldTimeStart
    const oldTimeEnd = body.oldTimeEnd
    const newDate = body.newDate
    const newTimeStart = body.newTimeStart
    const newTimeEnd = body.newTimeEnd
    const address = sanitizeText(body.address)?.slice(0, 300) || 'N/A'

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
    
    const formattedOldDate = oldDate 
      ? new Date(oldDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
      : 'N/A'
    const oldTimeRange = oldTimeStart && oldTimeEnd 
      ? `${oldTimeStart} - ${oldTimeEnd}` 
      : 'N/A'

    const formattedNewDate = newDate 
      ? new Date(newDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
      : 'TBD'
    const newTimeRange = newTimeStart && newTimeEnd 
      ? `${newTimeStart} - ${newTimeEnd}` 
      : 'TBD'

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `Your ${serviceLabel} Has Been Rescheduled`,
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
            
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 10px; padding: 30px; margin-bottom: 30px; text-align: center;">
              <h2 style="color: white; margin: 0; font-size: 28px;">📅 Appointment Rescheduled</h2>
            </div>

            <div style="background: #f8f9fa; border-radius: 10px; padding: 30px; margin-bottom: 30px;">
              <p style="font-size: 16px; margin-top: 0;">Hi ${customerName},</p>
              <p style="font-size: 16px;">Your cleaning appointment has been rescheduled to a new date and time.</p>
              
              <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #1C294E; margin-top: 0; font-size: 18px;">Previous Schedule</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">
                      <strong>Date:</strong>
                    </td>
                    <td style="padding: 8px 0; text-align: right; color: #6b7280; text-decoration: line-through;">
                      ${formattedOldDate}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 2px solid #e5e7eb; color: #6b7280;">
                      <strong>Time:</strong>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 2px solid #e5e7eb; text-align: right; color: #6b7280; text-decoration: line-through;">
                      ${oldTimeRange}
                    </td>
                  </tr>
                </table>

                <h3 style="color: #079447; margin-top: 20px; font-size: 18px;">✓ New Schedule</h3>
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
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #079447; font-weight: 600;">
                      ${formattedNewDate}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                      <strong>Time:</strong>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #079447; font-weight: 600;">
                      ${newTimeRange}
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

              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  <strong>Please note:</strong> If this change doesn't work for you, contact us immediately and we'll find a time that fits your schedule.
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/portal/appointments" style="display: inline-block; background: #079447; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  View in Portal
                </a>
              </div>

              <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
                Questions about this change? Reply to this email or contact us.
              </p>
            </div>

            <div style="text-align: center; color: #6b7280; font-size: 14px;">
              <p>Thank you for your understanding!</p>
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
    console.error('Error sending appointment reschedule email:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}