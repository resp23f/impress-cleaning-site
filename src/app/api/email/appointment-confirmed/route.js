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

    if (!customerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const serviceLabel = serviceLabelMap[serviceType] || serviceType || 'Cleaning Service'
    const formattedDate = formatDate(scheduledDate)
    const timeRange = scheduledTimeStart && scheduledTimeEnd
      ? `${formatTime(scheduledTimeStart)} - ${formatTime(scheduledTimeEnd)}`
      : 'TBD'

    const contentHtml = generateAppointmentDetailsHtml({
      serviceLabel,
      formattedDate,
      timeRange,
      address,
    }) + generateInfoBox({
      bgColor: '#ecfdf5',
      borderColor: '#079447',
      textColor: '#065f46',
      content: '<strong>What to expect:</strong> Our professional cleaning team will arrive on time with all necessary supplies. We\'ll text you when we\'re on our way!',
    })

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `Your ${serviceLabel} is Confirmed!`,
      html: generateEmailTemplate({
        eyebrow: 'APPOINTMENT CONFIRMED',
        title: 'You\'re All Set!',
        subtitle: `Great news, ${customerName}! Your cleaning appointment has been scheduled and confirmed.`,
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
    console.error('Error sending appointment confirmation email:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}