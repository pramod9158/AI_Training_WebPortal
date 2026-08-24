-- Waynautic Academy Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. MODULES
create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null,
  difficulty text not null check (difficulty in ('Beginner', 'Intermediate', 'Advanced')),
  order_index integer not null,
  icon_name text not null default 'BookOpen',
  created_at timestamptz default now()
);

-- 2. TOPICS
create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  slug text unique not null,
  title text not null,
  description text not null,
  video_url text not null,
  video_provider text not null default 'youtube',
  order_index integer not null,
  text_content text not null,
  estimated_minutes integer not null default 15,
  created_at timestamptz default now()
);

-- 3. QUIZ QUESTIONS
create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  question_text text not null,
  options jsonb not null, -- Array of strings e.g. ["Option A", "Option B", "Option C", "Option D"]
  correct_option_index integer not null,
  explanation text not null,
  created_at timestamptz default now()
);

-- 4. USER PROFILES
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  selected_path text default 'path-a',
  last_accessed_topic_id text,
  last_accessed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. USER PROGRESS
create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id text not null,
  status text not null check (status in ('not_started', 'in_progress', 'completed')),
  completed_at timestamptz,
  updated_at timestamptz default now(),
  unique(user_id, topic_id)
);

-- 6. USER QUIZ ATTEMPTS
create table if not exists public.user_quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id text not null,
  score integer not null,
  total_questions integer not null,
  attempted_at timestamptz default now()
);

-- 7. USER BADGES
create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_type text not null,
  earned_at timestamptz default now(),
  unique(user_id, badge_type)
);

-- 8. LEARNING PATHS
create table if not exists public.learning_paths (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null,
  module_order jsonb not null -- Array of module slugs e.g. ["python", "git", "llms", ...]
);

-- 9. USER BOOKMARKS
create table if not exists public.user_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id text not null,
  created_at timestamptz default now(),
  unique(user_id, topic_id)
);

-- ROW LEVEL SECURITY (RLS) POLICIES

-- Public Read Tables
alter table public.modules enable row level security;
alter table public.topics enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.learning_paths enable row level security;

create policy "Allow public read access on modules" on public.modules for select using (true);
create policy "Allow public read access on topics" on public.topics for select using (true);
create policy "Allow public read access on quiz_questions" on public.quiz_questions for select using (true);
create policy "Allow public read access on learning_paths" on public.learning_paths for select using (true);

-- User Profile RLS
alter table public.user_profiles enable row level security;
create policy "Users can view own profile" on public.user_profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.user_profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.user_profiles for update using (auth.uid() = id);

-- User Progress RLS
alter table public.user_progress enable row level security;
create policy "Users can view own progress" on public.user_progress for select using (auth.uid() = user_id);
create policy "Users can insert own progress" on public.user_progress for insert with check (auth.uid() = user_id);
create policy "Users can update own progress" on public.user_progress for update using (auth.uid() = user_id);

-- User Quiz Attempts RLS
alter table public.user_quiz_attempts enable row level security;
create policy "Users can view own quiz attempts" on public.user_quiz_attempts for select using (auth.uid() = user_id);
create policy "Users can insert own quiz attempts" on public.user_quiz_attempts for insert with check (auth.uid() = user_id);

-- User Badges RLS
alter table public.user_badges enable row level security;
create policy "Users can view own badges" on public.user_badges for select using (auth.uid() = user_id);
create policy "Users can insert own badges" on public.user_badges for insert with check (auth.uid() = user_id);

-- User Bookmarks RLS
alter table public.user_bookmarks enable row level security;
create policy "Users can view own bookmarks" on public.user_bookmarks for select using (auth.uid() = user_id);
create policy "Users can insert own bookmarks" on public.user_bookmarks for insert with check (auth.uid() = user_id);
create policy "Users can delete own bookmarks" on public.user_bookmarks for delete using (auth.uid() = user_id);

-- Trigger for auto-profile creation on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, display_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
