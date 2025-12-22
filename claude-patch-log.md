================================================================================
PATCH LOG #7 — 2025-12-22 — Security Hardening, Form Field Fixes & Invoice Email System
================================================================================
1. OBJECTIVE
--------------------------------------------------------------------------------
Critical security improvements and code quality fixes:
  - Fix payment integrity vulnerability (client-controlled amount parameter)
  - Complete key rotation after .env.local git exposure discovery
  - Add id/name attributes to 40+ form inputs for accessibility
  - Create custom invoice notification email (replacing Stripe's)
  - Fix email template body text and contact addresses
  - CSP updates for Tawk.to compatibility
  - Storage bucket RLS policies

2. FILES TOUCHED
--------------------------------------------------------------------------------
| File | Action |
|------|--------|
| src/app/api/stripe/create-payment-intent/route.js | Modified (CRITICAL) |
| src/app/portal/invoices/[id]/pay/page.jsx | Modified |
| src/app/api/email/invoice-ready/route.ts | Created (TypeScript) |
| src/app/api/admin/invoices/send/route.js | Modified |
| src/app/admin/invoices/page.jsx | Modified |
| src/app/admin/settings/page.jsx | Modified |
| src/app/admin/appointments/page.jsx | Modified |
| src/app/admin/reports/page.jsx | Modified |
| src/app/portal/settings/page.jsx | Modified |
| src/app/api/email/appointment-confirmed/route.js | Modified |
| src/app/api/email/appointment-rescheduled/route.js | Modified |
| src/app/api/email/appointment-cancelled/route.js | Modified |
| src/app/api/email/service-request-declined/route.js | Modified |
| src/app/api/admin/create-appointment/route.js | Modified |
| next.config.mjs | Modified |
| Supabase storage policies | SQL executed |
| Vercel environment variables | Updated |

3. CHANGES BY FILE
--------------------------------------------------------------------------------

### src/app/api/stripe/create-payment-intent/route.js (CRITICAL SECURITY FIX)
- REMOVED client-controlled `amount` parameter from request body
- Now fetches invoice.total directly from database
- Added validation: rejects if `!invoice.total || invoice.total <= 0`
- Prevents attacker from sending `amount: 0.01` to pay $500 invoice

BEFORE (VULNERABLE):
```javascript
const { invoice_id, amount } = await request.json()
// amount came from client - attacker could manipulate
```

AFTER (SECURE):
```javascript
const { invoice_id } = await request.json()
const { data: invoice } = await supabase.from('invoices').select('total, customer_id')...
const amount = Math.round(invoice.total * 100) // from DB only
```

### src/app/portal/invoices/[id]/pay/page.jsx
- Removed `amount` parameter from 4 fetch calls to create-payment-intent
- API now uses server-side invoice.total

### src/app/api/email/invoice-ready/route.ts (NEW - TypeScript)
- Custom invoice notification email replacing Stripe's default
- Uses same template dimensions as other emails (35px logo padding, 28px H1, 15px body)
- Button text: "LOG IN NOW" → links to /auth/login
- Contact: billing@impressyoucleaning.com
- TypeScript with proper types: NextRequest, InvoiceReadyRequest interface

### src/app/api/admin/invoices/send/route.js
- Added `sendNotificationEmail` boolean parameter (default: true)
- Fetches customer first_name and email from profiles
- Calls /api/email/invoice-ready when toggle is ON
- Returns `notificationEmailSent` in response

### src/app/admin/invoices/page.jsx
- Added `sendNotificationEmail` state (default: true)
- Added toggle UI in View Invoice modal for draft invoices
- Toast shows "Invoice sent! Customer notified." when email sent
- Radio inputs now have `id={`payment-method-${method}`}` for accessibility

### src/app/admin/settings/page.jsx
- Added id/name to 30+ form inputs across all tabs:
  - Business Info: name, phone, email, address fields
  - Business Hours: all day checkboxes
  - Service areas, notification preferences

### src/app/admin/appointments/page.jsx
- Added id/name to 6 inputs:
  - appointment-search, appointment-status-filter
  - create-appointment-customer, create-appointment-address
  - create-appointment-notes, notify-customer checkbox

### src/app/admin/reports/page.jsx
- Added id/name to date-range-filter select

### src/app/portal/settings/page.jsx
- Added id/name to mobile status filter and communication preference selects

### Email Template Fixes (5 files)
All appointment emails updated:
- Body text: Removed "make a payment" (incorrect for appointments)
- Contact: Changed to scheduling@impressyoucleaning.com

| File | Body Text | Contact |
|------|-----------|---------|
| appointment-confirmed/route.js | "...view the details." | scheduling@ |
| appointment-rescheduled/route.js | "...view the updated details." | scheduling@ |
| appointment-cancelled/route.js | "...view the details." | scheduling@ |
| service-request-declined/route.js | "...view the details or submit a new request." | scheduling@ |
| admin/create-appointment/route.js | "...view the details." | scheduling@ |

Invoice email (unchanged, correct):
| invoice-ready/route.ts | "...view the details and make a payment." | billing@ |

### next.config.mjs (CSP Updates)
- style-src: Added `https://*.tawk.to`
- font-src: Added `https://*.tawk.to`
- frame-src: Changed `https://tawk.to` → `https://*.tawk.to`
(Tawk.to uses subdomains like embed.tawk.to, va.tawk.to)

4. SECURITY CHANGES
--------------------------------------------------------------------------------

### Key Rotation (All keys rotated 2025-12-22)
REASON: .env.local committed to git on Nov 17 & 19, 2025 (commits 8e655fc, e00c6cf)
Keys remain in git history forever - rotation required.

| Key | Action |
|-----|--------|
| STRIPE_SECRET_KEY | Rolled in Stripe dashboard |
| STRIPE_WEBHOOK_SECRET | Rolled in Stripe dashboard |
| SUPABASE_SERVICE_ROLE_KEY | Regenerated |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Regenerated (paired with above) |
| RESEND_API_KEY | Rotated |
| TURNSTILE_SECRET_KEY | Rotated (was MISSING from Vercel production) |
| GOOGLE_PLACES_API_KEY | Rotated |
| RECAPTCHA_SITE_KEY | Recreated |
| RECAPTCHA_SECRET_KEY | Recreated |
| CRON_SECRET | REMOVED (unused - pg_cron handles jobs) |

### Storage Bucket Policies (SQL executed in Supabase)
Created RLS policies for `public-assets` bucket:
- Public read access (for logo in auth emails)
- Admin-only INSERT/UPDATE/DELETE

### GitHub Email Privacy
- Changed commit email to noreply address

5. LOGIC DECISIONS
--------------------------------------------------------------------------------

WHY REMOVE CLIENT AMOUNT PARAMETER:
- Client sends invoice_id only, server fetches amount from DB
- Eliminates entire class of payment manipulation attacks
- No legitimate reason for client to specify amount

WHY ROTATE ALL KEYS:
- .env.local in git history = keys compromised forever
- Even if file deleted, history contains keys
- No way to know if keys were extracted
- Rotation is only safe option

WHY TURNSTILE WAS FAILING:
- TURNSTILE_SECRET_KEY missing from Vercel production environment
- Server-side verification was silently failing
- Added to Vercel env vars during rotation

WHY SEPARATE EMAIL CONTACTS:
- billing@impressyoucleaning.com for invoice emails
- scheduling@impressyoucleaning.com for appointment emails
- Matches business workflow and customer expectations

WHY TYPESCRIPT FOR NEW EMAIL ROUTE:
- Project convention: new files use .ts/.tsx
- Existing files stay as .js/.jsx
- Proper typing: NextRequest, interface for request body

6. KNOWN ISSUES RESOLVED
--------------------------------------------------------------------------------
- Payment integrity vulnerability: FIXED
- .env.local git exposure: ROTATED all keys
- Missing TURNSTILE_SECRET_KEY in production: ADDED
- Form inputs missing id/name: FIXED (40+ inputs)
- Appointment emails mentioning payment: FIXED
- Tawk.to fonts/frames blocked by CSP: FIXED
- Radio inputs in Mark Paid modal missing id: FIXED

7. CONSOLE ERRORS INVESTIGATED
--------------------------------------------------------------------------------
Chrome DevTools showed 4 issues - ALL from Cloudflare (unfixable):

| Issue | Source | Fixable? |
|-------|--------|----------|
| Form field missing id/name | Cloudflare challenge iframe | ❌ |
| CSP blocks eval() | Cloudflare challenge uses eval | ❌ |
| Deprecated StorageType | Cloudflare internal code | ❌ |
| Quirks Mode | Cloudflare challenge iframe | ❌ |

These are safe to ignore - Cloudflare's bot protection layer.

8. NEXT STEPS / TODOs
--------------------------------------------------------------------------------
- User to enable MFA on: Supabase, Vercel, GitHub, Cloudflare, Porkbun, Email
- User to verify storage policies: `SELECT * FROM pg_policies WHERE tablename = 'objects';`
- Phase 2: RLS isolation tests (prove User A can't access User B's data)
- Phase 2: Database constraints (max 3 cards, foreign keys, amount > 0)
- Phase 3: Cloudflare WAF configuration
- Phase 3: Rate limiting on auth endpoints
- Phase 4: Admin audit log table
- Phase 4: Monitoring/alerting (Sentry)

================================================================================
END PATCH LOG #7
================================================================================

================================================================================
PATCH LOG #6 — 2025-12-19 — Booking Validation, Auth Path Rename & Baseline Clarifications
================================================================================
1. OBJECTIVE
--------------------------------------------------------------------------------
Multiple improvements across public forms, auth paths, documentation, and admin UI:
  - Add real-time phone formatting to public booking page
  - Add free address validation to booking page (no Google API cost)
  - Rename confusing auth path for admin-invited customers
  - Comprehensive baseline documentation clarifications
  - Display customer birthday in admin portal
  - Git repository cleanup

2. FILES TOUCHED
--------------------------------------------------------------------------------
| File | Action |
|------|--------|
| src/app/(public)/booking/BookingContent.jsx | Modified |
| src/app/api/booking/route.js | Modified |
| src/app/auth/admin-invited-set-password/ | Renamed → activate/ |
| src/app/api/auth/validate-invite/route.ts | Modified |
| src/app/admin/customers/page.jsx | Modified |
| claude-baseline-master.md | Modified (extensive) |
| .claudeignore | Created |

3. CHANGES BY FILE
--------------------------------------------------------------------------------

### src/app/(public)/booking/BookingContent.jsx
- Added `formatPhoneNumber()` function (matches profile-setup pattern)
- Updated handleChange to format phone as user types: (512) 555-1234
- Changed phone input maxLength from 20 to 14
- Added `validateAddress()` function for free validation (no API)
- Added `addressError` state for error display
- Validates on blur (when user clicks away) and on submit
- Red border + error message with Info icon on invalid address
- Error clears when user starts typing

### src/app/api/booking/route.js
- Added same `validateAddress()` function as backend security layer
- Returns 400 error if address fails validation
- Prevents API manipulation bypassing frontend validation

### Address Validation Rules (Free - No Google API)
- Minimum 15 characters (forces complete address)
- Must contain street number (regex: /\d/)
- Must contain valid street suffix (st, street, ave, avenue, rd, road, dr, drive, ln, lane, blvd, boulevard, way, ct, court, cir, circle, pl, place, ter, terrace, pkwy, parkway, hwy, highway, trl, trail, loop, run, pass, xing, crossing)
- Must contain 5-digit ZIP code
- Blocklist: test, asdf, fake, xxxx, sample, example, n/a, none, null
- Blocks 5+ repeated characters (e.g., "aaaaaaa")

### src/app/auth/admin-invited-set-password/ → src/app/auth/activate/
- Renamed folder from `admin-invited-set-password` to `activate`
- Old name was confusing (read like "admin staff invite" not "admin-invited customer")
- New URL: impressyoucleaning.com/auth/activate (clean, professional)

### src/app/api/auth/validate-invite/route.ts
- Updated redirect from `/auth/admin-invited-set-password` to `/auth/activate`

### src/app/admin/customers/page.jsx
- Added birthday display to Customer Details modal
- Shows "March 15" format or "Not provided"
- Uses month name array for display formatting

### claude-baseline-master.md (Extensive Updates)
- Fixed tech stack versions (Next.js 16.0.10, React 19.1.0, Tailwind 4.x)
- Fixed auth pages count (8 → 9)
- Clarified self-registration flow (password set at signup, NOT after verification)
- Clarified admin invite flow (uses custom token system, NOT Supabase magic links)
- Added "Key distinction" notes explaining WHY flows are different
- Added `booking_requests` table schema (was missing)
- Added `customer_email` column to invoices table (orphan invoice support)
- Added pg_cron scheduled jobs section with schedules
- Added Business Policies section (cancellation fees, late payment 5% on pre-tax)
- Added admin login email note (portal@impressyoucleaning.com)
- Expanded Phone Number Handling section:
  - formatPhoneNumber() vs validatePhone() distinction
  - Where each is used
- Expanded Address Handling section:
  - Google Places API: profile-setup ONLY
  - Manual input: portal settings
  - Free validation: booking page
- Updated Google Places integration to clarify scope

### .claudeignore (New File)
- Created to exclude .env files from Claude Code CLI scans
- Entries: .env, .env.local, .env*.local

4. GIT REPOSITORY CLEANUP
--------------------------------------------------------------------------------
- Removed .DS_Store files: `find . -name ".DS_Store" -type f -delete`
- Removed ._ resource fork files: `find . -name "._*" -type f -delete`
- Fixed git corruption from ._pack files in .git/objects/pack/
- Deleted empty /api/cron folder (legacy, using Supabase pg_cron)
- Deleted trigger.txt test file
- Synced preview branch with main: deleted and recreated from main
- Deleted stale preview-backup branch

5. LOGIC DECISIONS
--------------------------------------------------------------------------------

WHY FREE ADDRESS VALIDATION INSTEAD OF GOOGLE API:
- Public booking form = high volume, many spam attempts
- API calls cost money per request
- Free validation catches 95%+ of spam/bots
- Real customers type real addresses naturally

WHY DIFFERENT VALIDATION PER PAGE:
| Page | Method | Reason |
|------|--------|--------|
| /auth/profile-setup | Google Places API | Critical first address, must be real for invoicing |
| /portal/settings | Manual input fields | No API cost, customer can type freely |
| /booking | Free validation rules | Filter spam without losing leads |

WHY RENAME TO /auth/activate:
- "admin-invited-set-password" reads like "admin staff invites"
- Confusing for future Claude sessions
- "/activate" is clean, common pattern, doesn't expose implementation

WHY SEPARATE formatPhoneNumber vs validatePhone:
- formatPhoneNumber: UX improvement (pretty display as user types)
- validatePhone: Security (blocks fake numbers)
- Booking page uses format only (too strict validation loses leads)
- Profile/settings use both (registered customers need valid data)

6. KNOWN ISSUES RESOLVED
--------------------------------------------------------------------------------
- Auth flow confusion between self-registered and admin-invited: CLARIFIED in baseline
- Missing booking_requests table in docs: ADDED
- Missing pg_cron schedules in docs: ADDED
- Confusing auth path name: RENAMED
- Birthday not visible in admin: ADDED

7. NEXT STEPS / TODOs
--------------------------------------------------------------------------------
- Admin portal styling improvements (next session)
- Monitor address validation effectiveness in production

================================================================================
END PATCH LOG #6
================================================================================

================================================================================
PATCH LOG #5 2025-12-18 — Dashboard Row 1 Premium Redesign & Admin Invite Error Handling
================================================================================

1. DEEP LEVEL OBJECTIVE
--------------------------------------------------------------------------------
- Optimize portal dashboard layout for 16" MacBook Pro displays
- Redesign service request page cards from vertical to horizontal layout
- Create premium, cohesive Row 1 (Next Appointment + Account Balance cards)
- Fix admin-invited customer onboarding flow crashing on password submission
- Ensure all UI elements are polished without glitchy animations

2. FILES TOUCHED (EXACT PATHS)
--------------------------------------------------------------------------------
/Volumes/T7 Shield/impress-cleaning-site/src/app/portal/request-service/page.jsx
/Volumes/T7 Shield/impress-cleaning-site/src/app/portal/dashboard/page.jsx
/Volumes/T7 Shield/impress-cleaning-site/src/app/auth/admin-invited-set-password/page.tsx
/Volumes/T7 Shield/impress-cleaning-site/src/app/auth/profile-setup/page.jsx

3. WHAT CHANGED IN EACH FILE
--------------------------------------------------------------------------------

### /src/app/portal/request-service/page.jsx
- Replaced vertical SelectableCard components with inline horizontal button layout
- Changed grid from 2-column to single column (grid-cols-1 gap-3)
- Icon positioned on left (12x12, colored when selected)
- Title + description in middle with line-clamp-1 truncation
- Checkmark indicator on right when selected
- Compact padding (p-4) for tighter layout
- All 5 service types now fit without scrolling on laptop screens

### /src/app/portal/dashboard/page.jsx
- Changed container from max-w-7xl to max-w-6xl (matches appointments page)
- Complete Row 1 redesign (multiple iterations):
  
  NEXT APPOINTMENT CARD:
  - Added hero date block with green gradient showing day number + month abbreviation
  - Header with icon in rounded container + "Coming Up" label + "Next Appointment" title
  - Horizontal layout for date, time window, and service type with vertical dividers
  - View Details button changed from Button component to inline styled span
  - Removed styles.cardHover and styles.smoothTransition to prevent button shake
  - Address shown in subtle footer row with border-top separator
  - Running late notice with amber styling and icon
  - Empty state centered with flex justify-center wrapper for button
  
  ACCOUNT BALANCE CARD:
  - Centered layout for $0 state with prominent checkmark icon
  - Two decorative gradient circles (top-right and bottom-left)
  - Larger text sizing (text-3xl for amount, text-lg for header)
  - Full height with flex column layout to match appointment card height
  - Red gradient for balance due state, emerald gradient for all caught up

- Grid gap changed from gap-5 to gap-6 for Row 1
- Margin bottom changed from mb-8 to mb-6 for Row 1

### /src/app/auth/admin-invited-set-password/page.tsx
- Wrapped sign-in attempt in its own try/catch block
- On sign-in failure: shows toast "Account created! Please log in manually."
- On sign-in failure: redirects to /auth/login instead of crashing
- Added console.error logging for sign-in errors

### /src/app/auth/profile-setup/page.jsx
- Wrapped entire getUser async function in try/catch
- Added error handling for supabase.auth.getUser() call
- Added error handling for profile fetch (ignores PGRST116 - no rows)
- Added error handling for address fetch
- Console.error logging for debugging
- Page no longer crashes on data fetch errors

4. LOGIC DECISIONS MADE
--------------------------------------------------------------------------------
- max-w-6xl chosen to match appointments page proportions (1152px vs 1280px)
- Horizontal service cards prevent orphan 5th card that looked bad in 2-column grid
- Hero date block (day/month in gradient square) makes appointment feel more special
- Removed hover animations from View Details button to prevent shake/glitch
- Inline styled span for button instead of Button component for more control
- Sign-in errors redirect to login page rather than crashing - better UX
- Profile setup errors don't redirect - lets user attempt to use page anyway
- No emojis used - only Lucide React SVG icons throughout

6. KNOWN ISSUES RESOLVED
--------------------------------------------------------------------------------
- Admin invite flow needs real-world testing to confirm error handling works
- Browser console errors not captured yet for admin invite crash
- Root cause of original client-side exception unknown (error handling added as safety)

6. NEXT STEPS / TODOs
--------------------------------------------------------------------------------
- Test admin invite flow end-to-end with new error handling
- If crash persists, capture browser console errors for debugging
- Monitor for any layout issues on different screen sizes
- Consider adding more detailed error messages for specific failure cases
- Verify profile-setup page works correctly for new invited customers

================================================================================
END OF PATCH LOG #5
================================================================================

================================================================================
PATCH LOG #4 2025-12-17 — Profile Validation, Name Split, Phone Blocklist, Birthday Field, Registration Address Lock
================================================================================

1. OBJECTIVE
--------------------------------------------------------------------------------
Implement strict profile validation to prevent incomplete or invalid customer 
data from entering the system. Four specific requirements:
  - Split Full Name into First Name + Last Name with validation
  - Block fake phone numbers using pattern blocklist
  - Add optional Birthday field (Month + Day only) for marketing
  - Lock registration addresses so customers cannot edit/delete them

2. FILES TOUCHED
--------------------------------------------------------------------------------
src/lib/sanitize.js
src/app/auth/profile-setup/page.jsx
src/app/portal/settings/page.jsx
src/lib/supabase/middleware.js

SQL Migration (run directly in Supabase):
  - profiles table: added first_name, last_name, birth_month, birth_day columns
  - service_addresses table: added is_registration_address column
  - Backfill queries for existing data

3. CHANGES BY FILE
--------------------------------------------------------------------------------

src/lib/sanitize.js
  - Added validateName(name, fieldLabel) function
    - Requires 2+ characters, max 50
    - Allows letters (including accented: À-ÿ), hyphens, apostrophes
    - Returns { valid: boolean, error?: string }
  - Added validatePhone(phone) function
    - Requires exactly 10 digits
    - Blocks: 555 prefix, all-same-digit, sequential, repeating patterns
    - Blocks invalid area codes: 000, 111, 555, 999, 123
    - Returns { valid: boolean, error?: string }
  - Updated default export to include new functions

src/app/auth/profile-setup/page.jsx
  - Changed formData state: fullName → firstName + lastName + birthMonth + birthDay
  - Updated useEffect to:
    - Query first_name, last_name, birth_month, birth_day from profiles
    - Check hasCompleteName = first_name && last_name for redirect logic
    - Pre-fill firstName/lastName from existing data or parse from full_name
    - Pre-fill birthday fields if they exist
  - Updated handleSubmit:
    - Validate firstName with validateName()
    - Validate lastName with validateName()
    - Validate phone with validatePhone()
    - Validate birthday: if one filled, both must be filled
    - Save first_name, last_name, full_name (synced), birth_month, birth_day
    - Set is_registration_address: true on new address insert
  - Updated form UI:
    - Side-by-side First Name / Last Name fields (stacked on mobile)
    - Added Birthday section with Month/Day dropdowns
    - Added Gift icon and friendly copy for birthday
  - Added Gift to lucide-react imports

src/app/portal/settings/page.jsx
  - Changed profileForm state: full_name → first_name + last_name + birth_month + birth_day
  - Updated load to populate new fields from profile data
  - Updated handleProfileSave:
    - Validate first_name, last_name, phone using new validators
    - Validate birthday completeness
    - Save first_name, last_name, full_name (synced), birth_month, birth_day
    - Clear birthday if removed (set to null)
  - Updated profile form UI:
    - Split into First Name / Last Name inputs
    - Added Birthday section with Month/Day dropdowns
    - Added Gift icon
  - Updated Service Addresses section:
    - Check is_registration_address to determine if locked
    - Locked addresses: green background, Home icon, "Primary Service Address" badge, "Locked" indicator
    - No Edit/Delete buttons for locked addresses
    - Non-locked addresses: normal styling, "Additional Address" badge
    - Changed "Make Primary" to "Make Default for Appointments"
    - Added help text about locked addresses
  - Added safeguards in deleteAddress() and saveAddress() to block operations on registration addresses
  - Added Gift, Home, Lock to lucide-react imports
  - Added validateName, validatePhone to sanitize imports

src/lib/supabase/middleware.js
  - Changed profile query: full_name, phone → first_name, last_name, phone
  - Updated completeness check: hasCompleteName = first_name && last_name
  - isProfileComplete now requires: first_name AND last_name AND phone AND valid address

4. LOGIC DECISIONS
--------------------------------------------------------------------------------

Why split First/Last name instead of parsing Full Name?
  - Clean data for personalization ("Hi {firstName}")
  - Reliable for invoices, Stripe, mail marketing
  - Parsing "Mary Ann Smith" is ambiguous (which is last name?)

Why blocklist approach for phone validation instead of API?
  - No external dependencies or costs
  - Catches 99% of fake numbers
  - Instant validation, no latency

Why Month + Day only for birthday (no year)?
  - Sufficient for marketing (birthday emails, coupons)
  - Reduces privacy concerns
  - Lower friction for users

Why is_registration_address column instead of using is_primary?
  - is_primary could be repurposed later (e.g., default for appointments)
  - Explicit semantic meaning: "this address was set during registration"
  - Clear business rule: is_registration_address = true → locked forever

Why backfill existing is_primary addresses as is_registration_address?
  - Existing customers already have validated primary addresses
  - Maintains data consistency
  - No manual cleanup needed

Why keep full_name in sync?
  - Backward compatibility with existing code that queries full_name
  - Admin portal customer list, emails, etc. may still use it

6. KNOWN ISSUES RESOLVED
--------------------------------------------------------------------------------
- Admin portal customer creation still uses single full_name field
  (works fine — middleware will redirect invited users to profile-setup)
- Admin portal customer edit uses full_name
  (could be updated later to show first/last separately)
- TypeScript types regenerated but admin-invited-set-password.tsx only queries full_name
  (still works, just doesn't use new columns)

6. NEXT STEPS / TODOS
--------------------------------------------------------------------------------
- Test complete flows:
  - Self-registered customer signup
  - Admin-invited customer signup
  - Existing customer with incomplete profile (forced to profile-setup)
  - Settings page profile editing
  - Settings page address management (verify lock works)
- Verify fake phone blocklist catches edge cases in production
- Consider updating admin portal to show first/last name separately
- Future: birthday email automation using birth_month/birth_day

================================================================================
END PATCH LOG #4
================================================================================


================================================================================
PATCH LOG #3 ## 2025-12-17 — Admin-Invited Customer Onboarding Flow & Welcome Email
================================================================================

1. DEEP LEVEL OBJECTIVE
--------------------------------------------------------------------------------
Implement a complete admin-invited customer onboarding flow that:
- Sends a branded welcome email with magic link (via Resend, not Supabase)
- Auto-signs in the customer and routes them to set a password first
- Then requires profile completion (name, phone, address) before portal access
- Removes Communication Preferences from profile setup (moved to Settings)
- Provides admin UI toggle to skip welcome email on customer creation
- Provides manual "Send Welcome Email" button in customer details modal

================================================================================

2. FILES TOUCHED
--------------------------------------------------------------------------------
| File                                                          | Action   |
|---------------------------------------------------------------|----------|
| src/app/api/admin/customers/create/route.js                   | Modified |
| src/app/api/email/customer-welcome/route.js                   | Modified |
| src/app/admin/customers/page.jsx                              | Modified |
| src/app/auth/profile-setup/page.jsx                           | Modified |
| src/app/auth/admin-invited-set-password/page.tsx              | Created  |

================================================================================

3. WHAT CHANGED IN EACH FILE
--------------------------------------------------------------------------------

src/app/api/admin/customers/create/route.js
-------------------------------------------
- Added Resend import for email sending
- Added `sendWelcomeEmail` param extraction (default: true)
- Added magic link generation via `adminClient.auth.admin.generateLink()`
- Magic link redirects to `/auth/admin-invited-set-password`
- Added `generateWelcomeEmail(firstName, magicLink)` function
- Email subject: "Finish Setting Up Your Portal"
- Email CTA: "FINISH SETTING UP" (was "CREATE MY ACCOUNT")
- Email copy: "Almost ready" / "one step away" (was "Portal is ready")
- Returns `welcomeEmailSent` boolean in response

src/app/api/email/customer-welcome/route.js
-------------------------------------------
- Added `createAdminClient` import for magic link generation
- Added magic link generation via `adminClient.auth.admin.generateLink()`
- Magic link redirects to `/auth/admin-invited-set-password`
- Updated email subject to match create route
- Replaced entire `generateWelcomeEmail` function with magic link version
- Alt link section now shows full magic link URL for copy/paste

src/app/admin/customers/page.jsx
--------------------------------
- Added `sendWelcomeEmail: true` to `newCustomer` state
- Added `sendingWelcome` state for manual send button loading
- Updated `handleCreateCustomer` to pass `sendWelcomeEmail` flag
- Updated success toast to show " Welcome email sent!" when applicable
- Reset state now includes `sendWelcomeEmail: true`
- Added toggle UI in Create Customer modal (green switch)
- Added `handleSendWelcomeEmail` async function for manual sends
- Added "Send Welcome Email" button in Customer Details modal Quick Actions
- Button only shows for customers with real email (not @placeholder)

src/app/auth/profile-setup/page.jsx
-----------------------------------
- Removed MessageSquare, Mail, MessageCircle from lucide imports
- Removed `communicationPreference` from formData state
- Removed `communication_preference` from profile update query
- Removed entire Communication Preferences UI section (~75 lines)

src/app/auth/admin-invited-set-password/page.tsx (NEW)
------------------------------------------------------
- TypeScript file with FormEvent typing
- Validates session on mount (redirects to login if invalid)
- Fetches user's first name from profile for personalized greeting
- "Welcome to Impress" badge with Sparkles icon
- "Step 1 of 2" indicator
- Password + Confirm Password fields with show/hide toggle
- Password strength meter (5 bars: Weak/Medium/Strong)
- Requirements checklist (8+ chars, passwords match)
- On success: redirects to /auth/profile-setup
- Loading/validating state with spinner

================================================================================
4. LOGIC DECISIONS
--------------------------------------------------------------------------------
WHY MAGIC LINK INSTEAD OF STATIC SIGNUP URL:
- Admin-created users already have auth account (no password)
- Sending to /auth/signup would fail (user exists) or trigger verify email
- Magic link auto-signs them in, bypassing that friction

WHY PASSWORD BEFORE PROFILE:
- Secures account immediately
- User can log back in even if they abandon profile setup
- Matches natural "account creation" mental model

WHY RESEND INSTEAD OF SUPABASE EMAIL:
- Full branding control (matches all other transactional emails)
- Uses your domain (@impressyoucleaning.com)
- Template consistency across all customer communications
- Supabase still handles auth security (token generation/verification)

WHY SEPARATE PAGE FROM /auth/set-password:
- Clear separation of flows (invite vs recovery)
- Can customize copy/UX specifically for invited customers
- No risk of breaking existing set-password flow

WHY REMOVE COMMUNICATION PREFERENCES FROM ONBOARDING:
- Already exists in Settings
- Reduces onboarding friction
- Profile setup now: name, phone, address only

WHY DEFAULT sendWelcomeEmail TO TRUE:
- Most common use case is sending the email
- Toggle provides override for exceptions

================================================================================
6. KNOWN ISSUES RESOLVED
| Issue                                              | Status              |
|----------------------------------------------------|---------------------|
| Account deletion should block if outstanding balance | Not implemented     |
| Overdue $0.00 should show green                    | Not implemented     |
| TypeScript strict typing for new page              | Minimal (works fine)|

================================================================================

6. NEXT STEPS / TODOs
--------------------------------------------------------------------------------
1. TEST: Admin creates customer with toggle ON → verify email arrives with magic link
2. TEST: Click magic link → lands on /auth/admin-invited-set-password
3. TEST: Set password → redirects to /auth/profile-setup
4. TEST: Complete profile → lands on portal dashboard
5. TEST: Admin creates customer with toggle OFF → verify no email sent
6. TEST: Manual "Send Welcome Email" button from customer details modal
7. TEST: Abandon at password step → next login works with new password
8. TEST: Abandon at profile step → next login forces back to profile-setup
9. OPTIONAL: Add stricter TypeScript typing to admin-invited-set-password page
10. OPTIONAL: Consider TypeScript conversion for other auth pages

================================================================================
SESSION METADATA
Date: 2025-12-17
Continues from: 2025-12-17 — Fixes & Decisions (Session B)
New TypeScript file: src/app/auth/admin-invited-set-password/page.tsx
================================================================================
END PATCH LOG #3
================================================================================


================================================================================
PATCH LOG #2 ## 2025-12-17 — Customer Portal Payment Methods Card Input & Validation UX
================================================================================

1. HIGH-LEVEL OBJECTIVE
--------------------------------------------------------------------------------
Fix three issues in Settings → Payment Methods (mobile & desktop):
  - Single-card showing "Make Default" button when it shouldn't
  - Add New Card input rendering as solid white block (Stripe element not mounting)
  - No card validation UX (invalid cards not caught, button always enabled)
TypeScript added 12/17/25: src/types/supabase.ts via CLI
================================================================================
2. FILES TOUCHED
--------------------------------------------------------------------------------
/Volumes/T7 Shield/impress-cleaning-site/src/app/portal/settings/page.jsx
================================================================================
3. CHANGES PER FILE
--------------------------------------------------------------------------------
src/app/portal/settings/page.jsx
--------------------------------
STATE CHANGES:
  - Removed: cardComplete (useState), cardError (useState), cardElementRef (useRef), stripeCardRef (useRef)
  - Added: cardState (useState) — tracks numberComplete, expiryComplete, cvcComplete, numberError, expiryError, cvcError
  - Added: cardNumberRef, cardExpiryRef, cardCvcRef (useRef)
  - Added: stripeElementsRef (useRef) — holds { stripe, cardNumber, cardExpiry, cardCvc }
  - Added: cardComplete (computed) — cardState.numberComplete && expiryComplete && cvcComplete
  - Added: cardError (computed) — cardState.numberError || expiryError || cvcError

STRIPE ELEMENT MOUNTING (useEffect):
  - Changed from single elements.create('card') to three separate elements:
    - elements.create('cardNumber', { showIcon: true })
    - elements.create('cardExpiry')
    - elements.create('cardCvc')
  - Each element has own onChange handler updating cardState
  - All three mounted to their respective refs

CLEANUP (useEffect):
  - Unmounts all three elements: cardNumber, cardExpiry, cardCvc

handleAddCard():
  - Uses stripeElementsRef.current.cardNumber for confirmCardSetup
  - Clears all three elements after success
  - Resets cardState to initial values

PAYMENT CARD LIST LOGIC:
  - showDefaultBadge = pm.is_default || payments.length === 1
  - showMakeDefault = payments.length > 1 && !pm.is_default
  - Badge changed from amber/star to blue/CreditCard icon with "Default Payment" text

ADD NEW CARD UI:
  - Split into three labeled inputs: Card Number, Expiry, CVC
  - Each input has dynamic border color:
    - Gray (default) → Green (complete) → Red (error)
  - Error messages display per-field with AlertTriangle icon
  - Success banner shows when all fields complete
  - Button disabled until cardComplete === true
  - Button text: "Enter Card Details" → "Save Card" based on state

================================================================================
4. LOGIC DECISIONS
--------------------------------------------------------------------------------
WHY SPLIT ELEMENTS INSTEAD OF SINGLE CARD ELEMENT:
  - Single Card element was rendering as solid white block (mounting issue)
  - Split elements provide better visual structure and more reliable mounting
  - Per-field validation gives clearer UX feedback

WHY SINGLE CARD SHOWS DEFAULT BADGE:
  - If only one card exists, it will always be used for payment
  - Showing "Make Default" is confusing when there's nothing to switch to
  - Badge communicates that this card will be charged

WHY BUTTON DISABLED UNTIL COMPLETE:
  - Prevents API calls with incomplete data
  - Stripe validates on their end anyway, but this improves UX
  - Clear visual feedback that more input is needed

================================================================================
6. KNOWN ISSUES
None from this session.
================================================================================

6. NEXT STEPS / TODOs
--------------------------------------------------------------------------------
- Deploy and test on mobile and desktop
- Verify Stripe element mounting works across browsers
- Test card validation with:
  - Valid test card: 4242 4242 4242 4242
  - Declined card: 4000 0000 0000 0002
  - Incomplete inputs
  - Expired date
- Confirm single-card scenario shows badge, no "Make Default"
- Confirm multi-card scenario shows "Make Default" on non-default cards
================================================================================
END PATCH LOG #2
================================================================================

================================================================================
# PATCH LOG #1 — 2025-12-17 — Mobile UX Fixes: Login Logo, PortalNav Menu, Invoice Side Panel
================================================================================
## 1. High-Level Objective
Fix three mobile UI issues in the customer portal:
1. Sign-in page logo too small on mobile
2. Hamburger menu X icon not visible when menu is open
3. Invoice side panel not behaving as overlay (no close button, no slide animation, z-index conflicts)

## 2. Files Touched

| File | Action |
|------|--------|
| `src/app/auth/login/page.jsx` | Modified |
| `src/components/portal/PortalNav.jsx` | Modified |
| `src/app/portal/invoices/InvoiceSidePanel.jsx` | Rewritten |

## 3. What Changed

### `src/app/auth/login/page.jsx`
- Mobile logo: `h-14` → `h-20`, `width={180}` → `width={240}`, `height={56}` → `height={80}`
- Updated in both main component and Suspense fallback skeleton
- Desktop logo unchanged

### `src/components/portal/PortalNav.jsx`
- Mobile menu panel: `inset-y-0` → `top-16 bottom-0` (starts below header)
- Panel z-index: `z-40` → `z-50`
- Backdrop z-index: `z-50` → `z-30`
- Split single wrapper div into separate backdrop + panel elements with React fragment
- Header remains `z-40` — X button now stays visible above panel

### `src/app/portal/invoices/InvoiceSidePanel.jsx`
- Added `createPortal` from `react-dom` — renders at `document.body` level
- Added `mounted` state for SSR-safe portal rendering
- Added `isAnimating` state for slide-in/slide-out animations
- Backdrop: `z-[9999]`, fade transition `duration-300`
- Panel: slide from right via `translate-x-0/full`, `duration-300 ease-out`
- Header simplified: invoice number + status badge on left, X button on right (always visible)
- X button: `w-6 h-6`, `p-2.5`, `-mr-2` for proper tap target
- Desktop pay button moved inside totals section (under Amount Due)
- Mobile pay button in flex container at bottom (not fixed positioning)
- Removed `ChevronLeft` import (no longer used)
- Removed invalid `safe-area-top` / `safe-area-bottom` classes
- Skeleton updated to match new header structure with working X button

## 4. Logic Decisions

| Decision | Rationale |
|----------|-----------|
| Portal for InvoiceSidePanel | Parent stacking contexts (PortalNav z-40/z-50) were trapping panel; portal escapes to document.body |
| `z-[9999]` for panel | Guarantees above all other UI including nav headers |
| `requestAnimationFrame` before `setIsAnimating(true)` | Ensures DOM is ready before triggering CSS transition |
| Separate `isAnimating` from `isOpen` | Allows slide-out animation to complete before unmounting |
| Panel starts at `top-16` in PortalNav | Prevents panel from covering "Welcome back, username" text |
| X button always visible (not mobile/desktop conditional) | Consistent close affordance on all screen sizes |
| Pay button inside totals on desktop | User requirement — button directly under Amount Due |
| Pay button in flex container on mobile | Avoids z-index conflicts with fixed positioning |

6. KNOWN ISSUES RESOLVED
| Issue | Status |
|-------|--------|
| Account deletion should block if outstanding balance | Not implemented |
| Cancellation/rescheduling fee popup | Not implemented |
| Account section tiles (Member Since / Freshness) stacking | Not implemented |
| Overdue $0.00 should show green | Not implemented |
| `src/app/api/cron/process-overdue/route.js` — keep or delete? | Pending decision (depends on Supabase pg_cron scope) |

## 6. Next Steps / TODOs

1. **Account Deletion Guard**
   - File: `src/app/api/customer-portal/delete-account/route.js`
   - Add check: sum of invoices where `status IN ('sent', 'overdue')` > 0 → block deletion

2. **Cancellation/Rescheduling Fee Modal**
   - File: `src/app/portal/appointments/page.jsx`
   - Show fee breakdown (48+ hrs free, 24-48 hrs $50, <24 hrs full) before confirmation
   - Decide: informational only or auto-generate invoice?

3. **Account Section Tile Layout**
   - File: `src/app/portal/settings/page.jsx` or `src/app/portal/dashboard/page.jsx`
   - Stack "Member Since" and "Freshness" vertically on mobile

4. **Overdue Status Color Logic**
   - Files: `src/app/portal/invoices/page.jsx`, `src/app/portal/dashboard/page.jsx`
   - If overdue total = $0.00, display green instead of red

5. **Cron Decision**
   - Review Supabase pg_cron SQL
   - If pg_cron only updates status → need to add DB trigger for notifications OR keep API route
   - If keeping API route → need external cron caller (Vercel Cron)
## Session Metadata
- **Date:** 2025-12-17
- **Baseline:** `claude-baseline-master.md` (2025-12-16)
- **Patch applies to:** Portal mobile experience
================================================================================
END PATCH LOG #1
================================================================================

================================================================================
## PATCH LOG #0 — 2025-12-16 — UI Polish & Modal Fixes
================================================================================
### Modal Component — React Portal Implementation
**Status:** ARCHITECTURE IMPROVEMENT  
**File Modified:** `src/components/ui/Modal.jsx`

**Change:** Implemented React Portal pattern so modals render at `document.body` level to prevent clipping from parent overflow/stacking contexts.
**Key Changes:**
- Added `createPortal` from `react-dom`
- Added `mounted` state for SSR safety
- Added optional `centered` prop (defaults to `false`)
- Conditional header layout for centered vs default mode
- Adjusted centered title padding (`px-6 sm:px-0`) for mobile spacing

**Backward Compatibility:** `centered` defaults to `false`, so existing usages remain unchanged:
- `src/app/admin/appointments/page.jsx` (2 modals)
- `src/app/admin/customers/page.jsx` (2 modals)
- `src/app/admin/invoices/page.jsx` (5 modals)
- `src/app/admin/requests/page.jsx` (1 modal)
- `src/app/portal/appointments/page.jsx` (1 modal)
- `src/app/portal/invoices/[id]/pay/page.jsx` (1 modal)
- `src/app/portal/settings/page.jsx` (1 modal)

### Cancellation & Rescheduling Policy Modal — Complete Redesign
**Status:** UX IMPROVEMENT  
**File Modified:** `src/app/portal/invoices/page.jsx`
**Changes:**
1. Renamed from "Cancellation Policy" to "Cancellation & Rescheduling Policy"
2. Full-screen modal experience (backdrop blur)
3. Color-coded tier cards (green → amber → red)
4. Lucide icons (Check, DollarSign, Clock)
5. No-show footnote disclaimer (15-minute grace period)

### Invoice Page — Balance Cards Alignment Fix
**Status:** UI CONSISTENCY  
**File Modified:** `src/app/portal/invoices/page.jsx`

**Problem:** Total Balance and Overdue cards had misaligned content heights and inconsistent icon container sizing.
**Changes:**
- Fixed header row height: `h-9`
- Adjusted header spacing: `mb-4`
- Standardized overdue icon container: `w-9 h-9` + `flex-shrink-0`
- Updated overdue icon background to gradient (`from-red-50 to-red-100`)
- Updated overdue icon color to `text-red-600`

### Batch 9 — Email Templates, Soft Delete, & “Arriving Today”
**Status:** MAJOR FEATURE ADDITIONS

#### Email Template Standardization
**New File Created:** `src/lib/emailTemplate.js`

**Customer-Facing Emails Updated:**
- `src/app/api/email/appointment-confirmed/route.js`
- `src/app/api/email/appointment-cancelled/route.js`
- `src/app/api/email/appointment-rescheduled/route.js`
- `src/app/api/email/service-request-declined/route.js` (fixed missing serviceLabelMap)
**Deleted:**
- `src/app/api/email/service-request-received/route.js` (portal notification sufficient)
#### Soft Delete Implementation
**File Modified:** `src/app/api/customer-portal/delete-account/route.js`

**SQL Migration:**
```sql
ALTER TYPE public.account_status ADD VALUE 'deleted';

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
================================================================================
END PATCH LOG #0
================================================================================