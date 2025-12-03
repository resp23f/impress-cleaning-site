import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sanitizeText, sanitizeEmail, sanitizePhone } from '@/lib/sanitize'

const resend = new Resend(process.env.RESEND_API_KEY_STAGING)

// Create Supabase admin client for database operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function createBookingConfirmationEmail(bookingData) {
  const {
    name,
    email,
    phone,
    address,
    serviceType,
    serviceLevel,
    preferredDate,
    preferredTime,
    specialRequests,
  } = bookingData

  // Format service level for display
  const serviceLevelMap = {
    basic: 'Standard Clean',
    deep: 'Deep Clean',
    move: 'Move-In/Move-Out Clean',
  }

  const timeMap = {
    morning: 'Morning (8am - 12pm)',
    afternoon: 'Afternoon (12pm - 4pm)',
    evening: 'Evening (4pm - 7pm)',
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Georgia', 'Times New Roman', serif; background-color: #f8f9fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 50px 20px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="650" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 0; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12); overflow: hidden;">
          <!-- Elegant Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a4d2e 0%, #2d6a4f 50%, #1a4d2e 100%); padding: 60px 40px; text-align: center;">
              <div style="border-bottom: 2px solid rgba(212, 175, 55, 0.3); padding-bottom: 20px; margin-bottom: 20px;">
                <h1 style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 400; letter-spacing: 3px; text-transform: uppercase;">Impress Cleaning Services</h1>
              </div>
              <h2 style="margin: 0; color: #d4af37; font-size: 42px; font-weight: 300; letter-spacing: 1px;">Booking Received</h2>
              <p style="margin: 15px 0 0; color: #e8f5e9; font-size: 16px; font-weight: 300; letter-spacing: 0.5px;">We'll be in touch within 24 hours</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 50px 50px 40px;">
              <p style="margin: 0 0 30px; color: #2d3748; font-size: 20px; font-weight: 300; font-family: 'Georgia', serif;">
                Dear ${name},
              </p>
              <p style="margin: 0 0 40px; color: #4a5568; font-size: 16px; line-height: 1.8; font-weight: 300;">
                Thank you for choosing Impress Cleaning Services. We have received your booking request and will review the details carefully.
              </p>

              <!-- Booking Details Box -->
              <div style="background: linear-gradient(to bottom, #fafafa 0%, #f5f5f5 100%); border: 1px solid #e8e8e8; border-radius: 2px; padding: 35px 40px; margin: 0 0 40px;">
                <h3 style="margin: 0 0 25px; color: #1a4d2e; font-size: 22px; font-weight: 400; letter-spacing: 0.5px;">Your Booking Details</h3>
                <table width="100%" cellpadding="0" cellspacing="0" style="color: #4a5568; font-size: 15px; line-height: 2;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #2d3748; width: 40%;">Service Type:</td>
                    <td style="padding: 8px 0;">${serviceType === 'residential' ? 'Residential' : 'Commercial'}</td>
                  </tr>
                  ${
                    serviceLevel
                      ? `
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #2d3748;">Service Level:</td>
                    <td style="padding: 8px 0;">${serviceLevelMap[serviceLevel] || serviceLevel}</td>
                  </tr>
                  `
                      : ''
                  }
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #2d3748;">Service Address:</td>
                    <td style="padding: 8px 0;">${address}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #2d3748;">Preferred Date:</td>
                    <td style="padding: 8px 0;">${preferredDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #2d3748;">Preferred Time:</td>
                    <td style="padding: 8px 0;">${timeMap[preferredTime] || preferredTime}</td>
                  </tr>
                  ${
                    specialRequests
                      ? `
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #2d3748; vertical-align: top;">Special Requests:</td>
                    <td style="padding: 8px 0;">${specialRequests}</td>
                  </tr>
                  `
                      : ''
                  }
                </table>
              </div>
            </td>
          </tr>

          <!-- What Happens Next -->
          <tr>
            <td style="padding: 0 50px 50px;">
              <div style="background-color: #fffef7; border-left: 3px solid #d4af37; padding: 25px 30px; border-radius: 2px; margin: 0 0 30px;">
                <h3 style="margin: 0 0 15px; color: #1a4d2e; font-size: 18px; font-weight: 600;">What Happens Next?</h3>
                <p style="margin: 0; color: #5a4a2a; font-size: 14px; line-height: 1.8; font-weight: 300;">
                  Our team will review your booking request and contact you within <strong>24 hours</strong> with:
                </p>
                <ul style="margin: 15px 0 0; padding-left: 20px; color: #5a4a2a; font-size: 14px; line-height: 1.8; font-weight: 300;">
                  <li>Confirmed pricing for your service</li>
                  <li>Appointment confirmation for your preferred date and time</li>
                  <li>Any additional details or questions we may have</li>
                </ul>
              </div>
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 15px; line-height: 1.8; font-weight: 300; text-align: center;">
                If you have any questions in the meantime, please don't hesitate to contact us.
              </p>
            </td>
          </tr>

          <!-- Contact Button -->
          <tr>
            <td style="padding: 0 50px 50px; text-align: center;">
              <a href="mailto:info@impressyoucleaning.com"
                 style="display: inline-block; background: linear-gradient(135deg, #1a4d2e 0%, #2d6a4f 100%); color: #ffffff; text-decoration: none; padding: 18px 55px; border-radius: 2px; font-size: 15px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase; box-shadow: 0 4px 12px rgba(26, 77, 46, 0.3);">
                Contact Us
              </a>
            </td>
          </tr>

          <!-- Elegant Footer -->
          <tr>
            <td style="padding: 40px 50px; background-color: #1a1a1a; text-align: center;">
              <div style="border-bottom: 1px solid rgba(212, 175, 55, 0.2); padding-bottom: 25px; margin-bottom: 25px;">
                <p style="margin: 0 0 5px; color: #ffffff; font-size: 20px; font-weight: 300; letter-spacing: 2px;">IMPRESS CLEANING SERVICES</p>
                <p style="margin: 0; color: #a0a0a0; font-size: 13px; font-weight: 300; letter-spacing: 1px;">Premium Home &amp; Business Cleaning</p>
              </div>
              <div style="margin: 0 0 25px;">
                <a href="mailto:info@impressyoucleaning.com" style="color: #d4af37; text-decoration: none; font-size: 14px; font-weight: 300; letter-spacing: 0.5px;">info@impressyoucleaning.com</a>
                <span style="color: #666; margin: 0 10px;">|</span>
                <a href="tel:+15122775364" style="color: #d4af37; text-decoration: none; font-size: 14px; font-weight: 300; letter-spacing: 0.5px;">(512) 277-5364</a>
              </div>
              <p style="margin: 0; color: #666666; font-size: 12px; font-weight: 300;">
                © ${new Date().getFullYear()} Impress Cleaning Services. All Rights Reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

export async function POST(request) {
  try {
    const bookingData = await request.json()

    // Sanitize user inputs (fixed: was referencing 'sanitized' before defined)
    const sanitized = {
      name: sanitizeText(bookingData.name)?.slice(0, 100) || '',
      email: sanitizeEmail(bookingData.email) || '',
      phone: sanitizePhone(bookingData.phone) || '',
      address: sanitizeText(bookingData.address)?.slice(0, 300) || '',
      serviceType: ['residential', 'commercial'].includes(bookingData.serviceType)
        ? bookingData.serviceType
        : 'residential',
      serviceLevel: ['basic', 'deep', 'move'].includes(bookingData.serviceLevel)
        ? bookingData.serviceLevel
        : 'basic',
      preferredDate: sanitizeText(bookingData.preferredDate)?.slice(0, 20) || '',
      preferredTime: ['morning', 'afternoon', 'evening'].includes(bookingData.preferredTime)
        ? bookingData.preferredTime
        : '',
      specialRequests: sanitizeText(bookingData.specialRequests)?.slice(0, 1000) || '',
      giftCertificate: sanitizeText(bookingData.giftCertificate)?.slice(0, 50) || '',
      spaceSize: sanitizeText(bookingData.spaceSize)?.slice(0, 50) || '',
    }

    // Validate required fields
    if (!sanitized.name || !sanitized.email || !sanitized.address) {
      return NextResponse.json(
        { error: 'Name, email, and address are required' },
        { status: 400 }
      )
    }

    // Save booking to database
    const { data: booking, error: dbError } = await supabaseAdmin
      .from('booking_requests')
      .insert({
        name: sanitized.name,
        email: sanitized.email,
        phone: sanitized.phone,
        address: sanitized.address,
        service_type: sanitized.serviceType,
        service_level: sanitized.serviceLevel,
        space_size: sanitized.spaceSize,
        preferred_date: sanitized.preferredDate,
        preferred_time: sanitized.preferredTime,
        gift_certificate: sanitized.giftCertificate,
        special_requests: sanitized.specialRequests,
        status: 'pending',
      })
      .select('id')
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save booking' },
        { status: 500 }
      )
    }

    // Format the service level for display in emails
    const serviceLevelMap = {
      basic: 'Standard Clean',
      deep: 'Deep Clean',
      move: 'Move-In/Move-Out Clean',
    }

    const timeMap = {
      morning: 'Morning (8am - 12pm)',
      afternoon: 'Afternoon (12pm - 4pm)',
      evening: 'Evening (4pm - 7pm)',
    }

    // Send email notification TO YOU (admin)
    const { error: notificationError } = await resend.emails.send({
      from: 'Bookings <bookings@impressyoucleaning.com>',
      to: ['notifications@impressyoucleaning.com'],
      subject: `New Booking Request - ${sanitized.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #079447 0%, #08A855 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              background: #ffffff;
              padding: 30px;
              border: 1px solid #e0e0e0;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #1C294E;
              border-bottom: 2px solid #5FB87E;
              padding-bottom: 8px;
              margin-bottom: 15px;
            }
            .info-row {
              margin-bottom: 10px;
            }
            .label {
              font-weight: bold;
              color: #1C294E;
              display: inline-block;
              width: 150px;
            }
            .value {
              color: #555;
            }
            .footer {
              background: #f5f5f5;
              padding: 20px;
              text-align: center;
              border-radius: 0 0 10px 10px;
              font-size: 14px;
              color: #666;
            }
            .highlight {
              background: #fff3cd;
              padding: 2px 6px;
              border-radius: 3px;
            }
            .booking-id {
              background: #e8f5e9;
              border: 1px solid #c8e6c9;
              border-radius: 8px;
              padding: 15px;
              text-align: center;
              margin-bottom: 20px;
            }
            .booking-id code {
              font-family: monospace;
              font-size: 14px;
              color: #2e7d32;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>New Booking Request</h1>
          </div>
          <div class="content">
            <div class="booking-id">
              <strong>Booking ID:</strong><br>
              <code>${booking.id}</code>
            </div>

            <div class="section">
              <div class="section-title">Customer Information</div>
              <div class="info-row">
                <span class="label">Name:</span>
                <span class="value">${sanitized.name}</span>
              </div>
              <div class="info-row">
                <span class="label">Email:</span>
                <span class="value">${sanitized.email}</span>
              </div>
              <div class="info-row">
                <span class="label">Phone:</span>
                <span class="value">${sanitized.phone}</span>
              </div>
              <div class="info-row">
                <span class="label">Address:</span>
                <span class="value">${sanitized.address}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Service Details</div>
              <div class="info-row">
                <span class="label">Service Type:</span>
                <span class="value">${sanitized.serviceType === 'residential' ? 'Residential' : 'Commercial'}</span>
              </div>
              <div class="info-row">
                <span class="label">Service Level:</span>
                <span class="value">${serviceLevelMap[sanitized.serviceLevel] || sanitized.serviceLevel}</span>
              </div>
              <div class="info-row">
                <span class="label">Space Size:</span>
                <span class="value">${sanitized.spaceSize || 'Not specified'}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Scheduling</div>
              <div class="info-row">
                <span class="label">Preferred Date:</span>
                <span class="value">${sanitized.preferredDate || 'Flexible'}</span>
              </div>
              <div class="info-row">
                <span class="label">Preferred Time:</span>
                <span class="value">${timeMap[sanitized.preferredTime] || sanitized.preferredTime || 'Flexible'}</span>
              </div>
            </div>

            ${
              sanitized.giftCertificate
                ? `
              <div class="section">
                <div class="section-title">Gift Certificate</div>
                <div class="info-row">
                  <span class="label">Code:</span>
                  <span class="value highlight">${sanitized.giftCertificate}</span>
                </div>
                <p style="color: #d97706; font-weight: bold;">Remember to validate and apply this certificate!</p>
              </div>
            `
                : ''
            }

            ${
              sanitized.specialRequests
                ? `
              <div class="section">
                <div class="section-title">Special Requests</div>
                <p class="value">${sanitized.specialRequests}</p>
              </div>
            `
                : ''
            }
          </div>
          <div class="footer">
            <p><strong>Action Required:</strong> Respond to customer within 24 hours with confirmed pricing and appointment details.</p>
            <p style="margin-top: 10px;">Reply to: ${sanitized.email} | Call: ${sanitized.phone}</p>
          </div>
        </body>
        </html>
      `,
    })

    if (notificationError) {
      console.error('Notification email error:', notificationError)
    }

    // Send confirmation email TO CUSTOMER
    const confirmationHtml = createBookingConfirmationEmail({
      name: sanitized.name,
      email: sanitized.email,
      phone: sanitized.phone,
      address: sanitized.address,
      serviceType: sanitized.serviceType,
      serviceLevel: sanitized.serviceLevel,
      preferredDate: sanitized.preferredDate,
      preferredTime: sanitized.preferredTime,
      specialRequests: sanitized.specialRequests,
    })

    const { error: confirmationError } = await resend.emails.send({
      from: 'Impress Cleaning <bookings@impressyoucleaning.com>',
      to: sanitized.email,
      subject: 'Your Booking Request Has Been Received',
      html: confirmationHtml,
    })

    if (confirmationError) {
      console.error('Confirmation email error:', confirmationError)
    }

    // Return booking ID for redirect
    return NextResponse.json(
      {
        success: true,
        bookingId: booking.id,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Booking API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}