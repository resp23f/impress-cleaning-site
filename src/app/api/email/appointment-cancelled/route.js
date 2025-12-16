import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { sanitizeText, sanitizeEmail } from '@/lib/sanitize'
import {
  generateEmailTemplate,
  generateAppointmentDetailsHtml,
  generateInfoBox,
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
    const scheduledDate = body.scheduledDate
    const scheduledTimeStart = body.scheduledTimeStart
    const scheduledTimeEnd = body.scheduledTimeEnd
    const address = sanitizeText(body.address)?.slice(0, 300) || 'N/A'
    const cancelledBy = body.cancelledBy // 'customer' or 'admin'

    if (!customerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const serviceLabel = serviceLabelMap[serviceType] || serviceType || 'Cleaning Service'
    const formattedDate = formatDate(scheduledDate)
    const timeRange = scheduledTimeStart && scheduledTimeEnd
      ? `${formatTime(scheduledTimeStart)} - ${formatTime(scheduledTimeEnd)}`
      : 'N/A'

    const infoBoxContent = cancelledBy === 'customer'
      ? '<strong>We\'re sorry to see you go!</strong> We hope to serve you again in the future. Feel free to book a new appointment anytime.'
      : '<strong>We apologize for any inconvenience.</strong> If you have questions about this cancellation, please contact us and we\'ll be happy to help.'

    const contentHtml = generateAppointmentDetailsHtml({
      serviceLabel,
      formattedDate,
      timeRange,
      address,
    }) + generateInfoBox({
      bgColor: cancelledBy === 'customer' ? '#dbeafe' : '#fef3c7',
      borderColor: cancelledBy === 'customer' ? '#3b82f6' : '#f59e0b',
      textColor: cancelledBy === 'customer' ? '#1e3a8a' : '#92400e',
      content: infoBoxContent,
    })

    const subtitleText = cancelledBy === 'customer'
      ? 'Your cancellation request has been processed. Your appointment has been cancelled.'
      : 'We\'re writing to inform you that your upcoming appointment has been cancelled.'

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `Appointment Cancelled - ${serviceLabel}`,
      html: generateEmailTemplate({
        eyebrow: 'APPOINTMENT CANCELLED',
        title: 'Appointment Cancelled',
        subtitle: `Hi ${customerName}, ${subtitleText}`,
        contentHtml,
        buttonText: 'BOOK A NEW SERVICE',
        buttonUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/portal/request-service`,
      }),
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