# Impress Cleaning Services - Project Baseline

**Last Generated:** 2025-12-19

---

## 1. Project Overview

### What This App Does
Impress Cleaning Services is a full-stack B2B SaaS platform for a professional cleaning company serving Central Texas since 1998. The platform provides:

- **Customer Portal**: Authenticated customers manage appointments, invoices, service requests, and account settings
- **Admin Dashboard**: Staff manage customers, appointments, invoices, service requests, and business analytics
- **Public Website**: Marketing pages, online booking, quotes, gift certificates, and job applications

### Geographic Coverage
Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, Austin, Lakeway, Bee Cave, Liberty Hill, Jarrell, Florence, Taylor, and Jonestown, Texas.

### Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js | 16.0.10 |
| UI Library | React | 19.1.0 |
| Language | TypeScript/JavaScript | 5.9.3 |
| Styling | Tailwind CSS | 4.0 |
| Database | Supabase (PostgreSQL) | Latest |
| Auth | Supabase Auth | SSR 0.7.0 |
| Payments | Stripe | 20.0.0 |
| Email | Resend | 6.5.0 |
| Animation | Framer Motion | 12.23.24 |
| Icons | Lucide React + Heroicons | Latest |
| Hosting | Vercel | - |

### Folder Structure

```
src/
├── app/
│   ├── (public)/           # Public marketing pages
│   ├── portal/             # Customer portal (protected)
│   ├── admin/              # Admin dashboard (protected)
│   ├── auth/               # Authentication pages
│   └── api/                # API routes
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── portal/             # Portal-specific components
│   └── admin/              # Admin-specific components
├── lib/
│   ├── supabase/           # Database clients
│   ├── sanitize.js         # Input sanitization
│   ├── rateLimit.js        # Rate limiting
│   └── emailTemplate.js    # Email templates
├── hooks/                  # Custom React hooks
└── types/                  # TypeScript definitions
```

---

## 2. Database Schema

### Enums

| Enum | Values |
|------|--------|
| account_status | pending, active, suspended, deleted |
| appointment_status | pending, confirmed, completed, cancelled, not_completed, en_route |
| communication_preference | text, email, both |
| invoice_status | draft, sent, paid, overdue, cancelled |
| payment_method | stripe, zelle, cash, check |
| request_status | pending, approved, declined, completed |
| service_type | standard, deep, move_in_out, post_construction, office |
| user_role | customer, admin |

### Tables

#### profiles
Primary user accounts synced with auth.users.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, FK to auth.users |
| email | text | Unique |
| first_name, last_name | text | Required for portal access |
| phone | text | Required for portal access |
| role | user_role | customer or admin |
| account_status | account_status | Default: pending |
| stripe_customer_id | text | Synced with Stripe |
| admin_notes | text | Internal notes |
| birth_month, birth_day | integer | Optional birthday |
| communication_preference | enum | Default: both |

#### service_addresses
Customer service locations.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK to profiles |
| street_address, city, state, zip_code | text | Required |
| unit | text | Apt/unit number |
| place_id | text | Google Places ID |
| is_primary | boolean | Default address flag |
| is_registration_address | boolean | Original signup address |

#### appointments
Scheduled cleaning appointments.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| customer_id | uuid | FK to profiles |
| address_id | uuid | FK to service_addresses |
| service_type | service_type | Required |
| scheduled_date | date | Required |
| scheduled_time_start/end | time | Required |
| status | appointment_status | Default: pending |
| team_members | text[] | Employee IDs |
| is_recurring | boolean | Recurring flag |
| recurring_frequency | text | weekly, bi-weekly, etc. |
| parent_recurring_id | uuid | Self-reference for series |

