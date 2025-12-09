import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
// Validated internal API base URL

export async function POST(request) {
  try {
    const { invoiceId, paymentMethod } = await request.json()

    if (!invoiceId) {
      return NextResponse.json({ error: 'invoiceId is required' }, { status: 400 })
    }

    if (!paymentMethod || !['zelle', 'cash', 'check'].includes(paymentMethod)) {
      return NextResponse.json({ error: 'Valid paymentMethod required (zelle, cash, check)' }, { status: 400 })
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

    // Check if invoice can be marked paid
    if (invoice.status === 'paid') {
      return NextResponse.json({ error: 'Invoice is already paid' }, { status: 400 })
    }

    if (invoice.status === 'cancelled') {
      return NextResponse.json({ error: 'Cannot mark a cancelled invoice as paid' }, { status: 400 })
    }

    // 3. Update invoice to paid
    const { error: updateError } = await supabaseAdmin
      .from('invoices')
      .update({
        status: 'paid',
        paid_date: new Date().toISOString().split('T')[0],
        payment_method: paymentMethod,
        updated_at: new Date().toISOString()
      })
      .eq('id', invoiceId)

    if (updateError) {
      console.error('Error updating invoice:', updateError)
      return NextResponse.json({ error: 'Failed to mark invoice as paid' }, { status: 500 })
    }

    // 4. Get customer info
    const customerEmail = invoice.profiles?.email || invoice.customer_email
    const customerName = invoice.profiles?.full_name || 'Customer'
    const customerId = invoice.customer_id

    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(invoice.total || invoice.amount)

    // 5. Create customer notification
    if (customerId) {
      const paymentMethodDisplay = {
        zelle: 'Zelle',
        cash: 'Cash',
        check: 'Check'
      }[paymentMethod]

      await supabaseAdmin
        .from('customer_notifications')
        .insert({
          user_id: customerId,
          type: paymentMethod === 'zelle' ? 'zelle_verified' : 'payment_received',
          title: paymentMethod === 'zelle' ? 'Zelle Payment Confirmed' : 'Payment Received',
          message: paymentMethod === 'zelle'
            ? `Your Zelle payment for Invoice ${invoice.invoice_number} has been verified`
            : `Your ${paymentMethodDisplay} payment of ${formattedAmount} for Invoice ${invoice.invoice_number} has been received`,
          link: '/portal/invoices',
          reference_id: invoiceId,
          reference_type: 'invoice'
        })
    }

    // 6. Create admin notification
    await supabaseAdmin
      .from('admin_notifications')
      .insert({
        type: 'payment_received',
        title: 'Payment Received',
        message: `${customerName} paid Invoice ${invoice.invoice_number} via ${paymentMethod}`,
        link: '/admin/invoices'
      })


    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking invoice as paid:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
