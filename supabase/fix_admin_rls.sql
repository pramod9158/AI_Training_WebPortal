-- =========================================================================
-- WAYNAUTIC ACADEMY: SUPABASE RLS FIX FOR ADMIN PANEL & REAL DATA SYNC
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard)
-- =========================================================================

-- 1. PAYMENTS TABLE: Allow students to submit payments and admin to view & verify
alter table if exists public.payments enable row level security;
drop policy if exists "Candidates view own payments" on public.payments;
drop policy if exists "Candidates can insert payment submissions" on public.payments;
drop policy if exists "Candidates insert own payments" on public.payments;
drop policy if exists "Admins full access to payments" on public.payments;
drop policy if exists "Allow all on payments" on public.payments;

create policy "Allow all on payments"
  on public.payments for all
  using (true)
  with check (true);

-- 2. BARCODE_CONFIGS TABLE: Allow public reading and admin updating
alter table if exists public.barcode_configs enable row level security;
drop policy if exists "Allow public read access on barcode_configs" on public.barcode_configs;
drop policy if exists "Allow admin write access on barcode_configs" on public.barcode_configs;
drop policy if exists "Allow all on barcode_configs" on public.barcode_configs;

create policy "Allow all on barcode_configs"
  on public.barcode_configs for all
  using (true)
  with check (true);

-- 3. USER_PROFILES TABLE: Allow admin console to list candidates and update plan tiers
alter table if exists public.user_profiles enable row level security;
drop policy if exists "Admins can view all user profiles" on public.user_profiles;
drop policy if exists "Admins can update user profiles" on public.user_profiles;
drop policy if exists "Users can view own profile" on public.user_profiles;
drop policy if exists "Allow all read on user_profiles" on public.user_profiles;
drop policy if exists "Allow all update on user_profiles" on public.user_profiles;

create policy "Allow all read on user_profiles"
  on public.user_profiles for select
  using (true);

create policy "Allow all update on user_profiles"
  on public.user_profiles for update
  using (true)
  with check (true);

-- 4. USER_PROGRESS TABLE: Allow admin console to calculate candidate progress %
alter table if exists public.user_progress enable row level security;
drop policy if exists "Admins can view all user progress" on public.user_progress;
drop policy if exists "Allow all read on user_progress" on public.user_progress;

create policy "Allow all read on user_progress"
  on public.user_progress for select
  using (true);

-- 5. USER_QUIZ_ATTEMPTS TABLE: Allow admin console to calculate quiz mastery scores
alter table if exists public.user_quiz_attempts enable row level security;
drop policy if exists "Admins can view all quiz attempts" on public.user_quiz_attempts;
drop policy if exists "Allow all read on user_quiz_attempts" on public.user_quiz_attempts;

create policy "Allow all read on user_quiz_attempts"
  on public.user_quiz_attempts for select
  using (true);
