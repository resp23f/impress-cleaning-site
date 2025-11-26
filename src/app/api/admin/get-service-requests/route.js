import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
export async function GET() {
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
    // Get pending service requests using admin client
    const { data, error } = await supabaseAdmin
      .from('service_requests')
      .select(`
        *,
        profiles!customer_id(id, email, full_name, phone),
        service_addresses!address_id(*)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error loading service requests:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}