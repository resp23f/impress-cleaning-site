import { NextResponse } from 'next/server'
import { sendTemplateEmail } from '@/lib/email/sendEmail'

export async function POST(request) {
  try {
    const { email, name, serviceType } = await request.json()

    if (!email || !name || !serviceType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const requestUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/portal/dashboard`

    const result = await sendTemplateEmail(email, 'serviceRequestReceived', {
      name,
      serviceType,
      requestUrl,
    })

    if (!result.success) {
      throw new Error(result.error)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending service request email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
