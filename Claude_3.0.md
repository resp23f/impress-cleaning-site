# Impress Cleaning Services - Comprehensive Project Analysis
## Version 3.0 - Updated December 2024

---

## 📋 CHANGELOG FROM VERSION 2.0

### Admin Appointments Page (`src/app/admin/appointments/page.jsx`)
**Status: COMPLETELY REVAMPED**

| Change | Details |
|--------|---------|
| **Clickable Stat Cards** | Total, Today, Confirmed, Pending, En Route - click to filter instantly |
| **Active Filter Indicator** | Visual highlight shows which filter is active |
| **Create Appointment Modal** | Full modal with customer dropdown, address selection, service type, calendar date picker, time windows (Morning/Afternoon/Evening) |
| **Modern Design** | Gradient background, rounded cards, smooth hover transitions, skeleton loader |
| **Customer/Address Auto-Select** | When customer selected, their addresses load automatically with primary pre-selected |
| **Clear Filters Button** | Easy reset for all active filters |
| **Debug Code Removed** | All `console.log` and `console.error` statements removed |
| **Sanitization Added** | `searchQuery` and `special_instructions` now sanitized |

**New Features:**
- Admin can now create appointments directly (not just from service requests)
- Appointments created by admin auto-confirm and send customer email + portal notification
- Time windows: Morning (8AM-12PM), Afternoon (12PM-3PM), Evening (3PM-5:45PM)

---

### Admin Invoices Page (`src/app/admin/invoices/page.jsx`)
**Status: COMPLETELY REVAMPED**

| Change | Details |
|--------|---------|
| **Clickable Stat Cards** | Total, Paid, Pending, Overdue, Revenue - click to filter (except Revenue) |
| **Active Filter Indicator** | Visual highlight shows which filter is active |
| **Edit Draft Invoice** | New feature - modify draft invoices before sending |
| **Resend Invoice** | New feature - resend emails for sent/overdue invoices |
| **Modern Design** | Matches appointments page - gradient background, premium cards, skeleton loader |
| **Tax Selection Buttons** | Visual toggle buttons (8.25%, No Tax, Custom) instead of dropdown |
| **Payment Method Selection** | Radio buttons with visual selection state for Mark as Paid |
| **Debug Code Removed** | All 13 `console.log` and `console.error` statements removed |
| **Sanitization Added** | `searchQuery`, `newInvoice.notes`, line item descriptions, customer fields all sanitized |

**New Features:**
- **Edit Draft**: Opens pre-filled modal for draft invoices, "Save Changes" updates the invoice
- **Resend Invoice**: Button appears for sent/overdue invoices, resends email to customer

---

### Files Modified This Session

| File | Status | Changes |
|------|--------|---------|
| `src/app/admin/appointments/page.jsx` | **REPLACED** | Complete rewrite with new features |
| `src/app/admin/invoices/page.jsx` | **REPLACED** | Complete rewrite with new features |

---

### Security Improvements

| Area | Implementation |
|------|----------------|
| **Input Sanitization** | All user inputs sanitized via `sanitizeText()` from `@/lib/sanitize.js` |
| **Debug Code Removal** | All `console.log` and `console.error` removed from production frontend |
| **XSS Prevention** | Text inputs sanitized before database operations and filtering |

---

## 1. Project Overview

### What the App Does
Impress Cleaning Services is a full-stack web application for managing a residential and commercial cleaning business. It provides:
- **Customer Portal**: Service booking, appointment management, invoice payments, and account management
- **Admin Dashboard**: Customer management, service request handling, appointment scheduling, invoicing, and business analytics
- **Public Website**: Service information, booking requests, and gift certificate purchases

### Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Lucide React (icons)
- Framer Motion (animations)
- React Hot Toast (notifications)
- Canvas Confetti (payment success celebrations)

**Backend:**
- Next.js API Routes (serverless)
- Supabase (PostgreSQL database + Auth + Row Level Security)

**Third-Party Services:**
- **Stripe**: Payment processing, invoicing, saved payment methods
- **Resend**: Transactional emails
- **Cloudflare Turnstile**: CAPTCHA protection
- **Google Places API**: Address autocomplete

### Folder Structure Overview

