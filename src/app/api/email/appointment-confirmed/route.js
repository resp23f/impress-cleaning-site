import { NextResponse } from 'next/server'
import { sendTemplateEmail } from '@/lib/email/sendEmail'
import { format, parseISO } from 'date-fns'

export async function POST(request) {
  try {
    const { email, name, serviceType, date, time, address } = await request.json()

    if (!email || !name || !serviceType || !date || !time || !address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Format date for better readability
    const formattedDate = format(parseISO(date), 'EEEE, MMMM d, yyyy')
    const formattedTime = format(parseISO(`2000-01-01T${time}`), 'h:mm a')

    const result = await sendTemplateEmail(email, 'appointmentConfirmed', {
      name,
      serviceType,
      date: formattedDate,
      time: formattedTime,
      address,
    })

    if (!result.success) {
      throw new Error(result.error)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending appointment confirmation email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
