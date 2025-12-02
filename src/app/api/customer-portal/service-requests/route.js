import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import { sanitizeText } from '@/lib/sanitize'
const resend = new Resend(process.env.RESEND_API_KEY)

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
  
  if (!service_type || !preferred_date || !address_id) {
   return NextResponse.json(
    { error: 'service_type, preferred_date, and address_id are required' },
    { status: 422 }
   )
  }
  
  // Get customer profile for email
  const { data: profile } = await supabaseAdmin
  .from('profiles')
  .select('full_name, email, phone')
  .eq('id', user.id)
  .single()
  
  // Get address details
  const { data: address } = await supabaseAdmin
  .from('service_addresses')
  .select('*')
  .eq('id', address_id)
  .single()
  
  const { data: serviceRequest, error } = await supabase
  .from('service_requests')
  .insert({
   customer_id: user.id,
   service_type,
   preferred_date,
   preferred_time,
   is_flexible: !!is_flexible,
   address_id,
special_requests: special_requests ? sanitizeText(special_requests).slice(0, 2000) : null,
   is_recurring: !!is_recurring,
   recurring_frequency: is_recurring ? recurring_frequency || null : null,
   status: 'pending',
  })
  .select()
  .single()
  
  if (error) {
   return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  // Create admin notification in database
  try {
   await supabaseAdmin.from('admin_notifications').insert({
    type: 'new_service_request',
    title: 'New service request submitted',
    message: `Customer ${profile?.full_name || user.email} requested ${service_type}`,
    link: `/admin/requests`,
   })
  } catch (notifyError) {
   console.error('Failed to create admin notification', notifyError)
  }
  
  // Send email notification to admin
  try {
   const timeRangeLabels = {
    morning: 'Morning (8:00 AM - 12:00 PM)',
    afternoon: 'Afternoon (12:00 PM - 3:00 PM)',
    evening: 'Evening (3:00 PM - 5:45 PM)',
   }
   
   const serviceTypeLabels = {
    standard: 'Standard Cleaning',
    deep: 'Deep Cleaning',
    move_in_out: 'Move In/Out Cleaning',
    post_construction: 'Post-Construction Cleaning',
    office: 'Office Cleaning',
   }
   
   await resend.emails.send({
    from: 'Impress Cleaning <notifications@impressyoucleaning.com>',
    to: 'admin@impressyoucleaning.com',
    subject: `🧹 New Service Request from ${profile?.full_name || 'Customer'}`,
    html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #079447; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">New Service Request</h1>
            </div>
            
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #1C294E; margin-top: 0;">Customer Details</h2>
              <p><strong>Name:</strong> ${profile?.full_name || 'N/A'}</p>
              <p><strong>Email:</strong> ${profile?.email || user.email}</p>
              <p><strong>Phone:</strong> ${profile?.phone || 'N/A'}</p>
              
              <hr style="border: 1px solid #ddd; margin: 20px 0;">
              
              <h2 style="color: #1C294E;">Service Details</h2>
              <p><strong>Service Type:</strong> ${serviceTypeLabels[service_type] || service_type}</p>
              <p><strong>Preferred Date:</strong> ${new Date(preferred_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
              <p><strong>Preferred Time:</strong> ${timeRangeLabels[preferred_time] || preferred_time}</p>
              <p><strong>Flexible:</strong> ${is_flexible ? 'Yes' : 'No'}</p>
              ${is_recurring ? `<p><strong>Recurring:</strong> ${recurring_frequency}</p>` : ''}
              
              <hr style="border: 1px solid #ddd; margin: 20px 0;">
              
              <h2 style="color: #1C294E;">Service Address</h2>
              <p>
                ${address?.street_address || ''}${address?.unit ? `, ${address.unit}` : ''}<br>
                ${address?.city || ''}, ${address?.state || ''} ${address?.zip_code || ''}
              </p>
              
              ${special_requests ? `
                <hr style="border: 1px solid #ddd; margin: 20px 0;">
                <h2 style="color: #1C294E;">Special Requests</h2>
                <p>${special_requests}</p>
              ` : ''}
              
              <div style="margin-top: 30px; text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/requests" 
                   style="background: #079447; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  View in Admin Portal
                </a>
              </div>
            </div>
            
            <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
              <p>Impress Cleaning Services, LLC</p>
            </div>
          </div>
        `,
   })
  } catch (emailError) {
   console.error('Failed to send admin email notification', emailError)
   // Don't fail the request if email fails
  }
  
  // Send confirmation email to customer
  try {
   const addressLine = address
   ? `${address.street_address}${address.unit ? ', ' + address.unit : ''}, ${address.city}, ${address.state} ${address.zip_code}`
   : 'N/A'
   
   await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/email/service-request-received`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
     customerEmail: profile?.email || user.email,
     customerName: profile?.full_name || user.email.split('@')[0],
     serviceType: service_type,
     preferredDate: preferred_date,
     preferredTime: preferred_time,
     address: addressLine,
    }),
   })
  } catch (emailError) {
   console.error('Failed to send customer confirmation email', emailError)
   // Don't fail the request if email fails
  }
  
  return NextResponse.json({ data: serviceRequest }, { status: 201 })
  
 } catch (err) {
  console.error('Service request error', err)
  return NextResponse.json({ error: err.message || 'Failed to submit request' }, { status: 500 })
 }
}