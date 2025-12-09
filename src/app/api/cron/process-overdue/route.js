import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request) {
  try {
    // 1. Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get base URL from request
    const baseUrl = new URL(request.url).origin

    // 2. Get invoices that are 7+ days overdue
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const overdueDate = sevenDaysAgo.toISOString().split('T')[0]

    const { data: invoices, error: queryError } = await supabaseAdmin
      .from('invoices')
      .select('id, invoice_number, customer_id, customer_email, amount, total, due_date, profiles:customer_id(id, email, full_name)')
      .eq('status', 'sent')
      .lte('due_date', overdueDate)

    if (queryError) {
      console.error('Error fetching overdue invoices:', queryError)
      return NextResponse.json({ error: 'Failed to fetch overdue invoices' }, { status: 500 })
    }

    let processedCount = 0
    const errors = []

    for (const invoice of invoices || []) {
      try {
        // Get customer info
        const customerEmail = invoice.customer_email || invoice.profiles?.email
        const customerName = invoice.customer_name || invoice.profiles?.full_name || 'Valued Customer'
        const customerId = invoice.customer_id || invoice.profiles?.id

        const amount = invoice.total || invoice.amount
        const dueDate = new Date(invoice.due_date)
        const today = new Date()
        const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24))

        // 3. Update invoice status to overdue
        const { error: updateError } = await supabaseAdmin
          .from('invoices')
          .update({
            status: 'overdue',
            updated_at: new Date().toISOString()
          })
          .eq('id', invoice.id)

        if (updateError) {
          console.error(`Error updating invoice ${invoice.invoice_number}:`, updateError)
          errors.push({ invoice: invoice.invoice_number, error: 'status update failed' })
          continue
        }

        const formattedAmount = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(amount)

        // 5. Create customer notification
        if (customerId) {
          await supabaseAdmin
            .from('customer_notifications')
            .insert({
              user_id: customerId,
              type: 'invoice_overdue',
              title: 'Invoice Overdue',
              message: `Invoice ${invoice.invoice_number} for ${formattedAmount} is now overdue`,
              link: `/portal/invoices/${invoice.id}/pay`,
              reference_id: invoice.id,
              reference_type: 'invoice'
            })
        }

        // 6. Create admin notification
        await supabaseAdmin
          .from('admin_notifications')
          .insert({
            type: 'invoice_overdue',
            title: 'Invoice Overdue',
            message: `Invoice ${invoice.invoice_number} for ${customerName} is now overdue (${daysOverdue} days)`,
            link: '/admin/invoices'
          })

        processedCount++
      } catch (invoiceError) {
        console.error(`Error processing invoice ${invoice.invoice_number}:`, invoiceError)
        errors.push({ invoice: invoice.invoice_number, error: invoiceError.message })
      }
    }

    return NextResponse.json({
      success: true,
      processedCount,
      totalFound: invoices?.length || 0,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Error in process-overdue cron:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Also support POST for flexibility
export async function POST(request) {
  return GET(request)
}
