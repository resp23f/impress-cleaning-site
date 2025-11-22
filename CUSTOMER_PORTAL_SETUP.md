# Impress Cleaning Services - Customer Portal Setup Guide

 

## Overview

 

This is a complete Customer Portal system for Impress Cleaning Services with a modern, HelloFresh-inspired UX. The portal allows customers to manage appointments, view service history, pay invoices, and request new services.

 

## Tech Stack

 

- **Framework**: Next.js 15.5.4 (App Router)

- **Authentication & Database**: Supabase

- **Payments**: Stripe

- **Address Autocomplete**: Google Places API

- **UI Components**: Custom component library with Tailwind CSS

- **Animations**: Framer Motion

- **Notifications**: React Hot Toast

- **PDF Generation**: jsPDF (for invoices)

 

## Brand Colors

 

- **Primary Green**: `#079447`

- **Navy**: `#1C294E`

- **Background**: `#F7FAFC` (light gray)

- **White**: `#FFFFFF`

 

## Setup Instructions

 

### 1. Environment Variables

 

Create a `.env.local` file in the root directory with the following variables:

 

```bash

# Supabase Configuration

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url

NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

 

# Stripe Configuration

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

STRIPE_SECRET_KEY=your_stripe_secret_key

STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

 

# Google Places API

NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_api_key

 

# reCAPTCHA v3 (optional)

NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key

RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key

 

# Email Configuration (Resend)

RESEND_API_KEY=your_resend_api_key

ADMIN_EMAIL=admin@impresscleaningservices.com

 

# App Configuration

NEXT_PUBLIC_APP_URL=http://localhost:3000

ADMIN_APPROVAL_REQUIRED=true

```

 

### 2. Supabase Setup

 

#### A. Create a Supabase Project

 