#### invoices
Payment invoices.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| invoice_number | text | Unique, auto-generated (IMP-XXXXXXX) |
| customer_id | uuid | FK to profiles |
| appointment_id | uuid | FK to appointments |
| amount, total | numeric(10,2) | Base and final amounts |
| tax_rate, tax_amount | numeric | Tax calculations |
| status | invoice_status | Default: draft |
| payment_method | payment_method | How paid |
| stripe_payment_intent_id | text | Stripe reference |
| stripe_invoice_id | text | Stripe invoice ID |
| line_items | jsonb | Array of items |
| refund_amount | numeric(10,2) | Default: 0 |
| disputed | boolean | Dispute flag |

#### service_requests
Customer service requests from portal.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| customer_id | uuid | FK to profiles |
| service_type | service_type | Required |
| preferred_date | date | Requested date |
| preferred_time | text | Requested time |
| is_flexible | boolean | Flexibility flag |
| address_id | uuid | FK to service_addresses |
| status | request_status | Default: pending |
| reviewed_by | uuid | Admin who reviewed |

#### service_history
Completed service records (auto-created).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| appointment_id | uuid | FK to appointments |
| customer_id | uuid | FK to profiles |
| completed_date | date | Completion date |
| customer_rating | integer(1-5) | Optional rating |
| customer_feedback | text | Optional feedback |

#### customer_notifications / admin_notifications
User notification queues.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK to auth.users (customer only) |
| type | text | Notification type |
| title, message | text | Content |
| link | text | Related URL |
| is_read | boolean | Read status |

#### payment_methods
Stored Stripe payment methods.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK to profiles |
| stripe_payment_method_id | text | Unique |
| card_brand, card_last4 | text | Card info |
| is_default | boolean | Default method |

#### customer_invite_tokens / auth_handoff_tokens
Authentication tokens for invite flows.

| Column | Type | Notes |
|--------|------|-------|
| token_hash | text | SHA-256 hashed token |
| expires_at | timestamp | Expiration time |
| used_at | timestamp | Single-use marker |

### Key Database Functions

| Function | Purpose |
|----------|---------|
| generate_invoice_number() | Creates unique IMP-XXXXXXX invoice numbers |
| auto_complete_appointments() | Auto-completes past appointments (runs every 15 min) |
| mark_overdue_invoices() | Marks invoices overdue, adds late fees (daily at 2 AM) |
| apply_account_credit() | Applies credits to customer accounts |
| handle_new_user() | Creates profile on auth.users signup |
| link_orphan_invoices() | Links orphan invoices by email on profile creation |

### RLS Policies Summary

- **Admin**: Full access to all tables
- **Customers**: Access own data only (appointments, invoices, addresses, notifications)
- **Public**: Can insert booking_requests only
- **Service Role**: Bypasses RLS for admin operations

---

## 3. Authentication Flow

### Self-Registration Flow
1. User visits `/auth/signup`
2. Enters email/password (or Google OAuth)
3. Email verification sent
4. User verifies at `/auth/verify-email`
5. Profile created via `handle_new_user()` trigger
6. Redirect to `/auth/profile-setup`
7. Complete profile (name, phone, address with Google Places verification)
8. Access granted to `/portal/dashboard`

### Admin Invite Flow
1. Admin creates customer at `/admin/customers`
2. System creates auth user with auto-confirmed email
3. Creates Stripe customer
4. Generates 48-hour invite token (SHA-256 hashed)
5. Sends welcome email with invite link
6. User clicks link → `/api/auth/validate-invite`
7. Generates 30-minute handoff token
8. Redirects to `/auth/set-password`
9. User sets password via `/api/auth/complete-invite`
10. Redirects to `/auth/profile-setup` to complete profile

### Session Management
- **Middleware**: `src/lib/supabase/middleware.js`
- **Cookie-based**: Supabase SSR session tokens
- **Protected Paths**: `/portal/*`, `/admin/*`
- **Auto-refresh**: Session refreshed on each request

### Role-Based Access

| Role | Access |
|------|--------|
| customer | Portal pages, own data only |
| admin | Admin dashboard, all data, customer management |

