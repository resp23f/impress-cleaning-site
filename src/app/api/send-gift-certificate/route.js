import { Resend } from 'resend'
import Stripe from 'stripe'
import { sanitizeText, sanitizeEmail } from '@/lib/sanitize'

const resend = new Resend(process.env.RESEND_API_KEY_STAGING)

function createGiftCertificateEmail(giftData) {
  const { code, recipientName, senderName, message, amount } = giftData

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gift Certificate from ${senderName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Georgia', 'Times New Roman', serif; background-color: #f8f9fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 50px 20px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="650" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 0; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12); overflow: hidden;">
          <!-- Elegant Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a4d2e 0%, #2d6a4f 50%, #1a4d2e 100%); padding: 60px 40px; text-align: center; position: relative;">
              <div style="border-bottom: 2px solid rgba(212, 175, 55, 0.3); padding-bottom: 20px; margin-bottom: 20px;">
                <h1 style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 400; letter-spacing: 3px; text-transform: uppercase;">Impress Cleaning Services</h1>
              </div>
              <h2 style="margin: 0; color: #d4af37; font-size: 42px; font-weight: 300; letter-spacing: 1px;">A Gift For You</h2>
              <p style="margin: 15px 0 0; color: #e8f5e9; font-size: 16px; font-weight: 300; letter-spacing: 0.5px;">From ${senderName}</p>
            </td>
          </tr>
          <!-- Personal Message -->
          ${message ? `
          <tr>
            <td style="padding: 40px 50px; background: linear-gradient(to bottom, #fafafa 0%, #ffffff 100%); border-bottom: 1px solid #e8e8e8;">
              <p style="margin: 0 0 12px; color: #1a4d2e; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">A Personal Note</p>
              <p style="margin: 0; color: #2d3748; font-size: 17px; line-height: 1.8; font-style: italic; font-family: 'Georgia', serif;">"${message}"</p>
            </td>
          </tr>
          ` : ''}
          <!-- Main Content -->
          <tr>
            <td style="padding: 50px 50px 40px; text-align: center;">
              <p style="margin: 0 0 30px; color: #2d3748; font-size: 20px; font-weight: 300; font-family: 'Georgia', serif;">
                Dear ${recipientName},
              </p>
              <p style="margin: 0 0 40px; color: #4a5568; font-size: 16px; line-height: 1.8; font-weight: 300;">
              Someone special has chosen to gift you the luxury of a professionally cleaned home or business.
              </p>
              <!-- Premium Gift Amount -->
              <div style="background: linear-gradient(135deg, #1a4d2e 0%, #2d6a4f 100%); border-radius: 4px; padding: 40px; margin: 0 0 40px; box-shadow: 0 4px 16px rgba(26, 77, 46, 0.2);">
                <p style="margin: 0 0 12px; color: #d4af37; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Certificate Value</p>
                <p style="margin: 0; color: #ffffff; font-size: 56px; font-weight: 300; letter-spacing: -1px;">$${amount}</p>
              </div>
              <!-- Elegant Code Display -->
              <div style="background-color: #fafafa; border: 1px solid #e0e0e0; border-radius: 2px; padding: 35px 30px; margin: 0 0 40px;">
                <p style="margin: 0 0 18px; color: #718096; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Your Certificate Code</p>
                <div style="background-color: #ffffff; border: 2px solid #1a4d2e; border-radius: 2px; padding: 20px; margin: 0 0 18px;">
                  <p style="margin: 0; color: #1a4d2e; font-size: 28px; font-weight: 600; font-family: 'Courier New', monospace; letter-spacing: 3px;">${code}</p>
                </div>
                <p style="margin: 0; color: #a0aec0; font-size: 13px; font-weight: 300;">Please retain this code for redemption</p>
              </div>
            </td>
          </tr>
          <!-- Redemption Instructions -->
          <tr>
            <td style="padding: 0 50px 50px;">
              <div style="background: linear-gradient(to bottom, #fafafa 0%, #f5f5f5 100%); border: 1px solid #e8e8e8; border-radius: 2px; padding: 35px 40px;">
                <h3 style="margin: 0 0 25px; color: #1a4d2e; font-size: 22px; font-weight: 400; letter-spacing: 0.5px;">How to Redeem</h3>
                <div style="color: #4a5568; font-size: 15px; line-height: 2; font-weight: 300;">
                  <p style="margin: 0 0 15px; padding-left: 25px; position: relative;">
                    <span style="position: absolute; left: 0; color: #d4af37; font-weight: 600;">1.</span>
                    Contact us via phone or our website to schedule your service
                  </p>
                  <p style="margin: 0 0 15px; padding-left: 25px; position: relative;">
                    <span style="position: absolute; left: 0; color: #d4af37; font-weight: 600;">2.</span>
                    Provide your certificate code: <strong style="color: #1a4d2e;">${code}</strong>
                  </p>
                  <p style="margin: 0 0 15px; padding-left: 25px; position: relative;">
                    <span style="position: absolute; left: 0; color: #d4af37; font-weight: 600;">3.</span>
                    Your $${amount} credit will be applied to your service
                  </p>
                  <p style="margin: 0; padding-left: 25px; position: relative;">
                    <span style="position: absolute; left: 0; color: #d4af37; font-weight: 600;">4.</span>
                    Experience our Impressive Cleaning Service
                  </p>
                </div>
              </div>
            </td>
          </tr>
          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 50px 50px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://impressyoucleaning.com'}"
                 style="display: inline-block; background: linear-gradient(135deg, #1a4d2e 0%, #2d6a4f 100%); color: #ffffff; text-decoration: none; padding: 18px 55px; border-radius: 2px; font-size: 15px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase; box-shadow: 0 4px 12px rgba(26, 77, 46, 0.3);">
                Schedule Service
              </a>
            </td>
          </tr>
          <!-- Important Notice -->
          <tr>
            <td style="padding: 0 50px 50px;">
              <div style="background-color: #fffef7; border-left: 3px solid #d4af37; padding: 25px 30px; border-radius: 2px;">
                <p style="margin: 0; color: #5a4a2a; font-size: 14px; line-height: 1.7; font-weight: 300;">
                  <strong style="font-weight: 600;">Important Notice:</strong> This certificate never expires. Book now for priority scheduling during our busy season! For inquiries, please contact our team.
                </p>
              </div>
            </td>
          </tr>
          <!-- Elegant Footer -->
          <tr>
            <td style="padding: 40px 50px; background-color: #1a1a1a; text-align: center;">
              <div style="border-bottom: 1px solid rgba(212, 175, 55, 0.2); padding-bottom: 25px; margin-bottom: 25px;">
                <p style="margin: 0 0 5px; color: #ffffff; font-size: 20px; font-weight: 300; letter-spacing: 2px;">IMPRESS CLEANING SERVICES</p>
                <p style="margin: 0; color: #a0a0a0; font-size: 13px; font-weight: 300; letter-spacing: 1px;">Residential and Commercial Cleaning Service</p>
              </div>
              <div style="margin: 0 0 25px;">
                <a href="mailto:gifts@impressyoucleaning.com" style="color: #d4af37; text-decoration: none; font-size: 14px; font-weight: 300; letter-spacing: 0.5px;">gifts@impressyoucleaning.com</a>
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
    const { sessionId } = await request.json()

    // Validate session_id is provided
    if (!sessionId || typeof sessionId !== 'string') {
      console.error('Missing or invalid session_id')
      return Response.json(
        { error: 'Missing session ID' },
        { status: 400 }
      )
    }

    // Validate session_id format (Stripe session IDs start with cs_)
    if (!sessionId.startsWith('cs_')) {
      console.error('Invalid session_id format:', sessionId.substring(0, 10))
      return Response.json(
        { error: 'Invalid session ID format' },
        { status: 400 }
      )
    }

    // Check Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured')
      return Response.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      )
    }

    // Check Resend configuration
    if (!process.env.RESEND_API_KEY_STAGING) {
      console.error('RESEND_API_KEY_STAGING is not configured')
      return Response.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    // Initialize Stripe and verify the session
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    
    let session
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId)
    } catch (stripeError) {
      console.error('Stripe session retrieval failed:', stripeError.message)
      return Response.json(
        { error: 'Invalid or expired session' },
        { status: 400 }
      )
    }

    // Verify payment was successful
    if (session.payment_status !== 'paid') {
      console.error('Payment not completed:', session.payment_status)
      return Response.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    // Verify this is a gift certificate session
    if (session.metadata?.type !== 'gift_certificate') {
      console.error('Invalid session type:', session.metadata?.type)
      return Response.json(
        { error: 'Invalid session type' },
        { status: 400 }
      )
    }

    // Check if email was already sent (prevent duplicate sends on refresh)
    if (session.metadata?.emailSent === 'true') {
      console.log('Email already sent for session:', sessionId)
      return Response.json({
        success: true,
        alreadySent: true,
        message: 'Gift certificate was already sent',
      })
    }

    // Extract and sanitize gift data from session metadata
    const giftData = {
      code: sanitizeText(session.metadata.giftCode)?.slice(0, 50) || '',
      recipientName: sanitizeText(session.metadata.recipientName)?.slice(0, 100) || '',
      recipientEmail: sanitizeEmail(session.metadata.recipientEmail) || '',
      senderName: sanitizeText(session.metadata.senderName)?.slice(0, 100) || '',
      message: sanitizeText(session.metadata.message)?.slice(0, 500) || '',
      amount: session.metadata.amount,
    }

    const { code, recipientName, recipientEmail, senderName, amount } = giftData

    console.log('Processing verified gift certificate:', { 
      code, 
      recipientName, 
      recipientEmail: recipientEmail.substring(0, 3) + '***', // Log partial email for privacy
      senderName,
      amount,
      sessionId: sessionId.substring(0, 15) + '***'
    })

    // Validate required fields from metadata
    if (!code || !recipientName || !recipientEmail || !senderName || !amount) {
      console.error('Missing required fields in session metadata:', { 
        hasCode: !!code, 
        hasRecipientName: !!recipientName, 
        hasRecipientEmail: !!recipientEmail, 
        hasSenderName: !!senderName, 
        hasAmount: !!amount 
      })
      return Response.json(
        { error: 'Missing required gift certificate data in payment session' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(recipientEmail)) {
      console.error('Invalid recipient email format')
      return Response.json(
        { error: 'Invalid recipient email' },
        { status: 400 }
      )
    }

    // Generate email HTML
    const emailHtml = createGiftCertificateEmail(giftData)

    console.log('Sending gift certificate email to:', recipientEmail.substring(0, 3) + '***')

    // Send the email
    const emailResponse = await resend.emails.send({
      from: 'Impress Cleaning Services Gift Certificate <gifts@impressyoucleaning.com>',
      to: recipientEmail,
      subject: `Your $${amount} Gift Certificate from ${senderName}`,
      html: emailHtml,
    })

    console.log('Resend response:', emailResponse)

    if (!emailResponse.data) {
      console.error('No data in email response:', emailResponse)
      throw new Error('Failed to send email - no response data')
    }

    // Mark the session as processed to prevent duplicate emails
    // Note: Stripe metadata is immutable after session creation, so we'd need
    // a database to properly track this. For now, we rely on the success page
    // only calling this once. For production, consider:
    // 1. Using a database to track sent gift certificates
    // 2. Using Stripe webhooks (checkout.session.completed) instead
    
    console.log('Gift certificate email sent successfully:', {
      emailId: emailResponse.data.id,
      sessionId: sessionId.substring(0, 15) + '***'
    })

    return Response.json({
      success: true,
      emailId: emailResponse.data.id,
      message: 'Gift certificate sent successfully',
    })

  } catch (error) {
    console.error('Error sending gift certificate email:', error)
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack?.substring(0, 500)
    })

    return Response.json(
      {
        error: error.message || 'Failed to send gift certificate email',
        details: process.env.NODE_ENV === 'development' ? error.stack : null
      },
      { status: 500 }
    )
  }
}