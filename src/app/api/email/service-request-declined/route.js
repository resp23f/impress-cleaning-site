import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { sanitizeText, sanitizeEmail } from '@/lib/sanitize'
import {
  generateEmailTemplate,
  generateInfoBox,
  serviceLabelMap,
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
    const reason = sanitizeText(body.reason)?.slice(0, 500) || ''
    const preferredDate = body.preferredDate
    const address = sanitizeText(body.address)?.slice(0, 300) || 'N/A'

    if (!customerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const serviceLabel = serviceLabelMap[serviceType] || serviceType || 'Cleaning Service'
    const formattedDate = formatDate(preferredDate)

    const contentHtml = `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
        <tr>
          <td style="background-color: #f9fafb; border-radius: 10px; padding: 20px;">
            <p style="margin: 0 0 12px; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #6b7280; font-weight: 600;">Request Details</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                  <span style="color: #6b7280; font-size: 14px;">Service</span>
                </td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                  <span style="color: #111827; font-size: 14px; font-weight: 600;">${serviceLabel}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                  <span style="color: #6b7280; font-size: 14px;">Requested Date</span>
                </td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                  <span style="color: #111827; font-size: 14px; font-weight: 600;">${formattedDate}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0;">
                  <span style="color: #6b7280; font-size: 14px;">Location</span>
                </td>
                <td style="padding: 8px 0; text-align: right;">
                  <span style="color: #111827; font-size: 14px; font-weight: 600;">${address}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      ${reason ? `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 24px;">
          <tr>
            <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0; padding: 16px;">
              <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                <strong>Reason:</strong> ${reason}
              </p>
            </td>
          </tr>
        </table>
      ` : ''}

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 24px;">
        <tr>
          <td style="background-color: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 0 8px 8px 0; padding: 16px;">
            <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.5;">
              <strong>We're here to help!</strong> Please contact us to discuss alternative dates or services that might work better. We'd love to find a solution for you.
            </p>
          </td>
        </tr>
      </table>
    `

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `Update on Your Service Request`,
      html: generateEmailTemplate({
        eyebrow: 'SERVICE REQUEST UPDATE',
        title: 'Unable to Accommodate Request',
        subtitle: `Hi ${customerName}, thank you for your interest in our cleaning services. Unfortunately, we're unable to accommodate your service request at this time.`,
        contentHtml,
        buttonText: 'REQUEST ANOTHER DATE',
        buttonUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/portal/request-service`,
      }),
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending service request declined email:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}