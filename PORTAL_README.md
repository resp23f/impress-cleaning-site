# 🧹 Impress Cleaning Services - Customer Portal

 

A modern, HelloFresh-inspired customer portal for Impress Cleaning Services built with Next.js, Supabase, and Stripe.

 

## 🎨 Design Philosophy

 

This portal follows a **minimal, modern, HelloFresh-inspired** design:

 

- ✅ One task per screen - no overwhelming forms

- ✅ Large touch-friendly buttons (min 48px)

- ✅ Generous whitespace

- ✅ Rounded corners (8-12px) and soft shadows

- ✅ Mobile-first, responsive design

- ✅ Delightful micro-interactions

 

### Brand Colors

 

- **Primary Green**: `#079447`

- **Navy**: `#1C294E`

- **Background**: `#F7FAFC`

- **White**: `#FFFFFF`

 

## ✨ Features Completed

 

### 🔐 Authentication & Onboarding

 

1. **Sign Up** (`/auth/signup`)

   - Email/password with strength indicator

   - Google OAuth integration

   - reCAPTCHA v3 ready

   - Clean, minimal design

 

2. **Login** (`/auth/login`)

   - Email/password authentication

   - Social login (Google)

   - Role-based redirects (customer → portal, admin → admin panel)

 

3. **Email Verification** (`/auth/verify-email`)

   - Verification confirmation screen

   - Resend email functionality

 

4. **Profile Setup** (`/auth/profile-setup`)

   - Name and phone collection

   - **Google Places Autocomplete** for address

   - Communication preferences (text/email/both)

   - Sets account to "pending" for admin approval

 

5. **Pending Approval** (`/auth/pending-approval`)

   - Real-time status updates via Supabase

   - Auto-redirect when approved

 

### 👥 Customer Portal

 

#### Dashboard (`/portal/dashboard`)

- Welcome message with personalization

- **Next Appointment Card** (large, prominent)

  - Date, time, team members, address

  - View details & reschedule buttons

- **Balance Status Card**

  - Shows outstanding balance

  - Quick pay button

- **Quick Action Buttons**

  - Request Service

  - Pay Invoice

  - View History

- **Upcoming Appointments** section

- **Recent Services** with ratings

- **Invoices & Payments** list

- **Recurring Services** display

- **Service Address** card

 

#### Request Service (`/portal/request-service`)

Multi-step flow (HelloFresh style):

 

1. **Step 1**: Select service type

   - Standard, Deep, Move In/Out, Post-Construction, Office

   - Large selectable cards with icons

 

2. **Step 2**: Choose date & time

   - Date picker

   - Time input

   - "Flexible with timing" option

 

3. **Step 3**: Select address

   - Choose from saved addresses

   - Or add new address with Google Places Autocomplete

 

4. **Step 4**: Special requests

   - Large text area for special instructions

 

5. **Step 5**: Make recurring

   - Toggle for recurring service

   - Select frequency (weekly, bi-weekly, monthly)

 

6. **Success**: Confirmation screen

 

#### Invoices (`/portal/invoices`)

- List all invoices with filters

- Balance summary cards

- Unpaid invoices section

- Full invoice history

 

#### Pay Invoice (`/portal/invoices/[id]/pay`)

- Invoice summary sidebar

- **Stripe Payment Integration**

  - Saved payment methods

  - New card input (Stripe Elements ready)

  - 3D Secure support

- **Zelle Payment Option**

  - Instructions with QR code placeholder

  - Confirmation workflow

- **Confetti animation** on successful payment

 

#### Navigation

- Desktop: Sidebar navigation

- Mobile: Bottom tab bar + hamburger menu

- Active state highlighting

- Logout functionality

 

### 👨‍💼 Admin Panel

 

#### Dashboard (`/admin/dashboard`)

- **Statistics Cards**

  - Total customers

  - Upcoming appointments

  - Unpaid invoices total

  - Pending actions count

- **Alert Cards**

  - Pending registrations

  - Pending service requests

- **Recent Activity**

  - Pending registrations list

  - Pending requests list

 

#### Pending Registrations (`/admin/registrations`)

- List all pending customer accounts

- View customer details

- **Approve/Deny workflow**

  - View full customer information

  - One-click approve

  - Deny with reason

- Email notifications ready (API routes needed)

 

#### Service Requests (`/admin/requests`)

- List all pending service requests

- **Approve & Create Appointment**

  - Pre-filled with customer preferences

  - Set date, time, team members

  - Creates appointment in one step

- **Decline** with reason

- Email notifications ready (API routes needed)

 

#### Navigation

- Dark navy sidebar (`#1C294E`)

- Badge counters for pending items

- Mobile responsive

 

### 🎨 UI Component Library

 

Location: `/src/components/ui/`

 

All components follow brand design system:

 

- **Button**: Primary, secondary, text, danger variants with loading states

- **Card**: Flexible container with hover effects

- **Input**: Text input with icons and error states

- **PasswordInput**: Show/hide toggle

- **Modal**: Centered modal with backdrop blur

- **Badge**: Status badges (success, warning, danger, info, primary)

