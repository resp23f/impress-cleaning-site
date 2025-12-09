import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { sanitizeText, sanitizeEmail } from '@/lib/sanitize'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const { Resend } = require('resend')
const resend = new Resend(process.env.RESEND_API_KEY)

// Invoice payment link email template
function createInvoiceEmail({ name, invoiceNumber, amount, dueDate, paymentUrl }) {
  const formattedAmount = parseFloat(amount).toFixed(2)
  const formattedDueDate = dueDate 
    ? new Date(dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/Chicago' })
    : 'Upon Receipt'

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Invoice from Impress Cleaning Services</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="width:100%;padding:32px 16px;">
    <div style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.06);">

      <!-- LOGO HEADER -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center" style="padding:0;">
            <div style="background:linear-gradient(135deg,#1e293b 0%,#334155 100%);padding:32px 0;">
              <img src="https://impressyoucleaning.com/logo_impress_white.png" alt="Impress Cleaning Services" style="height:56px;width:auto;" />
            </div>
          </td>
        </tr>
      </table>

      <!-- INVOICE BADGE -->
      <div style="padding:32px 40px 0;text-align:center;">
        <div style="display:inline-block;background:linear-gradient(135deg,#ecfdf5 0%,#d1fae5 100%);border:1px solid #a7f3d0;border-radius:100px;padding:8px 20px;">
          <span style="font-size:12px;font-weight:600;color:#059669;letter-spacing:0.05em;text-transform:uppercase;">New Invoice</span>
        </div>
      </div>

      <!-- GREETING -->
      <div style="padding:24px 40px 0;text-align:center;">
        <h1 style="font-size:26px;font-weight:700;color:#0f172a;margin:0 0 8px;">Hi ${name},</h1>
        <p style="font-size:15px;color:#64748b;margin:0;line-height:1.6;">Here's your invoice from Impress Cleaning Services.</p>
      </div>

      <!-- INVOICE CARD -->
      <div style="padding:28px 40px;">
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
          
          <!-- Invoice Header -->
          <div style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td>
                  <p style="font-size:11px;color:#94a3b8;margin:0 0 2px;text-transform:uppercase;letter-spacing:0.08em;">Invoice Number</p>
                  <p style="font-size:15px;font-weight:600;color:#1e293b;margin:0;">${invoiceNumber}</p>
                </td>
                <td align="right">
                  <p style="font-size:11px;color:#94a3b8;margin:0 0 2px;text-transform:uppercase;letter-spacing:0.08em;">Due Date</p>
                  <p style="font-size:15px;font-weight:600;color:#1e293b;margin:0;">${formattedDueDate}</p>
                </td>
              </tr>
            </table>
          </div>

          <!-- Total -->
          <div style="padding:20px 24px;background:linear-gradient(135deg,#f1f5f9 0%,#e2e8f0 100%);">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td>
                  <p style="font-size:14px;font-weight:600;color:#475569;margin:0;">Amount Due</p>
                </td>
                <td align="right">
                  <p style="font-size:28px;font-weight:700;color:#0f172a;margin:0;">$${formattedAmount}</p>
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>

      <!-- PAY BUTTON -->
      <div style="padding:0 40px 32px;text-align:center;">
        <a href="${paymentUrl}" style="display:inline-block;background:linear-gradient(135deg,#059669 0%,#10b981 100%);color:#ffffff;text-decoration:none;padding:16px 48px;border-radius:100px;font-size:15px;font-weight:600;letter-spacing:0.03em;box-shadow:0 8px 24px rgba(5,150,105,0.3);">Pay Now</a>
        <p style="margin-top:16px;font-size:13px;color:#94a3b8;">Secure payment powered by Stripe</p>
      </div>

      <!-- DIVIDER -->
      <div style="padding:0 40px;">
        <div style="height:1px;background:linear-gradient(90deg,transparent,#e2e8f0,transparent);"></div>
      </div>

      <!-- PAYMENT OPTIONS -->
      <div style="padding:28px 40px;text-align:center;">
        <p style="font-size:13px;color:#64748b;margin:0 0 12px;">Prefer another payment method?</p>
        <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
          <tr>
            <td style="padding:0 8px;">
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;">
                <p style="font-size:12px;font-weight:600;color:#475569;margin:0;">Zelle</p>
                <p style="font-size:11px;color:#94a3b8;margin:4px 0 0;">billing@impressyoucleaning.com</p>
              </div>
            </td>
          </tr>
        </table>
        <p style="font-size:11px;color:#94a3b8;margin:12px 0 0;">Include invoice number ${invoiceNumber} in your payment memo</p>
      </div>

      <!-- HELP BOX -->
      <div style="padding:0 40px 32px;">
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;text-align:center;">
          <p style="font-size:13px;font-weight:600;color:#475569;margin:0 0 4px;">Questions about this invoice?</p>
          <p style="font-size:13px;color:#64748b;margin:0;">Reply to this email or call <a href="tel:5129989658" style="color:#059669;text-decoration:none;font-weight:500;">(512) 998-9658</a></p>
        </div>
      </div>

      <!-- FOOTER -->
      <div style="padding:24px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;">
        <p style="font-size:12px;font-weight:600;color:#64748b;margin:0 0 4px;">Impress Cleaning Services, LLC</p>
        <p style="font-size:11px;color:#94a3b8;margin:0 0 2px;">1530 Sun City Blvd, Suite 120-403, Georgetown, TX 78633</p>
        <p style="font-size:11px;color:#94a3b8;margin:0;">© 2025 Impress Cleaning Services, LLC. All rights reserved.</p>
      </div>

    </div>

    <!-- FOOTER LINKS -->
    <div style="text-align:center;padding:24px 0;">
      <a href="https://impressyoucleaning.com/portal/invoices" style="font-size:12px;color:#64748b;text-decoration:none;">View in Portal</a>
      <span style="color:#cbd5e1;margin:0 12px;">•</span>
      <a href="https://impressyoucleaning.com/portal/settings" style="font-size:12px;color:#64748b;text-decoration:none;">Manage Preferences</a>
    </div>

  </div>
</body>
</html>
  `
}
export async function POST(request) {
  try {
    const { invoiceId } = await request.json()

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'invoiceId is required' },
        { status: 400 }
      )
    }

    // 1. Get invoice details
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .select('*')
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
        await stripe.invoiceItems.create({
          customer: stripeCustomerId,
          description: sanitizeText(item.description)?.slice(0, 200) || 'Service',
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
    const stripeInvoice = await stripe.invoices.create({
      customer: stripeCustomerId,
      number: invoice.invoice_number,
      collection_method: 'send_invoice',
      days_until_due: invoice.due_date
        ? Math.max(1, Math.ceil((new Date(invoice.due_date) - new Date()) / (1000 * 60 * 60 * 24)))
        : 7,
      pending_invoice_items_behavior: 'include',
      metadata: {
        supabase_invoice_id: invoice.id,
        invoice_number: invoice.invoice_number
      }
    })
    
// 6. Finalize the Stripe Invoice (don't call sendInvoice - we send our own email)
    const sentInvoice = await stripe.invoices.finalizeInvoice(stripeInvoice.id)
    
// 7. Update Supabase invoice with Stripe details
    // Check if webhook already updated it (race condition)
    const { data: currentInvoice } = await supabaseAdmin
      .from('invoices')
      .select('stripe_invoice_id, status')
      .eq('id', invoice.id)
      .single()

    // Only update if webhook hasn't already done it
    if (!currentInvoice?.stripe_invoice_id) {
      const { error: updateError } = await supabaseAdmin
        .from('invoices')
        .update({
          stripe_invoice_id: sentInvoice.id,
          status: 'sent',
          updated_at: new Date().toISOString()
        })
        .eq('id', invoice.id)

      if (updateError) {
        console.error('Update error:', updateError)
        // Don't fail - invoice was sent successfully
      }
    } else {
      console.log('Webhook already updated invoice, skipping duplicate update')
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
          link: '/portal/invoices',
          reference_id: invoice.id,
          reference_type: 'invoice'
        })
    }

// 9. Send email with payment link
    try {
      const { error: emailError } = await resend.emails.send({
        from: 'Impress Cleaning Services <notifications@impressyoucleaning.com>',
        to: customerEmail,
        subject: `Invoice ${invoice.invoice_number} - Payment Required`,
        html: createInvoiceEmail({
          name: customerName,
          invoiceNumber: invoice.invoice_number,
          amount: invoice.total || invoice.amount,
          dueDate: invoice.due_date,
          paymentUrl: sentInvoice.hosted_invoice_url
        })
      })

      if (emailError) {
        console.error('Failed to send invoice email:', emailError)
      } else {
        console.log(`Invoice email sent successfully to ${customerEmail}`)
      }
    } catch (emailError) {
      console.error('Error sending invoice email:', emailError)
    }
    
    return NextResponse.json({
      success: true,
      stripeInvoiceId: sentInvoice.id,
      hostedInvoiceUrl: sentInvoice.hosted_invoice_url
    })
  } catch (error) {
    console.error('Error sending invoice:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
