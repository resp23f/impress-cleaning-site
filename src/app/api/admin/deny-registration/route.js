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

    const { customerId, reason } = await request.json()

    // Deny the account using admin client
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ account_status: 'suspended' })
      .eq('id', customerId)

    if (error) throw error

    // TODO: Send denial email with reason

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error denying account:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}