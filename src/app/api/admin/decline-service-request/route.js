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

    const { requestId, reason } = await request.json()

    // Update service request status
    const { error } = await supabaseAdmin
      .from('service_requests')
      .update({ 
        status: 'declined',
        admin_notes: reason,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', requestId)

    if (error) throw error

    // TODO: Send decline email to customer with reason

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error declining service request:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}