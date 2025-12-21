import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Resend } from 'resend'
import { sanitizeText, sanitizeEmail } from '@/lib/sanitize'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const resend = new Resend(process.env.RESEND_API_KEY)
const SITE_URL = 'https://impressyoucleaning.com'

export async function POST(request) {
  try {
    const { invoiceId, sendNotificationEmail = true } = await request.json()

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'invoiceId is required' },
        { status: 400 }
      )
    }

    // 1. Get invoice details
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .select('*, profiles!customer_id(first_name, email)')
      .eq('id', invoiceId)
      .single()

    if (invoiceError || !invoice) {
      console.error('Invoice error:', invoiceError)
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Check if invoice is in draft status
    if (invoice.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft invoices can be sent' },
        { status: 400 }
      )
    }

    // 2. Get customer info - either from profiles or customer_email
    let customerEmail = null
    let customerName = null
    let customerId = null
    let stripeCustomerId = null

    if (invoice.customer_id) {
      const { data: customer, error: customerError } = await supabaseAdmin
        .from('profiles')
        .select('id, email, full_name, stripe_customer_id')
        .eq('id', invoice.customer_id)
        .single()

      if (customerError || !customer) {
        console.error('Customer error:', customerError)
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        )
      }

      customerEmail = sanitizeEmail(customer.email)
      customerName = sanitizeText(customer.full_name)?.slice(0, 100) || customer.email.split('@')[0]
      customerId = customer.id
      stripeCustomerId = customer.stripe_customer_id
    } else if (invoice.customer_email) {
      customerEmail = sanitizeEmail(invoice.customer_email)
      customerName = 'Customer'
    } else {
      return NextResponse.json(
        { error: 'No customer email associated with invoice' },
        { status: 400 }
      )
    }

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Invalid customer email' },
        { status: 400 }
      )
    }

    // 3. Create or retrieve Stripe customer
    // First, verify existing stripe_customer_id is still valid
    if (stripeCustomerId) {
      try {
        await stripe.customers.retrieve(stripeCustomerId)
      } catch (err) {
        console.log(`Stripe customer ${stripeCustomerId} not found, will create new one`)
        stripeCustomerId = null
        // Clear invalid ID from profile
        if (customerId) {
          await supabaseAdmin
            .from('profiles')
            .update({ stripe_customer_id: null })
            .eq('id', customerId)
        }
      }
    }

    if (!stripeCustomerId) {
      // Check if a Stripe customer already exists with this email
      const existingCustomers = await stripe.customers.list({
        email: customerEmail,
        limit: 1
      })

      if (existingCustomers.data.length > 0) {
        stripeCustomerId = existingCustomers.data[0].id
      } else {
        // Create new Stripe customer
        const stripeCustomer = await stripe.customers.create({
          email: customerEmail,
          name: customerName,
          metadata: {
            supabase_user_id: customerId || 'email_only',
            invoice_id: invoiceId
          }
        })
        stripeCustomerId = stripeCustomer.id
      }

      // Save stripe_customer_id to profile if we have a customer_id
      if (customerId) {
        await supabaseAdmin
          .from('profiles')
          .update({
            stripe_customer_id: stripeCustomerId,
            updated_at: new Date().toISOString()
          })
          .eq('id', customerId)
      }
    }

    // 4. Create invoice items FIRST (as pending items for the customer)
    const lineItems = invoice.line_items || []

    if (lineItems.length > 0) {
      for (const item of lineItems) {
        const description = sanitizeText(item.description)?.slice(0, 250) || 'Service'

        await stripe.invoiceItems.create({
          customer: stripeCustomerId,
          description: description,
          amount: Math.round(parseFloat(item.rate) * (item.quantity || 1) * 100),
          currency: 'usd'
        })
      }
    } else {
      // Fallback: create single line item from invoice amount
      await stripe.invoiceItems.create({
        customer: stripeCustomerId,
        description: `Invoice ${invoice.invoice_number}`,
        amount: Math.round(parseFloat(invoice.amount) * 100),
        currency: 'usd'
      })
    }

    // Add tax if present
    if (invoice.tax_amount && parseFloat(invoice.tax_amount) > 0) {
      await stripe.invoiceItems.create({
        customer: stripeCustomerId,
        description: `Tax (${invoice.tax_rate || 0}%)`,
        amount: Math.round(parseFloat(invoice.tax_amount) * 100),
        currency: 'usd'
      })
    }

    // 5. Create Stripe Invoice (includes pending invoice items automatically)
    // Calculate days until due with timezone-safe date handling
    let daysUntilDue = 7 // default
    if (invoice.due_date) {
      // Parse due_date as local date (YYYY-MM-DD -> local midnight)
      const dueDate = new Date(invoice.due_date + 'T00:00:00')
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset to local midnight for accurate day diff
      const diffTime = dueDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      daysUntilDue = Math.max(1, diffDays) // Stripe requires at least 1 day
    }

    const stripeInvoice = await stripe.invoices.create({
      customer: stripeCustomerId,
      number: invoice.invoice_number,
      collection_method: 'send_invoice',
      days_until_due: daysUntilDue,
      pending_invoice_items_behavior: 'include',
      metadata: {
        supabase_invoice_id: invoice.id,
        invoice_number: invoice.invoice_number
      }
    })

    // 6. Finalize the Stripe Invoice (do NOT call sendInvoice - we use our own email)
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(stripeInvoice.id, {
      auto_advance: false  // Prevent Stripe from auto-sending emails
    })

    // 7. Update Supabase invoice with Stripe details
    // Check if webhook already updated it (race condition)
    const { data: currentInvoice } = await supabaseAdmin
      .from('invoices')
      .select('stripe_invoice_id, status, due_date')
      .eq('id', invoice.id)
      .single()

    // Calculate the actual due date that was set in Stripe
    const actualDueDate = invoice.due_date || new Date(Date.now() + daysUntilDue * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Only update if webhook hasn't already done it
    if (!currentInvoice?.stripe_invoice_id) {
      const { error: updateError } = await supabaseAdmin
        .from('invoices')
        .update({
          stripe_invoice_id: finalizedInvoice.id,
          status: 'sent',
          due_date: actualDueDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', invoice.id)

      if (updateError) {
        console.error('Update error:', updateError)
        // Don't fail - invoice was sent successfully
      }
    } else {
      // Still update due_date if it wasn't set
      if (!currentInvoice.due_date) {
        await supabaseAdmin
          .from('invoices')
          .update({ due_date: actualDueDate, updated_at: new Date().toISOString() })
          .eq('id', invoice.id)
      }
    }

    // 8. Create customer notification
    if (customerId) {
      const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(invoice.total || invoice.amount)

      await supabaseAdmin
        .from('customer_notifications')
        .insert({
          user_id: customerId,
          type: 'invoice_sent',
          title: 'New Invoice Ready',
          message: `Invoice ${invoice.invoice_number} for ${formattedAmount} is ready for payment`,
          link: `/portal/invoices/${invoice.id}/pay`,
          reference_id: invoice.id,
          reference_type: 'invoice'
        })
    }


    // 9. Send notification email (if enabled)
    let emailSent = false
    if (sendNotificationEmail && invoice.profiles?.email && invoice.profiles?.first_name) {
      try {
        const firstName = invoice.profiles.first_name
        const emailHtml = generateInvoiceReadyEmail(firstName)

        const { error: emailError } = await resend.emails.send({
          from: 'Impress Cleaning Services <notifications@impressyoucleaning.com>',
          to: invoice.profiles.email,
          subject: `${firstName}, You have a new invoice`,
          html: emailHtml,
        })

        emailSent = !emailError
        if (emailError) {
          console.error('Failed to send notification email:', emailError)
        }
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError)
        // Don't fail the whole request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      stripeInvoiceId: finalizedInvoice.id,
      hostedInvoiceUrl: finalizedInvoice.hosted_invoice_url,
      notificationEmailSent: emailSent
    })
  } catch (error) {
    console.error('Error sending invoice:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// Email template for invoice notification
function generateInvoiceReadyEmail(firstName) {
  const loginLink = `${SITE_URL}/auth/login`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>New Invoice Ready</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#ffffff;">
    <tr>
      <td style="padding:24px 0 0 0;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" align="center" style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
          <!-- LOGO HEADER -->
          <tr>
            <td align="center" style="background:linear-gradient(180deg,#d5d8dc 0%,#cdd0d4 50%,#d5d8dc 100%);padding:35px 0;">
              <img src="https://bzcdasbrdaonxpomzakh.supabase.co/storage/v1/object/public/public-assets/logo_impress_white.png" alt="Impress Cleaning Services" width="200" style="display:block;width:200px;height:auto;" />
            </td>
          </tr>
          <!-- TITLE / COPY -->
          <tr>
            <td style="padding:32px 32px 8px;">
              <p style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6b7280;margin:0 0 8px;">NEW INVOICE</p>
              <h1 style="font-size:28px;line-height:1.2;font-weight:700;color:#111827;margin:0 0 12px;">Hi ${firstName}, You Have a New Invoice</h1>
              <p style="font-size:15px;line-height:1.6;color:#4b5563;margin:0;">A new invoice has been added to your account. Sign in to your customer portal to view the details and make a payment.</p>
            </td>
          </tr>
          <!-- BUTTON -->
          <tr>
            <td style="padding:24px 32px 8px;text-align:center;">
              <a href="${loginLink}" style="display:inline-block;background-color:#079447;color:#ffffff !important;text-decoration:none;padding:18px 48px;border-radius:999px;font-size:16px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">LOG IN NOW</a>
            </td>
          </tr>
          <!-- HELP BOX -->
          <tr>
            <td style="padding:32px;">
              <table role="presentation" width="320" cellspacing="0" cellpadding="0" align="center" style="background-color:#f3f4f6;border-radius:10px;">
                <tr>
                  <td style="padding:18px 24px;text-align:center;">
                    <p style="margin:0 0 4px 0;font-weight:600;font-size:12px;color:#374151;">Have a question?</p>
                    <p style="margin:4px 0 0;font-size:12px;"><a href="mailto:billing@impressyoucleaning.com" style="color:#079447;text-decoration:none;border-bottom:1px solid #079447;">Reach out to our team</a></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- FOOTER -->
          <tr>
            <td style="padding:28px 32px;border-top:1px solid #e5e7eb;">
              <p style="font-size:11px;font-weight:600;color:#6b7280;margin:2px 0;">Impress Cleaning Services, LLC</p>
              <p style="font-size:10px;color:#6b7280;margin:2px 0;">1530 Sun City Blvd, Suite 120-403, Georgetown, TX 78633</p>
              <p style="font-size:10px;color:#6b7280;margin:2px 0;">© 2025 Impress Cleaning Services, LLC. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
