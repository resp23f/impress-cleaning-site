import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY_STAGING);

export async function POST(request) {
  try {
    const bookingData = await request.json();

    // Format the service level for display
    const serviceLevelMap = {
      'basic': 'Basic Clean',
      'deep': 'Deep Clean',
      'move': 'Move-In/Move-Out Clean'
    };

    const timeMap = {
      'morning': 'Morning (8am - 12pm)',
      'afternoon': 'Afternoon (12pm - 4pm)',
      'evening': 'Evening (4pm - 7pm)'
    };

    // Calculate estimated price for email
    let estimatedPrice = 'TBD';
    if (bookingData.serviceType === 'commercial') {
      estimatedPrice = 'Starting at $300';
    } else if (bookingData.serviceType === 'residential') {
      if (bookingData.serviceLevel === 'basic') {
        estimatedPrice = 'Starting at $150';
      } else if (bookingData.serviceLevel === 'deep') {
        estimatedPrice = 'Starting at $325';
      } else if (bookingData.serviceLevel === 'move') {
        estimatedPrice = 'Starting at $400';
      }
    }

    // Send email notification
    const { data, error } = await resend.emails.send({
      from: 'Bookings <bookings@impressyoucleaning.com>',
      to: ['booking@impressyoucleaning.com'],
      subject: `New Booking Request - ${bookingData.name}`,
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
            .estimate-box {
              background: #f0fdf4;
              border: 2px solid #5FB87E;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 20px 0;
            }
            .estimate-price {
              font-size: 32px;
              font-weight: bold;
              color: #079447;
              margin: 10px 0;
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
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 New Booking Request</h1>
          </div>
          
          <div class="content">
            <div class="estimate-box">
              <div style="font-size: 16px; color: #666;">Estimated Price Range</div>
              <div class="estimate-price">${estimatedPrice}</div>
              <div style="font-size: 14px; color: #666;">
                ${bookingData.giftCertificate ? '⚠️ Customer has a gift certificate to apply' : 'Final pricing to be confirmed'}
              </div>
            </div>

            <div class="section">
              <div class="section-title">📋 Customer Information</div>
              <div class="info-row">
                <span class="label">Name:</span>
                <span class="value">${bookingData.name}</span>
              </div>
              <div class="info-row">
                <span class="label">Email:</span>
                <span class="value">${bookingData.email}</span>
              </div>
              <div class="info-row">
                <span class="label">Phone:</span>
                <span class="value">${bookingData.phone}</span>
              </div>
              <div class="info-row">
                <span class="label">Address:</span>
                <span class="value">${bookingData.address}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">🧹 Service Details</div>
              <div class="info-row">
                <span class="label">Service Type:</span>
                <span class="value">${bookingData.serviceType === 'residential' ? 'Residential' : 'Commercial'}</span>
              </div>
              <div class="info-row">
                <span class="label">Service Level:</span>
                <span class="value">${serviceLevelMap[bookingData.serviceLevel]}</span>
              </div>
              <div class="info-row">
                <span class="label">Space Size:</span>
                <span class="value">${bookingData.spaceSize}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">📅 Scheduling</div>
              <div class="info-row">
                <span class="label">Preferred Date:</span>
                <span class="value">${bookingData.preferredDate}</span>
              </div>
              <div class="info-row">
                <span class="label">Preferred Time:</span>
                <span class="value">${timeMap[bookingData.preferredTime]}</span>
              </div>
            </div>

            ${bookingData.giftCertificate ? `
              <div class="section">
                <div class="section-title">🎁 Gift Certificate</div>
                <div class="info-row">
                  <span class="label">Code:</span>
                  <span class="value highlight">${bookingData.giftCertificate}</span>
                </div>
                <p style="color: #d97706; font-weight: bold;">⚠️ Remember to validate and apply this certificate to the final invoice!</p>
              </div>
            ` : ''}

            ${bookingData.specialRequests ? `
              <div class="section">
                <div class="section-title">📝 Special Requests</div>
                <p class="value">${bookingData.specialRequests}</p>
              </div>
            ` : ''}
          </div>

          <div class="footer">
            <p><strong>Action Required:</strong> Respond to customer within 24 hours with confirmed pricing and appointment details.</p>
            <p style="margin-top: 10px;">Reply to: ${bookingData.email} | Call: ${bookingData.phone}</p>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, messageId: data.id },
      { status: 200 }
    );

  } catch (error) {
    console.error('Booking API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}