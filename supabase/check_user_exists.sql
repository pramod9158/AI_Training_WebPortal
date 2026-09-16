-- =========================================================================
-- WAYNAUTIC ACADEMY: CHECK USER EXISTS RPC & USER_PROFILES EMAIL SYNC
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard)
-- =========================================================================

-- 1. Ensure email column exists on user_profiles
alter table if exists public.user_profiles add column if not exists email text;

-- 2. Populate email for all existing user_profiles from auth.users
update public.user_profiles p
set email = u.email
from auth.users u
where p.id = u.id and (p.email is null or p.email = '');

-- 3. Update handle_new_user trigger to always store email in user_profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email, display_name, avatar_url)
  values (
    new.id, 
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set 
    email = coalesce(excluded.email, public.user_profiles.email),
    display_name = coalesce(public.user_profiles.display_name, excluded.display_name);
  return new;
end;
$$ language plpgsql security definer;

-- 4. Create check_user_exists RPC function to check if account is registered in auth.users
create or replace function public.check_user_exists(lookup_email text)
returns boolean as $$
declare
  user_found boolean;
begin
  select exists(
    select 1 from auth.users where lower(email) = lower(trim(lookup_email))
  ) into user_found;
  return user_found;
end;
$$ language plpgsql security definer;

-- 5. Grant execute permission to anon and authenticated clients
grant execute on function public.check_user_exists(text) to anon, authenticated, service_role;

-- 6. Grant read permission on user_profiles email column
alter table if exists public.user_profiles enable row level security;
drop policy if exists "Allow all read on user_profiles" on public.user_profiles;
create policy "Allow all read on user_profiles" on public.user_profiles for select using (true);
