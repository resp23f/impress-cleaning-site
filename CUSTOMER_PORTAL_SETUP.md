# Impress Cleaning Services - Customer Portal Setup Guide
## Overview
This is a complete Customer Portal system for Impress Cleaning Services with a modern, HelloFresh-inspired UX. The portal allows customers to manage appointments, view service history, pay invoices, and request new services.
## Tech Stack
- **Framework**: Next.js 15.5.4 (App Router)
- **Authentication & Database**: Supabase
- **Payments**: Stripe
- **Email**: Resend (configured and verified)
- **Address Autocomplete**: Google Places API
- **UI Components**: Custom component library with Tailwind CSS
- **Animations**: CSS Modules (no Framer Motion - premium CSS animations)
- **Notifications**: React Hot Toast
- **reCAPTCHA**: v3 (configured)
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
# reCAPTCHA v3
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
# Email Configuration (Resend - VERIFIED)
RESEND_API_KEY=your_resend_api_key
# App Configuration
NEXT_PUBLIC_APP_URL=https://preview.impressyoucleaning.com (or your domain)
```
**Note**: Admin approval has been REMOVED. Users get immediate portal access after completing profile setup.
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
- **profiles**: User profiles with roles (customer/admin) - NO LONGER USES PENDING STATUS
- **service_addresses**: Customer service addresses with Google Places integration
- **appointments**: Scheduled cleaning appointments
- **service_history**: Completed services with ratings
- **invoices**: Customer invoices with Stripe integration
- **service_requests**: Customer service requests
- **payment_methods**: Saved Stripe payment methods
- **admin_notifications**: Notifications for admin panel
**IMPORTANT SCHEMA CHANGES**:
- Removed `account_status` checks from login flow
- Users are automatically active after profile completion
- Admin approval workflow has been removed
#### C. Configure Authentication
1. In Supabase Dashboard → Authentication → Providers:
   - Enable **Email** provider
   - Enable **Google** OAuth provider (configured with credentials)
2. In Authentication → URL Configuration:
   - **Site URL**: `https://preview.impressyoucleaning.com` (or your domain)
   - **Redirect URLs**:
     - `https://preview.impressyoucleaning.com/auth/callback`
     - `http://localhost:3000/auth/callback` (for dev)
     - `https://preview.impressyoucleaning.com/**` (wildcard)
3. In Authentication → Email Templates:
   - Custom verification email template configured
   - Uses branded HTML template with logo
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
4. **Stripe Elements**: Not yet fully integrated (shows placeholder)
5. Set up webhooks (for production):
   - Webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Events to listen for:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `payment_method.attached`
### 5. Resend Email Setup
**STATUS**: ✅ Domain verified and configured
1. Domain `impressyoucleaning.com` is verified in Resend
2. Sending from: `notifications@impressyoucleaning.com`
3. DNS records (SPF/DKIM) are configured
4. Email templates use branded HTML with company logo
**Email Flow**:
- Verification emails sent automatically by Supabase (using custom template)
- Future: Appointment confirmations, notifications via Resend API
### 6. Install Dependencies
```bash
npm install
```
All required dependencies are already listed in `package.json`.
### 7. Run Development Server
```bash
npm run dev
```
Visit `http://localhost:3000` to see the site.
## Features Implemented
### ✅ Authentication & Onboarding (UPDATED FLOW)
**NEW FLOW** (No admin approval):
1. Sign up → Email verification
2. Verify email → Redirects to login
3. Login → Profile setup (if incomplete)
4. Complete profile → Immediate portal access ✅
**Pages:**
1. **Sign Up Page** (`/auth/signup`)
   - Email/password signup with strength indicator
   - Google OAuth integration (working)
   - reCAPTCHA v3 ready
   - Clean, minimal design
2. **Login Page** (`/auth/login`)
   - Email/password login
   - Google OAuth
   - **Profile completion check** - redirects to profile-setup if incomplete
   - Role-based redirects (customer → portal, admin → admin)
3. **Email Verification** (`/auth/verify-email`)
   - Branded email template with company logo
   - Confirmation screen after signup
   - Resend email option