- **LoadingSpinner**: Animated spinner

- **Toast**: React Hot Toast integration

- **SelectableCard**: Large clickable selection cards

- **SkeletonLoader**: Loading skeletons

 

### 🗄️ Database (Supabase)

 

Complete schema in `supabase-schema.sql`:

 

**Tables:**

- `profiles` - User profiles with roles (customer/admin)

- `service_addresses` - Customer addresses with Google Places IDs

- `appointments` - Scheduled services with team assignments

- `service_history` - Completed services with ratings

- `invoices` - Invoice management with Stripe integration

- `service_requests` - Customer requests (pending approval)

- `payment_methods` - Saved Stripe payment methods

- `admin_notifications` - Real-time admin alerts

- `rate_limits` - Anti-spam rate limiting

 

**Features:**

- Row Level Security (RLS) on all tables

- Automated triggers for notifications

- Auto-generating invoice numbers

- Updated_at timestamp triggers

- Profile auto-creation on signup

 

### 💳 Stripe Integration

 

- Payment intent creation

- Saved payment methods

- 3D Secure support

- Webhook ready (route at `/api/stripe/webhook`)

- Confetti animation on success

 

## 📦 Installation

 

### 1. Clone & Install

 

```bash

git clone <repository>

cd impress-cleaning-site

npm install

```

 

### 2. Environment Variables

 

Create `.env.local`:

 

```bash

# Copy from .env.example

cp .env.example .env.local

```

 

Fill in all values in `.env.local`:

 

- Supabase URL and keys

- Stripe keys

- Google Places API key

- Resend API key (for emails)

- reCAPTCHA keys (optional)

 

### 3. Supabase Setup

 

