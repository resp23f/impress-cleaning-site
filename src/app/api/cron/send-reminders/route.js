import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    // 1. Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Get invoices due today using the database function
    const { data: invoices, error: queryError } = await supabaseAdmin
      .rpc('get_invoices_due_today')

    if (queryError) {
      console.error('Error fetching invoices due today:', queryError)
      // Fallback to direct query if function doesn't exist
      const { data: fallbackInvoices, error: fallbackError } = await supabaseAdmin
        .from('invoices')
        .select('id, invoice_number, customer_id, customer_email, amount, total, due_date, stripe_invoice_id, profiles:customer_id(id, email, full_name)')
        .eq('status', 'sent')
        .eq('due_date', new Date().toISOString().split('T')[0])

      if (fallbackError) {
        console.error('Fallback query error:', fallbackError)
        return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
      }

      // Process fallback results
return await processReminders(fallbackInvoices || [], request)
    }

return await processReminders(invoices || [], request)
  } catch (error) {
    console.error('Error in send-reminders cron:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function processReminders(invoices, request) {
  const baseUrl = new URL(request.url).origin
  let sentCount = 0
    const errors = []

  for (const invoice of invoices) {
    try {
      // Get customer info
      const customerEmail = invoice.customer_email || invoice.profiles?.email
      const customerName = invoice.customer_name || invoice.profiles?.full_name || 'Valued Customer'
      const customerId = invoice.customer_id || invoice.profiles?.id

      if (!customerEmail) {
        console.log(`Skipping invoice ${invoice.invoice_number}: no customer email`)
        continue
      }

      const amount = invoice.total || invoice.amount

      // Send reminder email
      try {
await fetch(`${baseUrl}/api/email/invoice-reminder`, {          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invoiceId: invoice.id || invoice.invoice_id,
            customerEmail,
            customerName,
            invoiceNumber: invoice.invoice_number,
            amount,
            dueDate: invoice.due_date
          })
        })
      } catch (emailError) {
        console.error(`Error sending reminder email for ${invoice.invoice_number}:`, emailError)
        errors.push({ invoice: invoice.invoice_number, error: 'email failed' })
      }

      // Create customer notification
      if (customerId) {
        const formattedAmount = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(amount)

        await supabaseAdmin
          .from('customer_notifications')
          .insert({
            user_id: customerId,
            type: 'payment_reminder',
            title: 'Payment Reminder',
            message: `Invoice ${invoice.invoice_number} for ${formattedAmount} is due today`,
            link: `/portal/invoices/${invoice.id || invoice.invoice_id}/pay`,
            reference_id: invoice.id || invoice.invoice_id,
            reference_type: 'invoice'
          })
      }

      sentCount++
    } catch (invoiceError) {
      console.error(`Error processing invoice ${invoice.invoice_number}:`, invoiceError)
      errors.push({ invoice: invoice.invoice_number, error: invoiceError.message })
    }
  }

  return NextResponse.json({
    success: true,
    remindersSent: sentCount,
    totalInvoices: invoices.length,
    errors: errors.length > 0 ? errors : undefined
  })
}

// Also support POST for flexibility
export async function POST(request) {
  return GET(request)
}
