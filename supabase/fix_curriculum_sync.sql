-- =========================================================================
-- WAYNAUTIC ACADEMY: SUPABASE CURRICULUM & QUIZ CLOUD SYNCHRONIZATION
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard)
-- This script fixes the schema and RLS policies for topics and quiz_questions
-- to allow seamless synchronization between Admin Portal and Academy Portal.
-- =========================================================================

-- 1. TOPICS TABLE ADJUSTMENTS
-- Ensure topics table exists and supports text IDs (e.g. 't-1', 't-custom-...')
create table if not exists public.topics (
  id text primary key,
  module_id uuid,
  module_slug text not null default 'llms',
  slug text unique not null,
  title text not null,
  description text not null,
  video_url text not null default 'https://www.youtube.com/embed/zxQyTK8ckyY',
  video_provider text not null default 'youtube',
  order_index integer not null default 1,
  text_content text not null default '',
  estimated_minutes integer not null default 15,
  chapters jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- If topics table already exists with uuid id or missing columns, adapt columns safely:
do $$
begin
  -- Add module_slug column if missing
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'topics' and column_name = 'module_slug') then
    alter table public.topics add column module_slug text not null default 'llms';
  end if;

  -- Add updated_at column if missing
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'topics' and column_name = 'updated_at') then
    alter table public.topics add column updated_at timestamptz default now();
  end if;

  -- Add chapters column if missing
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'topics' and column_name = 'chapters') then
    alter table public.topics add column chapters jsonb default '[]'::jsonb;
  end if;

  -- If id is UUID, alter to text to support 't-1', 't-custom-...'
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'topics' and column_name = 'id' and data_type = 'uuid') then
    alter table public.topics alter column id type text using id::text;
  end if;
end $$;

-- 2. QUIZ_QUESTIONS TABLE ADJUSTMENTS
create table if not exists public.quiz_questions (
  id text primary key,
  topic_id text not null,
  question_text text not null,
  options jsonb not null, -- Array of strings e.g. ["Option A", "Option B", "Option C", "Option D"]
  correct_option_index integer not null default 0,
  explanation text not null default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

do $$
begin
  -- If id is UUID in quiz_questions, alter to text
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'quiz_questions' and column_name = 'id' and data_type = 'uuid') then
    -- Drop foreign key constraint if it exists to allow text id
    alter table public.quiz_questions drop constraint if exists quiz_questions_topic_id_fkey;
    alter table public.quiz_questions alter column id type text using id::text;
    alter table public.quiz_questions alter column topic_id type text using topic_id::text;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'quiz_questions' and column_name = 'updated_at') then
    alter table public.quiz_questions add column updated_at timestamptz default now();
  end if;
end $$;

-- 3. ROW LEVEL SECURITY (RLS) POLICIES FOR TOPICS & QUIZZES
alter table public.topics enable row level security;
drop policy if exists "Allow public read access on topics" on public.topics;
drop policy if exists "Allow all on topics" on public.topics;
drop policy if exists "Allow all read on topics" on public.topics;
drop policy if exists "Allow all write on topics" on public.topics;

create policy "Allow all on topics"
  on public.topics for all
  using (true)
  with check (true);

alter table public.quiz_questions enable row level security;
drop policy if exists "Allow public read access on quiz_questions" on public.quiz_questions;
drop policy if exists "Allow all on quiz_questions" on public.quiz_questions;
drop policy if exists "Allow all read on quiz_questions" on public.quiz_questions;
drop policy if exists "Allow all write on quiz_questions" on public.quiz_questions;

create policy "Allow all on quiz_questions"
  on public.quiz_questions for all
  using (true)
  with check (true);
