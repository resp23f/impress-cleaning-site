import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { sanitizeText } from '@/lib/sanitize'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = 'Impress Cleaning Services <notifications@impressyoucleaning.com>'

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
    
    const {
      customer_id,
      address_id,
      service_type,
      scheduled_date,
      scheduled_time_start,
      scheduled_time_end,
      special_instructions,
      status = 'confirmed',
    } = appointmentData

    // Validate required fields
    if (!customer_id || !service_type || !scheduled_date || !scheduled_time_start || !scheduled_time_end) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Sanitize text fields
    const sanitizedData = {
      customer_id,
      address_id: address_id || null,
      service_type,
      scheduled_date,
      scheduled_time_start,
      scheduled_time_end,
      status,
      special_instructions: special_instructions 
        ? sanitizeText(special_instructions)?.slice(0, 2000) 
        : null,
    }

    // Create appointment using admin client
    const { data: appointment, error } = await supabaseAdmin
      .from('appointments')
      .insert([sanitizedData])
      .select()
      .single()
    
    if (error) throw error

    // Get customer details for email
    const { data: customer } = await supabaseAdmin
      .from('profiles')
      .select('full_name, email')
      .eq('id', customer_id)
      .single()

    // Get address details if provided
    let addressDetails = null
    if (address_id) {
      const { data: address } = await supabaseAdmin
        .from('service_addresses')
        .select('street_address, unit, city, state, zip_code')
        .eq('id', address_id)
        .single()
      addressDetails = address
    }

    const customerName = customer?.full_name || 'Valued Customer'
    const customerEmail = customer?.email

    // Format service type label
    const serviceLabelMap = {
      standard: 'Standard Cleaning',
      deep: 'Deep Cleaning',
      move_in_out: 'Move In/Out Cleaning',
      post_construction: 'Post-Construction Cleaning',
      office: 'Office Cleaning',
    }
    const serviceLabel = serviceLabelMap[service_type] || service_type

    // Format date and time
    const formatDate = (dateStr) => {
      if (!dateStr) return 'N/A'
      const date = new Date(dateStr + 'T00:00:00')
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    }

    const formatTime = (timeStr) => {
      if (!timeStr) return ''
      const [h, m] = timeStr.split(':')
      const date = new Date()
      date.setHours(Number(h || 0), Number(m || 0), 0, 0)
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
    }

    const formattedDate = formatDate(scheduled_date)
    const formattedTime = `${formatTime(scheduled_time_start)} - ${formatTime(scheduled_time_end)}`
    
    const addressLine = addressDetails
      ? `${addressDetails.street_address}${addressDetails.unit ? ', ' + addressDetails.unit : ''}, ${addressDetails.city}, ${addressDetails.state} ${addressDetails.zip_code}`
      : 'Address on file'

    // 1. Create customer notification (shows in portal)
    try {
      await supabaseAdmin.from('customer_notifications').insert({
        user_id: customer_id,
        type: 'appointment_confirmed',
        title: 'New Appointment Scheduled',
        message: `Your ${serviceLabel} has been scheduled for ${formattedDate}`,
        link: '/portal/appointments',
        reference_id: appointment.id,
        reference_type: 'appointment',
        is_read: false,
      })
    } catch (notifError) {
      console.error('Failed to create customer notification:', notifError)
    }

    // 2. Send customer confirmation email
    if (customerEmail) {
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: customerEmail,
          subject: `Your ${serviceLabel} is Confirmed! ✨`,
          html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <img src="https://www.impressyoucleaning.com/ImpressLogoNoBackgroundBlue.png" alt="Impress Cleaning" style="height: 60px; width: auto;">
    </div>
    
    <div style="background: linear-gradient(135deg, #079447 0%, #10b981 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 16px;">✨</div>
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Appointment Confirmed!</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">We're excited to make your space shine</p>
    </div>
    
    <div style="background: #ffffff; border-radius: 0 0 16px 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Hi ${customerName},
      </p>
      <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Great news! Your cleaning appointment has been confirmed. Here are the details:
      </p>
      
      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #bbf7d0;">
        <h3 style="color: #065f46; margin: 0 0 16px 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Appointment Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 100px;">Service</td>
            <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${serviceLabel}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Date</td>
            <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Time</td>
            <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${formattedTime}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Location</td>
            <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${addressLine}</td>
          </tr>
        </table>
      </div>
      
      ${special_instructions ? `
      <div style="background: #f1f5f9; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <p style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; margin: 0 0 8px 0;">Special Instructions</p>
        <p style="color: #334155; font-size: 14px; margin: 0;">${sanitizeText(special_instructions)?.slice(0, 500)}</p>
      </div>
      ` : ''}
      
      <div style="background: #fffbeb; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid #fde68a;">
        <p style="color: #92400e; font-size: 14px; margin: 0;">
          <strong>📋 Preparation Tips:</strong><br>
          Please ensure pets are secured and any fragile items are put away before our team arrives.
        </p>
      </div>
      
      <a href="https://www.impressyoucleaning.com/portal/appointments" style="display: block; background: linear-gradient(135deg, #079447 0%, #10b981 100%); color: #ffffff; text-decoration: none; padding: 16px 24px; border-radius: 12px; font-weight: 600; font-size: 16px; text-align: center;">
        View Appointment
      </a>
      
      <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0; text-align: center;">
        Need to make changes?<br>
        <a href="https://www.impressyoucleaning.com/portal/appointments" style="color: #079447; text-decoration: none; font-weight: 500;">Manage your appointment</a> or call us at <a href="tel:5122775364" style="color: #079447; text-decoration: none; font-weight: 500;">(512) 277-5364</a>
      </p>
    </div>
    
    <div style="text-align: center; margin-top: 32px;">
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">
        © ${new Date().getFullYear()} Impress Cleaning Services LLC. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
          `,
        })
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError)
      }
    }

    return NextResponse.json({ success: true, data: appointment })
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}