### Middleware Protection Flow
1. Check user authentication via `supabase.auth.getUser()`
2. If unauthenticated → redirect to `/auth/login?redirectTo=...`
3. For `/admin/*` → verify `role === 'admin'`
4. For `/portal/*` → verify profile complete (name, phone, verified address)
5. Incomplete profile → redirect to `/auth/profile-setup`

### Geographic Restriction
- US-only access enforced via `x-vercel-ip-country` header
- Bots/crawlers exempted via user-agent detection

---

## 4. API Routes

### Admin Routes

| Route | Method | Purpose | Auth |
|-------|--------|---------|------|
| `/api/admin/get-all-appointments` | GET | Fetch all appointments | Admin |
| `/api/admin/get-all-customers` | GET | Fetch all customers | Admin |
| `/api/admin/get-all-invoices` | GET | Fetch all invoices | Admin |
| `/api/admin/get-service-requests` | GET | Fetch pending requests | Admin |
| `/api/admin/create-appointment` | POST | Create appointment | Admin |
| `/api/admin/update-appointment` | POST | Update appointment | Admin |
| `/api/admin/delete-appointment` | POST | Delete appointment | Admin |
| `/api/admin/approve-service-request` | POST | Approve request | Admin |
| `/api/admin/decline-service-request` | POST | Decline request | Admin |
| `/api/admin/create-invoice` | POST | Create invoice | Admin |
| `/api/admin/update-invoice` | POST | Update invoice | Admin |
| `/api/admin/invoices/send` | POST | Send via Stripe | Admin |
| `/api/admin/invoices/mark-paid` | POST | Mark as paid | Admin |
| `/api/admin/invoices/cancel` | POST | Cancel invoice | Admin |
| `/api/admin/invoices/apply-credit` | POST | Apply credit | Admin |
| `/api/admin/customers/create` | POST | Create customer | Admin |

### Customer Portal Routes

| Route | Method | Purpose | Auth |
|-------|--------|---------|------|
| `/api/customer-portal/invoice/[id]` | GET | Get own invoice | Customer |
| `/api/customer-portal/service-requests` | POST | Submit request | Customer |
| `/api/customer-portal/delete-account` | DELETE | Soft-delete account | Customer |

### Stripe Routes

| Route | Method | Purpose | Auth |
|-------|--------|---------|------|
| `/api/stripe/create-payment-intent` | POST | Create payment intent | Customer |
| `/api/stripe/create-setup-intent` | POST | Save payment method | Customer |
| `/api/stripe/save-payment-method` | POST | Attach payment method | Customer |
| `/api/stripe/pay-stripe-invoice` | POST | Pay Stripe invoice | Customer |

### Email Routes

| Route | Method | Purpose | Auth |
|-------|--------|---------|------|
| `/api/email/appointment-confirmed` | POST | Confirmation email | Internal |
| `/api/email/appointment-cancelled` | POST | Cancellation email | Internal |
| `/api/email/appointment-rescheduled` | POST | Reschedule email | Internal |
| `/api/email/service-request-declined` | POST | Decline email | Internal |
| `/api/email/notify-appointment-change` | POST | Admin notification | Customer |
| `/api/email/customer-welcome` | POST | Welcome email | Admin |

### Webhook Routes

| Route | Method | Purpose | Auth |
|-------|--------|---------|------|
| `/api/webhooks/stripe` | POST | Stripe events | Signature |

**Handled Stripe Events:**
- `invoice.finalized`, `invoice.paid`, `invoice.payment_failed`, `invoice.voided`
- `checkout.session.completed`
- `payment_intent.succeeded`, `payment_intent.payment_failed`
- `charge.succeeded`, `charge.refunded`
- `charge.dispute.created`, `charge.dispute.closed`

### Public Routes

| Route | Method | Purpose | Auth |
|-------|--------|---------|------|
| `/api/booking` | POST | Create booking | None |
| `/api/booking/[id]` | GET | Get booking | None |
| `/api/create-gift-checkout` | POST | Gift certificate checkout | None |
| `/api/send-gift-certificate` | POST | Send gift email | None |
| `/api/verify-recaptcha` | POST | Verify reCAPTCHA | None |

