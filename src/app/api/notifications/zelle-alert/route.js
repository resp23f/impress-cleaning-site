import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { invoiceId, customerName, amount } = await request.json()

    if (!invoiceId) {
      return NextResponse.json({ error: 'invoiceId is required' }, { status: 400 })
    }

    // Get invoice details if not provided
    let invoiceNumber = null
    let finalCustomerName = customerName
    let finalAmount = amount

    if (!customerName || !amount) {
      const { data: invoice } = await supabaseAdmin
        .from('invoices')
        .select('invoice_number, total, amount, profiles:customer_id(full_name)')
        .eq('id', invoiceId)
        .single()

      if (invoice) {
        invoiceNumber = invoice.invoice_number
        finalCustomerName = customerName || invoice.profiles?.full_name || 'Customer'
        finalAmount = amount || invoice.total || invoice.amount
      }
    }

    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(finalAmount)

    const adminEmail = 'admin@impressyoucleaning.com'

    // 1. Send full email notification to admin
    if (adminEmail) {
      try {
        await resend.emails.send({
          from: 'Impress Cleaning <notifications@impressyoucleaning.com>',
          to: adminEmail,
          subject: `Zelle Payment Claimed - ${invoiceNumber || invoiceId}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                      <!-- Header -->
                      <tr>
                        <td style="background-color: #7c3aed; padding: 30px; text-align: center;">
                          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Zelle Payment Claimed</h1>
                        </td>
                      </tr>
                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px 30px;">
                          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                            A customer has claimed to have sent a Zelle payment. Please verify this payment in your Zelle account.
                          </p>

                          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                            <tr>
                              <td>
                                <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">Customer</p>
                                <p style="color: #111827; font-size: 18px; font-weight: 600; margin: 0 0 20px 0;">${finalCustomerName}</p>

                                <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">Invoice</p>
                                <p style="color: #111827; font-size: 18px; font-weight: 600; margin: 0 0 20px 0;">${invoiceNumber || invoiceId}</p>

                                <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">Amount</p>
                                <p style="color: #111827; font-size: 24px; font-weight: 700; margin: 0;">${formattedAmount}</p>
                              </td>
                            </tr>
                          </table>

                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td align="center">
                                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/invoices" style="display: inline-block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">View Invoice</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center;">
                          <p style="color: #6b7280; font-size: 12px; margin: 0;">
                            This is an automated notification from Impress Cleaning Services
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
        })
      } catch (emailError) {
        console.error('Error sending Zelle alert email:', emailError)
      }
    }

    // 2. Send SMS via email gateway (T-Mobile)
    const smsGatewayEmail = '5129989658@tmomail.net'
    try {
      // Keep total message under 160 characters for SMS
      const shortName = finalCustomerName.length > 15
        ? finalCustomerName.substring(0, 15) + '...'
        : finalCustomerName
      const shortInvoice = invoiceNumber || invoiceId.substring(0, 8)

      await resend.emails.send({
        from: 'Impress <notifications@impressyoucleaning.com>',
        to: smsGatewayEmail,
        subject: 'Zelle Claimed',
        text: `${shortName} - ${formattedAmount} - ${shortInvoice}. Verify payment.`
      })
    } catch (smsError) {
      console.error('Error sending SMS via email gateway:', smsError)
    }

    // 3. Create admin notification in database
    await supabaseAdmin
      .from('admin_notifications')
      .insert({
        type: 'zelle_claimed',
        title: 'Zelle Payment Claimed',
        message: `${finalCustomerName} claims Zelle payment of ${formattedAmount} for Invoice ${invoiceNumber || invoiceId}. Verification required.`,
        link: '/admin/invoices'
      })

    // 4. Create customer notification (pending verification)
    const { data: invoice } = await supabaseAdmin
      .from('invoices')
      .select('customer_id')
      .eq('id', invoiceId)
      .single()

    if (invoice?.customer_id) {
      await supabaseAdmin
        .from('customer_notifications')
        .insert({
          user_id: invoice.customer_id,
          type: 'zelle_pending',
          title: 'Zelle Payment Pending',
          message: `Your Zelle payment claim for Invoice ${invoiceNumber || invoiceId} is being verified`,
          link: '/portal/invoices',
          reference_id: invoiceId,
          reference_type: 'invoice'
        })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending Zelle alert:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
