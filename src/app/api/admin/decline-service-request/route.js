import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sanitizeText } from '@/lib/sanitize'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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
    const { requestId } = body
    const reason = sanitizeText(body.reason)?.slice(0, 500) || null

    // Validate requestId is a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!requestId || !uuidRegex.test(requestId)) {
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 })
    }

    // Update service request status
    const { data: updatedRequest, error } = await supabaseAdmin
      .from('service_requests')
      .update({
        status: 'declined',
        admin_notes: reason,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single()

    if (error) throw error

    if (!updatedRequest) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 })
    }

    // Get service request details for email (with address)
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
    if (customer?.email && serviceRequest) {
      try {
        const serviceLabelMap = {
          standard: 'Standard Cleaning',
          deep: 'Deep Cleaning',
          move_in_out: 'Move In/Out Cleaning',
          post_construction: 'Post-Construction Cleaning',
          office: 'Office Cleaning',
        }

        const serviceLabel = serviceLabelMap[serviceRequest.service_type] || serviceRequest.service_type || 'Cleaning Service'
        const customerName = customer.full_name || customer.email.split('@')[0]
        const declineReason = reason || 'Unfortunately, we are unable to accommodate this request at this time.'
        const formattedDate = serviceRequest.preferred_date 
          ? new Date(serviceRequest.preferred_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
          : 'N/A'

        await resend.emails.send({
          from: 'Impress Cleaning Services <notifications@impressyoucleaning.com>',
          to: customer.email,
          subject: `Update on Your Service Request`,
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
                
                <div style="background: linear-gradient(135deg, #64748b 0%, #475569 100%); border-radius: 10px; padding: 30px; margin-bottom: 30px; text-align: center;">
                  <h2 style="color: white; margin: 0; font-size: 24px;">Service Request Update</h2>
                </div>

                <div style="background: #f8f9fa; border-radius: 10px; padding: 30px; margin-bottom: 30px;">
                  <p style="font-size: 16px; margin-top: 0;">Hi ${customerName},</p>
                  <p style="font-size: 16px;">Thank you for your interest in our cleaning services. Unfortunately, we're unable to fulfill your recent service request.</p>
                  
                  <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #1C294E; margin-top: 0; font-size: 18px;">Request Details</h3>
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
                          <strong>Requested Date:</strong>
                        </td>
                        <td style="padding: 10px 0; text-align: right;">
                          ${formattedDate}
                        </td>
                      </tr>
                    </table>
                  </div>

                  <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
                    <p style="margin: 0 0 5px 0; color: #92400e; font-size: 14px;"><strong>Reason:</strong></p>
                    <p style="margin: 0; color: #92400e; font-size: 14px;">${declineReason}</p>
                  </div>

                  <p style="font-size: 16px;">We apologize for any inconvenience. Please feel free to submit a new request for a different date, or contact us if you have any questions.</p>

                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://impressyoucleaning.com/portal/request-service" style="display: inline-block; background: #079447; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Submit New Request
                    </a>
                  </div>
                </div>

                <div style="text-align: center; color: #6b7280; font-size: 14px;">
                  <p>We hope to serve you in the future!</p>
                  <p style="margin: 10px 0;">Impress Cleaning Services</p>
                  <p style="margin: 10px 0;">
                    Questions? Reply to this email or contact us at notifications@impressyoucleaning.com
                  </p>
                </div>
              </body>
            </html>
          `,
        })

        // Create portal notification
        await supabaseAdmin
          .from('customer_notifications')
          .insert({
            user_id: serviceRequest.customer_id,
            type: 'request_declined',
            title: 'Service Request Update',
            message: `Your ${serviceLabel} request for ${formattedDate} could not be accommodated. ${declineReason}`,
            link: '/portal/request-service',
            reference_id: requestId,
            reference_type: 'service_request',
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