### Auth Routes

| Route | Method | Purpose | Auth |
|-------|--------|---------|------|
| `/api/auth/validate-invite` | GET | Validate invite token | None |
| `/api/auth/complete-invite` | POST | Set password | None |
| `/api/auth/verify-handoff` | POST | Verify handoff token | None |

---

## 5. Frontend Pages

### Public Pages (17 total)

| Route | Description |
|-------|-------------|
| `/` | Homepage with services overview |
| `/about-us` | Company history and team |
| `/residential-section` | Residential cleaning services |
| `/commercial` | Commercial cleaning services |
| `/booking` | Online booking form |
| `/booking/confirmation` | Booking success page |
| `/service-quote` | Quote request form |
| `/gift-certificate` | Purchase gift certificates |
| `/gift-certificate/success` | Gift purchase success |
| `/cleaning-tips` | Expert cleaning tips |
| `/faq` | Frequently asked questions |
| `/apply` | Job applications (English) |
| `/apply/jobs/[slug]` | Specific job application |
| `/aplicar` | Job applications (Spanish) |
| `/aplicar/trabajos/[slug]` | Specific job (Spanish) |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |

### Auth Pages (8 total)

| Route | Description |
|-------|-------------|
| `/auth/login` | Customer login |
| `/auth/signup` | Customer registration |
| `/auth/verify-email` | Email verification |
| `/auth/forgot-password` | Password reset request |
| `/auth/reset-password` | Set new password |
| `/auth/set-password` | Initial password (invites) |
| `/auth/profile-setup` | Complete profile |
| `/auth/admin-invited-set-password` | Admin staff invite |

### Portal Pages (9 total)

| Route | Description |
|-------|-------------|
| `/portal/dashboard` | Customer home with overview |
| `/portal/appointments` | View/manage appointments |
| `/portal/request-service` | Submit service request |
| `/portal/invoices` | View all invoices |
| `/portal/invoices/[id]/pay` | Pay specific invoice |
| `/portal/service-history` | Past services |
| `/portal/customer-feedback` | Submit feedback/reviews |
| `/portal/notifications` | Notification center |
| `/portal/settings` | Account settings |

### Admin Pages (9 total)

| Route | Description |
|-------|-------------|
| `/admin/dashboard` | Business metrics overview |
| `/admin/appointments` | Appointment management |
| `/admin/requests` | Service request queue |
| `/admin/customers` | Customer management |
| `/admin/invoices` | Invoice management |
| `/admin/reports` | Analytics and reports |
| `/admin/notifications` | Admin notifications |
| `/admin/settings` | System settings |
| `/admin/send-welcome` | Send welcome emails |

---

## 6. User Flows

### Customer Signup → Portal Access
```
Signup → Verify Email → Profile Setup (name, phone, address) → Portal Dashboard
```

### Service Request → Appointment
```
Customer: Request Service (portal)
    ↓
Admin: Reviews in /admin/requests
    ↓
Admin: Approve → Creates Appointment → Sends Confirmation Email
   or
Admin: Decline → Sends Decline Email with Reason
```

### Invoice → Payment
```
Admin: Create Invoice → Send via Stripe
    ↓
Customer: Receives email notification
    ↓
Customer: Views in /portal/invoices → Clicks Pay
    ↓
Pay with Stripe (card) → Invoice marked paid
   or
Pay with Zelle → Admin marks as paid → Customer notified
```

### Admin Invite Flow
```
Admin: Create Customer (/admin/customers)
    ↓
System: Creates auth user, Stripe customer, invite token
    ↓
Email: Welcome email with 48-hour invite link
    ↓
Customer: Clicks link → Set password → Profile setup → Portal
```

---

## 7. Integrations

### Stripe
- **Purpose**: Payment processing, invoices, refunds
- **Webhook**: `/api/webhooks/stripe`
- **Events**: invoice.*, payment_intent.*, charge.*, checkout.session.completed

