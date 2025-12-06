================================================================================
INVOICE LIFECYCLE AUTOMATION - IMPLEMENTATION SPEC
================================================================================

A. OVERVIEW
--------------------------------------------------------------------------------
This spec defines the complete invoice lifecycle automation for Impress Cleaning
Services. It covers invoice creation, sending via Stripe, payment processing,
reminders, overdue handling, refunds, disputes, and notifications across admin
portal, customer portal, Supabase, and Stripe.

================================================================================
B. REQUIRED API ROUTES
================================================================================

B1. /api/admin/invoices/send/route.js
- Description: Rewrite existing route. Must create Stripe Invoice instead of Checkout Session. Creates Stripe customer if needed, creates Stripe Invoice with line items, finalizes invoice, updates Supabase with stripe_invoice_id, sends email, creates customer notification.
- File path: src/app/api/admin/invoices/send/route.js
- Status: EXISTS - MUST REWRITE
- Inputs: invoiceId (uuid)
- Outputs: JSON with success boolean, stripeInvoiceId, hostedInvoiceUrl
- Dependencies: stripe, supabaseAdmin, /api/email/invoice-payment-link

B2. /api/admin/invoices/cancel/route.js
- Description: Cancel invoice. If stripe_invoice_id exists, void Stripe invoice. Update Supabase status to cancelled. Send cancellation email. Create customer notification.
- File path: src/app/api/admin/invoices/cancel/route.js
- Status: MUST CREATE
- Inputs: invoiceId (uuid)
- Outputs: JSON with success boolean
- Dependencies: stripe, supabaseAdmin, /api/email/invoice-cancelled

B3. /api/admin/invoices/mark-paid/route.js
- Description: Manual override to mark invoice paid. Updates Supabase status to paid, sets paid_date, sets payment_method. Sends payment confirmation email. Creates customer notification. Does NOT touch Stripe.
- File path: src/app/api/admin/invoices/mark-paid/route.js
- Status: MUST CREATE
- Inputs: invoiceId (uuid), paymentMethod (zelle, cash, check)
- Outputs: JSON with success boolean
- Dependencies: supabaseAdmin, /api/email/payment-received

B4. /api/admin/invoices/refund/route.js
- Description: Process refund. If stripe_payment_intent_id exists, call Stripe Refund API. Update Supabase with refund_amount, refund_reason. If full refund, update status. Send refund email. Create customer and admin notifications.
- File path: src/app/api/admin/invoices/refund/route.js
- Status: MUST CREATE
- Inputs: invoiceId (uuid), amount (number), reason (string)
- Outputs: JSON with success boolean, stripeRefundId
- Dependencies: stripe, supabaseAdmin, /api/email/invoice-refunded

B5. /api/admin/invoices/apply-credit/route.js
- Description: Apply account credit to invoice. Deduct from customer_credits table. Reduce invoice amount or mark paid if fully covered. Create notification.
- File path: src/app/api/admin/invoices/apply-credit/route.js
- Status: MUST CREATE
- Inputs: invoiceId (uuid), creditAmount (number)
- Outputs: JSON with success boolean, remainingBalance
- Dependencies: supabaseAdmin

B6. /api/email/invoice-reminder/route.js
- Description: Send due date reminder email. Called by cron job for invoices due today.
- File path: src/app/api/email/invoice-reminder/route.js
- Status: MUST CREATE
- Inputs: invoiceId (uuid), customerEmail (string), customerName (string), invoiceNumber (string), amount (number), dueDate (string)
- Outputs: JSON with success boolean
- Dependencies: resend

B7. /api/email/invoice-overdue/route.js
- Description: Send overdue notice email. Called when invoice hits 7 days past due.
- File path: src/app/api/email/invoice-overdue/route.js
- Status: MUST CREATE
- Inputs: invoiceId (uuid), customerEmail (string), customerName (string), invoiceNumber (string), amount (number), daysOverdue (number)
- Outputs: JSON with success boolean
- Dependencies: resend

B8. /api/email/invoice-cancelled/route.js
- Description: Send invoice cancellation email to customer.
- File path: src/app/api/email/invoice-cancelled/route.js
- Status: MUST CREATE
- Inputs: customerEmail (string), customerName (string), invoiceNumber (string)
- Outputs: JSON with success boolean
- Dependencies: resend