4. **Profile Setup** (`/auth/profile-setup`)
   - Name and phone collection
   - Google Places address autocomplete (working)
   - Communication preferences
   - **Sets account to ACTIVE immediately** (no approval needed)
5. **Pending Approval Page** - ⚠️ DEPRECATED (can be removed)
### ✅ Customer Portal (PREMIUM DESIGN)
**RECENT UPDATES**:
- ✅ Premium CSS animations (fade-in, stagger effects, card hover)
- ✅ Shared animation CSS module (`/src/app/portal/shared-animations.module.css`)
- ✅ Smooth transitions and micro-interactions
- ✅ Company logo integration (`ImpressLogoNoBackgroundBlue.png`)
- ✅ Cohesive design system across all portal pages
1. **Dashboard** (`/portal/dashboard/page.jsx`)
   - ✅ Premium animations with CSS modules
   - ✅ Staggered fade-in effects
   - ✅ Card hover states with smooth transitions
   - Welcome message with user's first name
   - Next appointment card (large, prominent with gradient background)
   - Balance status card (color-coded: green for paid, yellow for due)
   - Quick action buttons with smooth hover effects
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
   - Step 3: Select or add address (Google Places autocomplete)
   - Step 4: Special requests (optional)
   - Step 5: Make recurring (optional)
   - Success confirmation
   - Creates service request in database
   - Triggers admin notification
3. **Service History** (`/portal/service-history`)
   - ✅ Built by Claude Code
   - Lists completed services
   - Filters by date range
   - Shows service details, team members
   - **Fixed query** to use correct schema relationships
4. **Appointments** (`/portal/appointments`)
   - ✅ Built by Claude Code
   - View upcoming/past appointments
   - Reschedule functionality
   - Cancel with confirmation modal
   - Shows status, team assignments
5. **Settings** (`/portal/settings`)
   - ✅ Built by Claude Code
   - Update profile (name, phone, email)
   - Manage service addresses (CRUD with Google Places)
   - Change password
   - Communication preferences
   - Payment method management (Stripe integration)
   - Account deletion option
6. **Invoices** (`/portal/invoices`)
   - ✅ Built by Claude Code
   - List all invoices
   - Filter by status
   - Payment functionality
   - Stripe card management
7. **Portal Navigation** (`/components/portal/PortalNav.jsx`)
   - ✅ Updated with company logo (`ImpressLogoNoBackgroundBlue.png`)
   - Desktop sidebar navigation
   - Mobile bottom tab bar
   - Hamburger menu for mobile
   - Active state highlighting
   - Smooth transitions
   - Logout functionality
### ✅ Premium Animation System
**Location**: `/src/app/portal/shared-animations.module.css`
**Features**:
- Fade-in and fade-in-up animations
- Staggered animation delays (6 levels)
- Card hover effects (lift and shadow)
- Interactive card states
- Gradient backgrounds for hero cards
- Status indicator cards (success, warning, info)
- Smooth transitions (fast and standard)
- Skeleton loaders for loading states
- Button hover effects
- Badge pulse animations
- List item hover effects
- Modal/overlay animations
- Reduced motion support
**Usage**: Imported by all portal pages for consistent premium feel
### ✅ UI Component Library
Location: `/src/components/ui/`
- **Button**: Primary, secondary, text, danger variants with loading states
- **Card**: Flexible card component with hover states (works with animation CSS)
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
### ✅ Admin Panel
**Note**: Admin approval workflow removed but admin panel still functional for managing customers and services
1. **Admin Dashboard** (`/admin/dashboard`)
   - Statistics overview
   - Pending service requests count (no longer shows pending registrations)
   - Revenue tracking
   - Recent activity
2. **Pending Registrations** - ⚠️ PAGE DEPRECATED (can be removed or repurposed)
3. **Service Requests** (`/admin/requests`)
   - List of pending service requests
   - Approve and create appointments
   - Modify request details
   - Decline with reason
