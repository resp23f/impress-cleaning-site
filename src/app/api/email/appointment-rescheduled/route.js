import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { sanitizeText, sanitizeEmail } from '@/lib/sanitize'
import {
  generateEmailTemplate,
  serviceLabelMap,
  formatTime,
  formatDate,
} from '@/lib/emailTemplate'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = 'Impress Cleaning Services <notifications@impressyoucleaning.com>'

export async function POST(request) {
  try {
    const body = await request.json()

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

    if (!customerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const serviceLabel = serviceLabelMap[serviceType] || serviceType || 'Cleaning Service'
    const formattedOldDate = formatDate(oldDate)
    const oldTimeRange = oldTimeStart && oldTimeEnd
      ? `${formatTime(oldTimeStart)} - ${formatTime(oldTimeEnd)}`
      : 'N/A'
    const formattedNewDate = formatDate(newDate)
    const newTimeRange = newTimeStart && newTimeEnd
      ? `${formatTime(newTimeStart)} - ${formatTime(newTimeEnd)}`
      : 'TBD'

    const contentHtml = `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
        <tr>
          <td style="background-color: #f9fafb; border-radius: 10px; padding: 20px;">
            <p style="margin: 0 0 12px; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #6b7280; font-weight: 600;">Previous Schedule</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                  <span style="color: #9ca3af; font-size: 14px;">Date</span>
                </td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                  <span style="color: #9ca3af; font-size: 14px; text-decoration: line-through;">${formattedOldDate}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0;">
                  <span style="color: #9ca3af; font-size: 14px;">Time</span>
                </td>
                <td style="padding: 8px 0; text-align: right;">
                  <span style="color: #9ca3af; font-size: 14px; text-decoration: line-through;">${oldTimeRange}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 24px;">
        <tr>
          <td style="background-color: #ecfdf5; border-radius: 10px; padding: 20px; border: 2px solid #079447;">
            <p style="margin: 0 0 12px; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #079447; font-weight: 600;">New Schedule</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #d1fae5;">
                  <span style="color: #065f46; font-size: 14px;">Service</span>
                </td>
                <td style="padding: 8px 0; border-bottom: 1px solid #d1fae5; text-align: right;">
                  <span style="color: #065f46; font-size: 14px; font-weight: 600;">${serviceLabel}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #d1fae5;">
                  <span style="color: #065f46; font-size: 14px;">Date</span>
                </td>
                <td style="padding: 8px 0; border-bottom: 1px solid #d1fae5; text-align: right;">
                  <span style="color: #065f46; font-size: 14px; font-weight: 600;">${formattedNewDate}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #d1fae5;">
                  <span style="color: #065f46; font-size: 14px;">Time</span>
                </td>
                <td style="padding: 8px 0; border-bottom: 1px solid #d1fae5; text-align: right;">
                  <span style="color: #065f46; font-size: 14px; font-weight: 600;">${newTimeRange}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0;">
                  <span style="color: #065f46; font-size: 14px;">Location</span>
                </td>
                <td style="padding: 8px 0; text-align: right;">
                  <span style="color: #065f46; font-size: 14px; font-weight: 600;">${address}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 24px;">
        <tr>
          <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0; padding: 16px;">
            <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
              <strong>Please note:</strong> If this change doesn't work for you, contact us immediately and we'll find a time that fits your schedule.
            </p>
          </td>
        </tr>
      </table>
    `

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `Your ${serviceLabel} Has Been Rescheduled`,
      html: generateEmailTemplate({
        eyebrow: 'APPOINTMENT RESCHEDULED',
        title: 'New Date & Time',
        subtitle: `Hi ${customerName}, your cleaning appointment has been rescheduled to a new date and time.`,
        contentHtml,
        buttonText: 'VIEW IN PORTAL',
        buttonUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/portal/appointments`,
      }),
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