import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sanitizeText } from '@/lib/sanitize'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Whitelist of allowed appointment fields
const ALLOWED_APPOINTMENT_FIELDS = [
  'customer_id',
  'address_id',
  'service_type',
  'scheduled_date',
  'scheduled_time_start',
  'scheduled_time_end',
  'special_instructions',
  'is_recurring',
  'recurring_frequency',
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
    const { requestId, appointmentData } = body

    // Validate requestId is a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!requestId || !uuidRegex.test(requestId)) {
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 })
    }

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
    const { data: updatedRequest, error: updateError } = await supabaseAdmin
      .from('service_requests')
      .update({
        status: 'approved',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single()

    if (updateError) throw updateError

    if (!updatedRequest) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 })
    }

    // Create appointment if data provided
    let createdAppointment = null
    if (appointmentData) {
      // Filter to only allowed fields
      const sanitizedAppointment = {}
      for (const [key, value] of Object.entries(appointmentData)) {
        if (ALLOWED_APPOINTMENT_FIELDS.includes(key)) {
          // Sanitize text fields
          if (key === 'special_instructions') {
            sanitizedAppointment[key] = sanitizeText(value)?.slice(0, 2000) || null
          } else {
            sanitizedAppointment[key] = value
          }
        }
      }

      // Validate required fields
      if (!sanitizedAppointment.customer_id || !uuidRegex.test(sanitizedAppointment.customer_id)) {
        return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 })
      }

      const timeRange = appointmentData.preferred_time 
        ? timeBucketToRange(appointmentData.preferred_time) 
        : null

      const payload = {
        ...sanitizedAppointment,
        scheduled_time_start: sanitizedAppointment.scheduled_time_start || timeRange?.start,
        scheduled_time_end: sanitizedAppointment.scheduled_time_end || timeRange?.end,
      }

      console.log('Admin approving service request, creating appointment with:', payload)

      const { data: newAppointment, error: appointmentError } = await supabaseAdmin
        .from('appointments')
        .insert([payload])
        .select()
        .single()

      if (appointmentError) throw appointmentError
      createdAppointment = newAppointment

      // Create portal notification for confirmed appointment
      if (newAppointment?.id) {
        try {
          const serviceLabelMap = {
            standard: 'Standard Cleaning',
            deep: 'Deep Cleaning',
            move_in_out: 'Move In/Out Cleaning',
            post_construction: 'Post-Construction Cleaning',
            office: 'Office Cleaning',
          }
          const serviceLabel = serviceLabelMap[sanitizedAppointment.service_type] || sanitizedAppointment.service_type
          const formattedDate = sanitizedAppointment.scheduled_date
            ? new Date(sanitizedAppointment.scheduled_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
            : 'your requested date'

          await supabaseAdmin.from('customer_notifications').insert({
            user_id: sanitizedAppointment.customer_id,
            type: 'appointment_confirmed',
            title: 'Service Request Approved!',
            message: `Your ${serviceLabel} has been scheduled for ${formattedDate}`,
            link: '/portal/appointments',
            reference_id: newAppointment.id,
            reference_type: 'appointment',
          })
        } catch (notifError) {
          console.error('Failed to create appointment notification:', notifError)
        }
      }
    }

    // Get appointment details for email
    const { data: appointment } = await supabaseAdmin
      .from('appointments')
      .select(`
        *,
        service_addresses (*)
      `)
      .eq('customer_id', appointmentData?.customer_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Get customer profile
    const { data: customer } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .eq('id', appointmentData?.customer_id)
      .single()

    // Send confirmation email to customer
    if (customer?.email && appointment) {
      try {
        const serviceLabelMap = {
          standard: 'Standard Cleaning',
          deep: 'Deep Cleaning',
          move_in_out: 'Move In/Out Cleaning',
          post_construction: 'Post-Construction Cleaning',
          office: 'Office Cleaning',
        }

        const serviceLabel = serviceLabelMap[appointment.service_type] || appointment.service_type || 'Cleaning Service'
        const customerName = customer.full_name || customer.email.split('@')[0]
        const firstName = customerName.split(' ')[0]
        const loginLink = 'https://impressyoucleaning.com/auth/login'

        await resend.emails.send({
          from: 'Impress Cleaning Services <notifications@impressyoucleaning.com>',
          to: customer.email,
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
      } catch (emailError) {
        console.error('Failed to send appointment confirmation email', emailError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error approving service request:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}