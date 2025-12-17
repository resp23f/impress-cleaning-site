## 2025-12-16 - current fixes claude chat

Soft Delete Behavior (Implemented):
Set profiles.account_status = 'deleted'
Set profiles.deleted_at = NOW()
Email anonymization to deleted_[userId]@removed.local
Phone set to null
Full name kept for business records
Addresses anonymized
Payment methods deleted
Auth user deleted from auth.users (prevents login)
Appointments/Invoices preserved
Confirmation email sent to original email before deletion
Admin Filtering: Queries should use WHERE account_status = 'active' to hide deleted users.

“Arriving Today” Auto-Status Feature
Files Modified:
src/app/portal/dashboard/page.jsx
src/app/admin/appointments/page.jsx
SQL Migration:
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS is_running_late BOOLEAN DEFAULT FALSE;
Behavior:
Customer portal auto-displays “Arriving Today” for today’s confirmed appointments
Shows “Running slightly behind” when is_running_late = true
Admin toggle for today’s confirmed/en_route appointments that notifies customer
Settings Page — Payment Methods Polish
File Modified: src/app/portal/settings/page.jsx
Changes:
Show “Default Card” badge if is_default OR payments.length === 1
Hide “Make Default” button when only one card exists
Added disableLink: true to card element creation (prevents Stripe Link UI)

Invoice Filter Styling
File Modified: src/app/portal/invoices/page.jsx
Change: Desktop floating centered filters with shadows; mobile spacing and sizing optimizations.

---

```md
# claude-session-log.md

## 2025-12-16 — Current Fixes (Session Log)

This session covered portal bug fixes, email template creation, and database function updates for the Impress Cleaning Services customer portal. Work spanned from December 16-17, 2024.

**Primary accomplishments:**
- Portal animation standardization (removed staggered `cardReveal` animations to match Appointments page pattern)
- Customer welcome email template creation for existing customers
- Desktop bug fixes: payment method default card logic, appointments cancelled section filter
- Supabase `mark_overdue_invoices()` function rewrite to add late fees as line items instead of notes

**Stack context:** Next.js 14, Supabase (Postgres + Auth + RLS + pg_cron), Stripe, Resend, Tailwind

---

# Goals & Constraints

## Goals
1. Standardize portal page animations to match the Appointments page pattern (simple `contentReveal`, no staggered card animations)
2. Create a welcome email template for existing recurring customers to introduce them to the new portal
3. Fix desktop issues discovered during user testing:
   - Payment method default card bug
   - Card input fields visually stacking
   - Appointments cancelled section showing completed appointments
   - Overdue invoice late fee display (should be line item, not note)
   - Invoice amount reverting after payment
4. Address mobile issues (sign-in logo, hamburger X icon, invoice close button)
5. Implement behavior suggestions (account deletion with balance, cancellation fees, layout fixes)

## Constraints
- Maintain existing template styling for emails (match Supabase invite template exactly)
- Sanitize all user inputs with `sanitizeText()` and `sanitizeEmail()` from `src/lib/sanitize.js`
- Timezone-safe dates: use `new Date(date + 'T00:00:00')`
- Preserve orphan invoice linking functionality
- No schema changes for card nicknames (deferred)

---

# Key Decisions Made

## 1. Portal Animation Pattern
**Decision:** Remove all staggered `cardReveal1`, `cardReveal2`, etc. classes from portal pages. Keep only the outer `contentReveal` on the min-h-screen wrapper.

**Rationale:** Appointments page uses a cleaner pattern that provides smooth page reveal without individual card animations. Dashboard retains staggered animations as a special case.

**Pages affected:** Invoices, Notifications, Service History, Settings, Request Service

## 2. Email Template Approach
**Decision:** Use Resend Dashboard template (manual send) instead of API route integration.

**Rationale:** User has existing customers with names/emails but not yet in Supabase. Resend Dashboard allows quick manual sends without code deployment. API route was created as backup for future automation.

**Template details:**
- Subject: `Your Customer Portal is Ready, {{firstName}}!`
- Eyebrow: "YOUR PORTAL IS READY"
- Messaging: Positioned for existing customers getting portal access, not new customer welcome
- Only variable: `{{firstName}}`

## 3. Payment Method Default Card Logic
**Decision:** Only set `makeDefault: true` when adding the first card (`payments.length === 0`).

**Rationale:** Frontend was always passing `makeDefault: true` for every new card. API logic correctly unsets other defaults, but this caused all cards to become default. Fix is frontend-only.

## 4. Appointments Cancelled Section Filter
**Decision:** Filter cancelled section purely by status (`cancelled`, `not_completed`), not by date.

**Rationale:** Original filter used `dt < now || PAST_STATUSES.includes(apt.status)` which included past completed appointments. Completed appointments should only appear in Service History page.

## 5. Late Fee Implementation
**Decision:** Rewrite `mark_overdue_invoices()` Supabase function to add late fee as a line item in `line_items` JSONB array.

**Rationale:** 
- Original function modified `amount` field (inflated base amount)
- Original added late fee to `notes` field (not visible during payment)
- Original double-taxed the late fee
- Original had no duplicate protection

---

# Technical Details / Commands / Code

## Portal Animation Fixes

### Request Service Page (`src/app/portal/request-service/page.jsx`)
**Issue:** Extra closing `</div>` broke structure, Progress Bar and Card were outside centered container.

**Find (around line 341-347):**
```jsx
          <p className="text-gray-600">
            Step {step} of 5
          </p>
        </div>

        {/* Progress Bar */}

