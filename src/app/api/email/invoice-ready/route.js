import { NextResponse } from 'next/server'
import { sendTemplateEmail } from '@/lib/email/sendEmail'
import { format, parseISO } from 'date-fns'

export async function POST(request) {
  try {
    const { email, name, invoiceNumber, amount, dueDate, invoiceId } = await request.json()

    if (!email || !name || !invoiceNumber || !amount || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const payUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/portal/invoices/${invoiceId}/pay`
    const formattedDueDate = format(parseISO(dueDate), 'MMMM d, yyyy')

    const result = await sendTemplateEmail(email, 'invoiceReady', {
      name,
      invoiceNumber,
      amount,
      dueDate: formattedDueDate,
      payUrl,
    })

    if (!result.success) {
      throw new Error(result.error)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending invoice email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