```
impress-cleaning-site/
├── src/
│   ├── app/
│   │   ├── (public)/         # Public marketing pages
│   │   ├── admin/            # Admin dashboard pages
│   │   ├── api/              # API routes
│   │   │   ├── admin/        # Admin-only endpoints
│   │   │   ├── customer-portal/  # Customer endpoints
│   │   │   ├── email/        # Email sending endpoints
│   │   │   ├── stripe/       # Stripe payment endpoints
│   │   │   └── webhooks/     # Stripe webhook handler
│   │   ├── auth/             # Authentication pages
│   │   └── portal/           # Customer portal pages
│   ├── components/
│   │   ├── admin/            # Admin-specific components
│   │   ├── layout/           # Layout components
│   │   └── ui/               # Reusable UI components
│   └── lib/
│       ├── supabase/         # Supabase clients
│       └── sanitize.js       # Input sanitization
├── public/                   # Static assets
└── CLAUDE.md                 # Project context file
```

---

## 2. Database Schema

### Tables and Columns

#### profiles (Core User Profile)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | FK to auth.users |
| email | TEXT (UNIQUE) | User email |
| full_name | TEXT | Customer/admin name |
| phone | TEXT | Contact phone |
| role | ENUM | 'customer' or 'admin' |
| account_status | ENUM | 'pending', 'active', 'suspended' |
| communication_preference | ENUM | 'text', 'email', 'both' |
| avatar_url | TEXT | Profile picture URL |
| stripe_customer_id | TEXT | Linked Stripe customer ID |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

#### appointments (Service Appointments)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Appointment ID |
| customer_id | UUID (FK) | References profiles.id |
| address_id | UUID (FK) | References service_addresses.id |
| service_type | ENUM | standard, deep, move_in_out, post_construction, office |
| scheduled_date | DATE | Service date |
| scheduled_time_start | TIME | Start time |
| scheduled_time_end | TIME | End time |
| status | ENUM | pending, confirmed, completed, cancelled, not_completed, en_route |
| team_members | TEXT[] | Array of team member names |
| special_instructions | TEXT | Customer notes |
| is_recurring | BOOLEAN | Recurring flag |
| recurring_frequency | TEXT | weekly, biweekly, monthly |
| parent_recurring_id | UUID (FK) | Self-reference for recurring series |
| completed_at | TIMESTAMP | Completion timestamp |
| cancelled_at | TIMESTAMP | Cancellation timestamp |
| cancellation_reason | TEXT | Reason for cancellation |

#### service_addresses (Customer Service Locations)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Address ID |
| user_id | UUID (FK) | References profiles.id |
| street_address | TEXT | Street address |
| unit | TEXT | Apartment/unit number |
| city | TEXT | City |
| state | TEXT | State |
| zip_code | TEXT | ZIP code |
| place_id | TEXT | Google Maps place ID |
| is_primary | BOOLEAN | Default service address |

#### invoices (Customer Invoices)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Invoice ID |
| invoice_number | TEXT (UNIQUE) | Format: IMP-XXXXXXX |
| customer_id | UUID (FK) | References profiles.id (nullable) |
| appointment_id | UUID (FK) | References appointments.id (nullable) |
| amount | NUMERIC(10,2) | Base amount |
| total | NUMERIC | Total with tax |
| tax_rate | NUMERIC | Tax percentage |
| tax_amount | NUMERIC(10,2) | Tax amount |
| status | ENUM | draft, sent, paid, overdue, cancelled |
| due_date | DATE | Payment due date |
| paid_date | DATE | Payment received date |
| payment_method | ENUM | stripe, zelle, cash, check |
| stripe_payment_intent_id | TEXT | Stripe payment intent ID |
| stripe_invoice_id | TEXT (UNIQUE) | Stripe invoice ID |
| customer_email | TEXT | Email for orphan invoices |
| line_items | JSONB | Array of {description, rate, quantity} |
| notes | TEXT | Invoice notes |
| refund_amount | NUMERIC(10,2) | Refund amount |
| refund_reason | TEXT | Reason for refund |
| disputed | BOOLEAN | Dispute flag |
| archived | BOOLEAN | Archive flag |

