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
        const addressLine = appointment.service_addresses
          ? `${appointment.service_addresses.street_address}${appointment.service_addresses.unit ? ', ' + appointment.service_addresses.unit : ''}, ${appointment.service_addresses.city}, ${appointment.service_addresses.state} ${appointment.service_addresses.zip_code}`
          : 'N/A'

        const serviceLabelMap = {
          standard: 'Standard Cleaning',
          deep: 'Deep Cleaning',
          move_in_out: 'Move In/Out Cleaning',
          post_construction: 'Post-Construction Cleaning',
          office: 'Office Cleaning',
        }

        const serviceLabel = serviceLabelMap[appointment.service_type] || appointment.service_type || 'Cleaning Service'
        const customerName = customer.full_name || customer.email.split('@')[0]
        const formattedDate = appointment.scheduled_date 
          ? new Date(appointment.scheduled_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
          : 'TBD'
        const timeRange = appointment.scheduled_time_start && appointment.scheduled_time_end 
          ? `${appointment.scheduled_time_start} - ${appointment.scheduled_time_end}` 
          : 'TBD'

        await resend.emails.send({
          from: 'Impress Cleaning Services <notifications@impressyoucleaning.com>',
          to: customer.email,
          subject: `Your ${serviceLabel} is Confirmed!`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #1C294E; margin: 0;">Impress Cleaning Services</h1>
                </div>
                
                <div style="background: linear-gradient(135deg, #10b981 0%, #079447 100%); border-radius: 10px; padding: 30px; margin-bottom: 30px; text-align: center;">
                  <h2 style="color: white; margin: 0; font-size: 28px;">✓ Appointment Confirmed!</h2>
                </div>

                <div style="background: #f8f9fa; border-radius: 10px; padding: 30px; margin-bottom: 30px;">
                  <p style="font-size: 16px; margin-top: 0;">Hi ${customerName},</p>
                  <p style="font-size: 16px;">Great news! Your cleaning appointment has been scheduled and confirmed.</p>
                  
                  <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #1C294E; margin-top: 0; font-size: 18px;">Appointment Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                          <strong>Service:</strong>
                        </td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                          ${serviceLabel}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                          <strong>Date:</strong>
                        </td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                          ${formattedDate}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                          <strong>Time:</strong>
                        </td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                          ${timeRange}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
                          <strong>Location:</strong>
                        </td>
                        <td style="padding: 10px 0; text-align: right;">
                          ${addressLine}
                        </td>
                      </tr>
                    </table>
                  </div>

                  <div style="background: #e0f2fe; border-left: 4px solid #0284c7; padding: 15px; border-radius: 4px; margin: 20px 0;">
                    <p style="margin: 0; color: #0c4a6e; font-size: 14px;">
                      <strong>What to expect:</strong> Our professional cleaning team will arrive on time with all necessary supplies. We'll text you when we're on our way!
                    </p>
                  </div>

                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://impressyoucleaning.com/portal/appointments" style="display: inline-block; background: #079447; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      View in Portal
                    </a>
                  </div>

                  <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
                    Need to make changes? Visit your customer portal or reply to this email.
                  </p>
                </div>

                <div style="text-align: center; color: #6b7280; font-size: 14px;">
                  <p>We look forward to serving you!</p>
                  <p style="margin: 10px 0;">Impress Cleaning Services</p>
                  <p style="margin: 10px 0;">
                    Questions? Reply to this email or contact us at notifications@impressyoucleaning.com
                  </p>
                </div>
              </body>
            </html>
          `,
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