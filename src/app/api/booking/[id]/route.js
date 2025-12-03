import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase admin client for database operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// UUID v4 regex for validation
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(request, { params }) {
  try {
    const { id } = await params

    // Validate UUID format to prevent SQL injection
    if (!id || !UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: 'Invalid booking ID' },
        { status: 400 }
      )
    }

    // Fetch booking from database
    const { data: booking, error } = await supabaseAdmin
      .from('booking_requests')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Return booking data (transform snake_case to camelCase for frontend)
    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        name: booking.name,
        email: booking.email,
        phone: booking.phone,
        address: booking.address,
        serviceType: booking.service_type,
        serviceLevel: booking.service_level,
        spaceSize: booking.space_size,
        preferredDate: booking.preferred_date,
        preferredTime: booking.preferred_time,
        giftCertificate: booking.gift_certificate,
        specialRequests: booking.special_requests,
        status: booking.status,
        createdAt: booking.created_at,
      },
    })
  } catch (error) {
    console.error('Booking fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}