#### service_requests (Customer Service Requests)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Request ID |
| customer_id | UUID (FK) | References profiles.id |
| service_type | ENUM | Type requested |
| preferred_date | DATE | Requested service date |
| preferred_time | TEXT | Requested time bucket |
| is_flexible | BOOLEAN | Flexible on timing |
| address_id | UUID (FK) | References service_addresses.id |
| special_requests | TEXT | Customer notes |
| is_recurring | BOOLEAN | Recurring service flag |
| recurring_frequency | TEXT | weekly, biweekly, monthly |
| status | ENUM | pending, approved, declined, completed |
| admin_notes | TEXT | Admin review notes |
| reviewed_by | UUID (FK) | References profiles.id (admin) |
| reviewed_at | TIMESTAMP | Review timestamp |

#### service_history (Completed Service Records)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | History ID |
| appointment_id | UUID (FK) | References appointments.id |
| customer_id | UUID (FK) | References profiles.id |
| service_type | ENUM | Type of service completed |
| completed_date | DATE | Completion date |
| team_members | TEXT[] | Team members who performed service |
| photos | TEXT[] | URLs of service photos |
| notes | TEXT | Service notes |
| customer_rating | INTEGER | 1-5 star rating |
| customer_feedback | TEXT | Customer feedback |

#### payment_methods (Saved Payment Methods)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Payment method ID |
| user_id | UUID (FK) | References profiles.id |
| stripe_payment_method_id | TEXT (UNIQUE) | Stripe payment method ID |
| card_brand | TEXT | Visa, Mastercard, etc. |
| card_last4 | TEXT | Last 4 digits |
| card_exp_month | INTEGER | Expiration month |
| card_exp_year | INTEGER | Expiration year |
| is_default | BOOLEAN | Default payment method |

#### customer_credits (Account Credits/Refunds)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Credit ID |
| customer_id | UUID (FK) | References profiles.id |
| amount | NUMERIC(10,2) | Credit amount |
| description | TEXT | Reason for credit |
| invoice_id | UUID (FK) | Related invoice (nullable) |
| created_by | UUID (FK) | Admin who created (nullable) |

#### customer_notifications (Customer In-App Notifications)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Notification ID |
| user_id | UUID (FK) | References auth.users |
| type | TEXT | Notification type |
| title | TEXT | Notification title |
| message | TEXT | Notification message |
| link | TEXT | Link to related resource |
| reference_id | UUID | ID of related resource |
| reference_type | TEXT | Type of resource |
| is_read | BOOLEAN | Read status |
| read_at | TIMESTAMP | When read |

#### admin_notifications (Admin System Notifications)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Notification ID |
| type | TEXT | Notification type |
| title | TEXT | Notification title |
| message | TEXT | Notification message |
| link | TEXT | Link to related resource |
| is_read | BOOLEAN | Read status |

#### admin_settings (Configuration - Singleton)
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK) | Always 1 |
| business_name | TEXT | Business name |
| business_email | TEXT | Business email |
| business_phone | TEXT | Phone number |
| price_standard | INTEGER | Standard cleaning price |
| price_deep | INTEGER | Deep cleaning price |
| price_move_in_out | INTEGER | Move in/out price |
| price_post_construction | INTEGER | Post-construction price |
| price_office | INTEGER | Office cleaning price |
| business_hours | JSONB | Hours by day |

#### booking_requests (Public Booking Inquiries)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Booking ID |
| name | TEXT | Customer name |
| email | TEXT | Customer email |
| phone | TEXT | Customer phone |
| address | TEXT | Service address |
| service_type | TEXT | Requested service type |
| preferred_date | TEXT | Preferred date |
| status | TEXT | pending, processed, etc. |

#### customer_reviews (Service Reviews)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Review ID |
| customer_id | UUID (FK) | References auth.users |
| rating | INTEGER | 1-5 star rating |
| review_text | TEXT | Review content |

### Relationships
- **profiles** 1:N appointments, service_addresses, service_requests, invoices, payment_methods
- **appointments** N:1 profiles, N:1 service_addresses, 1:N service_history
- **invoices** N:1 profiles (nullable), N:1 appointments (nullable)
- **service_requests** N:1 profiles, N:1 service_addresses

### Row Level Security Policies
- **Customers**: Can view/update only their own data (own profile, addresses, appointments, invoices)
- **Admins**: Full access to all data (role = 'admin' check via `is_admin()` function)
- **Service Role**: Internal operations bypass RLS

---

## 3. Authentication Flow

