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
  const { appointmentId } = await request.json()
  // Get appointment details BEFORE deleting (for email)
  const { data: appointment } = await supabaseAdmin
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
   .eq('id', appointment?.customer_id)
   .single()
   
   // Delete appointment using admin client
   const { error } = await supabaseAdmin
   .from('appointments')
   .delete()
   .eq('id', appointmentId)
   
   if (error) throw error
   
   // Send cancellation email to customer
   if (customer && appointment) {
    try {
     const addressLine = appointment.service_addresses
     ? `${appointment.service_addresses.street_address}${appointment.service_addresses.unit ? ', ' + appointment.service_addresses.unit : ''}, ${appointment.service_addresses.city}, ${appointment.service_addresses.state} ${appointment.service_addresses.zip_code}`
     : 'N/A'
     
     await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/email/appointment-cancelled`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
       customerEmail: customer.email,
       customerName: customer.full_name || customer.email.split('@')[0],
       serviceType: appointment.service_type,
       scheduledDate: appointment.scheduled_date,
       scheduledTimeStart: appointment.scheduled_time_start,
       scheduledTimeEnd: appointment.scheduled_time_end,
       address: addressLine,
       cancelledBy: 'admin',
      }),
     })
    } catch (emailError) {
     console.error('Failed to send cancellation email', emailError)
    }
   }
   
   return NextResponse.json({ success: true })
  } catch (error) {
   console.error('Error deleting appointment:', error)
   return NextResponse.json({ error: error.message }, { status: 500 })
  }
 }