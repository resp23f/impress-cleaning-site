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
  // Get service request details for email
  const { data: serviceRequest } = await supabaseAdmin
  .from('service_requests')
  .select(`
        *,
        service_addresses (*)
      `)
   .eq('id', requestId)
   .single()
   
   // Get customer profile
   const { data: customer } = await supabaseAdmin
   .from('profiles')
   .select('email, full_name')
   .eq('id', serviceRequest?.customer_id)
   .single()
   
   // Send decline email to customer
   if (customer && serviceRequest) {
    try {
     const addressLine = serviceRequest.service_addresses
     ? `${serviceRequest.service_addresses.street_address}${serviceRequest.service_addresses.unit ? ', ' + serviceRequest.service_addresses.unit : ''}, ${serviceRequest.service_addresses.city}, ${serviceRequest.service_addresses.state} ${serviceRequest.service_addresses.zip_code}`
     : 'N/A'
     
     await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/email/service-request-declined`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
       customerEmail: customer.email,
       customerName: customer.full_name || customer.email.split('@')[0],
       serviceType: serviceRequest.service_type,
       reason: reason || 'Unfortunately, we are unable to accommodate this request at this time.',
       preferredDate: serviceRequest.preferred_date,
       address: addressLine,
      }),
     })
    } catch (emailError) {
     console.error('Failed to send decline email', emailError)
    }
   }
   
   return NextResponse.json({ success: true })
  } catch (error) {
   console.error('Error declining service request:', error)
   return NextResponse.json({ error: error.message }, { status: 500 })
  }
 }