import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY_STAGING);

function createGiftCertificateEmail(giftData) {
  const { code, recipientName, senderName, message, amount } = giftData;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gift Certificate from ${senderName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">

          <!-- Header with Gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">🎁 You've Received a Gift!</h1>
              <p style="margin: 10px 0 0; color: #e0e7ff; font-size: 16px;">A special gift from ${senderName}</p>
            </td>
          </tr>

          <!-- Personal Message (if provided) -->
          ${message ? `
          <tr>
            <td style="padding: 30px 30px 20px; background-color: #eff6ff; border-bottom: 1px solid #dbeafe;">
              <p style="margin: 0 0 8px; color: #1e40af; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Personal Message</p>
              <p style="margin: 0; color: #1e3a8a; font-size: 16px; line-height: 1.6; font-style: italic;">"${message}"</p>
            </td>
          </tr>
          ` : ''}

          <!-- Gift Certificate Details -->
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <p style="margin: 0 0 24px; color: #4b5563; font-size: 18px;">
                Dear ${recipientName},
              </p>
              <p style="margin: 0 0 32px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                ${senderName} has sent you a gift certificate for our professional cleaning services!
              </p>

              <!-- Gift Amount Box -->
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #0ea5e9; border-radius: 12px; padding: 24px; margin: 0 0 24px;">
                <p style="margin: 0 0 8px; color: #0369a1; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Gift Value</p>
                <p style="margin: 0; color: #0c4a6e; font-size: 48px; font-weight: bold;">$${amount}</p>
              </div>

              <!-- Gift Code Box -->
              <div style="background-color: #fafafa; border: 2px dashed #d1d5db; border-radius: 12px; padding: 24px; margin: 0 0 32px;">
                <p style="margin: 0 0 12px; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Your Gift Certificate Code</p>
                <p style="margin: 0; color: #1f2937; font-size: 24px; font-weight: bold; font-family: 'Courier New', monospace; letter-spacing: 2px;">${code}</p>
                <p style="margin: 12px 0 0; color: #9ca3af; font-size: 12px;">Save this code to redeem your gift</p>
              </div>
            </td>
          </tr>

          <!-- How to Redeem Section -->
          <tr>
            <td style="padding: 0 30px 40px;">
              <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px;">
                <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 20px; font-weight: bold;">How to Redeem Your Gift</h2>
                <ol style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 1.8;">
                  <li style="margin-bottom: 8px;">Visit our website or call us to schedule your cleaning service</li>
                  <li style="margin-bottom: 8px;">Provide your gift certificate code: <strong>${code}</strong></li>
                  <li style="margin-bottom: 8px;">We'll apply the $${amount} credit to your service</li>
                  <li>Enjoy your sparkling clean home!</li>
                </ol>
              </div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 30px 40px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://impresscleaning.com'}"
                 style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                Schedule Your Cleaning
              </a>
            </td>
          </tr>

          <!-- Important Notes -->
          <tr>
            <td style="padding: 0 30px 40px;">
              <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.6;">
                  <strong>Important:</strong> This gift certificate does not expire. Keep this email safe as proof of your gift certificate. If you have any questions, please contact us.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 8px; color: #1f2937; font-size: 16px; font-weight: 600;">Impress Cleaning Services</p>
              <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px;">Professional cleaning for your home or business</p>
              <div style="margin: 0 0 16px;">
                <a href="mailto:contact@impresscleaning.com" style="color: #2563eb; text-decoration: none; font-size: 14px;">contact@impresscleaning.com</a>
              </div>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} Impress Cleaning Services. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export async function POST(request) {
  try {
    const giftData = await request.json();
    const { code, recipientName, recipientEmail, senderName, amount } = giftData;

    console.log('Attempting to send gift certificate:', { code, recipientName, recipientEmail, senderName, amount });

    // Validate required fields
    if (!code || !recipientName || !recipientEmail || !senderName || !amount) {
      console.error('Missing required fields:', { code, recipientName, recipientEmail, senderName, amount });
      return Response.json(
        { error: 'Missing required gift certificate data' },
        { status: 400 }
      );
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY_STAGING) {
      console.error('RESEND_API_KEY_STAGING is not configured');
      return Response.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Create the email HTML
    const emailHtml = createGiftCertificateEmail(giftData);

    // Send email using Resend
    // Using Resend's verified onboarding domain for testing
    // TODO: Replace with your verified domain once set up in Resend
    console.log('Sending email to:', recipientEmail);
    const emailResponse = await resend.emails.send({
      from: 'Impress Cleaning <onboarding@resend.dev>',
      to: recipientEmail,
      subject: `🎁 Gift Certificate from ${senderName} - $${amount}`,
      html: emailHtml,
    });

    console.log('Resend response:', emailResponse);

    if (!emailResponse.data) {
      console.error('No data in email response:', emailResponse);
      throw new Error('Failed to send email - no response data');
    }

    console.log('Gift certificate email sent successfully:', emailResponse.data.id);

    return Response.json({
      success: true,
      emailId: emailResponse.data.id,
      message: 'Gift certificate sent successfully',
    });

  } catch (error) {
    console.error('Error sending gift certificate email:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });

    // Log Resend-specific errors
    if (error.message?.includes('API')) {
      console.error('Resend API error detected');
    }

    return Response.json(
      {
        error: error.message || 'Failed to send gift certificate email',
        details: process.env.NODE_ENV === 'development' ? error.stack : null
      },
      { status: 500 }
    );
  }
}
