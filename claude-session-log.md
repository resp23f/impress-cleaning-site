# Session Log — 2025-12-22 — Security Hardening & Key Rotation

## 1. Session Overview

**Date:** December 21-22, 2025 (overnight session)  
**Primary Focus:** Comprehensive security audit, critical key rotation, payment vulnerability fix, and email template standardization

This session began with email template fixes from a prior session, evolved into a deep security audit after the user expressed late-night concerns about protecting customer data (addresses, saved cards, phone numbers). We discovered a **critical payment vulnerability** where client-sent amounts could be manipulated, found that `.env.local` had been previously committed to git (requiring full key rotation), and implemented storage bucket policies. The user explicitly chose the "harder but correct" approach throughout, preferring Cloudflare WAF over easier alternatives.

---

## 2. What We Discussed & Contemplated

### Security Audit Topics

| Topic | Discussion |
|-------|------------|
| **Nonces for CSP** | Explained what nonces do (random per-request strings that prevent injected scripts from executing). Determined this is Tier 3 priority because user inputs are already sanitized and no user-generated HTML is rendered. |
| **Cloudflare WAF vs Arcjet** | User asked which is better. Explained Cloudflare stops attacks at edge (before reaching app), Arcjet stops at app layer. User chose Cloudflare because already familiar with dashboard and DNS already managed there. |
| **ChatGPT Security Review** | User ran my initial assessment by ChatGPT for second opinion. ChatGPT caught: storage bucket policies (I missed), payment integrity verification needed, better sequencing rationale. |
| **Admin MFA Status** | User only had MFA on Stripe. Needs to enable on: Supabase, Vercel, GitHub, Cloudflare, Porkbun, Email. |
| **Legacy vs New Supabase Keys** | User asked about difference between legacy `anon`/`service_role` keys and new Secret API Keys. Advised staying with legacy for now (solo operator, single app - new system is for teams with granular access needs). |

### Alternatives Considered But Rejected

| Alternative | Why Rejected |
|-------------|--------------|
| Arcjet (easier in-app protection) | User explicitly said "I don't want 'easy' steps for security" - wanted strongest option |
| Storing keys in .txt file on desktop | Less secure than .env.local - could sync to iCloud, be indexed by Spotlight, accidentally shared |
| Switching to new Supabase Secret API Keys | Overkill for current setup, migration effort not justified |

### Email Template Deliberation

- User noticed appointment emails didn't match invoice email dimensions/proportions
- Updated all 5 appointment-related email files to match invoice format exactly
- User corrected my mistake of using `billing@` for appointment emails → should be `scheduling@`
- User corrected my mistake of adding "and make a payment" to appointment body text → appointments don't require immediate payment

---

## 3. Decisions Made & Why

| Decision | Reasoning |
|----------|-----------|
| **Rotate ALL secret keys** | `.env.local` was committed to git on Nov 17 & Nov 19, 2025 - keys are in git history forever |
| **Remove CRON_SECRET entirely** | No longer used - pg_cron handles jobs in Supabase directly, `/api/cron` folder is empty |
| **Go all-in on Cloudflare WAF** | User already has DNS managed by Cloudflare, familiar with dashboard, wants "correct not easy" |
| **Use Apple Passwords app for key backup** | End-to-end encrypted, biometric locked, better than plain .txt file |
| **Keep legacy Supabase keys** | Works fine for solo operator, new Secret API Keys add complexity without benefit |
| **Use `scheduling@` for appointment emails** | User already has this as alias in Google Workspace, makes sense for appointment-related inquiries |
| **Use `billing@` for invoice emails** | Logical separation - billing questions go to billing email |
| **Nonces as Tier 3 (later)** | Defense-in-depth but lower priority since inputs already sanitized, no user-generated HTML |

---

## 4. Implementations Completed

### Critical Security Fixes

