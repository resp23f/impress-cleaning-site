import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { sanitizeText } from '@/lib/sanitize'

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAIL = 'admin@impressyoucleaning.com'
const FROM_EMAIL = 'Impress Cleaning Services <notifications@impressyoucleaning.com>'

export async function POST(request) {
 try {
  // Verify user is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { type, appointment, rescheduleData, cancelReason } = body
  
  // Sanitize user input
  const sanitizedCancelReason = sanitizeText(cancelReason)?.slice(0, 500) || 'No reason provided.'
  
  if (!type || !appointment) {
   return NextResponse.json(
    { error: 'Missing type or appointment' },
    { status: 400 }
   )
  }
  
  const {
   id,
   customer_id,
   service_type,
   scheduled_date,
   scheduled_time_start,
   scheduled_time_end,
   service_addresses,
  } = appointment
  
  const serviceLabelMap = {
   standard: 'Standard Cleaning',
   deep: 'Deep Cleaning',
   move_in_out: 'Move In/Out Cleaning',
   post_construction: 'Post-Construction Cleaning',
   office: 'Office Cleaning',
  }
  
  const serviceLabel = serviceLabelMap[service_type] || service_type || 'Cleaning Service'
  
  const formattedDate = scheduled_date
  ? new Date(scheduled_date).toLocaleDateString()
  : 'N/A'
  
  const formattedTime = scheduled_time_start && scheduled_time_end
  ? `${scheduled_time_start} - ${scheduled_time_end}`
  : 'N/A'
  
  const addressLine = service_addresses
  ? sanitizeText(`${service_addresses.street_address}${
   service_addresses.unit ? ', ' + service_addresses.unit : ''
  }, ${service_addresses.city}, ${service_addresses.state} ${service_addresses.zip_code}`)?.slice(0, 300)
  : 'N/A'
  
  let subject = ''
  let html = ''
  
  if (type === 'reschedule') {
   const newDate = rescheduleData?.date
   ? new Date(rescheduleData.date).toLocaleDateString()
   : 'N/A'
   const newTime = rescheduleData?.timeStart && rescheduleData?.timeEnd
   ? `${rescheduleData.timeStart} - ${rescheduleData.timeEnd}`
   : 'N/A'
   
   subject = `Customer requested to reschedule appointment #${id || ''}`
   
   html = `
        <h2>Appointment Reschedule Request</h2>
        <p>A customer has requested to <strong>reschedule</strong> an appointment.</p>
        <h3>Appointment Details</h3>
        <ul>
          <li><strong>Appointment ID:</strong> ${id || 'N/A'}</li>
          <li><strong>Customer ID:</strong> ${customer_id || 'N/A'}</li>
          <li><strong>Service:</strong> ${serviceLabel}</li>
          <li><strong>Address:</strong> ${addressLine}</li>
        </ul>
        <h3>Original Date & Time</h3>
        <ul>
          <li><strong>Date:</strong> ${formattedDate}</li>
          <li><strong>Time:</strong> ${formattedTime}</li>
        </ul>
        <h3>Requested New Date & Time</h3>
        <ul>
          <li><strong>Date:</strong> ${newDate}</li>
          <li><strong>Time:</strong> ${newTime}</li>
        </ul>
      `
  } else if (type === 'cancel') {
   subject = `Customer requested to cancel appointment #${id || ''}`
   
   html = `
        <h2>Appointment Cancellation Request</h2>
        <p>A customer has requested to <strong>cancel</strong> an appointment.</p>
        <h3>Appointment Details</h3>
        <ul>
          <li><strong>Appointment ID:</strong> ${id || 'N/A'}</li>
          <li><strong>Customer ID:</strong> ${customer_id || 'N/A'}</li>
          <li><strong>Service:</strong> ${serviceLabel}</li>
          <li><strong>Address:</strong> ${addressLine}</li>
          <li><strong>Date:</strong> ${formattedDate}</li>
          <li><strong>Time:</strong> ${formattedTime}</li>
        </ul>
        <h3>Cancellation Reason</h3>
        <p>${sanitizedCancelReason}</p>
      `
  } else {
   return NextResponse.json(
    { error: 'Unsupported type' },
    { status: 400 }
   )
  }
  
  const { error } = await resend.emails.send({
   from: FROM_EMAIL,
   to: ADMIN_EMAIL,
   subject,
   html,
  })
  
  if (error) {
   console.error('Resend error:', error)
   return NextResponse.json(
    { error: 'Failed to send email' },
    { status: 500 }
   )
  }
  
  return NextResponse.json({ success: true })
 } catch (err) {
  console.error('notify-appointment-change error:', err)
  return NextResponse.json(
   { error: 'Unexpected error' },
   { status: 500 }
  )
 }
}