### How Users Sign Up
**File:** `src/app/auth/signup/page.jsx`

1. User enters email, password (8+ chars), completes CAPTCHA
2. `supabase.auth.signUp()` creates auth user
3. Database trigger `handle_new_user()` creates profile with role='customer'
4. User redirected to `/auth/verify-email`
5. User clicks email verification link
6. Redirects to `/auth/callback` which exchanges code for session
7. If profile incomplete, redirects to `/auth/profile-setup`

### How Users Log In
**File:** `src/app/auth/login/page.jsx`

1. User enters email, password, completes CAPTCHA
2. `supabase.auth.signInWithPassword()` authenticates
3. Checks email verification status
4. Fetches user profile to check role and completeness
5. If admin → `/admin/dashboard`
6. If customer → `/portal/dashboard`

**Recent Updates:**
- Added inline error message box (red background, AlertCircle icon)
- Added useEffect to clear stale session on page load
- Error clears when user starts typing
- Turnstile CAPTCHA resets on error

### How Sessions are Managed
**Files:** `src/lib/supabase/middleware.js`, `src/lib/supabase/server.js`

- Next.js middleware runs on every request
- `updateSession()` refreshes tokens automatically
- HTTP-only secure cookies managed by Supabase SSR
- Protected routes (`/portal/*`, `/admin/*`) require authentication

### Role-Based Access
- **Roles**: `customer` (default), `admin`
- **Middleware**: Checks auth for `/portal/*` and `/admin/*`
- **Admin check**: Fetches profile, verifies `role === 'admin'`
- **RLS**: Database policies enforce access at query level

---

## 4. All API Routes

### Admin Routes (`/api/admin/`)

| Route | Method | Description |
|-------|--------|-------------|
| `/admin/approve-service-request` | POST | Approves request, creates appointment, sends confirmation email |
| `/admin/decline-service-request` | POST | Declines request with reason, sends decline email |
| `/admin/create-appointment` | POST | **NEW** - Admin creates appointment directly with email + notification |
| `/admin/create-invoice` | POST | Creates draft invoice with line items |
| `/admin/invoices/send` | POST | Finalizes invoice in Stripe, sends to customer |
| `/admin/invoices/mark-paid` | POST | Marks invoice paid (for Zelle/cash/check) |
| `/admin/invoices/cancel` | POST | Cancels invoice, voids in Stripe if applicable |
| `/admin/invoices/apply-credit` | POST | Applies customer credit to invoice |
| `/admin/update-appointment` | POST | Updates appointment, sends reschedule email if date changed |
| `/admin/get-all-customers` | GET | Returns all customer profiles with addresses |
| `/admin/get-all-appointments` | GET | Returns all appointments with customer/address data |
| `/admin/customers/create` | POST | Admin creates customer account |
| `/admin/notifications/[id]/read` | POST | Marks admin notification as read |

### Customer Portal Routes (`/api/customer-portal/`)

| Route | Method | Description |
|-------|--------|-------------|
| `/customer-portal/service-requests` | POST | Submits new service request |
| `/customer-portal/profile` | GET/PUT | Get or update customer profile |
| `/customer-portal/addresses` | GET/POST | List or add service addresses |
| `/customer-portal/addresses/[id]` | PUT/DELETE | Update or delete address |
| `/customer-portal/appointments` | GET | List customer appointments |
| `/customer-portal/appointments/[id]` | GET | Get appointment details |
| `/customer-portal/invoice/[id]` | GET | Get invoice details |
| `/customer-portal/notifications` | GET | List customer notifications |
| `/customer-portal/notifications/[id]/read` | POST | Mark notification as read |

### Stripe Routes (`/api/stripe/`)

| Route | Method | Description |
|-------|--------|-------------|
| `/stripe/create-payment-intent` | POST | Creates payment intent for portal invoice |
| `/stripe/pay-stripe-invoice` | POST | Pays Stripe Dashboard invoice |
| `/stripe/create-setup-intent` | POST | Creates setup intent for saving cards |
| `/stripe/save-payment-method` | POST | Saves payment method to customer |
| `/stripe/delete-payment-method` | POST | Removes saved payment method |

### Email Routes (`/api/email/`)

