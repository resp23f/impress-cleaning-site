# claude-patch-log.md

## 2025-12-16 — UI Polish & Modal Fixes

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

---

### Cancellation & Rescheduling Policy Modal — Complete Redesign
**Status:** UX IMPROVEMENT  
**File Modified:** `src/app/portal/invoices/page.jsx`

**Changes:**
1. Renamed from "Cancellation Policy" to "Cancellation & Rescheduling Policy"
2. Full-screen modal experience (backdrop blur)
3. Color-coded tier cards (green → amber → red)
4. Lucide icons (Check, DollarSign, Clock)
5. No-show footnote disclaimer (15-minute grace period)

---

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

---

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

---

#### Soft Delete Implementation
**File Modified:** `src/app/api/customer-portal/delete-account/route.js`

**SQL Migration:**
```sql
ALTER TYPE public.account_status ADD VALUE 'deleted';

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

================================================================================

# PATCH LOG — 2025-12-17 — Mobile UX Fixes: Login Logo, PortalNav Menu, Invoice Side Panel
================================================================================


---

## 1. High-Level Objective

Fix three mobile UI issues in the customer portal:
1. Sign-in page logo too small on mobile
2. Hamburger menu X icon not visible when menu is open
3. Invoice side panel not behaving as overlay (no close button, no slide animation, z-index conflicts)

---

## 2. Files Touched

| File | Action |
|------|--------|
| `src/app/auth/login/page.jsx` | Modified |
| `src/components/portal/PortalNav.jsx` | Modified |
| `src/app/portal/invoices/InvoiceSidePanel.jsx` | Rewritten |

---

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

---

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

---

## 5. Known Issues Still Open

| Issue | Status |
|-------|--------|
| Account deletion should block if outstanding balance | Not implemented |
| Cancellation/rescheduling fee popup | Not implemented |
| Account section tiles (Member Since / Freshness) stacking | Not implemented |
| Overdue $0.00 should show green | Not implemented |
| `src/app/api/cron/process-overdue/route.js` — keep or delete? | Pending decision (depends on Supabase pg_cron scope) |

---

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

---

## Session Metadata

- **Date:** 2025-12-17
- **Baseline:** `claude-baseline-master.md` (2025-12-16)
- **Patch applies to:** Portal mobile experience

================================================================================
PATCH LOG ## 2025-12-17 — Customer Portal Payment Methods Card Input & Validation UX
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

5. KNOWN ISSUES STILL OPEN
--------------------------------------------------------------------------------
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
END PATCH LOG
================================================================================