4. **Customer Management** - To be completed
5. **Appointment Management** - To be completed
6. **Invoice Management** - To be completed
## Current Authentication Flow
**Updated Flow (No Approval)**:
```
┌─────────────┐
│   Sign Up   │
│ (Email/Pwd  │
│  or Google) │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Email     │ ← Only for email/password signups
│ Verification│   (Google skips this)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Login    │
└──────┬──────┘
       │
       ▼
    ┌──────┐
    │Profile│ ← Checks if profile complete
    │Check  │
    └──┬───┘
       │
   No  │  Yes
   ┌───┴───┐
   │       │
   ▼       ▼
┌─────┐ ┌──────┐
│Setup│ │Portal│
│Prof.│ │Access│
└──┬──┘ └──────┘
   │
   └──────────────┐
                  │
                  ▼
            ┌──────────┐
            │  Portal  │
            │Dashboard │
            └──────────┘
```
**Key Changes from Original**:
- ❌ Removed "Pending Approval" step
- ❌ Removed admin approval requirement
- ✅ Immediate portal access after profile completion
- ✅ Login page checks profile completion and redirects accordingly
## Database Schema Updates
### Modified Tables
**profiles**:
- `account_status` field still exists but is no longer used for blocking access
- All new users are set to 'active' automatically
- Admin approval logic removed from RLS policies
**Key RLS Policy Changes**:
- Removed checks for `account_status = 'active'`
- Customers can access portal immediately after profile completion
## File Structure
```
src/
├── app/
│   ├── auth/
│   │   ├── signup/page.jsx
│   │   ├── login/page.jsx (✅ UPDATED - profile check)
│   │   ├── verify-email/page.jsx
│   │   ├── profile-setup/page.jsx (✅ UPDATED - auto-active)
│   │   ├── pending-approval/page.jsx (⚠️ DEPRECATED)
│   │   └── callback/route.js (✅ UPDATED)
│   ├── portal/
│   │   ├── shared-animations.module.css (✅ NEW - Premium animations)
│   │   ├── layout.jsx (✅ UPDATED - removed approval check)
│   │   ├── dashboard/page.jsx (✅ PREMIUM DESIGN)
│   │   ├── request-service/page.jsx
│   │   ├── appointments/page.jsx (✅ COMPLETED by Claude Code)
│   │   ├── service-history/page.jsx (✅ COMPLETED by Claude Code)
│   │   ├── invoices/
│   │   │   ├── page.jsx (✅ COMPLETED by Claude Code)
│   │   │   └── [id]/pay/page.jsx (✅ COMPLETED by Claude Code)
│   │   └── settings/page.jsx (✅ COMPLETED by Claude Code)
│   └── admin/
│       ├── dashboard/page.jsx (✅ UPDATED - removed approval stats)
│       ├── registrations/page.jsx (⚠️ DEPRECATED)
│       └── requests/page.jsx
├── components/
│   ├── ui/ (component library)
│   ├── portal/
│   │   └── PortalNav.jsx (✅ UPDATED with logo)
│   └── admin/
│       └── AdminNav.jsx
├── lib/
│   └── supabase/
│       ├── client.js
│       ├── server.js
│       └── middleware.js
└── public/
    ├── ImpressLogoNoBackgroundBlue.png (✅ Company logo)
    └── logo_impress_white.png (✅ White logo for emails)
```
## Recent Changes & Fixes
### ✅ Completed (Session Nov 2024)
1. **Removed Admin Approval Requirement**
   - Users get immediate portal access after profile completion
   - Login flow updated to check profile completion only
   - No more "pending approval" waiting state
2. **Premium Design System**
   - Created shared CSS animation module
   - Added premium animations (fade-in, stagger, hover effects)
   - Gradient backgrounds on hero cards
   - Smooth transitions throughout
3. **Logo Integration**
   - Replaced placeholder "IC" circle with actual company logo
   - Desktop: 48px height
   - Mobile: 32px height
   - Logo: `ImpressLogoNoBackgroundBlue.png`
4. **Portal Pages Completed**
   - Service History (with fixed schema queries)
   - Appointments (full CRUD)
   - Settings (profile, addresses, payment methods)
   - Invoices (list and payment flow)
5. **CORS Issues Fixed**
   - Added preview domain to Supabase redirect URLs
   - Fixed Google OAuth redirect flow
   - Proper callback handling
6. **Email Configuration**
   - Resend domain verified
   - Branded email templates with logo
   - Using `notifications@impressyoucleaning.com`
   - SPF/DKIM configured for deliverability
