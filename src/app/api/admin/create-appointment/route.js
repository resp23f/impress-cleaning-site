import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { sanitizeText } from '@/lib/sanitize'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = 'Impress Cleaning Services <notifications@impressyoucleaning.com>'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://impressyoucleaning.com'

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
      sendNotificationEmail = true,
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

    // Get customer details for notification/email
    const { data: customer } = await supabaseAdmin
      .from('profiles')
      .select('full_name, email')
      .eq('id', customer_id)
      .single()

    const customerName = customer?.full_name || 'Valued Customer'
    const firstName = customerName.split(' ')[0]
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

    // Format date for notification
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
    const formattedDate = formatDate(scheduled_date)

    // Create customer notification (always - shows in portal)
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

    // Send customer confirmation email (only if toggle is on)
    let notificationEmailSent = false
    if (sendNotificationEmail && customerEmail) {
      try {
        const loginLink = `${SITE_URL}/auth/login`
        
        await resend.emails.send({
          from: FROM_EMAIL,
          to: customerEmail,
          subject: `${firstName}, Your Appointment Is Confirmed`,
          html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Appointment Confirmed</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#ffffff;">
    <tr>
      <td style="padding:24px 0 0 0;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" align="center" style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
          <!-- LOGO HEADER -->
          <tr>
            <td align="center" style="background:linear-gradient(180deg,#d5d8dc 0%,#cdd0d4 50%,#d5d8dc 100%);padding:35px 0;">
              <img src="https://bzcdasbrdaonxpomzakh.supabase.co/storage/v1/object/public/public-assets/logo_impress_white.png" alt="Impress Cleaning Services" width="200" style="display:block;width:200px;height:auto;" />
            </td>
          </tr>
          <!-- TITLE / COPY -->
          <tr>
            <td style="padding:32px 32px 8px;">
              <p style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6b7280;margin:0 0 8px;">APPOINTMENT CONFIRMED</p>
              <h1 style="font-size:28px;line-height:1.2;font-weight:700;color:#111827;margin:0 0 12px;">Hi ${firstName}, You're All Set!</h1>
              <p style="font-size:15px;line-height:1.6;color:#4b5563;margin:0;">Your cleaning appointment has been confirmed. Sign in to your customer portal to view the details.</p>
            </td>
          </tr>
          <!-- BUTTON -->
          <tr>
            <td style="padding:24px 32px 8px;text-align:center;">
              <a href="${loginLink}" style="display:inline-block;background-color:#079447;color:#ffffff !important;text-decoration:none;padding:18px 48px;border-radius:999px;font-size:16px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">LOG IN NOW</a>
            </td>
          </tr>
          <!-- HELP BOX -->
          <tr>
            <td style="padding:32px;">
              <table role="presentation" width="320" cellspacing="0" cellpadding="0" align="center" style="background-color:#f3f4f6;border-radius:10px;">
                <tr>
                  <td style="padding:18px 24px;text-align:center;">
                    <p style="margin:0 0 4px 0;font-weight:600;font-size:12px;color:#374151;">Have a question?</p>
                    <p style="margin:4px 0 0;font-size:12px;"><a href="mailto:scheduling@impressyoucleaning.com" style="color:#079447;text-decoration:none;border-bottom:1px solid #079447;">Reach out to our team</a></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- FOOTER -->
          <tr>
            <td style="padding:28px 32px;border-top:1px solid #e5e7eb;">
              <p style="font-size:11px;font-weight:600;color:#6b7280;margin:2px 0;">Impress Cleaning Services, LLC</p>
              <p style="font-size:10px;color:#6b7280;margin:2px 0;"><a style="color:#6b7280;text-decoration:none;pointer-events:none;">1530 Sun City Blvd, Suite 120-403, Georgetown, TX 78633</a></p>
              <p style="font-size:10px;color:#6b7280;margin:2px 0;">&copy; 2025 Impress Cleaning Services, LLC. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
        })
        notificationEmailSent = true
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError)
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: appointment,
      notificationEmailSent,
    })
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