| File | Change | Benefit |
|------|--------|---------|
| `src/app/api/stripe/create-payment-intent/route.js` | **CRITICAL FIX:** Now uses `invoice.total` from database instead of client-sent `amount` | Prevents attackers from paying $0.01 for $500 invoices |
| `src/app/api/stripe/create-payment-intent/route.js` | Added validation: reject if `!invoice.total || invoice.total <= 0` | Catches edge cases with null/zero amounts |
| `src/app/portal/invoices/[id]/pay/page.jsx` | Removed `amount` from all 4 fetch calls to payment-intent API | Client no longer sends amount (not needed) |

### Storage Bucket Policies (SQL)

User to run in Supabase SQL Editor:
```sql
-- 4 policies created for public-assets bucket:
-- 1. Public read access (for logo in emails)
-- 2. Admin-only INSERT
-- 3. Admin-only UPDATE  
-- 4. Admin-only DELETE
```

### Email Template Standardization

| File | Changes |
|------|---------|
| `src/app/api/email/appointment-confirmed/route.js` | Matched invoice format, uses `scheduling@`, body text: "...view the details." |
| `src/app/api/email/appointment-rescheduled/route.js` | Matched invoice format, uses `scheduling@`, body text: "...view the updated details." |
| `src/app/api/email/appointment-cancelled/route.js` | Matched invoice format, uses `scheduling@`, body text: "...view the details." |
| `src/app/api/email/service-request-declined/route.js` | Matched invoice format, uses `scheduling@`, body text: "...view the details or submit a new request." |
| `src/app/api/admin/create-appointment/route.js` | Updated inline email template to match, uses `scheduling@` |

### Key Rotation (User Completed Manually)

| Key | Rotated? |
|-----|----------|
| STRIPE_SECRET_KEY | ✅ Rolled |
| STRIPE_WEBHOOK_SECRET | ✅ Rolled |
| SUPABASE_SERVICE_ROLE_KEY | ✅ Regenerated (also regenerates anon key) |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | ✅ Regenerated with above |
| RESEND_API_KEY | ✅ Rotated |
| TURNSTILE_SECRET_KEY | ✅ Rotated |
| GOOGLE_PLACES_API_KEY | ✅ Rotated |
| RECAPTCHA_SITE_KEY | ✅ Recreated |
| RECAPTCHA_SECRET_KEY | ✅ Recreated |
| CRON_SECRET | ❌ Removed entirely (not used) |

### Items Confirmed Not Needing Rotation

| Variable | Why |
|----------|-----|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public identifier, not a secret |
| `NEXT_PUBLIC_SITE_URL` | Just the website URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL, security is in keys not URL |

---

## 5. My Stated Preferences, Rules & Guidelines

### Security Philosophy
> "I don't want 'easy' steps for security related implementations, because that does not give me the confidence I need to ensure my entire project is secure. I am a hard worker and like to implement right from the start, even if it means that its much more time consuming or harder."

### Email Contact Addresses
| Email Type | Contact Email |
|------------|---------------|
| Invoice-related | `billing@impressyoucleaning.com` |
| Appointment-related | `scheduling@impressyoucleaning.com` |

### Email Body Text Rules
- **Invoice emails:** Can say "view the details and make a payment" (payment expected)
- **Appointment emails:** Should NOT mention payment - just "view the details" or "view the updated details"

### Key Storage Preferences
- `.env.local` in project (gitignored) = acceptable for local dev
- Vercel env vars = production keys
- Apple Passwords app = acceptable for backup
- Plain `.txt` file = NOT acceptable (security risk)

---

## 6. Pending / Next Session

### Immediate To-Dos (User to Complete)
- [ ] Enable MFA on: Supabase, Vercel, GitHub, Cloudflare, Porkbun, Email (Gmail)
- [ ] Run storage policies SQL in Supabase
- [ ] Delete empty `/api/cron` folder
- [ ] Verify storage policies with: `SELECT * FROM pg_policies WHERE tablename = 'objects';`

### Phase 2: RLS Isolation Tests (P2-4)
- Write automated tests proving User A cannot access User B's data
- Tables to test: service_addresses, appointments, invoices, payment_methods, profiles
- Run on every deploy + nightly

