import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function DELETE() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = user.id
  const userEmail = user.email

  // Get user's name before anonymization
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('full_name')
    .eq('id', userId)
    .single()

  const userName = profile?.full_name || 'Valued Customer'

  try {
    // Soft delete: Update profile status and anonymize PII
    await supabaseAdmin
      .from('profiles')
      .update({
        account_status: 'deleted',
        deleted_at: new Date().toISOString(),
        email: `deleted_${userId}@removed.local`,
        phone: null,
        // Keep full_name for business record context
      })
      .eq('id', userId)

    // Anonymize addresses (keep structure for appointment history context)
    await supabaseAdmin
      .from('service_addresses')
      .update({
        street_address: 'Address Removed',
        unit: null,
        city: 'Removed',
        state: 'XX',
        zip_code: '00000',
        is_primary: false,
      })
      .eq('user_id', userId)

    // Delete payment methods (security - don't retain card data)
    await supabaseAdmin
      .from('payment_methods')
      .delete()
      .eq('user_id', userId)

    // Delete auth user (prevents login, but profile record remains)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (authError) throw authError

    // Send confirmation email
    try {
      await resend.emails.send({
        from: 'Impress Cleaning Services <notifications@impressyoucleaning.com>',
        to: userEmail,
        subject: 'Your Account Has Been Deleted',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #1C294E 0%, #2d3a5f 100%); padding: 32px 40px; text-align: center;">
                        <img src="https://impressyoucleaning.com/ImpressLogoNoBackground.png" alt="Impress Cleaning Services" style="height: 48px; width: auto;">
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 700; color: #1C294E;">
                          Account Deleted
                        </h1>
                        
                        <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #475569;">
                          Hi ${userName},
                        </p>
                        
                        <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #475569;">
                          This email confirms that your Impress Cleaning Services account has been successfully deleted as requested.
                        </p>
                        
                        <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #475569;">
                          Your personal information and payment methods have been removed from our system. We may retain basic records for legal and accounting purposes.
                        </p>
                        
                        <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #475569;">
                          We're sorry to see you go. If you ever need cleaning services in the future, we'd be happy to welcome you back.
                        </p>
                        
                        <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #475569;">
                          Thank you for being a customer.<br><br>
                          Best wishes,<br>
                          <strong style="color: #1C294E;">The Impress Cleaning Team</strong>
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b;">
                          Questions? Contact us at
                        </p>
                        <a href="mailto:admin@impressyoucleaning.com" style="color: #079447; text-decoration: none; font-weight: 600;">
                          admin@impressyoucleaning.com
                        </a>
                        <p style="margin: 16px 0 0 0; font-size: 12px; color: #94a3b8;">
                          © ${new Date().getFullYear()} Impress Cleaning Services, LLC. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      })
    } catch (emailError) {
      console.error('Failed to send deletion confirmation email:', emailError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete account error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}