| Route | Method | Description |
|-------|--------|-------------|
| `/email/appointment-confirmed` | POST | Sends appointment confirmation |
| `/email/appointment-cancelled` | POST | Sends cancellation notice |
| `/email/appointment-rescheduled` | POST | Sends reschedule notice |
| `/email/admin-new-registration` | POST | Notifies admin of new customer signup |
| `/email/notify-appointment-change` | POST | Notifies admin of customer reschedule/cancel request |

### Webhook Routes (`/api/webhooks/`)

| Route | Method | Description |
|-------|--------|-------------|
| `/webhooks/stripe` | POST | Handles all Stripe webhook events |

### Other Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/booking` | POST | Public booking form submission |
| `/create-gift-checkout` | POST | Creates Stripe checkout for gift certificates |
| `/send-gift-certificate` | POST | Sends gift certificate email |
| `/notifications/zelle-alert` | POST | Alerts admin of Zelle payment claim |

---

## 5. Frontend Pages

### Public Pages (`src/app/(public)/`)

| Page | Description |
|------|-------------|
| `/` | Landing page with services overview |
| `/services` | Service types and pricing |
| `/about` | Company information |
| `/contact` | Contact form |
| `/booking` | Public booking request form |
| `/gift-certificates` | Gift certificate purchase |

### Auth Pages (`src/app/auth/`)

| Page | Description |
|------|-------------|
| `/auth/login` | Login with email/password |
| `/auth/signup` | Create new account |
| `/auth/verify-email` | Email verification notice |
| `/auth/profile-setup` | Complete profile after signup |
| `/auth/forgot-password` | Request password reset |
| `/auth/reset-password` | Set new password |
| `/auth/callback` | OAuth/email verification handler |

### Customer Portal Pages (`src/app/portal/`)

| Page | Description |
|------|-------------|
| `/portal/dashboard` | Customer dashboard with overview |
| `/portal/request-service` | Submit new service request |
| `/portal/appointments` | List all appointments (with reschedule/cancel) |
| `/portal/invoices` | List all invoices |
| `/portal/invoices/[id]/pay` | Pay specific invoice |
| `/portal/settings` | **UPDATED** - Profile, password, email change sections |
| `/portal/addresses` | Manage service addresses |
| `/portal/payment-methods` | Manage saved cards |
| `/portal/notifications` | View notifications |

### Admin Pages (`src/app/admin/`)

| Page | Description |
|------|-------------|
| `/admin/dashboard` | Admin dashboard with stats |
| `/admin/requests` | View/manage service requests |
| `/admin/customers` | Customer list and management |
| `/admin/customers/[id]` | Customer detail view |
| `/admin/customers/create` | Create new customer |
| `/admin/appointments` | **REVAMPED** - Appointment management with create feature |
| `/admin/invoices` | **REVAMPED** - Invoice management with edit/resend features |
| `/admin/reports` | Business reports/analytics |
| `/admin/settings` | Business settings |

---

## 6. Detailed User Flows

### Flow A: New Customer Signup
*(Unchanged from v2.0)*

### Flow B: Customer Submits Service Request
*(Unchanged from v2.0)*

### Flow C: Admin Approves Service Request
*(Unchanged from v2.0)*

### Flow D: Admin Declines Service Request
*(Unchanged from v2.0)*

### Flow E: Admin Creates Appointment Directly (NEW)

**Files involved:**
- `src/app/admin/appointments/page.jsx`
- `src/app/api/admin/create-appointment/route.js`

**Step-by-step:**
1. Admin visits `/admin/appointments`
2. Clicks "New Appointment" button
3. Create Appointment modal opens
4. Selects customer from dropdown
5. Customer's addresses auto-populate (primary pre-selected)
6. Selects service type (Standard, Deep, Move In/Out, Post-Construction, Office)
7. Picks date from calendar (up to 3 months ahead)
8. Selects time window (Morning 8-12, Afternoon 12-3, Evening 3-5:45)
9. Optionally adds special instructions
10. Clicks "Create Appointment"
11. `handleCreateAppointment()` calls `POST /api/admin/create-appointment`
12. API creates appointment with status='confirmed'
13. Creates customer_notifications record
14. Sends confirmation email to customer via Resend
15. Toast success, modal closes, list refreshes

### Flow F: Admin Reschedules Appointment
*(Unchanged from v2.0)*

### Flow G: Customer Reschedules Appointment (UPDATED)