### Phase 2: Database Constraints (P2-5)
- Max 3 cards per user (trigger/constraint)
- Foreign keys everywhere
- Amounts > 0
- Status enums + allowed transitions
- NOT NULL on critical fields

### Phase 3: Edge Protection (P3-6, P3-7, P3-8)
- Cloudflare WAF configuration
- Cloudflare rate limiting on auth endpoints
- Re-auth gates for sensitive actions (add/remove payment method, change email/password)

### Phase 4: Detection (P4-9, P4-10)
- Admin audit log table
- Monitoring/alerting (Sentry)

---

## 7. Key Takeaways for Future Claude Sessions

### Critical Security Context
1. **Payment integrity is now fixed** - API uses `invoice.total` from database, ignores any client-sent amount
2. **All secret keys were rotated** on 2025-12-22 because `.env.local` was in git history
3. **CRON_SECRET removed** - pg_cron handles scheduled jobs, no external cron needed
4. **TURNSTILE_SECRET_KEY was missing from Vercel** - now added (server-side verification was failing in production)

### Gotchas Discovered
- Supabase key rotation regenerates BOTH `anon` and `service_role` keys simultaneously when you "Generate new JWT secret"
- No grace period on Supabase key rotation - old keys die instantly
- Stripe key rolling gives 24-hour grace period
- GitHub blocks pushes if commit email exposes personal email - use noreply email

### Important Distinctions
| Thing | What It Is | What It's NOT |
|-------|------------|---------------|
| `api/admin/create-appointment/route.js` | Sends email TO customer | Email FROM customer |
| Legacy Supabase keys | Still fully supported | Being deprecated |
| Nonces | Defense-in-depth | Required for current setup |
| Cloudflare WAF | Edge-level protection | Replacement for in-app security |

### User Reference Names
- Claude Sonnet = "Jake"
- Claude Opus = "Opus"

### Coding Standards Reminder
- Surgical edits only
- Exact file paths with START/END anchors
- Always check mobile/tablet/desktop responsiveness
- Remove debug code before production
- Use existing sanitization functions from `src/lib/sanitize.js`
# Session Log 2025-12-22 — Appendix
## Form Field Fixes, Cloudflare Console Errors, Tawk.to/Twilio Proposal & TypeScript Conversion

**Append this to the main Session Log 2025-12-22**

---

## A. Console Errors Investigation (Dec 20, 2025)

### Chrome DevTools Issues Panel Analysis

After deployment, Chrome DevTools showed 4 issues. Investigation revealed their sources:

| Issue | Source | Fixable? |
|-------|--------|----------|
| "A form field element should have an id or name attribute" | Cloudflare's challenge iframe creates hidden form elements | ❌ External |
| "Content Security Policy blocks 'eval' in JavaScript" | Cloudflare's challenge uses `eval()` internally | ❌ External |
| "Deprecated feature: StorageType.persistent" | Cloudflare's internal code | ❌ External |
| "Page layout may be unexpected due to Quirks Mode" | Cloudflare's challenge iframe document | ❌ External |

**Verdict:** All 4 issues originate from Cloudflare's bot protection layer (`challenges.cloudflare.com`). These are **not fixable** on our end and are safe to ignore. The Issues panel is being overly thorough by flagging third-party iframe contents.

---

## B. Form Field `id`/`name` Attribute Fixes (Dec 20, 2025)

Despite Cloudflare causing the DevTools warnings, a comprehensive audit was performed to ensure all form inputs in our codebase have proper `id` and `name` attributes for accessibility and browser compatibility.

### Files Modified

#### `src/app/admin/settings/page.jsx`
**30+ inputs fixed across all tabs:**
- Business Info inputs (name, phone, email, address)
- Business Hours checkboxes (all days)
- Service area inputs
- Notification preference checkboxes

