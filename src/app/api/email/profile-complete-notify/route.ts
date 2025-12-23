import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { sanitizeText } from '@/lib/sanitize'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    // Verify user is authenticated
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { customerName } = await request.json()

    if (!customerName) {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 })
    }

    const sanitizedName = sanitizeText(customerName)?.slice(0, 100) || 'Unknown Customer'

    // Send simple notification email to admin
    const { error: emailError } = await resend.emails.send({
      from: 'Impress Cleaning Services <notifications@impressyoucleaning.com>',
      to: 'admin@impressyoucleaning.com',
      subject: `${sanitizedName} Has Completed Portal Setup`,
      text: `Alex, customer ${sanitizedName} has completed their full portal sign up and is ready for you to send invoices, reminders, etc.`,
    })

    if (emailError) {
      console.error('Failed to send admin notification:', emailError)
      return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Profile complete notify error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