**Files involved:**
- `src/app/portal/appointments/page.jsx`
- `src/app/api/email/notify-appointment-change/route.js`

**Step-by-step:**
1. Customer visits `/portal/appointments`
2. Finds upcoming appointment (more than 48 hours away)
3. Clicks "Reschedule" button (disabled if within 48 hours)
4. Selects new date and time
5. Confirms reschedule
6. API updates appointment: status='pending' (not 'confirmed')
7. Creates admin_notifications record
8. Sends admin notification email
9. Sends customer email confirming request is pending approval
10. Toast: "Reschedule request submitted - pending admin approval"

**Key Change:** Customer reschedules now require admin approval (status goes to 'pending')

### Flow H: Customer Cancels Appointment (UPDATED)

**Files involved:**
- `src/app/portal/appointments/page.jsx`
- `src/app/api/email/notify-appointment-change/route.js`

**48-Hour Rule:** Cancel button disabled if appointment is within 48 hours

**Step-by-step:**
1. Customer finds appointment more than 48 hours away
2. Clicks "Cancel" button
3. Enters optional cancellation reason
4. Confirms cancellation
5. API updates: status='cancelled', cancelled_at, cancellation_reason
6. Creates admin_notifications record
7. Sends admin email notification
8. Sends customer confirmation email
9. Status shows as "Cancelled"

### Flow I: Admin Creates Invoice
*(Unchanged from v2.0)*

### Flow J: Admin Edits Draft Invoice (NEW)

**Files involved:**
- `src/app/admin/invoices/page.jsx`

**Step-by-step:**
1. Admin visits `/admin/invoices`
2. Views draft invoice
3. Clicks "Edit Draft" button
4. Modal opens pre-filled with:
   - Customer selection
   - Line items (description, qty, rate, amount)
   - Tax rate
   - Due date
   - Notes
5. Makes changes
6. Clicks "Save Changes"
7. `handleUpdateInvoice()` updates the invoice record
8. Toast success, modal closes, list refreshes

**Note:** Only draft invoices can be edited. Sent invoices cannot be modified.

### Flow K: Admin Resends Invoice (NEW)

**Files involved:**
- `src/app/admin/invoices/page.jsx`
- `src/app/api/admin/invoices/send/route.js`

**Step-by-step:**
1. Admin views sent or overdue invoice
2. Clicks "Resend Invoice" button
3. `handleResendInvoice()` calls same `/api/admin/invoices/send` endpoint
4. Email resent to customer
5. Customer notification created
6. Toast: "Invoice resent successfully!"

### Flow L: Customer Pays Invoice
*(Unchanged from v2.0)*

### Flow M: Admin Cancels/Refunds Invoice
*(Unchanged from v2.0)*

---

## 7. Email System

### Email Triggers Summary

| Trigger | Email Type | Recipient | Method |
|---------|-----------|-----------|--------|
| Customer signup complete | Admin notification | Admin | Resend direct |
| Service request submitted | Request received | Customer | Resend direct |
| Service request submitted | New request alert | Admin | Resend direct |
| Admin approves request | Appointment confirmed | Customer | Resend direct |
| Admin declines request | Request declined | Customer | Resend direct |
| Admin creates appointment | Appointment confirmed | Customer | Resend direct |
| Admin reschedules appointment | Appointment rescheduled | Customer | Resend direct |
| Customer requests reschedule | Reschedule request pending | Customer | Resend direct |
| Customer requests reschedule | New reschedule request | Admin | Resend direct |
| Customer cancels appointment | Cancellation confirmed | Customer | Resend direct |
| Customer cancels appointment | Cancellation notice | Admin | Resend direct |
| Gift certificate purchased | Gift certificate | Recipient | Resend direct |
| Dispute opened | SMS alert | Admin | Resend email-to-SMS |
| Invoice sent/resent | Invoice notification | Customer | Stripe + notification |

### Email Addresses
- **From**: `notifications@impressyoucleaning.com`
- **From (gifts)**: `gifts@impressyoucleaning.com`
- **Admin**: `admin@impressyoucleaning.com`
- **SMS Gateway**: `5129989658@tmomail.net`

---

## 8. Payment System (Stripe Integration)

*(Unchanged from v2.0)*

---

## 9. Components Library

### UI Components (`src/components/ui/`)

