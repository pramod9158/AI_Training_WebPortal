-- Waynautic Academy - Admin & Barcode Payment Management Schema
-- Run this in Supabase SQL Editor to enable admin roles and barcode payments

-- 1. EXTEND USER_PROFILES TABLE
alter table public.user_profiles 
  add column if not exists role text default 'candidate' check (role in ('candidate', 'admin', 'instructor')),
  add column if not exists plan text default 'free' check (plan in ('free', 'pro', 'enterprise')),
  add column if not exists account_status text default 'active' check (account_status in ('active', 'suspended')),
  add column if not exists streak_days integer default 0,
  add column if not exists last_active_at timestamptz default now();

-- Helper function to check if current user is an admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.user_profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- 2. BARCODE & PAYMENT CONFIGURATIONS
create table if not exists public.barcode_configs (
  id text primary key,
  title text not null,
  upi_id text not null,
  payee_name text not null,
  amount numeric(10,2) not null default 999.00,
  currency text not null default 'INR',
  qr_image_url text,
  description text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Seed default barcode configuration
insert into public.barcode_configs (id, title, upi_id, payee_name, amount, currency, description, is_active)
values (
  'waynautic_pro_upi',
  'Waynautic Pro AI Pass (Lifetime Access)',
  'waynautic@upi',
  'Waynautic Academy',
  999.00,
  'INR',
  'Scan with Google Pay, PhonePe, Paytm, BHIM or any UPI banking app.',
  true
)
on conflict (id) do nothing;

-- 3. PAYMENTS & TRANSACTIONS TABLE
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  user_email text not null,
  user_name text,
  amount numeric(10,2) not null,
  currency text not null default 'INR',
  payment_method text not null default 'barcode_qr' check (payment_method in ('barcode_qr', 'upi', 'cash', 'card', 'bank_transfer')),
  transaction_reference text unique not null, -- UTR or bank reference number
  barcode_id text default 'waynautic_pro_upi',
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected')),
  proof_url text,
  notes text,
  rejection_reason text,
  plan_granted text default 'pro' check (plan_granted in ('free', 'pro', 'enterprise')),
  verified_at timestamptz,
  verified_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indices for fast searching and filtering
create index if not exists idx_payments_user_id on public.payments(user_id);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_payments_txn_ref on public.payments(transaction_reference);
create index if not exists idx_user_profiles_role on public.user_profiles(role);
create index if not exists idx_user_profiles_plan on public.user_profiles(plan);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.barcode_configs enable row level security;
alter table public.payments enable row level security;

-- Barcode configs are publicly viewable by authenticated users & candidates
create policy "Allow public read access on barcode_configs"
  on public.barcode_configs for select
  using (true);

-- Admins and public access policies
create policy "Allow all on barcode_configs" on public.barcode_configs for all using (true) with check (true);
create policy "Allow all on payments" on public.payments for all using (true) with check (true);
create policy "Allow all read on user_profiles" on public.user_profiles for select using (true);
create policy "Allow all update on user_profiles" on public.user_profiles for update using (true) with check (true);
create policy "Allow all read on user_progress" on public.user_progress for select using (true);
create policy "Allow all read on user_quiz_attempts" on public.user_quiz_attempts for select using (true);


-- 5. TRIGGER FOR AUTOMATIC PRO UPGRADE ON PAYMENT VERIFICATION
create or replace function public.handle_payment_verification()
returns trigger as $$
begin
  if new.status = 'verified' and (old.status is null or old.status != 'verified') then
    -- Mark verified timestamp
    new.verified_at = coalesce(new.verified_at, now());
    
    -- Upgrade user profile plan if user_id is linked
    if new.user_id is not null then
      update public.user_profiles
      set plan = coalesce(new.plan_granted, 'pro'),
          updated_at = now()
      where id = new.user_id;
    elsif new.user_email is not null then
      -- Attempt match by email if auth user exists
      update public.user_profiles
      set plan = coalesce(new.plan_granted, 'pro'),
          updated_at = now()
      where id in (select id from auth.users where email = new.user_email);
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_payment_verified on public.payments;
create trigger on_payment_verified
  before update on public.payments
  for each row execute procedure public.handle_payment_verification();
