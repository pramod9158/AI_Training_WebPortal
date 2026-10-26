-- =========================================================================
-- WAYNAUTIC ACADEMY: MASTER ADMIN ACCOUNT CREATION & ROLE ELEVATION
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard)
-- =========================================================================

-- 1. Confirm Master Admin in auth.users (bypasses email confirmation requirement)
update auth.users
set email_confirmed_at = coalesce(email_confirmed_at, now())
where lower(email) in ('admin@waynautic.ai', 'academy@waynautic.com');

-- 2. Ensure user_profiles has role='admin' and plan='enterprise' for Master Admin
update public.user_profiles
set 
  role = 'admin',
  plan = 'enterprise',
  account_status = 'active',
  display_name = coalesce(display_name, 'Waynautic Admin')
where lower(email) in ('admin@waynautic.ai', 'academy@waynautic.com');

-- 3. Promote specific user to Admin (e.g. platform owner)
update public.user_profiles
set 
  role = 'admin',
  plan = 'enterprise',
  account_status = 'active'
where lower(email) = 'pramodkalyan25@gmail.com';

-- 4. Verify admin accounts
select id, email, display_name, role, plan, account_status, created_at 
from public.user_profiles 
where role = 'admin';