B9. /api/email/invoice-refunded/route.js
- Description: Send refund confirmation email to customer.
- File path: src/app/api/email/invoice-refunded/route.js
- Status: MUST CREATE
- Inputs: customerEmail (string), customerName (string), invoiceNumber (string), refundAmount (number), refundReason (string)
- Outputs: JSON with success boolean
- Dependencies: resend

B10. /api/cron/send-reminders/route.js
- Description: Daily cron endpoint. Query invoices with status sent and due_date equals today. For each, send reminder email and create customer notification.
- File path: src/app/api/cron/send-reminders/route.js
- Status: MUST CREATE
- Inputs: Authorization header with cron secret
- Outputs: JSON with success boolean, count of reminders sent
- Dependencies: supabaseAdmin, /api/email/invoice-reminder

B11. /api/cron/process-overdue/route.js
- Description: Daily cron endpoint. Query invoices with status sent and due_date older than 7 days. Update status to overdue. Send overdue email. Create customer and admin notifications.
- File path: src/app/api/cron/process-overdue/route.js
- Status: MUST CREATE
- Inputs: Authorization header with cron secret
- Outputs: JSON with success boolean, count processed
- Dependencies: supabaseAdmin, /api/email/invoice-overdue

B12. /api/notifications/zelle-alert/route.js
- Description: Send SMS and email to admin phone when customer claims Zelle payment.
- File path: src/app/api/notifications/zelle-alert/route.js
- Status: MUST CREATE
- Inputs: invoiceId (uuid), customerName (string), amount (number)
- Outputs: JSON with success boolean
- Dependencies: twilio or resend, environment variables ADMIN_PHONE_NUMBER, ADMIN_EMAIL

B13. /api/admin/customers/create/route.js
- Description: Update existing route. After creating profile in Supabase, also create Stripe customer and save stripe_customer_id to profiles table.
- File path: src/app/api/admin/customers/create/route.js
- Status: EXISTS - MUST UPDATE
- Inputs: email (string), fullName (string), phone (string)
- Outputs: JSON with success boolean, customerId, stripeCustomerId
- Dependencies: stripe, supabaseAdmin

================================================================================
C. REQUIRED WEBHOOKS
================================================================================

All webhook handlers go in: src/app/api/webhooks/stripe/route.js
Status: EXISTS - MUST UPDATE (add new event handlers, do not remove existing)

C1. payment_intent.payment_failed
- Description: Handle failed payment attempts from customer portal. Update invoice notes. Create customer notification with failure reason.
- Status: MUST ADD handler in existing webhook route
- Inputs: Stripe event object
- Outputs: Update Supabase invoice, create notification

C2. charge.refunded
- Description: Handle refunds initiated from Stripe Dashboard. Update Supabase invoice with refund_amount, refund_reason. If full refund, update status. Send refund email. Create customer and admin notifications.
- Status: MUST ADD handler in existing webhook route
- Inputs: Stripe event object
- Outputs: Update Supabase invoice, send email, create notifications

C3. charge.dispute.created
- Description: Handle dispute opened. Set invoice disputed column to true. Create urgent admin notification. Send SMS to admin phone.
- Status: MUST ADD handler in existing webhook route
- Inputs: Stripe event object
- Outputs: Update Supabase invoice, create admin notification, send SMS

C4. charge.dispute.closed
- Description: Handle dispute resolution. If won, clear disputed flag and add note. If lost, set status to cancelled, set refund_reason to dispute lost. Create notifications for both customer and admin.
- Status: MUST ADD handler in existing webhook route
- Inputs: Stripe event object
- Outputs: Update Supabase invoice, create notifications

STRIPE DASHBOARD ACTION REQUIRED:
Navigate to Developers then Webhooks then click your endpoint then Add events.
Add these events: payment_intent.payment_failed, charge.refunded, charge.dispute.created, charge.dispute.closed

================================================================================
D. REQUIRED SUPABASE FUNCTIONS
================================================================================

D1. mark_overdue_invoices
- Description: FIX existing function. Current function references status pending which does not exist in invoice_status enum. Should check status equals sent only. Should mark overdue when due_date is less than current_date minus 7 days.
- Status: EXISTS - MUST FIX
- Location: Supabase SQL Editor
- Current bug: WHERE status IN ('sent', 'pending') should be WHERE status = 'sent'

D2. get_invoices_due_today
- Description: New function. Returns invoices with status sent and due_date equals current_date.
- Status: MUST CREATE
- Location: Supabase SQL Editor
- Returns: Table of invoice records with customer email and name joined

