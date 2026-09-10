-- =========================================================================
-- WAYNAUTIC ACADEMY: PURGE & DELETE ALL EXISTING USER ACCOUNTS
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard)
-- =========================================================================

-- 1. Delete all user authentication records in auth.users
-- This automatically cascades and deletes:
-- - public.user_profiles
-- - public.user_progress
-- - public.user_quiz_attempts
-- - public.user_badges
-- - public.user_bookmarks
-- - public.user_notifications
-- - public.topic_comments
-- - public.topic_ratings
delete from auth.users;

-- 2. Ensure all profile & progress records are completely cleaned
delete from public.user_profiles;
delete from public.user_progress;
delete from public.user_quiz_attempts;
delete from public.user_badges;
delete from public.user_bookmarks;
delete from public.user_notifications;
delete from public.topic_comments;
delete from public.topic_ratings;

-- 3. Clear all payment verification transactions
delete from public.payments;