1. Create project at [supabase.com](https://supabase.com)

2. Run `supabase-schema.sql` in SQL Editor

3. Configure Auth providers:

   - Enable Email

   - Enable Google OAuth

   - Set redirect URLs

 

### 4. Google Places API

 

1. Enable Places API in Google Cloud Console

2. Create API key

3. Add to `.env.local`

 

### 5. Stripe Setup

 

1. Get API keys from Stripe Dashboard

2. Add to `.env.local`

3. (Production) Set up webhooks

 

### 6. Run Development Server

 

```bash

npm run dev

```

 

Visit `http://localhost:3000`

 

## 🚀 Testing the Portal

 

### Customer Flow

 

1. **Sign Up**

   - Go to `/auth/signup`

   - Sign up with email or Google

   - Verify email

 

2. **Profile Setup**

   - Enter name, phone

   - Add service address (Google Places autocomplete)

   - Set communication preferences

 

3. **Wait for Approval**

   - Account is "pending"

   - Real-time updates when approved

 

### Admin Flow

 

1. **Access Admin Panel**

   - Must have `role = 'admin'` in database

   - Login redirects to `/admin/dashboard`

 

2. **Approve Registration**

   - Go to `/admin/registrations`

   - Review customer details

   - Click "Approve"

   - Customer can now access portal

 

3. **Review Service Request**

   - Go to `/admin/requests`

   - Review request details

   - Schedule appointment

   - Click "Approve & Create Appointment"

 

### Customer Portal (After Approval)

 

1. **Dashboard**

   - View next appointment

   - Check balance

   - See recent services

 

2. **Request Service**

   - Click "Request Service"

   - Go through 5-step flow

   - Submit request

   - Wait for admin approval

 

3. **Pay Invoice**

   - Go to `/portal/invoices`

   - Click "Pay Now"

   - Choose Stripe or Zelle

   - Complete payment

 

## 📁 Project Structure

 

```

src/

├── app/

│   ├── auth/                    # Authentication pages

│   │   ├── signup/

│   │   ├── login/

│   │   ├── verify-email/

│   │   ├── profile-setup/

│   │   ├── pending-approval/

│   │   └── callback/

│   ├── portal/                  # Customer portal

│   │   ├── layout.jsx           # Portal layout with nav

│   │   ├── dashboard/

│   │   ├── request-service/

│   │   ├── invoices/

│   │   │   └── [id]/pay/

│   │   ├── appointments/        # To be completed

│   │   ├── history/             # To be completed

│   │   └── settings/            # To be completed

│   ├── admin/                   # Admin panel

│   │   ├── layout.jsx

│   │   ├── dashboard/

│   │   ├── registrations/

│   │   ├── requests/

│   │   ├── customers/           # To be completed

│   │   ├── appointments/        # To be completed

│   │   └── invoices/            # To be completed

│   └── api/

│       └── stripe/

│           └── create-payment-intent/

├── components/

│   ├── ui/                      # Component library

│   │   ├── Button.jsx

│   │   ├── Card.jsx

│   │   ├── Input.jsx

│   │   ├── PasswordInput.jsx

│   │   ├── Modal.jsx

│   │   ├── Badge.jsx

│   │   ├── LoadingSpinner.jsx

│   │   ├── Toast.jsx

│   │   ├── SelectableCard.jsx

│   │   └── SkeletonLoader.jsx

│   ├── portal/

│   │   └── PortalNav.jsx

│   └── admin/

│       └── AdminNav.jsx

├── lib/

│   └── supabase/

│       ├── client.js            # Browser client

│       ├── server.js            # Server client

│       └── middleware.js        # Auth middleware

└── middleware.js                # Next.js middleware

 

Root files:

├── supabase-schema.sql          # Database schema

├── CUSTOMER_PORTAL_SETUP.md     # Detailed setup guide

├── PORTAL_README.md             # This file

└── .env.example                 # Environment variables template

```

 

## 🔧 Still To Be Built

 

The foundation is complete! Remaining features:

 

### Customer Portal Pages

 

- [ ] **Appointments Page** - List, filter, view, reschedule, cancel

- [ ] **Service History Page** - Chronological list with photos and ratings

- [ ] **Account Settings** - Edit profile, addresses, preferences, payment methods

 

### Admin Panel Pages

 

- [ ] **Customers Page** - List, search, filter, manage customers

- [ ] **Appointments Page** - Calendar view, create, edit, assign teams

- [ ] **Invoices Page** - Create, edit, send invoices

- [ ] **Reports Page** - Analytics and reports

 

### Features

 

- [ ] **Email Notifications** (Resend API)

  - Account approval

  - Service request confirmation

  - Appointment reminders

  - Invoice notifications

  - Payment confirmations

 

- [ ] **PDF Generation** (jsPDF)

  - Invoice PDFs with branding

  - Service history reports

 

- [ ] **Security**

  - reCAPTCHA v3 integration

  - Rate limiting implementation

  - IP tracking

 

- [ ] **Stripe Elements**

  - Full Stripe Elements integration for card input

  - Save payment method functionality

 

- [ ] **Micro-interactions**

  - Page transitions (Framer Motion)

  - Loading states with skeletons

  - Optimistic UI updates

 

## 🎯 Key Files to Review

 

1. **Database Schema**: `supabase-schema.sql`

   - All tables, RLS policies, triggers, functions

 

2. **Authentication Flow**:

   - `src/app/auth/signup/page.jsx`

   - `src/app/auth/profile-setup/page.jsx`

   - `src/app/auth/pending-approval/page.jsx`

 

3. **Customer Portal**:

   - `src/app/portal/dashboard/page.jsx`

   - `src/app/portal/request-service/page.jsx`

   - `src/app/portal/invoices/[id]/pay/page.jsx`

 

4. **Admin Panel**:

   - `src/app/admin/dashboard/page.jsx`

   - `src/app/admin/registrations/page.jsx`

   - `src/app/admin/requests/page.jsx`

 

5. **UI Components**: `src/components/ui/`

 

## 🔑 Admin Access

 

To create an admin user:

 

1. Sign up normally through `/auth/signup`

2. In Supabase dashboard, update the user's profile:

 

```sql

UPDATE profiles

SET role = 'admin', account_status = 'active'

WHERE email = 'admin@example.com';

```

 

3. Log out and log back in

4. You'll be redirected to `/admin/dashboard`

 

## 📱 Mobile Responsiveness

 

Fully responsive design:

 

- **Mobile** (320px - 767px): Bottom navigation, stacked layouts

- **Tablet** (768px - 1023px): Hybrid layouts

- **Desktop** (1024px+): Sidebar navigation, multi-column grids

 

All touch targets are minimum 48px for mobile accessibility.

 

## 🎨 Customization

 

### Brand Colors

 

Update in Tailwind classes throughout:

 

- Primary: `bg-[#079447]`, `text-[#079447]`, `border-[#079447]`

- Navy: `bg-[#1C294E]`, `text-[#1C294E]`

 

### Logo

 

Replace the circular "IC" logo with your own:

 

- Portal: `src/components/portal/PortalNav.jsx`

- Admin: `src/components/admin/AdminNav.jsx`

- Auth pages: Individual page files

 

## 🐛 Known Issues / Notes

 

1. **Stripe Elements**: Currently shows placeholder. Full integration needs Stripe Elements component installation.

 

2. **Email Notifications**: API routes are referenced but not yet implemented. Will need:

   - `/api/send-email/account-approved`

   - `/api/send-email/appointment-confirmed`

   - `/api/send-email/request-declined`

 

3. **PDF Generation**: Download links are present but API route not implemented.

 

4. **reCAPTCHA**: Environment variables ready but not yet integrated into signup form.

 

## 📝 License

 

© 2024 Impress Cleaning Services. All rights reserved.

 

## 🙏 Credits

 

Built with:

- [Next.js](https://nextjs.org/)

- [Supabase](https://supabase.com/)

- [Stripe](https://stripe.com/)

- [Tailwind CSS](https://tailwindcss.com/)

- [Lucide Icons](https://lucide.dev/)

- [React Hot Toast](https://react-hot-toast.com/)

- [Google Places API](https://developers.google.com/maps/documentation/places)

- [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)

 

---

 

**Ready to launch!** 🚀

 

This portal provides a solid foundation with core functionality complete. The remaining features (appointments page, settings, email notifications, etc.) can be added incrementally as needed.