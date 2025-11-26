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
    const { requestId, appointmentData } = await request.json()
    const timeBucketToRange = (bucket) => {
      const startMap = {
        morning: '09:00',
        afternoon: '13:00',
        evening: '16:00',
      }
      const start = startMap[bucket] || '09:00'
      const startHour = parseInt(start.split(':')[0], 10)
      const end = Number.isNaN(startHour) ? '11:00' : `${String(startHour + 2).padStart(2, '0')}:00`
      return { start, end }
    }
    // Update service request status
    const { error: updateError } = await supabaseAdmin
      .from('service_requests')
      .update({ 
        status: 'approved',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', requestId)
    if (updateError) throw updateError
    // Create appointment if data provided
    if (appointmentData) {
      const timeRange = appointmentData.preferred_time ? timeBucketToRange(appointmentData.preferred_time) : null
      const payload = {
        ...appointmentData,
        scheduled_time_start: appointmentData.scheduled_time_start || timeRange?.start,
        scheduled_time_end: appointmentData.scheduled_time_end || timeRange?.end,
      }
      console.log('Admin approving service request, creating appointment with:', payload)
      const { error: appointmentError } = await supabaseAdmin
        .from('appointments')
        .insert([payload])
      if (appointmentError) throw appointmentError
    }
    // TODO: Send approval email to customer
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error approving service request:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
