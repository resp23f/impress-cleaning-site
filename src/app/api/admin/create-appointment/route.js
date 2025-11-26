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
    const appointmentData = await request.json()
    // Create appointment using admin client
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .insert([appointmentData])
      .select()
    if (error) throw error
    // TODO: Send appointment confirmation email to customer
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}