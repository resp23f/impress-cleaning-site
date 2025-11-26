import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
export async function POST(request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    console.log('Incoming service request body:', body)
    const {
      service_type,
      preferred_date,
      preferred_time,
      is_flexible,
      address_id,
      special_requests,
      is_recurring,
      recurring_frequency,
    } = body || {}
    // Basic validation
    if (!service_type || !preferred_date || !preferred_time || !address_id) {
      return NextResponse.json(
        { error: 'service_type, preferred_date, preferred_time, and address_id are required' },
        { status: 422 }
      )
    }
    const { data: serviceRequest, error } = await supabase
      .from('service_requests')
      .insert({
        customer_id: user.id,
        service_type,
        preferred_date,
        preferred_time,
        is_flexible: !!is_flexible,
        address_id,
        special_requests: special_requests || null,
        is_recurring: !!is_recurring,
        recurring_frequency: is_recurring ? recurring_frequency || null : null,
        status: 'pending',
      })
      .select()
      .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    // Fire-and-forget admin notification
    try {
      await supabaseAdmin.from('admin_notifications').insert({
        type: 'new_service_request',
        title: 'New service request submitted',
        message: `Customer ${user.email || user.id} requested ${service_type}`,
        link: `/admin/requests`,
        service_request_id: serviceRequest.id,
        status: 'unread',
      })
    } catch (notifyError) {
      console.error('Failed to create admin notification', notifyError)
    }
    return NextResponse.json({ data: serviceRequest }, { status: 201 })
  } catch (err) {
    console.error('Service request error', err)
    return NextResponse.json({ error: err.message || 'Failed to submit request' }, { status: 500 })
  }
}
