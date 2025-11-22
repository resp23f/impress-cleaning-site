# Fix: No Profile Found / Invalid Login Credentials

## Step 1: Check if you exist in auth.users

Run this in Supabase SQL Editor (replace with YOUR email):

```sql
SELECT
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'YOUR-EMAIL@example.com';
```

### If this returns NO ROWS:
**You need to sign up first!** Go to `/auth/signup` and create an account.

### If this RETURNS A ROW:
Continue to Step 2.

---

## Step 2: Create Missing Profile

If you exist in `auth.users` but not in `profiles`, your profile wasn't created properly.

**Run this to create your profile** (replace YOUR-EMAIL and the user ID):

```sql
-- First, get your user ID from the query above
-- Then run this (replace 'your-user-id-here' with actual ID):

INSERT INTO profiles (id, email, full_name, phone, role, account_status, communication_preference)
VALUES (
  'your-user-id-here',  -- Replace with ID from auth.users query
  'YOUR-EMAIL@example.com',  -- Your email
  'Your Full Name',  -- Your name
  '(555) 555-5555',  -- Your phone
  'customer',  -- Role: 'customer' or 'admin'
  'active',  -- MUST be 'active' to login
  'both'  -- Communication preference
);

-- Add a service address (required)
INSERT INTO service_addresses (user_id, street_address, city, state, zip_code, is_primary)
VALUES (
  'your-user-id-here',  -- Same user ID
  '123 Main Street',
  'Austin',
  'TX',
  '78701',
  true
);
```

---

## Step 3: ALL-IN-ONE FIX

If you know your email exists in auth.users, run this complete fix:

**Replace 'YOUR-EMAIL@example.com' with your actual email:**

```sql
DO $$
DECLARE
  user_id_var UUID;
  user_email TEXT := 'YOUR-EMAIL@example.com';  -- CHANGE THIS!
BEGIN
  -- Get user ID from auth.users
  SELECT id INTO user_id_var
  FROM auth.users
  WHERE email = user_email;

  -- Check if user exists
  IF user_id_var IS NULL THEN
    RAISE EXCEPTION 'No user found with email: %. You need to sign up first at /auth/signup', user_email;
  END IF;

  -- Confirm email if not confirmed
  UPDATE auth.users
  SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
  WHERE id = user_id_var;

  -- Create or update profile
  INSERT INTO profiles (id, email, full_name, phone, role, account_status, communication_preference)
  VALUES (
    user_id_var,
    user_email,
    'Test User',
    '(555) 555-5555',
    'customer',
    'active',
    'both'
  )
  ON CONFLICT (id) DO UPDATE SET
    account_status = 'active',
    role = 'customer',
    full_name = COALESCE(profiles.full_name, 'Test User'),
    phone = COALESCE(profiles.phone, '(555) 555-5555');

  -- Create service address if missing
  INSERT INTO service_addresses (user_id, street_address, city, state, zip_code, is_primary)
  VALUES (user_id_var, '123 Main St', 'Austin', 'TX', '78701', true)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '✅ Account fixed! Email: %, User ID: %', user_email, user_id_var;
  RAISE NOTICE 'Try logging in now with your password.';
END $$;
```

---

## Step 4: Reset Your Password (if password is wrong)

If you forgot your password:

### Option A: Via Supabase Dashboard
1. Go to Supabase Dashboard
2. Click **Authentication** → **Users**
3. Find your email
4. Click the three dots (•••) → **Send Password Recovery**
5. Check your email for reset link

### Option B: Use the forgot password page
1. Go to `/auth/forgot-password` (you may need to create this page)
2. OR use Supabase dashboard method above

### Option C: Manually set password in SQL (FOR TESTING ONLY)
```sql
-- WARNING: Only use this for local testing!
-- In production, use proper password reset flow

-- You can't see the actual password, but you can reset it via dashboard
-- Go to: Authentication → Users → Click user → Reset Password
```

---

## Step 5: Verify Everything is Set Up

Run this to check everything:

```sql
-- Check auth.users
SELECT
  'auth.users' as table_name,
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'YOUR-EMAIL@example.com'

UNION ALL

-- Check profiles
SELECT
  'profiles' as table_name,
  id,
  email,
  account_status::text as email_confirmed_at,
  created_at
FROM profiles
WHERE email = 'YOUR-EMAIL@example.com';
```

**You should see 2 rows** - one from `auth.users` and one from `profiles`.

**Both should have the same `id` (UUID).**

---

## Step 6: Clear Browser & Try Again

After running the fixes:

1. **Clear browser data:**
   - Press `Ctrl + Shift + Delete` (Windows/Linux) or `Cmd + Shift + Delete` (Mac)
   - Select "Cookies" and "Cached files"
   - Time range: "All time"
   - Click "Clear data"

2. **Close and reopen browser completely**

3. **Go to `/auth/login`**

4. **Enter your email and password**

---

## Common Issues:

### "No rows returned" when checking profiles
→ **Your profile was never created.** Run the ALL-IN-ONE FIX above.

### "Invalid login credentials"
→ **Either:**
  - Email not in auth.users (need to sign up)
  - Wrong password (reset it)
  - Email not confirmed (fixed by ALL-IN-ONE script)

### Still can't login after fix
→ **Check your .env.local file:**

```bash
# Make sure these match your Supabase project:
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

→ **Restart your dev server:**
```bash
# Stop the server (Ctrl+C)
npm run dev
```

---

## Quick Diagnostic

**Run this to see what's missing:**

```sql
WITH user_check AS (
  SELECT id, email, email_confirmed_at IS NOT NULL as email_confirmed
  FROM auth.users
  WHERE email = 'YOUR-EMAIL@example.com'
),
profile_check AS (
  SELECT id, account_status, role, full_name IS NOT NULL as has_name, phone IS NOT NULL as has_phone
  FROM profiles
  WHERE email = 'YOUR-EMAIL@example.com'
),
address_check AS (
  SELECT user_id, COUNT(*) as address_count
  FROM service_addresses
  WHERE user_id IN (SELECT id FROM user_check)
  GROUP BY user_id
)
SELECT
  CASE
    WHEN NOT EXISTS (SELECT 1 FROM user_check) THEN '❌ NOT IN auth.users - Need to SIGN UP'
    WHEN NOT EXISTS (SELECT 1 FROM profile_check) THEN '❌ NOT IN profiles - Need to CREATE PROFILE'
    WHEN (SELECT email_confirmed FROM user_check) = false THEN '❌ EMAIL NOT CONFIRMED'
    WHEN (SELECT account_status FROM profile_check) != 'active' THEN '❌ ACCOUNT NOT ACTIVE'
    WHEN NOT EXISTS (SELECT 1 FROM address_check) THEN '⚠️ NO SERVICE ADDRESS'
    ELSE '✅ ALL GOOD - Try logging in!'
  END as status,
  (SELECT id FROM user_check) as user_id,
  (SELECT account_status FROM profile_check) as account_status,
  (SELECT role FROM profile_check) as role;
```

This will tell you exactly what's wrong!

---

## Still Having Issues?

**Share the output of this query:**

```sql
-- Diagnostic info
SELECT
  'auth.users' as source,
  email,
  id::text as user_id,
  email_confirmed_at IS NOT NULL as email_confirmed,
  created_at
FROM auth.users
WHERE email = 'YOUR-EMAIL@example.com'

UNION ALL

SELECT
  'profiles' as source,
  email,
  id::text as user_id,
  account_status,
  created_at
FROM profiles
WHERE email = 'YOUR-EMAIL@example.com';
```

Then I can help you further!