D3. get_invoices_overdue_5_days
- Description: New function. Returns invoices with status sent and due_date equals current_date minus 5 days. Used for late fee warning.
- Status: MUST CREATE
- Location: Supabase SQL Editor
- Returns: Table of invoice records with customer email and name joined

D4. auto_archive_old_invoices
- Description: New function. Sets archived equals true on invoices with status paid and paid_date older than 90 days.
- Status: MUST CREATE
- Location: Supabase SQL Editor
- Returns: void

D5. apply_account_credit
- Description: New function. Inserts record into customer_credits table. Takes customer_id, amount, description, invoice_id as parameters.
- Status: MUST CREATE
- Location: Supabase SQL Editor
- Returns: uuid of created credit record

================================================================================
E. REQUIRED CRON JOBS
================================================================================

E1. mark_overdue_invoices
- Description: Existing cron. Currently scheduled at 2 AM UTC. Calls mark_overdue_invoices function.
- Status: EXISTS - VERIFY WORKING after function fix
- Schedule: 0 2 * * * (daily at 2 AM UTC)
- Location: Supabase Dashboard then Database then Extensions then pg_cron

E2. send_invoice_reminders
- Description: New cron. Calls external API endpoint /api/cron/send-reminders via pg_net or schedule as Supabase Edge Function.
- Status: MUST CREATE
- Schedule: 0 14 * * * (daily at 9 AM CST which is 14 UTC)
- Location: Supabase Dashboard or Vercel Cron

E3. process_overdue_invoices
- Description: New cron. Calls external API endpoint /api/cron/process-overdue.
- Status: MUST CREATE
- Schedule: 0 14 * * * (daily at 9 AM CST which is 14 UTC)
- Location: Supabase Dashboard or Vercel Cron

E4. auto_archive_old_invoices
- Description: New cron. Calls auto_archive_old_invoices function weekly.
- Status: MUST CREATE
- Schedule: 0 2 * * 0 (weekly on Sunday at 2 AM UTC)
- Location: Supabase Dashboard then Database then Extensions then pg_cron

================================================================================
F. REQUIRED EMAIL TEMPLATES
================================================================================

F1. invoice-reminder
- Description: Due date reminder sent day invoice is due
- Subject: Reminder: Invoice [number] is due today
- Body: Friendly reminder with amount, pay now button
- File: src/app/api/email/invoice-reminder/route.js

F2. invoice-overdue
- Description: Overdue notice sent when invoice hits 7 days past due
- Subject: Overdue: Invoice [number] requires immediate attention
- Body: Urgent notice with amount, days overdue, pay now button
- File: src/app/api/email/invoice-overdue/route.js

F3. invoice-cancelled
- Description: Cancellation notice when admin cancels invoice
- Subject: Invoice [number] has been cancelled
- Body: Confirmation that invoice is cancelled, contact info
- File: src/app/api/email/invoice-cancelled/route.js

F4. invoice-refunded
- Description: Refund confirmation when refund is processed
- Subject: Refund processed for Invoice [number]
- Body: Refund amount, reason, expected timeline
- File: src/app/api/email/invoice-refunded/route.js

================================================================================
G. REQUIRED NOTIFICATION TYPES
================================================================================

CUSTOMER NOTIFICATIONS (insert into customer_notifications table):

G1. invoice_sent
- Title: New Invoice Ready
- Message: Invoice [number] for [amount] is ready for payment
- Link: /portal/invoices
- Reference type: invoice

G2. payment_reminder
- Title: Payment Reminder
- Message: Invoice [number] is due today
- Link: /portal/invoices/[id]/pay
- Reference type: invoice

G3. late_fee_warning
- Title: Late Fee Warning
- Message: Invoice [number] is 5 days overdue. Late fees may apply.
- Link: /portal/invoices/[id]/pay
- Reference type: invoice

G4. invoice_overdue
- Title: Invoice Overdue
- Message: Invoice [number] is now overdue
- Link: /portal/invoices/[id]/pay
- Reference type: invoice

G5. invoice_cancelled
- Title: Invoice Cancelled
- Message: Invoice [number] has been cancelled
- Link: /portal/invoices
- Reference type: invoice

G6. refund_processed
- Title: Refund Processed
- Message: A refund of [amount] has been issued for Invoice [number]
- Link: /portal/invoices
- Reference type: invoice

G7. zelle_pending
- Title: Zelle Payment Pending
- Message: Your Zelle payment claim for Invoice [number] is being verified
- Link: /portal/invoices
- Reference type: invoice

