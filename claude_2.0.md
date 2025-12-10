# Impress Cleaning Services - Comprehensive Project Analysis

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
| `/admin/create-invoice` | POST | Creates draft invoice with line items |
| `/admin/invoices/send` | POST | Finalizes invoice in Stripe, sends to customer |
| `/admin/invoices/mark-paid` | POST | Marks invoice paid (for Zelle/cash/check) |
| `/admin/invoices/cancel` | POST | Cancels invoice, voids in Stripe if applicable |
| `/admin/invoices/apply-credit` | POST | Applies customer credit to invoice |
| `/admin/update-appointment` | POST | Updates appointment, sends reschedule email if date changed |
| `/admin/get-all-customers` | GET | Returns all customer profiles |
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
| `/email/service-request-received` | POST | Sends request confirmation to customer |
| `/email/service-request-declined` | POST | Sends decline notice with reason |
| `/email/notify-appointment-change` | POST | Notifies admin of customer change request |

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
| `/portal/appointments` | List all appointments |
| `/portal/invoices` | List all invoices |
| `/portal/invoices/[id]/pay` | Pay specific invoice |
| `/portal/profile` | Manage profile settings |
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
| `/admin/appointments` | Appointment calendar/list |
| `/admin/invoices` | Invoice list and management |
| `/admin/invoices/create` | Create new invoice |
| `/admin/reports` | Business reports/analytics |
| `/admin/settings` | Business settings |

---

## 6. Detailed User Flows

### Flow A: New Customer Signup

**Files involved:**
- `src/app/auth/signup/page.jsx`
- `src/app/auth/verify-email/page.jsx`
- `src/app/auth/callback/route.js`
- `src/app/auth/profile-setup/page.jsx`
- Database trigger: `handle_new_user()`

**Step-by-step:**
1. User visits `/auth/signup`
2. Enters email, password (8+ chars), completes Turnstile CAPTCHA
3. Clicks "Create Account"
4. `SignUpPage.handleSubmit()` calls `supabase.auth.signUp()`
5. Supabase creates auth.users record
6. Database trigger `handle_new_user()` creates profiles record with role='customer'
7. User redirected to `/auth/verify-email?email=...`
8. User clicks link in verification email
9. Redirects to `/auth/callback?code=...`
10. `callback/route.js` calls `supabase.auth.exchangeCodeForSession()`
11. Checks profile completeness (full_name, phone, addresses)
12. Redirects to `/auth/profile-setup` (incomplete)
13. User enters full name, phone, service address
14. `ProfileSetupPage.handleSubmit()` updates profiles and inserts service_addresses
15. Sends admin notification via `/api/email/admin-new-registration`
16. Redirects to `/portal/dashboard`

---

### Flow B: Customer Submits Service Request

**Files involved:**
- `src/app/portal/request-service/page.jsx`
- `src/app/api/customer-portal/service-requests/route.js`
- `src/app/api/email/service-request-received/route.js`

**Step-by-step:**
1. Authenticated customer visits `/portal/request-service`
2. Selects service type (standard, deep, move_in_out, post_construction, office)
3. Picks preferred date and time slot (morning, afternoon, evening)
4. Selects service address from saved addresses
5. Optionally adds special requests
6. Optionally marks as recurring with frequency
7. Clicks "Submit Request"
8. `RequestServicePage.handleSubmit()` calls `POST /api/customer-portal/service-requests`
9. `route.js` validates required fields
10. Creates service_requests record with status='pending'
11. Creates admin_notifications record
12. Sends admin email via Resend with request details
13. Sends customer confirmation via fetch to `/api/email/service-request-received`
14. Returns success, customer sees confirmation

---

### Flow C: Admin Approves Service Request

**Files involved:**
- `src/app/admin/requests/page.jsx`
- `src/app/api/admin/approve-service-request/route.js`

