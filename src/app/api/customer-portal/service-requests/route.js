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
      serviceType,
      preferred_date,
      preferredDate,
      preferred_time,
      preferredTime,
      is_flexible,
      isFlexible,
      address_id,
      addressId,
      special_requests,
      specialRequests,
      is_recurring,
      isRecurring,
      recurring_frequency,
      recurringFrequency,
    } = body || {}

    const finalServiceType = service_type ?? serviceType
    const finalPreferredDate = preferred_date ?? preferredDate
    const finalPreferredTime = preferred_time ?? preferredTime
    const finalAddressId = address_id ?? addressId
    const finalIsFlexible = is_flexible ?? isFlexible
    const finalSpecialRequests = special_requests ?? specialRequests
    const finalIsRecurring = is_recurring ?? isRecurring
    const finalRecurringFrequency = recurring_frequency ?? recurringFrequency
    // Basic validation
    if (!finalServiceType || !finalPreferredDate || !finalPreferredTime || !finalAddressId) {
      return NextResponse.json(
        { error: 'service_type, preferred_date, preferred_time, and address_id are required' },
        { status: 422 }
      )
    }
    const { data: serviceRequest, error } = await supabase
      .from('service_requests')
      .insert({
        customer_id: user.id,
        service_type: finalServiceType,
        preferred_date: finalPreferredDate,
        preferred_time: finalPreferredTime,
        is_flexible: !!finalIsFlexible,
        address_id: finalAddressId,
        special_requests: finalSpecialRequests || null,
        is_recurring: !!finalIsRecurring,
        recurring_frequency: finalIsRecurring ? finalRecurringFrequency || null : null,
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