### Resend
- **Purpose**: Transactional emails
- **Templates**: Appointment confirmations, invoices, welcome emails
- **From**: notifications@impressyoucleaning.com

### Google Places API
- **Purpose**: Address autocomplete and validation
- **Component**: `AddressAutocomplete.tsx`
- **Restrictions**: US addresses only

### Cloudflare Turnstile
- **Purpose**: Bot prevention (CAPTCHA alternative)
- **Component**: `TurnstileWidget.jsx`
- **Used in**: Booking forms, job applications

### Google reCAPTCHA v3
- **Purpose**: Invisible bot scoring
- **Used in**: Quote form (via Formspree)

### Supabase
- **Purpose**: Database, auth, real-time subscriptions
- **Clients**: Browser, Server, Admin (service role)

### Vercel Analytics
- **Purpose**: Performance and usage tracking
- **Components**: @vercel/analytics, @vercel/speed-insights

### Google Analytics 4
- **Tracking ID**: G-99P0RRZZ61
- **Purpose**: Website analytics

### Tawk.to
- **Purpose**: Live chat support
- **Component**: `TawkToChat.jsx`

### Formspree
- **Form ID**: xblzwdek
- **Purpose**: Quote form submissions

---

## 8. Components Library

### UI Components (`src/components/ui/`)

| Component | Props | Description |
|-----------|-------|-------------|
| Button | variant, size, loading, fullWidth | Primary action button |
| Input | label, error, icon, fullWidth | Form input with label |
| PasswordInput | (extends Input) | Password with visibility toggle |
| Select | label, error, options | Dropdown select |
| Textarea | label, error, resize, rows | Multi-line text input |
| Badge | variant, size | Status indicator |
| Card | padding, hover | Content container |
| Modal | isOpen, onClose, title, maxWidth | Dialog overlay |
| LoadingSpinner | size | Loading indicator |
| SkeletonLoader | count, height, width | Loading placeholder |
| SelectableCard | selected, icon, title, description | Selection card |
| Toast | - | Notification toasts (react-hot-toast) |
| AddressAutocomplete | onSelect, defaultValue | Google Places input |
| TurnstileWidget | onVerify, onError | CAPTCHA widget |

### Variants

**Button variants**: primary, secondary, text, danger

**Button sizes**: sm, md, lg

**Badge variants**: default, success, warning, danger, info, primary

**Card padding**: none, sm, default, lg

### Portal Components (`src/components/portal/`)

| Component | Description |
|-----------|-------------|
| PortalNav | Sidebar + mobile navigation |
| PageTitle | Dynamic document.title |
| SupportCard | Contact info display |
| RecentNotificationsCard | Notification list with real-time updates |

### Admin Components (`src/components/admin/`)

| Component | Description |
|-----------|-------------|
| AdminNav | Admin sidebar with request badge |
| AdminNotificationBell | Unread notification count |

### Global Components (`src/components/`)

| Component | Description |
|-----------|-------------|
| Header | Responsive navigation |
| Footer | Site footer with links |
| Breadcrumbs | Navigation trail |
| ContactButton | Floating contact menu |
| TawkToChat | Live chat integration |
| PageTransition | Framer Motion animations |
| StaggerItem | Staggered animations |

---

## 9. Validation & Security

### Input Sanitization (`src/lib/sanitize.js`)

