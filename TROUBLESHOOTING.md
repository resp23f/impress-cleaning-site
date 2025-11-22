# Troubleshooting Login Issues

## Problem: Can't sign in after setting account to 'active' in Supabase

### Step 1: Check Your Account Status in Supabase

1. Go to your Supabase Dashboard
2. Click on **Table Editor**
3. Select the **profiles** table
4. Find your account (by email)
5. Check these fields:
   - `account_status` should be: **active**
   - `role` should be: **customer** (or **admin** if you want admin access)
   - `full_name` should have your name
   - `phone` should have your phone number

### Step 2: Run Debug Queries

Open **SQL Editor** in Supabase and run this query (replace with your email):

```sql
-- Check your account
SELECT
  id,
  email,
  full_name,
  phone,
  role,
  account_status,
  created_at
FROM profiles
WHERE email = 'your-email@example.com';
```

**Expected result:**
- `account_status`: **'active'** (not 'pending' or 'suspended')
- `role`: **'customer'** or **'admin'**
- `full_name`: Should have a value
- `phone`: Should have a value

### Step 3: Fix Missing Data

If any fields are NULL or incorrect, run this fix:

```sql
UPDATE profiles
SET
  account_status = 'active',
  role = 'customer',
  full_name = 'Your Full Name',  -- Add your name
  phone = '(555) 555-5555'        -- Add your phone
WHERE email = 'your-email@example.com';
```

### Step 4: Check Email Verification

Run this query to check if your email is verified:

```sql
SELECT
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'your-email@example.com';
```

If `email_confirmed_at` is NULL, you need to verify your email first.

**To manually confirm email** (for testing):

```sql
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'your-email@example.com';
```

### Step 5: Check for Service Address

The profile setup requires a service address. Check if you have one:

```sql
SELECT * FROM service_addresses
WHERE user_id = (SELECT id FROM profiles WHERE email = 'your-email@example.com');
```

If no results, you need to add an address:

```sql
INSERT INTO service_addresses (user_id, street_address, city, state, zip_code, is_primary)
VALUES (
  (SELECT id FROM profiles WHERE email = 'your-email@example.com'),
  '123 Main Street',
  'Austin',
  'TX',
  '78701',
  true
);
```

### Step 6: Clear Browser Cache & Cookies

1. Open your browser's Developer Tools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Under **Cookies**, delete all cookies for `localhost:3000`
4. Under **Local Storage**, clear `localhost:3000`
5. Close and reopen the browser
6. Try logging in again

### Step 7: Check Browser Console for Errors

1. Open browser Developer Tools (F12)
2. Go to **Console** tab
3. Try logging in
4. Look for any red error messages
5. Share those errors if you need more help

### Common Issues & Solutions

#### Issue: "Your account is pending approval"

**Solution:** Run this SQL:

```sql
UPDATE profiles
SET account_status = 'active'
WHERE email = 'your-email@example.com';
```

#### Issue: "Your account has been suspended"

**Solution:** Change status from 'suspended' to 'active':

```sql
UPDATE profiles
SET account_status = 'active'
WHERE email = 'your-email@example.com';
```

#### Issue: "Invalid email or password"

**Possible causes:**
1. Wrong password - try resetting it
2. Email not verified
3. Account doesn't exist

**To reset password via Supabase:**
1. Go to Supabase Dashboard → Authentication → Users
2. Find your user
3. Click the three dots → Reset Password

#### Issue: Redirects to /auth/pending-approval

**Solution:** Your account_status is still 'pending'. Set it to 'active':

```sql
UPDATE profiles
SET account_status = 'active'
WHERE email = 'your-email@example.com';
```

#### Issue: Stuck in a redirect loop

**Solution:**
1. Clear all cookies and local storage
2. Make sure account_status = 'active'
3. Make sure profile is complete (name, phone, address)
4. Try incognito/private browsing mode

### Step 8: Create a Complete Test Account

If nothing works, create a fresh complete account:

```sql
-- First, get your user ID from auth.users
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Then create a complete profile (use the ID from above)
INSERT INTO profiles (id, email, full_name, phone, role, account_status, communication_preference)
VALUES (
  'your-user-id-here',  -- Replace with ID from above query
  'your-email@example.com',
  'John Doe',
  '(512) 555-1234',
  'customer',
  'active',
  'both'
)
ON CONFLICT (id)
DO UPDATE SET
  account_status = 'active',
  role = 'customer',
  full_name = 'John Doe',
  phone = '(512) 555-1234';

-- Add a service address
INSERT INTO service_addresses (user_id, street_address, city, state, zip_code, is_primary)
VALUES (
  'your-user-id-here',  -- Replace with your user ID
  '123 Main Street',
  'Austin',
  'TX',
  '78701',
  true
);
```

### Step 9: Quick Fix Script

Run this all-in-one fix (replace email):

```sql
-- All-in-one fix for login issues
DO $$
DECLARE
  user_id_var UUID;
BEGIN
  -- Get user ID
  SELECT id INTO user_id_var
  FROM auth.users
  WHERE email = 'your-email@example.com';

  -- Update profile
  UPDATE profiles
  SET
    account_status = 'active',
    role = 'customer',
    full_name = COALESCE(full_name, 'Test User'),
    phone = COALESCE(phone, '(555) 555-5555')
  WHERE id = user_id_var;

  -- Confirm email if not confirmed
  UPDATE auth.users
  SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
  WHERE id = user_id_var;

  -- Ensure service address exists
  INSERT INTO service_addresses (user_id, street_address, city, state, zip_code, is_primary)
  VALUES (user_id_var, '123 Main St', 'Austin', 'TX', '78701', true)
  ON CONFLICT (user_id) WHERE is_primary = true
  DO NOTHING;

  RAISE NOTICE 'Account fixed! Try logging in now.';
END $$;
```

## Still Having Issues?

If you're still having trouble:

1. **Check environment variables** - Make sure `.env.local` has correct Supabase keys
2. **Restart dev server** - Stop and restart `npm run dev`
3. **Check Supabase logs** - Go to Supabase Dashboard → Logs → Auth Logs
4. **Check RLS policies** - Make sure Row Level Security isn't blocking you

## To Become an Admin

If you want admin access instead of customer access:

```sql
UPDATE profiles
SET
  role = 'admin',
  account_status = 'active'
WHERE email = 'your-email@example.com';
```

Then log in and you'll be redirected to `/admin/dashboard` instead of `/portal/dashboard`.