#### `src/app/admin/appointments/page.jsx`
**6 inputs fixed:**
- Search input → `id="appointment-search"` `name="appointment-search"`
- Status filter select → `id="appointment-status-filter"` `name="appointment-status-filter"`
- Customer select (create modal) → `id="create-appointment-customer"` `name="create-appointment-customer"`
- Address select (create modal) → `id="create-appointment-address"` `name="create-appointment-address"`
- Special instructions textarea → `id="create-appointment-notes"` `name="create-appointment-notes"`
- Notify customer checkbox → `id="notify-customer"` `name="notify-customer"`

#### `src/app/admin/invoices/page.jsx`
**6 inputs fixed:**
- Search input → `id="invoice-search"` `name="invoice-search"`
- Status filter select → `id="invoice-status-filter"` `name="invoice-status-filter"`
- Customer select (create modal) → `id="create-invoice-customer"` `name="create-invoice-customer"`
- Line item descriptions → `id="line-item-description-{index}"` `name="line-item-description-{index}"`
- Notes textarea → `id="create-invoice-notes"` `name="create-invoice-notes"`
- Payment method radio buttons → `id="payment-method-{method}"` (see Section E below)

#### `src/app/portal/settings/page.jsx`
**2 selects fixed:**
- Mobile status filter
- Communication preference select

#### `src/app/admin/reports/page.jsx`
**1 select fixed:**
- Date range filter → `id="date-range-filter"` `name="date-range-filter"`

### Input Component Analysis

The `src/components/ui/Input.jsx` component was verified to auto-generate `id` and `name` attributes using React's `useId()` hook. This means all `<Input />` component usages are automatically compliant. Only raw `<input>`, `<select>`, and `<textarea>` elements needed manual fixes.

---

## C. Tawk.to vs Twilio SMS Proposal (Dec 20, 2025)

### Problem Statement
Tawk.to live chat widget had multiple issues:
- Required extensive CSP configuration (script-src, style-src, font-src, frame-src, connect-src)
- Caused console warnings from their iframe (Quirks Mode, eval, deprecated APIs)
- Limited styling control (their template, not ours)

### Comparison Discussed

| Aspect | Tawk.to (Current) | Twilio |
|--------|-------------------|--------|
| **Cost** | Free | Pay-per-message (~$0.01-0.05/msg) |
| **Setup** | 5 min (paste script) | Days/weeks (build UI, backend, webhooks) |
| **UI Control** | None (their iframe) | 100% (you build it) |
| **Styling** | Dashboard only | Full CSS control |
| **CSP** | Requires loosening | Clean (self-hosted) |
| **Features** | Chat only | Chat, SMS, WhatsApp, Voice |
| **Dashboard** | Included | Build your own or use Flex ($$$) |
| **Mobile app** | Free Tawk.to app | Build your own |

### Simpler Alternative Proposed

Instead of full Twilio chat, a simpler SMS contact form was proposed:

**How it would work:**
1. User clicks "Chat with us"
2. Modal opens: Name, Phone, Message fields
3. User submits
4. API sends SMS to Alex's phone via Twilio
5. Alex texts them back directly

**No chat UI, no iframe, no Tawk.to dashboard.**

### Effort Estimate

| Task | Time |
|------|------|
| Twilio account + phone number | 10 min |
| API route (`/api/send-sms`) | 30 min |
| Update ContactButton modal | 30 min |
| Remove Tawk.to + CSP cleanup | 15 min |
| **Total** | **~1.5 hours** |

### Cost

- Twilio phone number: ~$1.15/month
- SMS: ~$0.0079/message sent

### Decision
**Deferred** — Alex decided to keep Tawk.to for now after CSP fixes resolved the major issues. Twilio SMS remains an option for future implementation.

---

## D. CSP Fixes for Tawk.to (Dec 20, 2025)

### `next.config.mjs` CSP Updates

Multiple CSP directives were updated to allow Tawk.to to function properly:

```javascript
// Before
"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
"font-src 'self' https://fonts.gstatic.com",
"frame-src 'self' https://js.stripe.com https://challenges.cloudflare.com https://www.google.com https://tawk.to",

// After
"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.tawk.to",
"font-src 'self' https://fonts.gstatic.com https://*.tawk.to",
"frame-src 'self' https://js.stripe.com https://challenges.cloudflare.com https://www.google.com https://*.tawk.to",
```

**Key insight:** Tawk.to uses subdomains (`embed.tawk.to`, `va.tawk.to`) so wildcard `https://*.tawk.to` was required instead of just `https://tawk.to`.

---

## E. Invoice Email Notification + TypeScript Conversion (Dec 21, 2025)

### New File Created (TypeScript)

**File:** `src/app/api/email/invoice-ready/route.ts`

This was created as a TypeScript file (not `.js`) per the project convention that new files use `.ts`/`.tsx` extensions.

### TypeScript Implementation Details

```typescript
import { NextResponse, NextRequest } from 'next/server'
import { Resend } from 'resend'

interface InvoiceReadyRequest {
  customerId?: string
  customerEmail: string
  firstName: string
}

export async function POST(request: NextRequest) {
  try {
    const body: InvoiceReadyRequest = await request.json()
    // ... implementation
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

function generateInvoiceReadyEmail(firstName: string): string {
  // ... template
}
```

**TypeScript features used:**
- `NextRequest` type for request parameter
- `InvoiceReadyRequest` interface for request body typing
- `error: unknown` with proper type narrowing
- Explicit return type `: string` on helper function

### Radio Input ID Fix

**File:** `src/app/admin/invoices/page.jsx`

The Mark Paid Modal had radio inputs with `name` but missing `id`:

```jsx
// Before
<input
  type="radio"
  name="paymentMethod"
  value={method}
  ...
/>

// After
<input
  type="radio"
  id={`payment-method-${method}`}
  name="paymentMethod"
  value={method}
  ...
/>
```

This ensures each radio button has a unique `id` for accessibility and label association.

---

## F. ContactButton Revert Decision (Dec 20, 2025)

### Context
Alex initially asked to remove the custom ContactButton and use Tawk.to's native button. After implementation, Alex reconsidered.

### Files Affected

| File | Action |
|------|--------|
| `src/app/(public)/layout.jsx` | ContactButton import + usage restored |
| `src/components/TawkToChat.jsx` | Widget hiding logic restored |
| `src/components/ContactButton.jsx` | No changes (file retained) |

### ContactButton Features Retained
- Custom floating green bubble with pulse animation
- Opens menu with 4 options: Chat, Call, Email, FAQ
- "Chat with us" triggers `Tawk_API.maximize()` to open Tawk.to
- Tawk.to's native button hidden; custom button provides unified UX

---

## G. Mixed JS/TS File Compatibility

### Confirmed: Next.js Handles Mixed Files Seamlessly

The project now contains both JavaScript and TypeScript files:

| Extension | Example Files |
|-----------|---------------|
| `.js` | `src/app/api/admin/invoices/send/route.js` |
| `.jsx` | `src/app/admin/invoices/page.jsx` |
| `.ts` | `src/app/api/email/invoice-ready/route.ts` |
| `.tsx` | `src/app/auth/admin-invited-set-password/page.tsx` |

**Rule established:**
- **New files** → TypeScript (`.ts`/`.tsx`)
- **Existing files** → Keep as-is (`.js`/`.jsx`)
- No need to convert existing files

---

## Summary of Changes (Appendix Topics)

| Category | Files Modified | Key Changes |
|----------|----------------|-------------|
| Form field `id`/`name` fixes | 5 admin pages | 30+ inputs, selects, textareas fixed |
| CSP for Tawk.to | `next.config.mjs` | Added `https://*.tawk.to` to style-src, font-src, frame-src |
| Invoice email | `route.ts` (NEW) | TypeScript API route for invoice notifications |
| Radio input fix | `invoices/page.jsx` | Added `id={`payment-method-${method}`}` |
| ContactButton | `layout.jsx`, `TawkToChat.jsx` | Reverted to custom button + hidden Tawk widget |

---

**End of Appendix**