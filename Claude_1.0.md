# Invoice Email System - Fixes & Status

## Problem Summary
Cloudflare blocks server-to-server HTTP requests from the Stripe webhook to internal API routes, causing emails to fail silently with 403 errors. Solution: Replace all `fetch()` calls to internal email routes with direct Resend integration.

---

## What's Been Fixed ✅

### 1. Payment Received Email (handleStripeInvoice)
**File:** `/src/app/api/webhooks/stripe/route.js`
**Status:** DONE ✅

- Added `createPaymentReceivedEmail()` template function
- Both occurrences in `handleStripeInvoice()` now call Resend directly
- Timezone fixed to `America/Chicago`

### 2. Invoice Number Format
**Status:** DONE ✅

- Changed from `IMP-2512-1001` (sequential) to `IMP-XXXXXXX` (random 7 chars)
- Updated Supabase function `generate_invoice_number()`
- Admin send route passes `number: invoice.invoice_number` to Stripe

### 3. Admin Invoice Send Email
**File:** `/src/app/api/admin/invoices/send/route.js`
**Status:** DONE ✅

- Added `createInvoiceEmail()` template function
- Calls Resend directly instead of fetch
- Includes "Pay Now" button + "View in Portal" button

---

## What Still Needs Fixing ❌

### 4. checkout.session.completed - Payment Email
**File:** `/src/app/api/webhooks/stripe/route.js`
**Location:** Around line 480-510

**Current code (BROKEN):**
```javascript
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
```

**Needs to be:**
```javascript
const formattedDate = new Date().toLocaleDateString('en-US', { 
  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  timeZone: 'America/Chicago'
})

const { error: emailError } = await resend.emails.send({
  from: 'Impress Cleaning Services <notifications@impressyoucleaning.com>',
  to: emailRecipient,
  subject: `Payment Received - Invoice ${invoice.invoice_number}`,
  html: createPaymentReceivedEmail({
    customerName: emailName,
    invoiceNumber: invoice.invoice_number,
    amount: (invoice.total || invoice.amount).toFixed(2),
    paymentDate: formattedDate,
    paymentMethod: paymentMethod
  })
})

if (emailError) {
  console.error('Payment email error:', emailError)
} else {
  console.log(`Payment confirmation email sent for ${invoice.invoice_number}`)
}
```

---

### 5. payment_intent.succeeded - Payment Email
**File:** `/src/app/api/webhooks/stripe/route.js`
**Location:** Around line 540-565

**Current code (BROKEN):**
```javascript
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
```

**Needs to be:**
```javascript
const formattedDate = new Date().toLocaleDateString('en-US', { 
  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  timeZone: 'America/Chicago'
})

const { error: emailError } = await resend.emails.send({
  from: 'Impress Cleaning Services <notifications@impressyoucleaning.com>',
  to: emailRecipient,
  subject: `Payment Received - Invoice ${invoice.invoice_number}`,
  html: createPaymentReceivedEmail({
    customerName: emailName,
    invoiceNumber: invoice.invoice_number,
    amount: (invoice.total || invoice.amount).toFixed(2),
    paymentDate: formattedDate,
    paymentMethod: 'Card'
  })
})

if (emailError) {
  console.error('Payment email error:', emailError)
} else {
  console.log(`Payment confirmation email sent for ${invoice.invoice_number}`)
}
```

---

### 6. charge.refunded - Refund Email
**File:** `/src/app/api/webhooks/stripe/route.js`
**Location:** Around line 640-655

**Current code (BROKEN):**
```javascript
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
```

**Needs:** Create a `createRefundEmail()` template function and call Resend directly. Note: Currently uses payment-received route incorrectly for refunds - should have its own template.

---

## Files That Can Be Deleted After All Fixes

Once all webhook `fetch()` calls are replaced with direct Resend:

1. `/src/app/api/email/invoice-payment-link/route.js` - No longer used
2. `/src/app/api/email/payment-received/route.js` - No longer used (verify nothing else calls it first)

---

## Pending Decisions

### Invoice Reminder System
**Current state:** No automatic reminders

**Existing infrastructure:**
- `mark_overdue_invoices()` - Supabase function
- `get_invoices_due_today()` - Supabase function  
- `get_invoices_overdue_5_days()` - Supabase function
- Cron jobs exist (need to verify what's implemented)

**Options:**
1. Build reminder cron that sends branded emails at intervals
2. Use Stripe's built-in reminder system (less control, their template)
3. Hybrid - your initial email, Stripe reminders

**Need to review:** Existing cron implementation to see what's already built

---

### Stripe Dashboard Invoice Emails
**Current state:** If invoice sent from Stripe Dashboard, customer gets Stripe's generic email

**Options:**
1. Always send from Admin Portal (current - keeps it simple)
2. Add invoice email to webhook `invoice.finalized` event (branded email regardless of source)
3. Disable Stripe emails entirely and handle all via webhook

**If going with Option 2, need:**
- Add `createInvoiceEmail()` function to webhook (same as admin route)
- Add email send in `invoice.finalized` handler
- Duplicate check to prevent double emails when using Admin Portal
- Disable Stripe's automatic invoice emails in Stripe Dashboard

---

## Technical Context

### Why Cloudflare Blocks These
- Webhook runs on server
- Server calls `fetch()` to own public URL
- Cloudflare sees server-to-server request without browser cookies/JS
- Returns 403 challenge page
- Email never sends, but code logs "success" (fetch doesn't throw on HTTP errors)

### Why Direct Resend Works
- Webhook calls Resend API directly
- No round-trip through public URL
- Cloudflare not involved
- More secure (email only sent from verified Stripe webhook)

### Email Templates Already in Webhook
1. `createGiftCertificateEmail()` - Gift certificates
2. `createPaymentReceivedEmail()` - Payment confirmations

### Email Templates Needed
1. `createInvoiceEmail()` - For invoice.finalized (if implementing Option 2)
2. `createRefundEmail()` - For charge.refunded (currently broken/wrong template)
3. `createReminderEmail()` - For payment reminders (if building reminder system)

---

## Search Pattern to Find All fetch() Calls

```bash
grep -n "INTERNAL_API_URL" src/app/api/webhooks/stripe/route.js
```

This will show all remaining places that need to be converted.

---

## Testing Checklist

After each fix, test by:
1. Triggering the relevant Stripe event
2. Check Vercel logs for errors (no more 403s)
3. Check Resend dashboard for sent email
4. Check inbox for received email
5. Verify email content/formatting correct