**Step-by-step:**
1. Admin visits `/admin/requests`
2. Views pending service requests list
3. Clicks on specific request to view details
4. Reviews request (service type, date, address, special requests)
5. Optionally adjusts scheduled date/time
6. Clicks "Approve"
7. `RequestsPage.handleApprove()` calls `POST /api/admin/approve-service-request`
8. `route.js` verifies admin role
9. Updates service_requests: status='approved', reviewed_by, reviewed_at
10. Creates appointments record with scheduled details
11. Fetches customer profile and address for email
12. Sends confirmation email via Resend directly (not fetch)
13. Returns success, admin sees updated status

---

### Flow D: Admin Declines Service Request

**Files involved:**
- `src/app/admin/requests/page.jsx`
- `src/app/api/admin/decline-service-request/route.js`

**Step-by-step:**
1. Admin views request in `/admin/requests`
2. Determines request cannot be fulfilled
3. Enters decline reason (optional)
4. Clicks "Decline"
5. `RequestsPage.handleDecline()` calls `POST /api/admin/decline-service-request`
6. `route.js` verifies admin role
7. Sanitizes reason text
8. Updates service_requests: status='declined', admin_notes=reason
9. Fetches customer profile for email
10. Sends decline email via Resend with reason
11. Returns success

---

### Flow E: Admin Reschedules Appointment

**Files involved:**
- `src/app/admin/appointments/page.jsx`
- `src/app/api/admin/update-appointment/route.js`
- `src/app/api/email/appointment-rescheduled/route.js`

**Step-by-step:**
1. Admin visits `/admin/appointments`
2. Finds appointment to reschedule
3. Opens edit modal
4. Changes scheduled_date or scheduled_time_start/end
5. Clicks "Save Changes"
6. `AppointmentsPage.handleUpdate()` calls `POST /api/admin/update-appointment`
7. `route.js` verifies admin role
8. Compares old vs new date/time
9. Updates appointments record
10. If date OR time changed, sends reschedule email via Resend
11. Email shows old date (strikethrough) and new date (highlighted)
12. Returns success

---

### Flow F: Customer Cancels Appointment

**Files involved:**
- `src/app/portal/appointments/page.jsx`
- `src/app/api/customer-portal/appointments/[id]/cancel/route.js`
- `src/app/api/email/notify-appointment-change/route.js`

**Step-by-step:**
1. Customer visits `/portal/appointments`
2. Finds upcoming appointment
3. Clicks "Cancel" button
4. Enters cancellation reason (optional)
5. Confirms cancellation
6. API call to `POST /api/customer-portal/appointments/[id]/cancel`
7. Updates appointments: status='cancelled', cancelled_at, cancellation_reason
8. Creates admin_notifications record
9. Sends admin notification email via `/api/email/notify-appointment-change`
10. Returns success, customer sees updated status

---

### Flow G: Admin Creates Invoice

**Files involved:**
- `src/app/admin/invoices/create/page.jsx`
- `src/app/api/admin/create-invoice/route.js`
- `src/app/api/admin/invoices/send/route.js`

**Step-by-step:**
1. Admin visits `/admin/invoices/create`
2. Selects customer from dropdown
3. Adds line items (description, quantity, rate)
4. Sets due date
5. Optionally adds tax rate
6. Adds notes (optional)
7. Clicks "Create Invoice"
8. `CreateInvoicePage.handleSubmit()` calls `POST /api/admin/create-invoice`
9. `route.js` calls `generate_invoice_number()` for unique IMP-XXXXXXX
10. Creates invoices record with status='draft'
11. Returns to invoice list
12. Admin clicks "Send" on draft invoice
13. Calls `POST /api/admin/invoices/send`
14. Creates/retrieves Stripe customer
15. Creates Stripe invoice items
16. Creates Stripe invoice, finalizes it
17. Updates invoices with stripe_invoice_id, status='sent'
18. Creates customer_notifications record
19. Returns hostedInvoiceUrl

---

### Flow H: Customer Pays Invoice

**Files involved:**
- `src/app/portal/invoices/page.jsx`
- `src/app/portal/invoices/[id]/pay/page.jsx`
- `src/app/api/stripe/create-payment-intent/route.js`
- `src/app/api/stripe/pay-stripe-invoice/route.js`
- `src/app/api/webhooks/stripe/route.js`