G8. zelle_verified
- Title: Zelle Payment Confirmed
- Message: Your Zelle payment for Invoice [number] has been verified
- Link: /portal/invoices
- Reference type: invoice

G9. zelle_rejected
- Title: Zelle Payment Not Found
- Message: We could not verify your Zelle payment for Invoice [number]. Please contact us.
- Link: /portal/invoices
- Reference type: invoice

G10. credit_applied
- Title: Credit Applied
- Message: A credit of [amount] has been applied to your account
- Link: /portal/invoices
- Reference type: invoice

ADMIN NOTIFICATIONS (insert into admin_notifications table):

G11. payment_received
- Title: Payment Received
- Message: [customer name] paid Invoice [number]
- Link: /admin/invoices

G12. zelle_claimed
- Title: Zelle Payment Claimed
- Message: [customer name] claims Zelle payment for Invoice [number]. Verification required.
- Link: /admin/invoices

G13. invoice_overdue (admin)
- Title: Invoice Overdue
- Message: Invoice [number] for [customer name] is now overdue
- Link: /admin/invoices

G14. late_fee_pending
- Title: Late Fee Warning Sent
- Message: Invoice [number] for [customer name] is 5 days overdue
- Link: /admin/invoices

G15. dispute_opened
- Title: URGENT: Payment Dispute
- Message: A dispute has been opened for Invoice [number]
- Link: /admin/invoices

G16. dispute_won
- Title: Dispute Resolved - Won
- Message: Dispute for Invoice [number] resolved in your favor
- Link: /admin/invoices

G17. dispute_lost
- Title: Dispute Resolved - Lost
- Message: Dispute for Invoice [number] resolved against. Funds returned to customer.
- Link: /admin/invoices

G18. refund_processed (admin)
- Title: Refund Issued
- Message: Refund of [amount] issued for Invoice [number]
- Link: /admin/invoices

================================================================================
H. PORTAL UI UPDATES NEEDED
================================================================================

CUSTOMER PORTAL:

H1. NotificationBell.jsx
- Description: Bell icon component with unread count badge. Shows count 1 to 9, shows 9+ for 10 or more. Clicking opens dropdown.
- File path: src/components/portal/NotificationBell.jsx
- Status: MUST CREATE
- Dependencies: customer_notifications table query

H2. NotificationDropdown.jsx
- Description: Dropdown showing 5 most recent notifications. Each shows icon based on type, title, time ago. Mark all read link at top. View all link at bottom.
- File path: src/components/portal/NotificationDropdown.jsx
- Status: MUST CREATE
- Dependencies: NotificationBell.jsx

H3. PortalNav.jsx
- Description: Update existing nav to include NotificationBell component in header between user name and logout.
- File path: src/components/portal/PortalNav.jsx
- Status: EXISTS - MUST UPDATE

H4. /portal/notifications/page.jsx
- Description: Full notifications list page. Filter tabs for All, Unread, Payments, Invoices, System. Paginated 20 per page. Mark as read on click.
- File path: src/app/portal/notifications/page.jsx
- Status: MUST CREATE

H5. RecentNotificationsCard.jsx
- Description: Dashboard card showing 3 most recent notifications with View all link.
- File path: src/components/portal/RecentNotificationsCard.jsx
- Status: MUST CREATE

H6. /portal/dashboard/page.jsx
- Description: Update existing dashboard to include RecentNotificationsCard component.
- File path: src/app/portal/dashboard/page.jsx
- Status: EXISTS - MUST UPDATE

H7. /portal/invoices/page.jsx
- Description: Update to filter out archived invoices from list. Show refund badge on invoices with refund_amount greater than 0.
- File path: src/app/portal/invoices/page.jsx
- Status: EXISTS - MUST UPDATE

H8. /portal/invoices/[id]/pay/page.jsx
- Description: Update Zelle confirmation to call /api/notifications/zelle-alert. Show pending verification message after claim.
- File path: src/app/portal/invoices/[id]/pay/page.jsx
- Status: EXISTS - MUST UPDATE

ADMIN PORTAL:

H9. AdminNav.jsx
- Description: Add notification bell with unread count from admin_notifications table.
- File path: src/components/admin/AdminNav.jsx
- Status: EXISTS - MUST UPDATE

H10. /admin/invoices/page.jsx
- Description: Add Cancel, Refund, Apply Credit buttons to invoice detail modal. Add Zelle verification section with Verify and Reject buttons.
- File path: src/app/admin/invoices/page.jsx
- Status: EXISTS - MUST UPDATE