1. Go to [Supabase](https://supabase.com)

2. Create a new project

3. Copy your project URL and anon key to `.env.local`

 

#### B. Run the Database Schema

 

1. Open the SQL Editor in your Supabase dashboard

2. Copy the contents of `supabase-schema.sql`

3. Run the SQL script to create all tables, policies, functions, and triggers

 

The schema includes:

- **profiles**: User profiles with roles (customer/admin)

- **service_addresses**: Customer service addresses

- **appointments**: Scheduled cleaning appointments

- **service_history**: Completed services with ratings

- **invoices**: Customer invoices

- **service_requests**: Customer service requests (pending approval)

- **payment_methods**: Saved Stripe payment methods

- **admin_notifications**: Notifications for admin panel

- **rate_limits**: Rate limiting for security

 

#### C. Configure Authentication

 

1. In Supabase Dashboard → Authentication → Providers:

   - Enable **Email** provider

   - Enable **Google** OAuth provider (add OAuth credentials)

   - Enable **Apple** OAuth provider (optional)

 

2. In Authentication → URL Configuration:

   - Site URL: `http://localhost:3000` (or your production URL)

   - Redirect URLs:

     - `http://localhost:3000/auth/callback`

     - `http://localhost:3000/auth/verify-email`

 

3. In Authentication → Email Templates:

   - Customize email templates with your branding

 

### 3. Google Places API Setup

 

1. Go to [Google Cloud Console](https://console.cloud.google.com)

2. Create a new project or select existing

3. Enable **Places API** and **Maps JavaScript API**

4. Create an API key

5. Restrict the API key to:

   - HTTP referrers (your domain)

   - Places API only

6. Add the API key to `.env.local`

 

### 4. Stripe Setup

 

1. Create a [Stripe](https://stripe.com) account

2. Get your API keys from the Dashboard

3. Add keys to `.env.local`

4. Set up webhooks (for production):

   - Webhook endpoint: `https://yourdomain.com/api/stripe/webhook`

   - Events to listen for:

     - `payment_intent.succeeded`

     - `payment_intent.payment_failed`

     - `payment_method.attached`

 

### 5. Install Dependencies

 

```bash

npm install

```

 

All required dependencies are already listed in `package.json`.

 

### 6. Run Development Server

 

```bash

npm run dev

```

 

Visit `http://localhost:3000` to see the site.

 

## Features Implemented

 

### ✅ Authentication & Onboarding

 

1. **Sign Up Page** (`/auth/signup`)

   - Email/password signup

   - Google OAuth integration

   - Password strength indicator

   - Clean, minimal design

 

2. **Login Page** (`/auth/login`)

   - Email/password login

   - Social login (Google)

   - Forgot password link

   - Role-based redirects

 

3. **Email Verification** (`/auth/verify-email`)

   - Confirmation screen after signup

   - Resend email option

   - Auto-redirect after verification

 

4. **Profile Setup** (`/auth/profile-setup`)

   - Name and phone collection

   - Google Places address autocomplete

   - Communication preferences

   - Sets account to "pending" for admin approval

 

5. **Pending Approval** (`/auth/pending-approval`)

   - Waiting screen

   - Real-time updates via Supabase subscriptions

   - Auto-redirect when approved

 

### ✅ Customer Portal

 

1. **Dashboard** (`/portal/dashboard`)

   - Welcome message with user's first name

   - Next appointment card (large, prominent)

   - Balance status card

   - Quick action buttons

   - Upcoming appointments list

   - Recent services history

   - Invoices & payments section

   - Recurring services display

   - Service address card

   - Fully responsive

 

2. **Request Service** (`/portal/request-service`)

   - Multi-step flow (5 steps)

   - Step 1: Select service type (5 options)

   - Step 2: Choose date & time

   - Step 3: Select or add address

   - Step 4: Special requests (optional)

   - Step 5: Make recurring (optional)

   - Success confirmation

   - Creates service request in database

   - Triggers admin notification

 

3. **Portal Navigation**

   - Desktop sidebar

   - Mobile bottom navigation

   - Hamburger menu for mobile

   - Active state highlighting

   - Logout functionality

 

### ✅ UI Component Library

 

Location: `/src/components/ui/`

 

- **Button**: Primary, secondary, text, danger variants

- **Card**: Flexible card component with hover states

- **Input**: Text input with icons and error states

- **PasswordInput**: Password field with show/hide toggle

- **Modal**: Centered modal with backdrop

- **Badge**: Status badges with color variants

- **LoadingSpinner**: Animated loading indicator

- **Toast**: Toast notifications (React Hot Toast)

- **SelectableCard**: Clickable card for selections

- **SkeletonLoader**: Loading skeleton states

 

All components follow the brand design system with:

- Brand colors (Green #079447, Navy #1C294E)

- Rounded corners (8-12px)

- Soft shadows

- Smooth transitions

- Mobile-first responsive design

 

## Features Still To Be Implemented

 

The following features are scaffolded but need completion:

 

### 📋 Remaining Customer Portal Pages

 

1. **Appointments Page** (`/portal/appointments`)

   - List all appointments

   - Filter by upcoming/past/all

   - View appointment details

   - Reschedule functionality

   - Cancel appointments

 

2. **Service History** (`/portal/history`)

   - Chronological list of completed services

   - Filter by date range and service type

   - View photos from services

   - Rate and review services

 

3. **Invoices Page** (`/portal/invoices`)

   - List all invoices

   - Filter by paid/unpaid/overdue

   - **Stripe Payment Integration**:

     - Stripe Elements for card input

     - Save payment methods

     - Process payments

     - Payment confirmations

   - Zelle payment option with QR code

   - Download PDF invoices

 

4. **Account Settings** (`/portal/settings`)

   - Edit profile information

   - Manage service addresses

   - Update communication preferences

   - Change password

   - Manage saved payment methods

   - Delete account

 

### 📋 Admin Panel

 

Location: `/admin/`

 

1. **Admin Dashboard** (`/admin/dashboard`)

   - Statistics overview

   - Pending registrations count

   - Pending service requests count

   - Revenue charts

   - Recent activity

 

2. **Pending Registrations** (`/admin/registrations`)

   - List of pending customer accounts

   - View customer details

   - Approve/deny accounts

   - Send approval emails

 

3. **Service Requests** (`/admin/requests`)

   - List of pending service requests

   - Approve and create appointments

   - Modify request details

   - Decline with reason

   - Automated email notifications

 

4. **Customer Management** (`/admin/customers`)

   - View all customers

   - Search and filter

   - View customer details

   - Edit customer information

   - Suspend/activate accounts

 

5. **Appointment Management** (`/admin/appointments`)

   - Calendar view

   - List view with filters

   - Create new appointments

   - Edit existing appointments

   - Assign teams

   - Mark as completed

 

6. **Invoice Management** (`/admin/invoices`)

   - Create invoices

   - Edit invoices

   - Send invoices to customers

   - Track payment status

   - Generate reports

 

### 📋 Additional Features

 

1. **Email Notifications**

   - Welcome email after signup

   - Email verification

   - Account approval notification

   - Service request confirmation

   - Appointment reminders

   - Invoice notifications

   - Payment confirmations

   - Using Resend API

 

2. **PDF Generation**

   - Invoice PDFs with branding

   - Service history reports

   - Using jsPDF library

 

3. **Security Features**

   - reCAPTCHA v3 integration

   - Rate limiting on signup/login

   - IP tracking in rate_limits table

   - CSRF protection

   - XSS prevention

 

4. **Micro-interactions & Polish**

   - Loading states with skeletons

   - Success animations

   - Confetti on payment success

   - Smooth page transitions

   - Optimistic UI updates

   - Error boundaries

 

## Database Schema

 

### Tables

 

1. **profiles**

   - User profiles with role (customer/admin)

   - Account status (pending/active/suspended)

   - Communication preferences

 

2. **service_addresses**

   - Customer service locations

   - Google Places integration

   - Primary address flag

 

3. **appointments**

   - Scheduled services

   - Team assignments

   - Recurring appointments support

   - Status tracking

 

4. **service_history**

   - Completed services

   - Customer ratings

   - Photos

   - Team notes

 

5. **invoices**

   - Invoice management

   - Stripe integration

   - Line items (JSONB)

   - Payment tracking

 

6. **service_requests**

   - Customer service requests

   - Admin approval workflow

   - Triggers notifications

 

7. **payment_methods**

   - Saved Stripe payment methods

   - Default payment method

 

8. **admin_notifications**

   - Real-time admin alerts

   - Unread status

 

9. **rate_limits**

   - Anti-spam protection

   - IP-based rate limiting

 

### Row Level Security (RLS)

 

All tables have RLS enabled with policies:

- Customers can only view/edit their own data

- Admins can view/edit all data

- Public signup is allowed but sets status to "pending"

 

### Triggers

 

- **Auto-create profile**: Creates profile when user signs up

- **Update timestamps**: Auto-update `updated_at` on changes

- **Admin notifications**: Notify admins of new registrations and requests

- **Invoice numbering**: Auto-generate invoice numbers

 

## API Routes

 

The following API routes need to be created:

 

- `/api/stripe/create-payment-intent` - Create Stripe payment intent

- `/api/stripe/webhook` - Handle Stripe webhooks

- `/api/invoices/[id]/pdf` - Generate PDF invoice

- `/api/send-email` - Send emails via Resend

- `/api/recaptcha/verify` - Verify reCAPTCHA token

- `/api/rate-limit/check` - Check rate limits

 

## File Structure

 

```

src/

├── app/

│   ├── auth/

│   │   ├── signup/page.jsx

│   │   ├── login/page.jsx

│   │   ├── verify-email/page.jsx

│   │   ├── profile-setup/page.jsx

│   │   ├── pending-approval/page.jsx

│   │   └── callback/route.js

│   ├── portal/

│   │   ├── layout.jsx

│   │   ├── dashboard/page.jsx

│   │   ├── request-service/page.jsx

│   │   ├── appointments/ (to be completed)

│   │   ├── history/ (to be completed)

│   │   ├── invoices/ (to be completed)

│   │   └── settings/ (to be completed)

│   └── admin/ (to be completed)

├── components/

│   ├── ui/ (component library)

│   └── portal/

│       └── PortalNav.jsx

├── lib/

│   └── supabase/

│       ├── client.js

│       ├── server.js

│       └── middleware.js

└── middleware.js

```

 

## Testing Checklist

 

### Authentication

- [ ] Sign up with email

- [ ] Sign up with Google OAuth

- [ ] Email verification flow

- [ ] Profile setup with Google Places

- [ ] Admin approval process

- [ ] Login with email

- [ ] Login with Google

- [ ] Logout functionality

- [ ] Password reset (to be implemented)

 

### Customer Portal

- [ ] Dashboard loads with correct data

- [ ] Next appointment displays correctly

- [ ] Balance calculation is accurate

- [ ] Request service flow works end-to-end

- [ ] All navigation links work

- [ ] Mobile navigation works

- [ ] Real-time updates work

 

### Security

- [ ] RLS policies prevent unauthorized access

- [ ] Users can only see their own data

- [ ] Admins can see all data

- [ ] Session management works correctly

- [ ] Protected routes redirect to login

 

### Responsive Design

- [ ] Mobile (320px - 767px)

- [ ] Tablet (768px - 1023px)

- [ ] Desktop (1024px+)

- [ ] Touch targets are 48px minimum

 

## Deployment

 

### Environment Variables

 

Ensure all environment variables are set in your production environment.

 

### Supabase

 

1. Update URL configurations in Supabase Dashboard:

   - Site URL: Your production domain

   - Redirect URLs: Production callback URLs

 

2. Review RLS policies

 

3. Set up database backups

 

### Stripe

 

1. Switch to live keys in production

2. Set up production webhooks

3. Test payment flow in live mode

 

### Next.js

 

```bash

npm run build

npm start

```

 

Or deploy to Vercel:

 

```bash

vercel deploy

```

 

## Support & Maintenance

 

### Monitoring

 

- Monitor Supabase logs for errors

- Track Stripe payment failures

- Monitor email delivery (Resend dashboard)

- Set up error tracking (Sentry recommended)

 

### Regular Tasks

 

- Review pending registrations daily

- Respond to service requests within 24 hours

- Monitor invoice payment status

- Back up database weekly

 

## Additional Notes

 

### Design Philosophy

 

This portal follows a HelloFresh-inspired design philosophy:

- **One task per screen**: No overwhelming forms

- **Large touch targets**: Minimum 48px for mobile

- **Generous whitespace**: Clean, uncluttered layouts

- **Rounded corners**: 8-12px radius throughout

- **Soft shadows**: Subtle depth with `box-shadow: 0 2px 8px rgba(0,0,0,0.08)`

- **Smooth transitions**: 200-300ms duration

- **Mobile-first**: Responsive from the start

 

### Accessibility

 

- Semantic HTML

- ARIA labels where needed

- Keyboard navigation support

- Focus states on all interactive elements

- Color contrast meets WCAG AA standards

 

### Performance

 

- Server components where possible

- Client components only when needed

- Lazy loading for images

- Optimistic UI updates

- Skeleton loading states

 

## Getting Help

 

If you encounter issues:

 

1. Check Supabase logs for database errors

2. Check browser console for JavaScript errors

3. Verify environment variables are set correctly

4. Check that all dependencies are installed

5. Review the Supabase documentation for auth/database issues

6. Review Stripe documentation for payment issues

 

## Credits

 

Built with:

- Next.js

- Supabase

- Stripe

- Tailwind CSS

- Google Places API

- Lucide Icons

- React Hot Toast

- Framer Motion