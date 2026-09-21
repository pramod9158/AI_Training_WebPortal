-- =========================================================================
-- WAYNAUTIC ACADEMY: RATINGS, REVIEWS & COMMENTS CLOUD SYNCHRONIZATION
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard)
-- This script fixes RLS policies and table columns for topic_ratings and
-- topic_comments so all learners can see each other's ratings, reviews,
-- and discussion comments across devices, browsers, and logins.
-- =========================================================================

-- 1. TOPIC RATINGS & REVIEWS TABLE ENHANCEMENTS
create table if not exists public.topic_ratings (
  id uuid primary key default gen_random_uuid(),
  topic_id text not null,
  user_id uuid references auth.users(id) on delete cascade,
  user_name text,
  user_avatar text,
  vote text check (vote in ('up', 'down')),
  stars integer check (stars >= 1 and stars <= 5),
  feedback text,
  updated_at timestamptz default now(),
  unique(user_id, topic_id)
);

-- Safely add user_name and user_avatar if table already exists without them
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'topic_ratings' and column_name = 'user_name') then
    alter table public.topic_ratings add column user_name text;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'topic_ratings' and column_name = 'user_avatar') then
    alter table public.topic_ratings add column user_avatar text;
  end if;
end $$;

-- Backfill user_name and user_avatar from user_profiles
update public.topic_ratings r
set 
  user_name = coalesce(r.user_name, p.display_name, 'Member'),
  user_avatar = coalesce(r.user_avatar, p.avatar_url, '')
from public.user_profiles p
where r.user_id = p.id and (r.user_name is null or r.user_name = '' or r.user_name = 'Member');


-- 2. TOPIC COMMENTS & DISCUSSION TABLE ENHANCEMENTS
create table if not exists public.topic_comments (
  id uuid primary key default gen_random_uuid(),
  topic_id text not null,
  user_id uuid references auth.users(id) on delete cascade,
  user_name text not null default 'Learner',
  user_avatar text,
  content text not null,
  is_question boolean default false,
  parent_id uuid references public.topic_comments(id) on delete cascade,
  created_at timestamptz default now()
);

-- Backfill any missing names/avatars from user_profiles
update public.topic_comments c
set 
  user_name = coalesce(p.display_name, c.user_name, 'Learner'),
  user_avatar = coalesce(p.avatar_url, c.user_avatar, '')
from public.user_profiles p
where c.user_id = p.id and (c.user_name is null or c.user_name = '' or c.user_name = 'Developer');


-- 3. ROW LEVEL SECURITY (RLS) POLICIES — ALLOW SEAMLESS MULTI-USER CLOUD SYNC
-- Just like topics and quiz_questions in fix_curriculum_sync.sql,
-- allow all read and write operations so server endpoints and clients sync reliably.
alter table public.topic_ratings enable row level security;

drop policy if exists "Public read ratings"         on public.topic_ratings;
drop policy if exists "Users insert ratings"        on public.topic_ratings;
drop policy if exists "Users update ratings"        on public.topic_ratings;
drop policy if exists "Allow all on topic_ratings"  on public.topic_ratings;

create policy "Allow all on topic_ratings"
  on public.topic_ratings for all
  using (true)
  with check (true);

alter table public.topic_comments enable row level security;

drop policy if exists "Public read comments"         on public.topic_comments;
drop policy if exists "Users insert comments"        on public.topic_comments;
drop policy if exists "Users delete own comments"    on public.topic_comments;
drop policy if exists "Allow all on topic_comments"  on public.topic_comments;

create policy "Allow all on topic_comments"
  on public.topic_comments for all
  using (true)
  with check (true);


-- 4. RELOAD POSTGREST SCHEMA CACHE
notify pgrst, 'reload schema';