| Function | Purpose |
|----------|---------|
| sanitizeText | Strip XSS patterns (<>, javascript:, event handlers) |
| sanitizeEmail | ReDoS-safe validation, max 254 chars |
| sanitizePhone | Digits, spaces, hyphens only |
| sanitizeUrl | HTTPS only, block dangerous protocols |
| sanitizeMoney | Digits and decimal, returns X.XX |
| sanitizeReference | Alphanumeric and hyphens, uppercase |
| escapeHtml | Entity encoding (&, <, >, ", ') |

### Phone Validation Rules
- Exactly 10 digits after stripping
- Blocks 555 prefix (reserved)
- Blocks all same digits (0000000000)
- Blocks sequential patterns (1234567890)
- Blocks invalid area codes (000, 111, 555, 999, 123)

### Address Validation Rules
- Minimum 15 characters
- Must contain street number
- Must match valid street suffix (st, ave, rd, dr, etc.)
- Must contain 5-digit ZIP code
- Blocks fake patterns (test, asdf, n/a)
- Blocks 5+ repeated characters

### Rate Limiting (`src/lib/rateLimit.js`)
- Database-backed via Supabase `rate_limits` table
- Default: 5 attempts per 15-minute window
- Tracks by IP address + action

### Protected Routes
- `/portal/*`: Requires auth + complete profile
- `/admin/*`: Requires auth + admin role
- Geographic: US-only traffic allowed

### Webhook Security
- Stripe: Signature verification with `STRIPE_WEBHOOK_SECRET`

### Token Security
- SHA-256 hashing for stored tokens
- Invite tokens: 48-hour expiration
- Handoff tokens: 30-minute expiration
- One-time use enforcement

---

## 10. Environment Variables

### Required Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=

# Google Places
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# reCAPTCHA (optional, for Formspree)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=

# Site
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_APP_URL=

# Admin
ADMIN_EMAIL=
ADMIN_SMS_EMAIL=

# Cron Jobs
CRON_SECRET=
```

---

## 11. Key Patterns

### Date Handling (Timezone-Safe)
```javascript
// Always use date-fns for formatting
import { format, parseISO } from 'date-fns'

// Store dates in UTC, display in local
const displayDate = format(parseISO(dateString), 'MMM d, yyyy')
```

### Realtime Subscriptions (Leak Prevention)
```javascript
useEffect(() => {
  const subscription = supabase
    .channel('notifications')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'customer_notifications' }, handleChange)
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}, [])
```

### Loading States
```javascript
// Use SkeletonLoader presets
import { DashboardSkeleton, InvoicesSkeleton } from '@/components/ui/SkeletonLoader'

if (loading) return <DashboardSkeleton />
```

### Error Handling
```javascript
try {
  const { data, error } = await supabase.from('table').select()
  if (error) throw error
  return data
} catch (error) {
  console.error('Operation failed:', error)
  toast.error('Something went wrong')
  return null
}
```

### Admin Client Pattern
```javascript
// For admin operations that bypass RLS
import { supabaseAdmin } from '@/lib/supabase/admin'

const { data } = await supabaseAdmin.from('profiles').select('*')
```

### Invoice Number Generation
```javascript
// Auto-generated via database function
const { data } = await supabase.rpc('generate_invoice_number')
// Returns: IMP-A7B2C9X
```

### Sanitization Pattern
```javascript
import { sanitizeText, sanitizeEmail, sanitizePhone } from '@/lib/sanitize'

const cleanData = {
  name: sanitizeText(formData.name)?.slice(0, 100) || '',
  email: sanitizeEmail(formData.email),
  phone: sanitizePhone(formData.phone),
}
```

### Protected API Route Pattern
```javascript
export async function GET(request) {
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
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Proceed with admin operation...
}
```

---

## Quick Reference

### Common Commands

```bash
# Development
npm run dev         # Start dev server with Turbopack

# Build
npm run build       # Production build
npm run start       # Start production server

# Linting
npm run lint        # Run ESLint
```

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/middleware.js` | Global middleware (geo, auth) |
| `src/lib/supabase/middleware.js` | Supabase session + route protection |
| `src/lib/sanitize.js` | Input sanitization utilities |
| `src/lib/rateLimit.js` | Rate limiting |
| `src/lib/emailTemplate.js` | Email template builder |
| `src/types/supabase.ts` | Database type definitions |

### Important URLs

| URL | Purpose |
|-----|---------|
| `/portal/dashboard` | Customer home |
| `/admin/dashboard` | Admin home |
| `/api/webhooks/stripe` | Stripe webhook endpoint |
| `/auth/login` | Login page |
| `/auth/profile-setup` | Profile completion |