| Component | Props | Description |
|-----------|-------|-------------|
| `Button` | variant, size, fullWidth, loading, disabled, onClick | Primary action button with loading state |
| `Card` | className, padding, hover | Container card with shadow |
| `Modal` | isOpen, onClose, title, maxWidth, children | Dialog overlay with backdrop |
| `Input` | label, error, icon, type, placeholder, fullWidth | Form input with validation |
| `Badge` | variant, size, children | Status/count badge |
| `Select` | label, options, value, onChange, error | Dropdown select |
| `Textarea` | label, error, rows | Multi-line text input |
| `Checkbox` | label, checked, onChange | Checkbox input |
| `Toggle` | label, enabled, onChange | Toggle switch |
| `Spinner` | size | Loading spinner |

### Button Variants
- `primary`: Green background (#079447)
- `secondary`: Navy border, outline style
- `ghost`: Text only, subtle hover
- `danger`: Red background for destructive actions
- `success`: Green for confirmations
- `warning`: Yellow/amber for cautions
- `outline`: Border only

### Admin Components (`src/components/admin/`)

| Component | Description |
|-----------|-------------|
| `AdminNav` | Sidebar navigation with routes and pending counts |
| `AdminNotificationBell` | Notification dropdown |

### Layout Components (`src/components/layout/`)

| Component | Description |
|-----------|-------------|
| `Navbar` | Public site navigation |
| `Footer` | Site footer |
| `PortalNav` | Customer portal sidebar |

---

## 10. Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend (Email)
RESEND_API_KEY=

# Cloudflare Turnstile (CAPTCHA)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# Google Places API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# App URLs
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_APP_URL=
```

---

## 11. Known Patterns

### Data Flow: Frontend to Backend

1. **Client Component** makes API call via `fetch()`
2. **API Route** receives request
3. Validates authentication via `createClient()` from `@/lib/supabase/server`
4. For admin routes, checks `profile.role === 'admin'`
5. Uses `supabaseAdmin` (service role) for operations requiring elevated access
6. Returns JSON response

### Error Handling Pattern (Updated - No Debug Logs)

```javascript
try {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ... business logic

  const { data, error } = await supabase.from('table').select()
  if (error) throw error

  return NextResponse.json({ success: true, data })
} catch (error) {
  return NextResponse.json({ error: error.message }, { status: 500 })
}
```

### Loading State Pattern (Updated with Skeleton)

```jsx
const [loading, setLoading] = useState(true)
const [data, setData] = useState([])

useEffect(() => {
  const loadData = async () => {
    try {
      const response = await fetch('/api/...')
      const result = await response.json()
      setData(result.data || [])
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }
  loadData()
}, [])

if (loading) {
  return (
    <div className="animate-pulse space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-24 bg-gray-200 rounded-xl" />
      ))}
    </div>
  )
}
```

### Input Sanitization Pattern (CRITICAL)
All user inputs MUST be sanitized using functions from `src/lib/sanitize.js`:
- `sanitizeText()`: Strips HTML, trims whitespace
- Applied to: search queries, notes, instructions, descriptions, names

```javascript
import { sanitizeText } from '@/lib/sanitize'

// Before using in filter
const q = sanitizeText(searchQuery)?.toLowerCase() || ''

// Before saving to database
notes: newInvoice.notes ? sanitizeText(newInvoice.notes.trim()) : null,
```

### Date Handling Pattern (Timezone-Safe)

```javascript
// WRONG - causes timezone shift
new Date(scheduled_date)

// CORRECT - treats as local date
new Date(scheduled_date + 'T00:00:00')

// For display
format(new Date(apt.scheduled_date + 'T00:00:00'), 'EEE, MMM d, yyyy')
```

### Role-Based Route Protection
```javascript
// API Route
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()

if (profile?.role !== 'admin') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

### Notification Creation Pattern
```javascript
// Customer notification
await supabaseAdmin.from('customer_notifications').insert({
  user_id: customerId,
  type: 'appointment_confirmed',
  title: 'Appointment Scheduled',
  message: `Your ${serviceType} has been scheduled for ${date}`,
  link: '/portal/appointments',
  reference_id: appointmentId,
  reference_type: 'appointment'
})

// Admin notification
await supabaseAdmin.from('admin_notifications').insert({
  type: 'appointment_reschedule_request',
  title: 'Reschedule Request',
  message: `${customerName} requested to reschedule...`,
  link: '/admin/appointments',
  is_read: false
})
```