**Step-by-step:**
1. Customer visits `/portal/invoices`
2. Clicks "Pay" on unpaid invoice
3. Navigates to `/portal/invoices/[id]/pay`
4. Sees invoice summary and payment options
5. **Option A - Credit Card:**
   - Selects saved card or enters new card
   - Clicks "Pay $X.XX"
   - If Stripe invoice exists: calls `POST /api/stripe/pay-stripe-invoice`
   - Else: calls `POST /api/stripe/create-payment-intent`
   - Stripe processes payment
   - If 3D Secure required, `stripe.confirmCardPayment()` handles
   - On success, invoice updated to paid
   - Confetti animation, redirect to invoices list
6. **Option B - Zelle:**
   - Views Zelle payment instructions
   - Sends payment externally
   - Clicks "I've Sent the Payment"
   - Calls API to update invoice notes
   - Sends admin Zelle alert
   - Invoice pending verification

**Webhook confirmation:**
- Stripe sends `payment_intent.succeeded` or `invoice.paid`
- `/api/webhooks/stripe/route.js` receives event
- Updates invoices: status='paid', paid_date, payment_method
- Creates customer_notifications record

---

### Flow I: Admin Cancels/Refunds Invoice

**Files involved:**
- `src/app/admin/invoices/page.jsx`
- `src/app/api/admin/invoices/cancel/route.js`
- Stripe Dashboard (for refunds)
- `src/app/api/webhooks/stripe/route.js`

**Step-by-step (Cancel):**
1. Admin visits `/admin/invoices`
2. Finds invoice to cancel
3. Clicks "Cancel"
4. Calls `POST /api/admin/invoices/cancel`
5. If has stripe_invoice_id, voids in Stripe
6. Updates invoices: status='cancelled'
7. Creates admin/customer notifications

**Step-by-step (Refund):**
1. Admin opens Stripe Dashboard
2. Finds charge/payment for invoice
3. Issues full or partial refund
4. Stripe sends `charge.refunded` webhook
5. `/api/webhooks/stripe/route.js` handles event
6. Looks up invoice by stripe_payment_intent_id
7. Updates invoices: refund_amount, refund_reason
8. Creates customer_notifications: "Refund Processed"
9. Creates admin_notifications with refund amount

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
| Admin reschedules appointment | Appointment rescheduled | Customer | Resend direct |
| Customer cancels appointment | Cancellation notice | Admin | Resend direct |
| Gift certificate purchased | Gift certificate | Recipient | Resend direct (webhook) |
| Dispute opened | SMS alert | Admin | Resend email-to-SMS |

### Emails Using Resend Directly (Working)
- All appointment emails (confirmed, cancelled, rescheduled)
- All service request emails (received, declined)
- Admin approval/decline emails
- Gift certificate emails
- Public booking confirmations
- Dispute alerts

### Emails Still Using Fetch (Need Fix per CLAUDE.md)
- Payment confirmation (`checkout.session.completed`)
- Payment confirmation (`payment_intent.succeeded`)
- Refund notification (`charge.refunded`)

### Email Addresses
- **From**: `notifications@impressyoucleaning.com`
- **From (gifts)**: `gifts@impressyoucleaning.com`
- **Admin**: `admin@impressyoucleaning.com`
- **SMS Gateway**: `5129989658@tmomail.net`

---

## 8. Payment System (Stripe Integration)

### How Customers are Created in Stripe

1. **On invoice send** (`/api/admin/invoices/send/route.js`):
   - Checks `profiles.stripe_customer_id` first
   - Validates customer still exists in Stripe
   - Falls back to searching by email
   - Creates new customer if none found
   - Saves stripe_customer_id to profiles

2. **On payment** (`/api/stripe/create-payment-intent/route.js`):
   - Same lookup pattern
   - Metadata: `{ supabase_user_id: user.id }`

### How Invoices are Created and Sent

