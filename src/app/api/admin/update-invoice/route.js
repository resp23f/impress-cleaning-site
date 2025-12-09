import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
// Validated internal API base URL
const INTERNAL_API_URL = (() => {
  const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://impressyoucleaning.com'
  const allowed = ['https://impressyoucleaning.com', 'https://www.impressyoucleaning.com', 'http://localhost:3000']
  return allowed.some(domain => url.startsWith(domain)) ? url : 'https://impressyoucleaning.com'
})()

export async function POST(request) {
 try {
  // Verify user is admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Check if user is admin
  const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()
  if (profile?.role !== 'admin') {
   return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { invoiceId, updates } = await request.json()
  // Update invoice using admin client
  const { data, error } = await supabaseAdmin
  .from('invoices')
  .update(updates)
  .eq('id', invoiceId)
  .select()
  
  if (error) throw error
  
  // Send payment received email if invoice was marked as paid
  if (updates.status === 'paid') {
   const { data: invoice } = await supabaseAdmin
   .from('invoices')
   .select(`
          *,
          profiles (email, full_name)
        `)
    .eq('id', invoiceId)
    .single()

    if (invoice && invoice.profiles) {
     try {
      const emailResponse = await fetch(`${INTERNAL_API_URL}/api/email/payment-received`, {
        method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
        customerEmail: invoice.profiles.email,
        customerName: invoice.profiles.full_name || invoice.profiles.email.split('@')[0],
        invoiceNumber: invoice.invoice_number,
        amount: invoice.amount,
        paymentDate: invoice.paid_date || new Date().toISOString(),
        paymentMethod: invoice.payment_method || 'Manual Payment',
       }),
      })

      if (!emailResponse.ok) {
        const emailError = await emailResponse.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Failed to send payment received email:', emailError)
        // Non-fatal
      } else {
        console.log(`Payment confirmation email sent successfully to ${invoice.profiles.email}`)
      }
     } catch (emailError) {
      console.error('Failed to send payment received email', emailError)
      // Non-fatal
     }
    }
   }
   
   return NextResponse.json({ success: true, data })
  } catch (error) {
   console.error('Error updating invoice:', error)
   return NextResponse.json({ error: error.message }, { status: 500 })
  }
 }