# Invoice System Critical Bugs - Fix Required

## Stack
- Next.js (App Router)
- Supabase (Postgres + RLS)
- Stripe (invoices, payments)
- Resend (transactional emails)

---

## Bug 1: Invoice Email Not Sending

### Symptom
When admin sends an invoice from the admin portal, the invoice is created in Stripe and updated in Supabase (status changes to "sent"), but NO email is sent to the customer.

### Location
`/src/app/api/admin/invoices/send/route.js` - around line 219

### Current Code
```javascript
await fetch(`${INTERNAL_API_URL}/api/email/invoice-payment-link`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: customerEmail,
    name: customerName,
    invoiceNumber: invoice.invoice_number,
    amount: invoice.total || invoice.amount,
    dueDate: invoice.due_date,
    paymentUrl: sentInvoice.hosted_invoice_url
  })
})
```

### Problem
1. The route `/src/app/api/email/invoice-payment-link/route.js` may not exist
2. The fetch has NO error handling - fails silently
3. No logging to confirm if email was sent or failed

### Required Fix
1. Check if `/src/app/api/email/invoice-payment-link/route.js` exists
2. If it doesn't exist, CREATE IT using Resend (reference other email routes in `/src/app/api/email/` for pattern)
3. Add try/catch and logging to the fetch call in send/route.js
4. Email template should include:
   - Customer name
   - Invoice number
   - Amount due
   - Due date
   - Payment link button (using Stripe hosted_invoice_url)
   - Company branding matching other email templates

---

## Bug 2: Admin Cannot Cancel Invoice - Access Denied

### Symptom
Admin portal shows "denied access" or similar error when trying to cancel an invoice.

### Files to Review
- `/src/app/api/admin/invoices/cancel/route.js` - main cancel route
- `/src/lib/supabase/admin.js` - verify admin client is configured correctly
- Check Supabase RLS policies on `invoices` table

### Likely Causes
1. Route not using `supabaseAdmin` (service role) client
2. Missing admin role verification
3. RLS policy blocking the update
4. Route might be using wrong HTTP method

### Required Fix
1. Ensure route uses `supabaseAdmin` from `/src/lib/supabase/admin.js` for database operations
2. Verify admin authentication pattern matches other working admin routes like `/src/app/api/admin/invoices/send/route.js`
3. Check the route exports the correct HTTP method (POST)

---

## Files to Review (Full Audit)

### Email Routes - Check All Exist and Work
- `/src/app/api/email/invoice-payment-link/route.js` - MAY NOT EXIST
- `/src/app/api/email/payment-received/route.js`
- `/src/app/api/email/invoice-cancelled/route.js`
- `/src/app/api/email/service-request-received/route.js`
- `/src/app/api/email/service-request-declined/route.js`

### Admin Invoice Routes - Verify All Use supabaseAdmin
- `/src/app/api/admin/invoices/send/route.js`
- `/src/app/api/admin/invoices/cancel/route.js`
- `/src/app/api/admin/invoices/mark-paid/route.js`
- `/src/app/api/admin/update-invoice/route.js`
- `/src/app/api/admin/create-invoice/route.js`

### Supabase Config
- `/src/lib/supabase/admin.js` - verify SUPABASE_SERVICE_ROLE_KEY is used
- `/src/lib/supabase/server.js`
- `/src/lib/supabase/client.js`

---

## Testing After Fix

1. **Send Invoice Test:**
   - Create draft invoice in admin
   - Click send
   - Verify customer receives email with payment link
   - Verify email uses Resend (not Stripe's default email)

2. **Cancel Invoice Test:**
   - Find a sent invoice
   - Click cancel
   - Verify status changes to "cancelled"
   - Verify Stripe invoice is voided (if applicable)

---

## Reference: Working Email Route Pattern

Look at `/src/app/api/email/payment-received/route.js` for the correct pattern:

```javascript
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { sanitizeText, sanitizeEmail } from '@/lib/sanitize'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = 'Impress Cleaning Services <notifications@impressyoucleaning.com>'

export async function POST(request) {
  try {
    const body = await request.json()
    // Sanitize inputs
    // Validate required fields
    // Send email via resend.emails.send()
    // Return success/error response
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

---

## Priority
1. Fix cancel invoice (admin is blocked)
2. Create/fix invoice-payment-link email route
3. Add error handling to send route
4. Test full flow end-to-end