1. Admin creates draft invoice with line items
2. `generate_invoice_number()` creates unique IMP-XXXXXXX
3. Admin clicks "Send"
4. Creates Stripe invoice items for each line item + tax
5. Creates Stripe invoice with metadata: `{ supabase_invoice_id, invoice_number }`
6. Finalizes invoice (makes it payable)
7. Updates Supabase with stripe_invoice_id

### Webhook Events Handled

| Event | Handler |
|-------|---------|
| `invoice.finalized` | Creates/updates invoice in portal |
| `invoice.paid` | Updates status to paid |
| `invoice.payment_failed` | Marks overdue, creates notifications |
| `invoice.voided` | Marks cancelled |
| `invoice.marked_uncollectible` | Updates status |
| `checkout.session.completed` | Gift certificates, portal invoice payments |
| `payment_intent.succeeded` | Updates invoice, creates notification |
| `payment_intent.payment_failed` | Marks overdue, creates notifications |
| `charge.succeeded` | Links payment_intent to invoice |
| `charge.refunded` | Records refund amount, notifies |
| `charge.dispute.created` | Flags invoice, SMS alerts admin |
| `charge.dispute.closed` | Updates dispute resolution |

### Refund Flow
1. Admin issues refund via Stripe Dashboard
2. Stripe sends `charge.refunded` webhook
3. Webhook looks up invoice by payment_intent_id or stripe_invoice_id
4. Updates invoices.refund_amount and refund_reason
5. Creates customer notification
6. Creates admin notification

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
- `primary`: Green background (#10b981)
- `secondary`: Navy border, outline style
- `text`: Text only, subtle hover
- `danger`: Red background for destructive actions

### Button Sizes
- `sm`: 36px height, small text
- `md`: 48px height, base text (default)
- `lg`: 56px height, large text

### Admin Components (`src/components/admin/`)

| Component | Description |
|-----------|-------------|
| `AdminNav` | Sidebar navigation with routes |
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

# Optional
RESEND_API_KEY_STAGING=
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

### Error Handling Pattern

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
  console.error('Error:', error)
  return NextResponse.json({ error: error.message }, { status: 500 })
}
```

### Loading State Pattern

```jsx
const [loading, setLoading] = useState(true)
const [data, setData] = useState(null)

useEffect(() => {
  const loadData = async () => {
    try {
      const response = await fetch('/api/...')
      const result = await response.json()
      setData(result.data)
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }
  loadData()
}, [])

if (loading) {
  return <LoadingSkeleton />
}
```

### Input Sanitization Pattern
All user inputs are sanitized using functions from `src/lib/sanitize.js`:
- `sanitizeText()`: Strips HTML, trims whitespace
- `sanitizeEmail()`: Validates and normalizes email
- `sanitizePhone()`: Formats phone number

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
  type: 'invoice_sent',
  title: 'New Invoice Ready',
  message: `Invoice ${invoiceNumber} for ${amount} is ready`,
  link: '/portal/invoices',
  reference_id: invoiceId,
  reference_type: 'invoice'
})

// Admin notification
await supabaseAdmin.from('admin_notifications').insert({
  type: 'new_service_request',
  title: 'New Request',
  message: `Customer ${name} requested ${serviceType}`,
  link: '/admin/requests'
})
```

---

## Quick Reference

### Key Database Functions
- `generate_invoice_number()`: Creates IMP-XXXXXXX format
- `handle_new_user()`: Trigger creating profile on signup
- `link_orphan_invoices()`: Links email-only invoices to new users
- `is_admin()`: Helper checking admin role

### Service Types
- `standard`: Standard Cleaning
- `deep`: Deep Cleaning
- `move_in_out`: Move In/Out Cleaning
- `post_construction`: Post-Construction Cleaning
- `office`: Office Cleaning

### Time Slots
- `morning`: 8:00 AM - 12:00 PM
- `afternoon`: 12:00 PM - 3:00 PM
- `evening`: 3:00 PM - 5:45 PM

### Invoice Statuses
`draft` → `sent` → `paid` | `overdue` | `cancelled`

### Appointment Statuses
`pending` → `confirmed` → `completed` | `cancelled` | `not_completed`
