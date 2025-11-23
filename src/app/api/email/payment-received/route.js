import { NextResponse } from 'next/server'
import { sendTemplateEmail } from '@/lib/email/sendEmail'
import { format } from 'date-fns'

export async function POST(request) {
  try {
    const { email, name, invoiceNumber, amount } = await request.json()

    if (!email || !name || !invoiceNumber || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const paymentDate = format(new Date(), 'MMMM d, yyyy')

    const result = await sendTemplateEmail(email, 'paymentReceived', {
      name,
      invoiceNumber,
      amount,
      paymentDate,
    })

    if (!result.success) {
      throw new Error(result.error)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending payment confirmation email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
