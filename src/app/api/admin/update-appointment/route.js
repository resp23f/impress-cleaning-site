import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sanitizeText } from '@/lib/sanitize'
// Validated internal API base URL
const INTERNAL_API_URL = (() => {
  const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://impressyoucleaning.com'
  const allowed = ['https://impressyoucleaning.com', 'https://www.impressyoucleaning.com', 'http://localhost:3000']
  return allowed.some(domain => url.startsWith(domain)) ? url : 'https://impressyoucleaning.com'
})()

// Whitelist of columns admins can update
const ALLOWED_UPDATE_FIELDS = [
  'scheduled_date',
  'scheduled_time_start',
  'scheduled_time_end',
  'status',
  'service_type',
  'estimated_duration',
  'special_instructions',
  'cancellation_reason',
  'service_address_id',
  'assigned_team',
  'notes',
]

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

    const body = await request.json()
    const { appointmentId, updates } = body

    // Validate appointmentId is a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!appointmentId || !uuidRegex.test(appointmentId)) {
      return NextResponse.json({ error: 'Invalid appointment ID' }, { status: 400 })
    }

    // Filter updates to only allowed fields
    const sanitizedUpdates = {}
    for (const [key, value] of Object.entries(updates || {})) {
      if (ALLOWED_UPDATE_FIELDS.includes(key)) {
        // Sanitize text fields
        if (key === 'special_instructions') {
          sanitizedUpdates[key] = sanitizeText(value)?.slice(0, 2000) || null
        } else if (key === 'cancellation_reason' || key === 'notes') {
          sanitizedUpdates[key] = sanitizeText(value)?.slice(0, 500) || null
        } else {
          sanitizedUpdates[key] = value
        }
      }
    }

    // Must have at least one valid field to update
    if (Object.keys(sanitizedUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // Get OLD appointment data before update (for email comparison)
    const { data: oldAppointment } = await supabaseAdmin
      .from('appointments')
      .select(`
        *,
        service_addresses (*)
      `)
      .eq('id', appointmentId)
      .single()

    if (!oldAppointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Update appointment using admin client
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .update(sanitizedUpdates)
      .eq('id', appointmentId)
      .select()

    if (error) throw error

    // Get NEW appointment data after update
    const { data: newAppointment } = await supabaseAdmin
      .from('appointments')
      .select(`
        *,
        service_addresses (*)
      `)
      .eq('id', appointmentId)
      .single()

    // Get customer profile
    const { data: customer } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .eq('id', newAppointment?.customer_id)
      .single()

    // Send reschedule email if date/time changed
    const dateChanged = oldAppointment?.scheduled_date !== newAppointment?.scheduled_date
    const timeChanged = oldAppointment?.scheduled_time_start !== newAppointment?.scheduled_time_start ||
      oldAppointment?.scheduled_time_end !== newAppointment?.scheduled_time_end

    if (customer && newAppointment && (dateChanged || timeChanged)) {
      try {
        const addressLine = newAppointment.service_addresses
          ? `${newAppointment.service_addresses.street_address}${newAppointment.service_addresses.unit ? ', ' + newAppointment.service_addresses.unit : ''}, ${newAppointment.service_addresses.city}, ${newAppointment.service_addresses.state} ${newAppointment.service_addresses.zip_code}`
          : 'N/A'

await fetch(`${INTERNAL_API_URL}/api/email/appointment-rescheduled`, {
           method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerEmail: customer.email,
            customerName: customer.full_name || customer.email.split('@')[0],
            serviceType: newAppointment.service_type,
            oldDate: oldAppointment.scheduled_date,
            oldTimeStart: oldAppointment.scheduled_time_start,
            oldTimeEnd: oldAppointment.scheduled_time_end,
            newDate: newAppointment.scheduled_date,
            newTimeStart: newAppointment.scheduled_time_start,
            newTimeEnd: newAppointment.scheduled_time_end,
            address: addressLine,
          }),
        })
      } catch (emailError) {
        console.error('Failed to send reschedule email', emailError)
      }
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}