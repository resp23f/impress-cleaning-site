-- DEBUG: Check your account status
-- Run these queries in Supabase SQL Editor to debug login issues

-- 1. Check your profile details
SELECT
  id,
  email,
  full_name,
  phone,
  role,
  account_status,
  created_at
FROM profiles
WHERE email = 'YOUR_EMAIL_HERE';  -- Replace with your email

-- 2. Check if you have a service address
SELECT * FROM service_addresses
WHERE user_id = (SELECT id FROM profiles WHERE email = 'YOUR_EMAIL_HERE');

-- 3. Check auth.users table
SELECT
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'YOUR_EMAIL_HERE';

-- ========================================
-- FIX: If account_status is not 'active', run this:
-- ========================================

UPDATE profiles
SET account_status = 'active'
WHERE email = 'YOUR_EMAIL_HERE';

-- ========================================
-- FIX: If profile is incomplete, you may need to set required fields:
-- ========================================

UPDATE profiles
SET
  account_status = 'active',
  full_name = 'Your Name',  -- Add your name if missing
  phone = '(555) 555-5555'  -- Add your phone if missing
WHERE email = 'YOUR_EMAIL_HERE';

-- ========================================
-- FIX: To make yourself an admin (optional):
-- ========================================

UPDATE profiles
SET
  account_status = 'active',
  role = 'admin'
WHERE email = 'YOUR_EMAIL_HERE';