================================================================================
I. STRIPE SYNC REQUIREMENTS
================================================================================

I1. Stripe Customer Creation
- When: Admin creates new customer OR when sending first invoice to email-only customer
- Action: Call stripe.customers.create with email and name
- Store: Save stripe_customer_id to profiles table

I2. Stripe Invoice Creation
- When: Admin clicks Send on draft invoice
- Action: Call stripe.invoices.create with customer, line items, metadata
- Action: Call stripe.invoices.finalizeInvoice
- Store: Save stripe_invoice_id and hosted_invoice_url to invoices table

I3. Stripe Invoice Void
- When: Admin cancels sent invoice
- Action: Call stripe.invoices.voidInvoice
- Store: Update status to cancelled in Supabase

I4. Stripe Refund
- When: Admin issues refund for paid invoice
- Action: Call stripe.refunds.create with payment_intent and amount
- Store: Save refund_amount and refund_reason to invoices table

I5. Stripe Webhook Sync
- When: Any invoice.* or charge.* event fires
- Action: Find matching invoice by stripe_invoice_id or stripe_payment_intent_id
- Action: Update Supabase status and fields accordingly

================================================================================
J. FILE PATHS AFFECTED
================================================================================

FILES TO CREATE:
- src/app/api/admin/invoices/cancel/route.js
- src/app/api/admin/invoices/mark-paid/route.js
- src/app/api/admin/invoices/refund/route.js
- src/app/api/admin/invoices/apply-credit/route.js
- src/app/api/email/invoice-reminder/route.js
- src/app/api/email/invoice-overdue/route.js
- src/app/api/email/invoice-cancelled/route.js
- src/app/api/email/invoice-refunded/route.js
- src/app/api/cron/send-reminders/route.js
- src/app/api/cron/process-overdue/route.js
- src/app/api/notifications/zelle-alert/route.js
- src/app/portal/notifications/page.jsx
- src/components/portal/NotificationBell.jsx
- src/components/portal/NotificationDropdown.jsx
- src/components/portal/RecentNotificationsCard.jsx

FILES TO UPDATE:
- src/app/api/admin/invoices/send/route.js (rewrite)
- src/app/api/admin/customers/create/route.js (add Stripe customer)
- src/app/api/webhooks/stripe/route.js (add event handlers)
- src/components/portal/PortalNav.jsx (add notification bell)
- src/components/admin/AdminNav.jsx (add notification bell)
- src/app/portal/dashboard/page.jsx (add notifications card)
- src/app/portal/invoices/page.jsx (filter archived, show refunds)
- src/app/portal/invoices/[id]/pay/page.jsx (Zelle alert call)
- src/app/admin/invoices/page.jsx (add action buttons)

SUPABASE CHANGES:
- Fix function: mark_overdue_invoices
- Create function: get_invoices_due_today
- Create function: get_invoices_overdue_5_days
- Create function: auto_archive_old_invoices
- Create function: apply_account_credit
- Create table: customer_credits
- Alter table invoices: add columns disputed, refund_amount, refund_reason
- Alter table profiles: add column stripe_customer_id
- Create cron: send_invoice_reminders
- Create cron: process_overdue_invoices
- Create cron: auto_archive_old_invoices

================================================================================
K. EXECUTION ORDER FOR CLAUDE CODE
================================================================================

PHASE 1: DATABASE SCHEMA UPDATES
Order: 1
- Add stripe_customer_id column to profiles table
- Add disputed boolean column to invoices table
- Add refund_amount numeric column to invoices table
- Add refund_reason text column to invoices table
- Create customer_credits table with id, customer_id, amount, description, invoice_id, created_by, created_at

PHASE 2: FIX EXISTING SUPABASE FUNCTION
Order: 2
- Fix mark_overdue_invoices function
- Change WHERE status IN ('sent', 'pending') to WHERE status = 'sent'
- Verify function executes without error

PHASE 3: CREATE NEW SUPABASE FUNCTIONS
Order: 3
- Create get_invoices_due_today function
- Create get_invoices_overdue_5_days function
- Create auto_archive_old_invoices function
- Create apply_account_credit function

PHASE 4: UPDATE ADMIN CUSTOMER CREATE ROUTE
Order: 4
- File: src/app/api/admin/customers/create/route.js
- Add Stripe customer creation
- Save stripe_customer_id to profiles