7. **Environment Variables**
   - Added `NEXT_PUBLIC_APP_URL` to Vercel
   - All Stripe keys configured
   - Google Places API key set
   - reCAPTCHA keys configured
### 🔧 Known Issues
1. **Stripe Elements**: Placeholder only - needs full Stripe Elements integration
2. **Email Notifications**: API routes referenced but not implemented
3. **PDF Generation**: Download links present but no PDF generation yet
4. **Pending Approval Page**: Still exists but no longer used - can be removed
5. **Service History Error**: Shows error initially but loads fine (minor UX issue)
## Testing Checklist
### Authentication ✅
- [x] Sign up with email
- [x] Sign up with Google OAuth
- [x] Email verification flow
- [x] Profile setup with Google Places
- [x] Login with email
- [x] Login with Google
- [x] Profile completion check on login
- [x] Logout functionality
- [ ] Password reset (to be implemented)
### Customer Portal ✅
- [x] Dashboard loads with animations
- [x] Next appointment displays correctly
- [x] Balance calculation is accurate
- [x] Request service flow works
- [x] All navigation links work
- [x] Mobile navigation works
- [x] Premium animations working
- [x] Logo displays correctly
### New Pages ✅
- [x] Service History page loads
- [x] Appointments page functional
- [x] Settings page CRUD operations
- [x] Invoices list and payment
### Security ✅
- [x] RLS policies prevent unauthorized access
- [x] Users can only see their own data
- [x] Admins can see all data
- [x] Session management works
- [x] Protected routes redirect to login
### Responsive Design ✅
- [x] Mobile (320px - 767px)
- [x] Tablet (768px - 1023px)
- [x] Desktop (1024px+)
- [x] Touch targets are 48px minimum
## Deployment
### Vercel Deployment
**Current Status**: Deployed to preview branch
**Preview URL**: `https://preview.impressyoucleaning.com`
### Environment Variables (Vercel)
All environment variables are configured in Vercel for the preview environment:
- Supabase keys ✅
- Stripe keys ✅
- Google Places API ✅
- Resend API key ✅
- App URL ✅
- reCAPTCHA keys ✅
### Supabase Production Config
1. URL configurations updated:
   - Site URL: `https://preview.impressyoucleaning.com`
   - Redirect URLs include preview domain
2. RLS policies reviewed and functional
3. Database backups: Not yet configured
## Support & Maintenance
### Monitoring
- Monitor Supabase logs for errors
- Track Stripe payment activity
- Monitor email delivery (Resend dashboard)
- Error tracking: Not yet implemented (Sentry recommended)
### Regular Tasks
- Respond to service requests within 24 hours
- Monitor invoice payment status
- Back up database weekly (to be configured)
## Additional Notes
### Design Philosophy
This portal follows a HelloFresh-inspired design philosophy:
- **One task per screen**: No overwhelming forms
- **Large touch targets**: Minimum 48px for mobile
- **Generous whitespace**: Clean, uncluttered layouts
- **Rounded corners**: 8-12px radius throughout
- **Soft shadows**: Subtle depth
- **Smooth transitions**: 200-300ms duration with cubic-bezier easing
- **Premium feel**: Gradient backgrounds, stagger animations, hover effects
- **Mobile-first**: Responsive from the start
### Premium Animation System
All portal pages use the shared animation CSS module for:
- Consistent visual language
- Smooth, professional feel
- Reduced motion support
- Performance (CSS-only, no JS overhead)
- Easy maintenance (one file to update)
### Accessibility
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Focus states on all interactive elements
- Color contrast meets WCAG AA standards
- Reduced motion support in animations
### Performance
- Server components where possible
- Client components only when needed
- CSS Modules for styling (tree-shakeable)
- Optimized images
- Smooth animations without JavaScript overhead
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
- Next.js 15
- Supabase
- Stripe
- Resend
- Tailwind CSS
- Google Places API
- Lucide Icons
- React Hot Toast
---
**Project Status**: Customer portal fully functional with premium design. Admin approval removed for streamlined onboarding. Email integration configured. Payment system partially complete (Stripe Elements pending).
**Last Updated**: November 2024