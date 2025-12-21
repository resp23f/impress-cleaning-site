import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sanitizeText } from '@/lib/sanitize'

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
      sendNotificationEmail = true, // Default to true for backwards compatibility
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
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/email/appointment-confirmed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerEmail,
            customerName,
          }),
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
