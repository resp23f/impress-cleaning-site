import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { invoiceId, creditAmount } = await request.json()

    if (!invoiceId) {
      return NextResponse.json({ error: 'invoiceId is required' }, { status: 400 })
    }

    if (!creditAmount || creditAmount <= 0) {
      return NextResponse.json({ error: 'Valid creditAmount is required' }, { status: 400 })
    }

    // 1. Verify admin authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // 2. Get invoice details
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .select('*, profiles:customer_id(id, email, full_name)')
      .eq('id', invoiceId)
      .single()

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Check if invoice is in a state that can accept credit
    if (invoice.status === 'paid') {
      return NextResponse.json({ error: 'Invoice is already paid' }, { status: 400 })
    }

    if (invoice.status === 'cancelled') {
      return NextResponse.json({ error: 'Cannot apply credit to a cancelled invoice' }, { status: 400 })
    }

    if (!invoice.customer_id) {
      return NextResponse.json({ error: 'Invoice must have a customer to apply credit' }, { status: 400 })
    }

    const invoiceTotal = parseFloat(invoice.total || invoice.amount)
    const amountToApply = Math.min(creditAmount, invoiceTotal)
    const remainingBalance = invoiceTotal - amountToApply
    const isFullyPaid = remainingBalance <= 0

    // 3. Record the credit application
    const { data: creditRecord, error: creditError } = await supabaseAdmin
      .from('customer_credits')
      .insert({
        customer_id: invoice.customer_id,
        amount: -amountToApply, // Negative because it's being used
        description: `Applied to Invoice ${invoice.invoice_number}`,
        invoice_id: invoiceId,
        created_by: user.id
      })
      .select()
      .single()

    if (creditError) {
      console.error('Error recording credit:', creditError)
      return NextResponse.json({ error: 'Failed to record credit application' }, { status: 500 })
    }

    // 4. Update invoice
    const updateData = {
      updated_at: new Date().toISOString()
    }

    if (isFullyPaid) {
      updateData.status = 'paid'
      updateData.paid_date = new Date().toISOString().split('T')[0]
      updateData.payment_method = 'credit'
      updateData.notes = (invoice.notes || '') + `\nCredit of $${amountToApply.toFixed(2)} applied on ${new Date().toLocaleDateString()}`
    } else {
      // Update the amount to reflect remaining balance
      updateData.amount = remainingBalance
      updateData.total = remainingBalance
      updateData.notes = (invoice.notes || '') + `\nCredit of $${amountToApply.toFixed(2)} applied on ${new Date().toLocaleDateString()}. Remaining: $${remainingBalance.toFixed(2)}`
    }

    const { error: updateError } = await supabaseAdmin
      .from('invoices')
      .update(updateData)
      .eq('id', invoiceId)

    if (updateError) {
      console.error('Error updating invoice:', updateError)
      return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
    }

    // 5. Get customer info
    const customerName = invoice.profiles?.full_name || 'Customer'
    const customerId = invoice.customer_id

    const formattedCredit = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amountToApply)

    // 6. Create customer notification
    await supabaseAdmin
      .from('customer_notifications')
      .insert({
        user_id: customerId,
        type: 'credit_applied',
        title: 'Credit Applied',
        message: `A credit of ${formattedCredit} has been applied to Invoice ${invoice.invoice_number}${isFullyPaid ? ' - Invoice is now paid!' : ''}`,
        link: '/portal/invoices',
        reference_id: invoiceId,
        reference_type: 'invoice'
      })

    // 7. If fully paid, create admin notification
    if (isFullyPaid) {
      await supabaseAdmin
        .from('admin_notifications')
        .insert({
          type: 'payment_received',
          title: 'Invoice Paid via Credit',
          message: `${customerName}'s Invoice ${invoice.invoice_number} paid in full via account credit`,
          link: '/admin/invoices'
        })
    }

    return NextResponse.json({
      success: true,
      creditApplied: amountToApply,
      remainingBalance: Math.max(0, remainingBalance),
      isFullyPaid,
      creditRecordId: creditRecord.id
    })
  } catch (error) {
    console.error('Error applying credit:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