---

## Quick Reference

### Key Database Functions
- `generate_invoice_number()`: Creates IMP-XXXXXXX format
- `handle_new_user()`: Trigger creating profile on signup
- `link_orphan_invoices()`: Links email-only invoices to new users
- `is_admin()`: Helper checking admin role
- `sync_user_email()`: **NEW** - Syncs auth.users.email to profiles.email on change

### Service Types
- `standard`: Standard Cleaning
- `deep`: Deep Cleaning
- `move_in_out`: Move In/Out Cleaning
- `post_construction`: Post-Construction Cleaning
- `office`: Office Cleaning

### Time Slots (Admin Create Appointment)
- `morning`: 8:00 AM - 12:00 PM
- `afternoon`: 12:00 PM - 3:00 PM
- `evening`: 3:00 PM - 5:45 PM

### Invoice Statuses
`draft` → `sent` → `paid` | `overdue` | `cancelled`

### Appointment Statuses
`pending` → `confirmed` → `en_route` → `completed` | `cancelled` | `not_completed`

### Status Labels (Customer Portal)
- `pending`: "Pending Approval" (not just "Pending")
- `confirmed`: "Confirmed"
- `en_route`: "En Route"
- `completed`: "Completed"
- `cancelled`: "Cancelled"
- `not_completed`: "Not Completed"

---

## 12. Recent Bug Fixes (This Session)

### Authentication Bugs Fixed

| Bug | Solution |
|-----|----------|
| Password change not working | Removed current password check, immediate update via `supabase.auth.updateUser()`, force sign-out after |
| Email change not syncing to profiles | Created SQL trigger `sync_user_email()` on auth.users |
| Login error messages not showing | Added inline error display with specific messages |
| Stale session after sign-out | Added useEffect to clear session on login page load |

### Customer Portal Bugs Fixed

| Bug | Solution |
|-----|----------|
| Reschedule auto-confirmed | Changed to set status='pending', requires admin approval |
| No 48hr rule on reschedule | Added `isWithin48Hours()` check, button disabled |
| No customer email on reschedule | Added customer confirmation email to notify-appointment-change |
| Status showing "Pending" | Changed to "Pending Approval" for clarity |

### Date Display Bugs Fixed

| Bug | Solution |
|-----|----------|
| Dates off by one day | Use `new Date(date + 'T00:00:00')` pattern everywhere |

---

## 13. Supabase Settings Configured

| Setting | Value | Reason |
|---------|-------|--------|
| Secure email change | OFF | Only new email gets confirmation link |
| Secure password change | OFF | Immediate update, user already authenticated |

---

## 14. Files to Delete (After Testing)

These email routes are no longer called from anywhere:
- `/api/email/appointment-confirmed/` - Now inline in approve-service-request
- `/api/email/service-request-received/` - Call removed
- `/api/email/service-request-declined/` - Now inline in decline-service-request
- `/api/email/invoice-*` - Stripe handles all invoice emails

---

## 15. Admin Page Features Summary

### Appointments Page Features
- ✅ View all appointments with filtering
- ✅ Clickable stat cards (Total, Today, Confirmed, Pending, En Route)
- ✅ Search by customer name/email/phone
- ✅ Filter by status and date
- ✅ Create new appointment (customer, address, service, date, time)
- ✅ Manage appointment (view details, update status)
- ✅ Reschedule appointment with customer notification
- ✅ Assign team members
- ✅ Quick links to invoices

### Invoices Page Features
- ✅ View all invoices with filtering
- ✅ Clickable stat cards (Total, Paid, Pending, Overdue, Revenue)
- ✅ Search by invoice number or customer
- ✅ Filter by status (including Archived)
- ✅ Create new invoice with line items
- ✅ Create new customer inline
- ✅ Tax calculation (8.25%, None, Custom)
- ✅ Edit draft invoices
- ✅ Send/Resend invoices
- ✅ Mark as paid (Zelle, Cash, Check)
- ✅ Apply credit
- ✅ Cancel invoice
- ✅ Archive invoice
- ✅ Zelle payment verification (Verify/Reject)
- ✅ Refund display
- ✅ Dispute warning display