Replace with:
          <p className="text-gray-600">
            Step {step} of 5
          </p>

          {/* Progress Bar */}

Other Pages Pattern
Remove all ${styles.cardReveal}, ${styles.cardReveal1}, etc. from:
src/app/portal/invoices/page.jsx
src/app/portal/notifications/page.jsx
src/app/portal/service-history/page.jsx
src/app/portal/settings/page.jsx
Keep only the outer wrapper pattern: <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 ${!loading ? styles.contentReveal : ''}`}>

API Route File: src/app/api/email/customer-welcome/route.js
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { sanitizeText, sanitizeEmail } from '@/lib/sanitize'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    // Verify admin
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()

    if (!body.email || !body.firstName) {
      return NextResponse.json({ error: 'email and firstName are required' }, { status: 422 })
    }

    const email = sanitizeEmail(body.email)
    const firstName = sanitizeText(body.firstName)?.slice(0, 50)

    if (!email) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 422 })
    }

    if (!firstName) {
      return NextResponse.json({ error: 'Invalid first name' }, { status: 422 })
    }

    const emailHtml = generateWelcomeEmail(firstName)

    const { data, error } = await resend.emails.send({
      from: 'Impress Cleaning Services <notifications@impressyoucleaning.com>',
      to: email,
      subject: `Your Customer Portal is Ready, ${firstName}!`,
      html: emailHtml,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, emailId: data?.id })
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function generateWelcomeEmail(firstName) {
  // ... HTML template as shown above
}


Desktop Issue Fixes
Issue 1a: Payment Method Default Card
File: src/app/portal/settings/page.jsx (line ~347)
Find: 
body: JSON.stringify({ paymentMethodId: pmId, makeDefault: true }),
Replace with:
body: JSON.stringify({ paymentMethodId: pmId, makeDefault: payments.length === 0 }),
Note: There are two instances of makeDefault: true in settings. Only change the one in handleAddCard, NOT the one in makeDefaultCard (that one is correct for explicitly setting a card as default).

Issue 1b: Card Input Stacking
File: src/app/portal/settings/page.jsx (line ~531)
Find:
<div ref={cardElementRef} className="border-2 border-gray-200 rounded-xl p-3 bg-white" />
Replace with:
<div ref={cardElementRef} className="border-2 border-gray-200 rounded-xl p-4 bg-white min-h-[50px]" />
Issue 2: Appointments Cancelled Section
File: src/app/portal/appointments/page.jsx
Find (lines ~162-172): const UPCOMING_STATUSES = ['pending', 'confirmed', 'en_route']
const PAST_STATUSES = ['cancelled', 'not_completed']
const now = new Date()

const upcoming = appointments.filter((apt) => {
  const dt = getAppointmentDateTime(apt)
  if (!dt) return false
  return dt >= now && UPCOMING_STATUSES.includes(apt.status)
})

const past = appointments.filter((apt) => {
  const dt = getAppointmentDateTime(apt)
  if (!dt) return false
  return dt < now || PAST_STATUSES.includes(apt.status)
})

replace with: const UPCOMING_STATUSES = ['pending', 'confirmed', 'en_route']
const CANCELLED_STATUSES = ['cancelled', 'not_completed']
const now = new Date()

const upcoming = appointments.filter((apt) => {
  const dt = getAppointmentDateTime(apt)
  if (!dt) return false
  return dt >= now && UPCOMING_STATUSES.includes(apt.status)
})

const cancelled = appointments.filter((apt) => {
  return CANCELLED_STATUSES.includes(apt.status)
})

Overdue Invoice Late Fee SQL Function
Original Function (Problematic): UPDATE public.invoices
SET 
  status = 'overdue',
  amount = new_amount,
  tax_amount = new_tax_amount,
  total = new_total,
  notes = COALESCE(notes, '') || E'\n[' || TO_CHAR(NOW(), 'YYYY-MM-DD') || '] 5% late fee applied.',
  updated_at = NOW()
WHERE id = invoice_record.id;

New Function (Corrected)
Run in Supabase SQL Editor: CREATE OR REPLACE FUNCTION "public"."mark_overdue_invoices"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
  invoice_record RECORD;
  late_fee NUMERIC;
  new_total NUMERIC;
  updated_line_items JSONB;
  has_late_fee BOOLEAN;
BEGIN
  FOR invoice_record IN
    SELECT id, amount, tax_amount, total, line_items
    FROM public.invoices
    WHERE status IN ('sent', 'pending')
      AND due_date < (CURRENT_DATE - interval '7 days')
  LOOP
    has_late_fee := FALSE;
    IF invoice_record.line_items IS NOT NULL THEN
      SELECT EXISTS (
        SELECT 1 FROM jsonb_array_elements(invoice_record.line_items) AS item
        WHERE item->>'description' ILIKE '%late fee%'
      ) INTO has_late_fee;
    END IF;
    
    IF has_late_fee THEN
      UPDATE public.invoices
      SET status = 'overdue', updated_at = NOW()
      WHERE id = invoice_record.id;
      CONTINUE;
    END IF;
    
    late_fee := ROUND((COALESCE(invoice_record.total, invoice_record.amount, 0) * 0.05)::numeric, 2);
    new_total := COALESCE(invoice_record.total, invoice_record.amount, 0) + late_fee;
    
    IF invoice_record.line_items IS NULL THEN
      updated_line_items := jsonb_build_array(
        jsonb_build_object(
          'description', 'Late Fee (5%)',
          'quantity', 1,
          'rate', late_fee,
          'amount', late_fee
        )
      );
    ELSE
      updated_line_items := invoice_record.line_items || jsonb_build_array(
        jsonb_build_object(
          'description', 'Late Fee (5%)',
          'quantity', 1,
          'rate', late_fee,
          'amount', late_fee
        )
      );
    END IF;
    
    UPDATE public.invoices
    SET 
      status = 'overdue',
      line_items = updated_line_items,
      total = new_total,
      updated_at = NOW()
    WHERE id = invoice_record.id;
  END LOOP;
END;
$$;

pg_cron Configuration
Schedule: 0 2 * * * (2:00 AM GMT daily)
Type: Database function
Schema: public
Function: mark_overdue_invoices
Existing Process-Overdue API Route
File: src/app/api/cron/process-overdue/route.js
This is an alternative to pg_cron. It:
Requires external trigger (Vercel Cron)
Updates status to overdue
Creates customer and admin notifications
Does NOT add late fee as line item (pg_cron function handles this)
The pg_cron approach was chosen as primary because it runs directly in Postgres.
Open Questions / Unresolved Items
Deferred Items
Card nicknames — Requires schema change to payment_methods table (add nickname column)
Pre-fill email in signup link — Optional enhancement: ?email=customer@example.com query param handling
Mobile Issues (Not Started)
Sign-in logo too small — Need file path for sign-in page
Hamburger menu X icon missing — Need file path for mobile nav component
Invoice view X button covered — Need file path for invoice side panel
Suggestions (Not Started)
Block account deletion with outstanding balance — Logic check before deletion
Cancellation/rescheduling fee menu — Pop-up showing applicable fees
Account section layout — Member Since/Freshness tiles stacking on smaller screens
Overdue status color when $0.00 — Display green instead of overdue color
Verification Needed
Late fee SQL function added but not yet tested
Card stacking fix prepared but not confirmed applied
Appointments cancelled filter prepared but not confirmed applied

Next Actions
Immediate (Testing Required)
Test late fee function:
SELECT mark_overdue_invoices();
Verify late fee appears as line item in portal invoice view
Test payment flow with overdue invoice to confirm correct total
Ready to Apply
Apply card stacking fix (min-h-[50px] on card element container)
Apply appointments cancelled section filter (change past to cancelled)
Future Batches
Mobile Issues Batch:
Collect file paths for sign-in page, mobile nav, invoice panel
Apply responsive fixes
Suggestions Batch:
Account deletion balance check
Cancellation fee menu
Layout adjustments
$0 overdue color logic
Documentation
Claude 7.0 session summary created and exported

| File                                          | Status                         | Change                          |
| --------------------------------------------- | ------------------------------ | ------------------------------- |
| `src/app/portal/request-service/page.jsx`     | ⚠️ Missing due to context loss | Remove extra `</div>`           |
| `src/app/portal/invoices/page.jsx`            | ⚠️ Missing due to context loss | Remove cardReveal classes       |
| `src/app/portal/notifications/page.jsx`       | ⚠️ Missing due to context loss | Remove cardReveal classes       |
| `src/app/portal/service-history/page.jsx`     | ⚠️ Missing due to context loss | Remove cardReveal classes       |
| `src/app/portal/settings/page.jsx`            | ✅ Applied                      | Payment method default card fix |
| `src/app/portal/settings/page.jsx`            | 🟡 Ready                       | Card stacking min-height fix    |
| `src/app/portal/appointments/page.jsx`        | 🟡 Ready                       | Cancelled section filter fix    |
| `src/app/api/email/customer-welcome/route.js` | 📦 Created                     | Welcome email API               |
| `src/app/admin/send-welcome/page.jsx`         | 📦 Created                     | Admin email sender UI           |
| Supabase `mark_overdue_invoices()`            | ✅ Added                        | Late fee as line item           |


---