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
