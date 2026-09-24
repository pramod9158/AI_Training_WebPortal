-- =========================================================================
-- WAYNAUTIC ACADEMY: SUPABASE SCHEMA MIGRATION FOR RAZORPAY PAYMENTS & ACCESS GATING
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- =========================================================================

-- 1. Ensure user_profiles has plan & role columns
alter table if exists public.user_profiles 
  add column if not exists plan text default 'free',
  add column if not exists role text default 'candidate',
  add column if not exists account_status text default 'active',
  add column if not exists streak_days integer default 0,
  add column if not exists last_active_at timestamptz default now();

-- Ensure plan check constraint allows 'free', 'pro', 'enterprise'
alter table if exists public.user_profiles 
  drop constraint if exists user_profiles_plan_check;
alter table if exists public.user_profiles 
  add constraint user_profiles_plan_check check (plan in ('free', 'pro', 'enterprise'));

-- 2. Ensure payments table exists
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  user_email text not null,
  user_name text,
  amount numeric(10,2) not null,
  currency text not null default 'INR',
  payment_method text not null default 'razorpay',
  transaction_reference text unique not null,
  barcode_id text,
  status text not null default 'verified',
  proof_url text,
  notes text,
  rejection_reason text,
  plan_granted text default 'pro',
  verified_at timestamptz default now(),
  verified_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ensure payment_method check allows 'razorpay'
alter table if exists public.payments 
  drop constraint if exists payments_payment_method_check;
alter table if exists public.payments 
  add constraint payments_payment_method_check 
  check (payment_method in ('barcode_qr', 'upi', 'cash', 'card', 'bank_transfer', 'razorpay'));

-- 3. Row Level Security (RLS) Policies
alter table public.payments enable row level security;
alter table public.user_profiles enable row level security;

-- Drop any previous conflicting policies
drop policy if exists "Allow all on payments" on public.payments;
drop policy if exists "Allow all read on user_profiles" on public.user_profiles;
drop policy if exists "Allow all update on user_profiles" on public.user_profiles;

-- Allow payment ledger insertion and viewing
create policy "Allow all on payments"
  on public.payments for all
  using (true)
  with check (true);

-- Allow reading and updating user profile (so plan updates to 'pro' persist in cloud)
create policy "Allow all read on user_profiles"
  on public.user_profiles for select
  using (true);

create policy "Allow all update on user_profiles"
  on public.user_profiles for update
  using (true)
  with check (true);
