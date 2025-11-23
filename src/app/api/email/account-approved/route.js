import { NextResponse } from 'next/server'
import { sendTemplateEmail } from '@/lib/email/sendEmail'

export async function POST(request) {
  try {
    const { email, name } = await request.json()

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name' },
        { status: 400 }
      )
    }

    const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/login`

    const result = await sendTemplateEmail(email, 'accountApproved', {
      name,
      loginUrl,
    })

    if (!result.success) {
      throw new Error(result.error)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending account approval email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