PHASE 5: REWRITE INVOICE SEND ROUTE
Order: 5
- File: src/app/api/admin/invoices/send/route.js
- Replace Checkout Session with Stripe Invoice
- Finalize invoice
- Save stripe_invoice_id
- Create customer notification type invoice_sent

PHASE 6: CREATE EMAIL TEMPLATE ROUTES
Order: 6
- Create src/app/api/email/invoice-reminder/route.js
- Create src/app/api/email/invoice-overdue/route.js
- Create src/app/api/email/invoice-cancelled/route.js
- Create src/app/api/email/invoice-refunded/route.js

PHASE 7: CREATE ADMIN INVOICE ACTION ROUTES
Order: 7
- Create src/app/api/admin/invoices/cancel/route.js
- Create src/app/api/admin/invoices/mark-paid/route.js
- Create src/app/api/admin/invoices/refund/route.js
- Create src/app/api/admin/invoices/apply-credit/route.js

PHASE 8: CREATE CRON ENDPOINT ROUTES
Order: 8
- Create src/app/api/cron/send-reminders/route.js
- Create src/app/api/cron/process-overdue/route.js

PHASE 9: CREATE ZELLE ALERT ROUTE
Order: 9
- Create src/app/api/notifications/zelle-alert/route.js

PHASE 10: UPDATE STRIPE WEBHOOK HANDLER
Order: 10
- File: src/app/api/webhooks/stripe/route.js
- Add handler for payment_intent.payment_failed
- Add handler for charge.refunded
- Add handler for charge.dispute.created
- Add handler for charge.dispute.closed
- Do not remove existing handlers

PHASE 11: CREATE CUSTOMER NOTIFICATION UI COMPONENTS
Order: 11
- Create src/components/portal/NotificationBell.jsx
- Create src/components/portal/NotificationDropdown.jsx
- Create src/components/portal/RecentNotificationsCard.jsx

PHASE 12: CREATE CUSTOMER NOTIFICATIONS PAGE
Order: 12
- Create src/app/portal/notifications/page.jsx

PHASE 13: UPDATE PORTAL NAV
Order: 13
- File: src/components/portal/PortalNav.jsx
- Import and add NotificationBell component

PHASE 14: UPDATE PORTAL DASHBOARD
Order: 14
- File: src/app/portal/dashboard/page.jsx
- Import and add RecentNotificationsCard component

PHASE 15: UPDATE PORTAL INVOICES LIST
Order: 15
- File: src/app/portal/invoices/page.jsx
- Filter out archived invoices
- Show refund badge when refund_amount greater than 0

PHASE 16: UPDATE PORTAL PAY PAGE
Order: 16
- File: src/app/portal/invoices/[id]/pay/page.jsx
- Call /api/notifications/zelle-alert on Zelle confirmation
- Show pending verification message

PHASE 17: UPDATE ADMIN NAV
Order: 17
- File: src/components/admin/AdminNav.jsx
- Add notification bell with unread count

PHASE 18: UPDATE ADMIN INVOICES PAGE
Order: 18
- File: src/app/admin/invoices/page.jsx
- Add Cancel button calling /api/admin/invoices/cancel
- Add Refund button calling /api/admin/invoices/refund
- Add Apply Credit button calling /api/admin/invoices/apply-credit
- Add Zelle Verify and Reject buttons

PHASE 19: CONFIGURE CRON JOBS
Order: 19
- Document SQL commands for pg_cron or Vercel cron config
- Schedule send_invoice_reminders at 0 14 * * *
- Schedule process_overdue_invoices at 0 14 * * *
- Schedule auto_archive_old_invoices at 0 2 * * 0

PHASE 20: STRIPE DASHBOARD CONFIGURATION
Order: 20
- Document steps to add webhook events in Stripe Dashboard
- Add payment_intent.payment_failed
- Add charge.refunded
- Add charge.dispute.created
- Add charge.dispute.closed

================================================================================
ENVIRONMENT VARIABLES REQUIRED
================================================================================

Verify these exist:
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- RESEND_API_KEY
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY

Must add if missing:
- ADMIN_EMAIL (email address for admin alerts)
- ADMIN_PHONE_NUMBER (phone for SMS alerts, format +1XXXXXXXXXX)
- CRON_SECRET (secret key to authenticate cron endpoints)

Optional for SMS:
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_PHONE_NUMBER

================================================================================
END OF IMPLEMENTATION SPEC
================================================================================

