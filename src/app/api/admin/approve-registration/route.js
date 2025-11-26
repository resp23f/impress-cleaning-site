import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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
    const { customerId } = await request.json()
    // Get customer details
    const { data: customer } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .eq('id', customerId)
      .single()
    // Approve the account using admin client
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ account_status: 'active' })
      .eq('id', customerId)
      .select()
    if (error) throw error
// Send approval email to customer
await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/account-approved`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: customer?.email,
    name: customer?.full_name || customer?.email.split('@')[0],
  })
})
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error approving account:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}