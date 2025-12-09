import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Resend } from 'resend'
import { sanitizeText, sanitizeEmail } from '@/lib/sanitize'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const resend = new Resend(process.env.RESEND_API_KEY)

// Validated internal API base URL
const INTERNAL_API_URL = (() => {
  const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://impressyoucleaning.com'
  const allowed = ['https://impressyoucleaning.com', 'https://www.impressyoucleaning.com', 'http://localhost:3000']
  if (allowed.some(domain => url.startsWith(domain))) {
    return url
  }
  return 'https://impressyoucleaning.com'
})()

// Gift certificate email template
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
        <table width="650" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 0; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a4d2e 0%, #2d6a4f 50%, #1a4d2e 100%); padding: 60px 40px; text-align: center;">
              <div style="border-bottom: 2px solid rgba(212, 175, 55, 0.3); padding-bottom: 20px; margin-bottom: 20px;">
                <h1 style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 400; letter-spacing: 3px; text-transform: uppercase;">Impress Cleaning Services</h1>
              </div>
              <h2 style="margin: 0; color: #d4af37; font-size: 42px; font-weight: 300; letter-spacing: 1px;">A Gift For You</h2>
              <p style="margin: 15px 0 0; color: #e8f5e9; font-size: 16px; font-weight: 300; letter-spacing: 0.5px;">From ${senderName}</p>
            </td>
          </tr>
          ${message ? `
          <tr>
            <td style="padding: 40px 50px; background: linear-gradient(to bottom, #fafafa 0%, #ffffff 100%); border-bottom: 1px solid #e8e8e8;">
              <p style="margin: 0 0 12px; color: #1a4d2e; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">A Personal Note</p>
              <p style="margin: 0; color: #2d3748; font-size: 17px; line-height: 1.8; font-style: italic; font-family: 'Georgia', serif;">"${message}"</p>
            </td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 50px 50px 40px; text-align: center;">
              <p style="margin: 0 0 30px; color: #2d3748; font-size: 20px; font-weight: 300; font-family: 'Georgia', serif;">
                Dear ${recipientName},
              </p>
              <p style="margin: 0 0 40px; color: #4a5568; font-size: 16px; line-height: 1.8; font-weight: 300;">
                Someone special has chosen to gift you the luxury of a professionally cleaned home or business.
              </p>
              <div style="background: linear-gradient(135deg, #1a4d2e 0%, #2d6a4f 100%); border-radius: 4px; padding: 40px; margin: 0 0 40px; box-shadow: 0 4px 16px rgba(26, 77, 46, 0.2);">
                <p style="margin: 0 0 12px; color: #d4af37; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Certificate Value</p>
                <p style="margin: 0; color: #ffffff; font-size: 56px; font-weight: 300; letter-spacing: -1px;">$${amount}</p>
              </div>
              <div style="background-color: #fafafa; border: 1px solid #e0e0e0; border-radius: 2px; padding: 35px 30px; margin: 0 0 40px;">
                <p style="margin: 0 0 18px; color: #718096; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Your Certificate Code</p>
                <div style="background-color: #ffffff; border: 2px solid #1a4d2e; border-radius: 2px; padding: 20px; margin: 0 0 18px;">
                  <p style="margin: 0; color: #1a4d2e; font-size: 28px; font-weight: 600; font-family: 'Courier New', monospace; letter-spacing: 3px;">${code}</p>
                </div>
                <p style="margin: 0; color: #a0aec0; font-size: 13px; font-weight: 300;">Please retain this code for redemption</p>
              </div>
            </td>
          </tr>
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
          <tr>
            <td style="padding: 0 50px 50px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://impressyoucleaning.com'}"
                 style="display: inline-block; background: linear-gradient(135deg, #1a4d2e 0%, #2d6a4f 100%); color: #ffffff; text-decoration: none; padding: 18px 55px; border-radius: 2px; font-size: 15px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase; box-shadow: 0 4px 12px rgba(26, 77, 46, 0.3);">
                Schedule Service
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 50px 50px;">
              <div style="background-color: #fffef7; border-left: 3px solid #d4af37; padding: 25px 30px; border-radius: 2px;">
                <p style="margin: 0; color: #5a4a2a; font-size: 14px; line-height: 1.7; font-weight: 300;">
                  <strong style="font-weight: 600;">Important Notice:</strong> This certificate never expires. Book now for priority scheduling during our busy season! For inquiries, please contact our team.
                </p>
              </div>
            </td>
          </tr>
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

// Handle gift certificate email sending
async function handleGiftCertificate(session) {
  const metadata = session.metadata

  const giftData = {
    code: sanitizeText(metadata.giftCode)?.slice(0, 50) || '',
    recipientName: sanitizeText(metadata.recipientName)?.slice(0, 100) || '',
    recipientEmail: sanitizeEmail(metadata.recipientEmail) || '',
    senderName: sanitizeText(metadata.senderName)?.slice(0, 100) || '',
    message: sanitizeText(metadata.message)?.slice(0, 500) || '',
    amount: metadata.amount,
  }

  const { code, recipientName, recipientEmail, senderName, amount } = giftData

  if (!code || !recipientName || !recipientEmail || !senderName || !amount) {
    console.error('Gift certificate missing required fields:', {
      hasCode: !!code,
      hasRecipientName: !!recipientName,
      hasRecipientEmail: !!recipientEmail,
      hasSenderName: !!senderName,
      hasAmount: !!amount,
    })
    return { success: false, error: 'Missing required fields' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(recipientEmail)) {
    console.error('Invalid recipient email format:', recipientEmail.substring(0, 5) + '***')
    return { success: false, error: 'Invalid email format' }
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured')
    return { success: false, error: 'Email service not configured' }
  }

  const emailHtml = createGiftCertificateEmail(giftData)

  try {
    const emailResponse = await resend.emails.send({
      from: 'Impress Cleaning Services Gift Certificate <gifts@impressyoucleaning.com>',
      to: recipientEmail,
      subject: `Your $${amount} Gift Certificate from ${senderName}`,
      html: emailHtml,
    })

    if (!emailResponse.data) {
      console.error('No data in Resend response:', emailResponse)
      return { success: false, error: 'Email send failed' }
    }

    console.log('Gift certificate email sent successfully:', {
      emailId: emailResponse.data.id,
      code: code,
      recipient: recipientEmail.substring(0, 3) + '***',
    })

    return { success: true, emailId: emailResponse.data.id }
  } catch (emailError) {
    console.error('Failed to send gift certificate email:', emailError)
    return { success: false, error: emailError.message }
  }
}

// Handle Stripe Dashboard invoice - creates/updates invoice in portal
async function handleStripeInvoice(stripeInvoice, eventType) {
  const customerEmail = stripeInvoice.customer_email?.toLowerCase()

  if (!customerEmail) {
    console.log('Stripe invoice has no customer email, skipping portal sync')
    return { success: false, error: 'No customer email' }
  }

  // Check if invoice already exists in our system
  const { data: existingInvoice } = await supabaseAdmin
    .from('invoices')
    .select('id, status')
    .eq('stripe_invoice_id', stripeInvoice.id)
    .single()

  // Look up customer by email
  const { data: customer, error: customerError } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, email')
    .ilike('email', customerEmail)
    .single()

  if (customerError) {
    console.log('Profile lookup failed:', customerError.message, '- will use Stripe email as fallback')
  }

  // Build line items from Stripe invoice
  const lineItems = (stripeInvoice.lines?.data || []).map(line => ({
    description: line.description || 'Service',
    quantity: line.quantity || 1,
    rate: (line.unit_amount || line.amount) / 100,
    amount: line.amount / 100,
  }))

  // Calculate totals
  const subtotal = stripeInvoice.subtotal / 100
  const taxAmount = (stripeInvoice.tax || 0) / 100
  const total = stripeInvoice.total / 100
  const taxRate = subtotal > 0 ? ((taxAmount / subtotal) * 100).toFixed(2) : 0

  // Determine status
  let status = 'sent'
  if (stripeInvoice.status === 'paid') {
    status = 'paid'
  } else if (stripeInvoice.status === 'void' || stripeInvoice.status === 'uncollectible') {
    status = 'cancelled'
  } else if (stripeInvoice.due_date && stripeInvoice.due_date * 1000 < Date.now()) {
    status = 'overdue'
  }

  const invoiceData = {
    invoice_number: stripeInvoice.number || `STRIPE-${stripeInvoice.id.slice(-8).toUpperCase()}`,
    customer_id: customer?.id || null,
    customer_email: customerEmail,
    stripe_invoice_id: stripeInvoice.id,
    ...(stripeInvoice.payment_intent && { stripe_payment_intent_id: stripeInvoice.payment_intent }),
    amount: subtotal,
    tax_rate: parseFloat(taxRate),
    tax_amount: taxAmount,
    total: total,
    status: status,
    due_date: stripeInvoice.due_date
      ? new Date(stripeInvoice.due_date * 1000).toISOString().split('T')[0]
      : null,
    paid_date: stripeInvoice.status === 'paid' && stripeInvoice.status_transitions?.paid_at
      ? new Date(stripeInvoice.status_transitions.paid_at * 1000).toISOString().split('T')[0]
      : null,
    payment_method: stripeInvoice.status === 'paid' ? 'stripe' : null,
    line_items: lineItems,
    notes: stripeInvoice.description || null,
    updated_at: new Date().toISOString(),
  }

  // Use customer email from profile, fallback to Stripe email
  const emailRecipient = customer?.email || customerEmail
  const emailName = customer?.full_name || emailRecipient.split('@')[0]

  try {
    if (existingInvoice) {
      // Update existing invoice
      const { error } = await supabaseAdmin
        .from('invoices')
        .update(invoiceData)
        .eq('id', existingInvoice.id)

      if (error) throw error

      console.log(`Updated invoice ${invoiceData.invoice_number} (${eventType})`)

      // Create customer notifications based on event type (with duplicate check)
      if (customer?.id) {
        if (eventType === 'finalized') {
          // Check if notification already exists (prevent duplicates from send route)
          const { data: existingNotif } = await supabaseAdmin
            .from('customer_notifications')
            .select('id')
            .eq('reference_id', existingInvoice.id)
            .eq('type', 'invoice_sent')
            .single()

          if (!existingNotif) {
            await supabaseAdmin
              .from('customer_notifications')
              .insert({
                user_id: customer.id,
                type: 'invoice_sent',
                title: 'New Invoice Ready',
                message: `Invoice ${invoiceData.invoice_number} for $${total.toFixed(2)} is ready for payment`,
                link: '/portal/invoices',
                reference_id: existingInvoice.id,
                reference_type: 'invoice'
              })
          }
        } else if (eventType === 'paid') {
          // Check if notification already exists
          const { data: existingNotif } = await supabaseAdmin
            .from('customer_notifications')
            .select('id')
            .eq('reference_id', existingInvoice.id)
            .eq('type', 'payment_received')
            .single()

          if (!existingNotif) {
            await supabaseAdmin
              .from('customer_notifications')
              .insert({
                user_id: customer.id,
                type: 'payment_received',
                title: 'Payment Confirmed',
                message: `Your payment for Invoice ${invoiceData.invoice_number} has been received`,
                link: '/portal/invoices',
                reference_id: existingInvoice.id,
                reference_type: 'invoice'
              })
          }
        }
      }

      // Send payment confirmation email for paid invoices
      if (eventType === 'paid' && emailRecipient) {
        try {
          console.log(`Attempting to send payment email to ${emailRecipient}`)
          const emailRes = await fetch(`${INTERNAL_API_URL}/api/email/payment-received`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerEmail: emailRecipient,
              customerName: emailName,
              invoiceNumber: invoiceData.invoice_number,
              amount: total,
              paymentDate: new Date().toISOString(),
              paymentMethod: 'Card',
            }),
          })

          if (!emailRes.ok) {
            const errText = await emailRes.text()
            console.error(`Payment email API failed (${emailRes.status}):`, errText)
          } else {
            const result = await emailRes.json()
            console.log(`Payment confirmation email sent for ${invoiceData.invoice_number} to ${emailRecipient}`, result)
          }
        } catch (emailError) {
          console.error('Failed to send payment email:', emailError.message)
        }
      }

      return { success: true, action: 'updated', invoiceNumber: invoiceData.invoice_number }

    } else {
      // Create new invoice
      const { error } = await supabaseAdmin
        .from('invoices')
        .insert([{
          ...invoiceData,
          created_at: new Date().toISOString(),
        }])

      if (error) throw error

      console.log(`Created invoice ${invoiceData.invoice_number} from Stripe Dashboard`)

      // Get the newly created invoice ID for notifications
      const { data: newInvoice } = await supabaseAdmin
        .from('invoices')
        .select('id')
        .eq('stripe_invoice_id', stripeInvoice.id)
        .single()

      // Create customer notifications based on event type
      if (customer?.id && newInvoice?.id) {
        if (eventType === 'finalized') {
          await supabaseAdmin
            .from('customer_notifications')
            .insert({
              user_id: customer.id,
              type: 'invoice_sent',
              title: 'New Invoice Ready',
              message: `Invoice ${invoiceData.invoice_number} for $${total.toFixed(2)} is ready for payment`,
              link: '/portal/invoices',
              reference_id: newInvoice.id,
              reference_type: 'invoice'
            })
        } else if (eventType === 'paid') {
          await supabaseAdmin
            .from('customer_notifications')
            .insert({
              user_id: customer.id,
              type: 'payment_received',
              title: 'Payment Confirmed',
              message: `Your payment for Invoice ${invoiceData.invoice_number} has been received`,
              link: '/portal/invoices',
              reference_id: newInvoice.id,
              reference_type: 'invoice'
            })
        }
      }

      // Send payment confirmation email for paid invoices
      if (eventType === 'paid' && emailRecipient) {
        try {
          console.log(`Attempting to send payment email to ${emailRecipient}`)
          const emailRes = await fetch(`${INTERNAL_API_URL}/api/email/payment-received`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerEmail: emailRecipient,
              customerName: emailName,
              invoiceNumber: invoiceData.invoice_number,
              amount: total,
              paymentDate: new Date().toISOString(),
              paymentMethod: 'Card',
            }),
          })

          if (!emailRes.ok) {
            const errText = await emailRes.text()
            console.error(`Payment email API failed (${emailRes.status}):`, errText)
          } else {
            const result = await emailRes.json()
            console.log(`Payment confirmation email sent for ${invoiceData.invoice_number} to ${emailRecipient}`, result)
          }
        } catch (emailError) {
          console.error('Failed to send payment email:', emailError.message)
        }
      }

      return { success: true, action: 'created', invoiceNumber: invoiceData.invoice_number }
    }
  } catch (error) {
    console.error('Error syncing Stripe invoice:', error)
    return { success: false, error: error.message }
  }
}

export async function POST(request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  // Handle the event
  switch (event.type) {
    // ==========================================
    // STRIPE DASHBOARD INVOICE EVENTS
    // ==========================================
    case 'invoice.finalized': {
      const invoice = event.data.object
      console.log('Processing finalized invoice:', invoice.id)
      await handleStripeInvoice(invoice, 'finalized')
      break
    }

    case 'invoice.paid': {
      const invoice = event.data.object
      console.log('Processing paid invoice:', invoice.id)
      await handleStripeInvoice(invoice, 'paid')
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object
      console.log('Processing failed invoice payment:', invoice.id)
      await handleStripeInvoice(invoice, 'payment_failed')
      break
    }

    case 'invoice.voided': {
      const invoice = event.data.object
      console.log('Processing voided invoice:', invoice.id)
      await handleStripeInvoice(invoice, 'voided')
      break
    }

    case 'invoice.marked_uncollectible': {
      const invoice = event.data.object
      console.log('Processing uncollectible invoice:', invoice.id)
      await handleStripeInvoice(invoice, 'uncollectible')
      break
    }

    // ==========================================
    // CHECKOUT SESSION EVENTS (existing)
    // ==========================================
    case 'checkout.session.completed': {
      const session = event.data.object

      // Handle gift certificate payments
      if (session.metadata?.type === 'gift_certificate') {
        console.log('Processing gift certificate payment:', session.id)
        const result = await handleGiftCertificate(session)
        if (result.success) {
          console.log(`Gift certificate ${session.metadata.giftCode} processed successfully`)
        } else {
          console.error(`Gift certificate processing failed:`, result.error)
        }
        break
      }

      // Handle invoice payments (portal payments)
      if (session.metadata?.invoice_id) {
        const { error } = await supabaseAdmin
          .from('invoices')
          .update({
            status: 'paid',
            paid_date: new Date().toISOString().split('T')[0],
            payment_method: 'stripe',
            updated_at: new Date().toISOString(),
          })
          .eq('id', session.metadata.invoice_id)

        if (error) {
          console.error('Error updating invoice:', error)
        } else {
          console.log(`Invoice ${session.metadata.invoice_number} marked as paid`)

          const { data: invoice } = await supabaseAdmin
            .from('invoices')
            .select(`*, profiles (email, full_name)`)
            .eq('id', session.metadata.invoice_id)
            .single()

          if (invoice) {
            const emailRecipient = invoice.profiles?.email || invoice.customer_email
            const emailName = invoice.profiles?.full_name || emailRecipient?.split('@')[0] || 'Customer'

            if (emailRecipient) {
              try {
                let paymentMethod = 'Card'
                if (session.payment_method_types?.[0]) {
                  paymentMethod = session.payment_method_types[0] === 'card' ? 'Card' : session.payment_method_types[0]
                }

                const emailRes = await fetch(`${INTERNAL_API_URL}/api/email/payment-received`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    customerEmail: emailRecipient,
                    customerName: emailName,
                    invoiceNumber: invoice.invoice_number,
                    amount: invoice.total || invoice.amount,
                    paymentDate: new Date().toISOString(),
                    paymentMethod: paymentMethod,
                  }),
                })

                if (!emailRes.ok) {
                  const errText = await emailRes.text()
                  console.error(`Payment email API failed (${emailRes.status}):`, errText)
                } else {
                  console.log(`Payment confirmation email sent for ${invoice.invoice_number}`)
                }
              } catch (emailError) {
                console.error('Failed to send payment received email:', emailError.message)
              }
            }
          }
        }
      }
      break
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object
      console.log('Payment succeeded:', paymentIntent.id)

      // Check if this payment was for a portal invoice
      if (paymentIntent.metadata?.invoice_id) {
        const { data: existingInvoice } = await supabaseAdmin
          .from('invoices')
          .select('id, status, invoice_number, total, amount, customer_id, customer_email')
          .eq('id', paymentIntent.metadata.invoice_id)
          .single()

        if (!existingInvoice) {
          console.log('Invoice not found:', paymentIntent.metadata.invoice_id)
          break
        }

        // Update invoice if not already paid
        if (existingInvoice.status !== 'paid') {
          const { error } = await supabaseAdmin
            .from('invoices')
            .update({
              status: 'paid',
              paid_date: new Date().toISOString().split('T')[0],
              payment_method: 'stripe',
              stripe_payment_intent_id: paymentIntent.id,
              updated_at: new Date().toISOString(),
            })
            .eq('id', paymentIntent.metadata.invoice_id)

          if (error) {
            console.error('Failed to update invoice from webhook:', error)
          } else {
            console.log(`Invoice ${existingInvoice.invoice_number} marked as paid via webhook`)
          }
        }

        // ALWAYS SEND EMAIL (regardless of status update)
        try {
          const { data: invoice } = await supabaseAdmin
            .from('invoices')
            .select('*, profiles!customer_id(email, full_name)')
            .eq('id', paymentIntent.metadata.invoice_id)
            .single()

          const emailRecipient = invoice?.profiles?.email || invoice?.customer_email
          const emailName = invoice?.profiles?.full_name || emailRecipient?.split('@')[0] || 'Customer'

          if (emailRecipient) {
            console.log(`Attempting to send payment email to ${emailRecipient}`)
            const emailRes = await fetch(`${INTERNAL_API_URL}/api/email/payment-received`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customerEmail: emailRecipient,
                customerName: emailName,
                invoiceNumber: invoice.invoice_number,
                amount: invoice.total || invoice.amount,
                paymentDate: new Date().toISOString(),
                paymentMethod: 'Card',
              }),
            })

            if (!emailRes.ok) {
              const errText = await emailRes.text()
              console.error(`Payment email API failed (${emailRes.status}):`, errText)
            } else {
              console.log(`Payment confirmation email sent for ${invoice.invoice_number}`)
            }
          } else {
            console.log('No email found for invoice:', invoice?.invoice_number)
          }
        } catch (emailError) {
          console.error('Failed to send payment email from webhook:', emailError.message)
        }

        // Create customer notification (with duplicate check)
        if (existingInvoice.customer_id) {
          try {
            const { data: existingNotif } = await supabaseAdmin
              .from('customer_notifications')
              .select('id')
              .eq('reference_id', existingInvoice.id)
              .eq('type', 'payment_received')
              .single()

            if (!existingNotif) {
              await supabaseAdmin
                .from('customer_notifications')
                .insert({
                  user_id: existingInvoice.customer_id,
                  type: 'payment_received',
                  title: 'Payment Confirmed',
                  message: `Your payment for Invoice ${existingInvoice.invoice_number} has been received`,
                  link: '/portal/invoices',
                  reference_id: existingInvoice.id,
                  reference_type: 'invoice'
                })
            }
          } catch (notifError) {
            console.error('Failed to create notification:', notifError)
          }
        }
      }
      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object
      console.log('Payment failed:', paymentIntent.id)

      if (paymentIntent.metadata?.invoice_id) {
        const { data: invoice } = await supabaseAdmin
          .from('invoices')
          .select('id, status, due_date, invoice_number, customer_id')
          .eq('id', paymentIntent.metadata.invoice_id)
          .single()

        if (invoice && invoice.status !== 'paid') {
          const isOverdue = invoice.due_date && new Date(invoice.due_date) < new Date()

          if (isOverdue && invoice.status !== 'overdue') {
            await supabaseAdmin
              .from('invoices')
              .update({
                status: 'overdue',
                updated_at: new Date().toISOString(),
              })
              .eq('id', invoice.id)

            console.log(`Invoice ${invoice.invoice_number} marked as overdue after failed payment`)
          }

          await supabaseAdmin
            .from('admin_notifications')
            .insert({
              type: 'payment_failed',
              title: 'Payment Failed',
              message: `Payment failed for invoice ${invoice.invoice_number}`,
              link: `/admin/invoices`,
            })

          if (invoice.customer_id) {
            const failureMessage = paymentIntent.last_payment_error?.message || 'Payment could not be processed'
            await supabaseAdmin
              .from('customer_notifications')
              .insert({
                user_id: invoice.customer_id,
                type: 'payment_failed',
                title: 'Payment Failed',
                message: `Your payment for Invoice ${invoice.invoice_number} failed: ${failureMessage}`,
                link: `/portal/invoices/${invoice.id}/pay`,
                reference_id: invoice.id,
                reference_type: 'invoice'
              })
          }

          const failureReason = paymentIntent.last_payment_error?.message || 'Payment failed'
          await supabaseAdmin
            .from('invoices')
            .update({
              notes: `Payment attempt failed on ${new Date().toLocaleDateString()}: ${failureReason}`,
              updated_at: new Date().toISOString(),
            })
            .eq('id', invoice.id)

          console.log(`Payment failed for invoice ${invoice.invoice_number}`)
        }
      }
      break
    }

    // ==========================================
    // CHARGE EVENTS
    // ==========================================
    case 'charge.succeeded': {
      const charge = event.data.object
      console.log('Charge succeeded:', charge.id, 'payment_intent:', charge.payment_intent, 'invoice:', charge.invoice)

      if (charge.invoice && charge.payment_intent) {
        const { data: invoice } = await supabaseAdmin
          .from('invoices')
          .select('id, invoice_number, stripe_payment_intent_id')
          .eq('stripe_invoice_id', charge.invoice)
          .single()

        if (invoice && !invoice.stripe_payment_intent_id) {
          await supabaseAdmin
            .from('invoices')
            .update({
              stripe_payment_intent_id: charge.payment_intent,
              updated_at: new Date().toISOString()
            })
            .eq('id', invoice.id)

          console.log(`Saved payment_intent ${charge.payment_intent} to invoice ${invoice.invoice_number}`)
        }
      }

      if (!charge.invoice && charge.payment_intent && charge.customer) {
        const { data: recentInvoice } = await supabaseAdmin
          .from('invoices')
          .select('id, invoice_number, stripe_payment_intent_id, stripe_invoice_id')
          .eq('status', 'paid')
          .is('stripe_payment_intent_id', null)
          .order('updated_at', { ascending: false })
          .limit(1)
          .single()

        if (recentInvoice) {
          await supabaseAdmin
            .from('invoices')
            .update({
              stripe_payment_intent_id: charge.payment_intent,
              updated_at: new Date().toISOString()
            })
            .eq('id', recentInvoice.id)

          console.log(`Saved payment_intent ${charge.payment_intent} to recent invoice ${recentInvoice.invoice_number} (fallback)`)
        }
      }
      break
    }

    // ==========================================
    // REFUND EVENTS
    // ==========================================
    case 'charge.refunded': {
      const charge = event.data.object

      console.log('Processing refund - charge data:', {
        chargeId: charge.id,
        paymentIntent: charge.payment_intent,
        stripeInvoice: charge.invoice,
        amountRefunded: charge.amount_refunded,
        currency: charge.currency
      })

      const paymentIntentId = charge.payment_intent
      const stripeInvoiceId = charge.invoice

      let invoice = null

      if (paymentIntentId) {
        const { data, error } = await supabaseAdmin
          .from('invoices')
          .select('id, invoice_number, customer_id, total, amount, refund_amount, stripe_payment_intent_id, customer_email, profiles:customer_id(email, full_name)')
          .eq('stripe_payment_intent_id', paymentIntentId)
          .single()
        if (error) console.log('Lookup by payment_intent failed:', error.message)
        invoice = data
      }

      if (!invoice && stripeInvoiceId) {
        const { data, error } = await supabaseAdmin
          .from('invoices')
          .select('id, invoice_number, customer_id, total, amount, refund_amount, stripe_payment_intent_id, customer_email, profiles:customer_id(email, full_name)')
          .eq('stripe_invoice_id', stripeInvoiceId)
          .single()
        if (error) console.log('Lookup by stripe_invoice_id failed:', error.message)
        invoice = data
      }

      if (!invoice) {
        console.log('No invoice found for refund. payment_intent:', paymentIntentId, 'stripe_invoice:', stripeInvoiceId)
        break
      }

      console.log('Found invoice for refund:', invoice.invoice_number)

      const refundedAmount = charge.amount_refunded / 100
      const invoiceTotal = parseFloat(invoice.total || invoice.amount)
      const isFullRefund = refundedAmount >= invoiceTotal

      const updateData = {
        refund_amount: refundedAmount,
        refund_reason: 'Refunded via Stripe',
        updated_at: new Date().toISOString(),
        ...(paymentIntentId && !invoice.stripe_payment_intent_id && { stripe_payment_intent_id: paymentIntentId })
      }

      await supabaseAdmin
        .from('invoices')
        .update(updateData)
        .eq('id', invoice.id)

      const formattedRefund = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(refundedAmount)

      if (invoice.customer_id) {
        await supabaseAdmin
          .from('customer_notifications')
          .insert({
            user_id: invoice.customer_id,
            type: 'refund_processed',
            title: 'Refund Processed',
            message: `A refund of ${formattedRefund} has been issued for Invoice ${invoice.invoice_number}`,
            link: '/portal/invoices',
            reference_id: invoice.id,
            reference_type: 'invoice'
          })
      }

      await supabaseAdmin
        .from('admin_notifications')
        .insert({
          type: 'refund_processed',
          title: 'Refund Issued',
          message: `Refund of ${formattedRefund} issued for Invoice ${invoice.invoice_number}`,
          link: '/admin/invoices'
        })

      const customerEmail = invoice.profiles?.email || invoice.customer_email
      const customerName = invoice.profiles?.full_name || 'Customer'

      if (customerEmail) {
        try {
          await fetch(`${INTERNAL_API_URL}/api/email/payment-received`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerEmail,
              customerName,
              invoiceNumber: invoice.invoice_number,
              refundAmount: refundedAmount,
              refundReason: 'Refund processed'
            })
          })
        } catch (emailError) {
          console.error('Error sending refund email:', emailError)
        }
      }

      console.log(`Refund of ${formattedRefund} processed for invoice ${invoice.invoice_number}`)
      break
    }

    // ==========================================
    // DISPUTE EVENTS
    // ==========================================
    case 'charge.dispute.created': {
      const dispute = event.data.object
      console.log('Processing dispute created:', dispute.id)

      const chargeId = dispute.charge
      let paymentIntentId = null

      try {
        const charge = await stripe.charges.retrieve(chargeId)
        paymentIntentId = charge.payment_intent
      } catch (err) {
        console.error('Error retrieving charge for dispute:', err)
      }

      if (!paymentIntentId) {
        console.log('Could not find payment intent for dispute')
        break
      }

      const { data: invoice } = await supabaseAdmin
        .from('invoices')
        .select('id, invoice_number, customer_id, profiles:customer_id(full_name)')
        .eq('stripe_payment_intent_id', paymentIntentId)
        .single()

      if (!invoice) {
        console.log('No invoice found for disputed payment intent:', paymentIntentId)
        break
      }

      await supabaseAdmin
        .from('invoices')
        .update({
          disputed: true,
          notes: `DISPUTE OPENED on ${new Date().toLocaleDateString()}: ${dispute.reason || 'No reason provided'}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', invoice.id)

      const customerName = invoice.profiles?.full_name || 'Customer'

      await supabaseAdmin
        .from('admin_notifications')
        .insert({
          type: 'dispute_opened',
          title: 'URGENT: Payment Dispute',
          message: `A dispute has been opened for Invoice ${invoice.invoice_number} (${customerName})`,
          link: '/admin/invoices'
        })

      const smsGatewayEmail = '5129989658@tmomail.net'
      try {
        await resend.emails.send({
          from: 'Impress <notifications@impressyoucleaning.com>',
          to: smsGatewayEmail,
          subject: 'DISPUTE',
          text: `${invoice.invoice_number} - ${customerName.substring(0, 12)}. Respond in 7 days.`
        })
      } catch (smsError) {
        console.error('Error sending dispute SMS:', smsError)
      }

      console.log(`Dispute opened for invoice ${invoice.invoice_number}`)
      break
    }

    case 'charge.dispute.closed': {
      const dispute = event.data.object
      console.log('Processing dispute closed:', dispute.id, 'Status:', dispute.status)

      const chargeId = dispute.charge
      let paymentIntentId = null

      try {
        const charge = await stripe.charges.retrieve(chargeId)
        paymentIntentId = charge.payment_intent
      } catch (err) {
        console.error('Error retrieving charge for dispute:', err)
      }

      if (!paymentIntentId) {
        console.log('Could not find payment intent for dispute')
        break
      }

      const { data: invoice } = await supabaseAdmin
        .from('invoices')
        .select('id, invoice_number, customer_id, profiles:customer_id(full_name)')
        .eq('stripe_payment_intent_id', paymentIntentId)
        .single()

      if (!invoice) {
        console.log('No invoice found for disputed payment intent:', paymentIntentId)
        break
      }

      const customerName = invoice.profiles?.full_name || 'Customer'
      const disputeWon = dispute.status === 'won'

      if (disputeWon) {
        await supabaseAdmin
          .from('invoices')
          .update({
            disputed: false,
            notes: `Dispute resolved in our favor on ${new Date().toLocaleDateString()}`,
            updated_at: new Date().toISOString()
          })
          .eq('id', invoice.id)

        await supabaseAdmin
          .from('admin_notifications')
          .insert({
            type: 'dispute_won',
            title: 'Dispute Resolved - Won',
            message: `Dispute for Invoice ${invoice.invoice_number} resolved in your favor`,
            link: '/admin/invoices'
          })

        if (invoice.customer_id) {
          await supabaseAdmin
            .from('customer_notifications')
            .insert({
              user_id: invoice.customer_id,
              type: 'dispute_resolved',
              title: 'Dispute Resolved',
              message: `The dispute for Invoice ${invoice.invoice_number} has been resolved`,
              link: '/portal/invoices',
              reference_id: invoice.id,
              reference_type: 'invoice'
            })
        }
      } else {
        await supabaseAdmin
          .from('invoices')
          .update({
            disputed: false,
            status: 'cancelled',
            refund_reason: 'Dispute lost - funds returned to customer',
            notes: `Dispute lost on ${new Date().toLocaleDateString()}. Funds returned to customer.`,
            updated_at: new Date().toISOString()
          })
          .eq('id', invoice.id)

        await supabaseAdmin
          .from('admin_notifications')
          .insert({
            type: 'dispute_lost',
            title: 'Dispute Resolved - Lost',
            message: `Dispute for Invoice ${invoice.invoice_number} resolved against. Funds returned to ${customerName}.`,
            link: '/admin/invoices'
          })

        if (invoice.customer_id) {
          await supabaseAdmin
            .from('customer_notifications')
            .insert({
              user_id: invoice.customer_id,
              type: 'refund_processed',
              title: 'Dispute Resolved - Refund Issued',
              message: `The dispute for Invoice ${invoice.invoice_number} has been resolved and a refund has been issued`,
              link: '/portal/invoices',
              reference_id: invoice.id,
              reference_type: 'invoice'
            })
        }
      }

      console.log(`Dispute for invoice ${invoice.invoice_number} closed - ${disputeWon ? 'WON' : 'LOST'}`)
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}