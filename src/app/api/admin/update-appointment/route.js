import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sanitizeText } from '@/lib/sanitize'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

    // If status changed to 'completed', create service_history entry
    if (sanitizedUpdates.status === 'completed' && oldAppointment.status !== 'completed') {
      // Check if service_history entry already exists for this appointment
      const { data: existingHistory } = await supabaseAdmin
        .from('service_history')
        .select('id')
        .eq('appointment_id', appointmentId)
        .single()

      if (!existingHistory) {
        const { error: historyError } = await supabaseAdmin
          .from('service_history')
          .insert({
            appointment_id: appointmentId,
            customer_id: oldAppointment.customer_id,
            service_type: oldAppointment.service_type,
            completed_date: new Date().toISOString().split('T')[0],
            team_members: oldAppointment.team_members || [],
          })

        if (historyError) {
          console.error('Failed to create service history:', historyError)
        }
      }
    }

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

    if (customer?.email && newAppointment && (dateChanged || timeChanged)) {
      try {
        const addressLine = newAppointment.service_addresses
          ? `${newAppointment.service_addresses.street_address}${newAppointment.service_addresses.unit ? ', ' + newAppointment.service_addresses.unit : ''}, ${newAppointment.service_addresses.city}, ${newAppointment.service_addresses.state} ${newAppointment.service_addresses.zip_code}`
          : 'N/A'

        const serviceLabelMap = {
          standard: 'Standard Cleaning',
          deep: 'Deep Cleaning',
          move_in_out: 'Move In/Out Cleaning',
          post_construction: 'Post-Construction Cleaning',
          office: 'Office Cleaning',
        }

        const serviceLabel = serviceLabelMap[newAppointment.service_type] || newAppointment.service_type || 'Cleaning Service'
        const customerName = customer.full_name || customer.email.split('@')[0]
        
        const formatDate = (date) => date 
          ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
          : 'TBD'
        
        const formatTime = (start, end) => start && end ? `${start} - ${end}` : 'TBD'

        const oldDateTime = `${formatDate(oldAppointment.scheduled_date)} at ${formatTime(oldAppointment.scheduled_time_start, oldAppointment.scheduled_time_end)}`
        const newDateTime = `${formatDate(newAppointment.scheduled_date)} at ${formatTime(newAppointment.scheduled_time_start, newAppointment.scheduled_time_end)}`

        await resend.emails.send({
          from: 'Impress Cleaning Services <notifications@impressyoucleaning.com>',
          to: customer.email,
          subject: `Your ${serviceLabel} Has Been Rescheduled`,
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
                
                <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 10px; padding: 30px; margin-bottom: 30px; text-align: center;">
                  <h2 style="color: white; margin: 0; font-size: 28px;">📅 Appointment Rescheduled</h2>
                </div>

                <div style="background: #f8f9fa; border-radius: 10px; padding: 30px; margin-bottom: 30px;">
                  <p style="font-size: 16px; margin-top: 0;">Hi ${customerName},</p>
                  <p style="font-size: 16px;">Your cleaning appointment has been rescheduled. Here are the updated details:</p>
                  
                  <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
                    <p style="margin: 0 0 5px 0; color: #92400e; font-size: 14px;"><strong>Previous:</strong></p>
                    <p style="margin: 0; color: #92400e; font-size: 14px; text-decoration: line-through;">${oldDateTime}</p>
                  </div>

                  <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; border-radius: 4px; margin: 20px 0;">
                    <p style="margin: 0 0 5px 0; color: #065f46; font-size: 14px;"><strong>New Date & Time:</strong></p>
                    <p style="margin: 0; color: #065f46; font-size: 16px; font-weight: 600;">${newDateTime}</p>
                  </div>
                  
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
                        <td style="padding: 10px 0;">
                          <strong>Location:</strong>
                        </td>
                        <td style="padding: 10px 0; text-align: right;">
                          ${addressLine}
                        </td>
                      </tr>
                    </table>
                  </div>

                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://impressyoucleaning.com/portal/appointments" style="display: inline-block; background: #079447; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      View in Portal
                    </a>
                  </div>

                  <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
                    If this new time doesn't work for you, please contact us to reschedule.
                  </p>
                </div>

                <div style="text-align: center; color: #6b7280; font-size: 14px;">
                  <p>Thank you for your flexibility!</p>
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
        console.error('Failed to send reschedule email', emailError)
      }
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}