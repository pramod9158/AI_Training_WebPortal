# Current State — Waynautic Academy

**Last Updated**: 2026-08-21  
**Updated By**: AI Assistant (Antigravity Baseline Scan)  
**Latest Session**: [2026-08-21.md](file:///c:/Users/User/OneDrive/Documents/ai%20training/ai%20training%20web%20portal/ai-memory/sessions/2026-08-21.md)

---

## 1. What is DONE (Feature-by-Feature)

### A. Core Curriculum & Content
- [x] **10 Curated Modules**: Full curriculum populated with ordered slugs, descriptions, difficulty badges, and Lucide icons ([`src/data/seedModules.ts`](file:///c:/Users/User/OneDrive/Documents/ai%20training/ai%20training%20web%20portal/src/data/seedModules.ts)).
- [x] **56 Detailed Topics**: Complete 56-topic dataset with video URLs, estimated durations, and rich markdown text ([`src/data/seedTopics.ts`](file:///c:/Users/User/OneDrive/Documents/ai%20training/ai%20training%20web%20portal/src/data/seedTopics.ts)).
- [x] **2 Learning Paths**: Configured *Path A (New to AI Development)* and *Path B (Building Production AI Systems)*.
- [x] **Expanded 20-Question Masterclass Quizzes**:
  - `t-54` (Advanced Retrieval & Hybrid Techniques in RAG) — 20 rigorous technical questions with deep explanations.
  - `t-55` (Grounding, Hallucination Detection & Evaluation) — 20 rigorous technical questions covering Ragas, TruLens, DeepEval, and G-Eval frameworks.
  - Initial topic quiz banks for `t-1`, `t-2`, `t-6`, `t-7`.

### B. User Interface & Experience
- [x] **Landing Page (`/`)**: Hero section with interactive CTA, metrics showcase (10 Modules, 56 Topics, 100% Practical), dynamic module preview grid, feature callouts, developer testimonials, and footer.
- [x] **Curriculum Directory (`/curriculum`)**: Filterable catalog of all 10 modules with progress indicators, topic counts, and difficulty tags.
- [x] **Module View (`/curriculum/[moduleSlug]`)**: Detailed breakdown of topics within a selected module, prerequisites, and sequential lesson access.
- [x] **Topic Lesson View (`/curriculum/[moduleSlug]/[topicSlug]`)**:
  - Split-view/integrated layout with `VideoPlayer`.
  - Rich `MarkdownNotes` with syntax highlighting, alert callout blocks (`[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`), code copy buttons, and practical cheatsheets.
  - Integrated `QuizEngine` with real-time feedback, score calculation, and progress recording.
  - Navigation controls (Previous Topic, Next Topic, Mark Complete, Toggle Bookmark).
- [x] **Dashboard (`/dashboard`)**:
  - Daily learning streak tracker with active/longest streak counters.
  - Visual 3-Column `SkillTree` showing real-time progress across all 10 modules.
  - Badge trophy case displaying unlocked and locked achievements.
  - Bookmarked topics quick-access drawer.
  - "Claim Certificate" modal trigger upon completing learning paths.
- [x] **Paths Selection (`/paths`)**: Visual path selector with module sequence maps and one-click active path switching.
- [x] **Profile & Data Management (`/profile`)**:
  - User display name and avatar customization.
  - Comprehensive learning statistics (completion percentage, total topics completed, quiz pass rate).
  - Badge collection showcase.
  - Bookmarked topics manager.
  - Data Export (JSON) and Local Reset controls.
- [x] **Interactive Onboarding Tour (`/onboarding` & `OnboardingTour.tsx`)**:
  - Multi-step preference survey (experience level, weekly commitment, goal).
  - Driver.js automated guided tour highlighting key UI elements.
- [x] **Global Search Modal (`SearchModal.tsx`)**: Instant fuzzy search across all 56 topics, modules, and concepts accessible via keyboard shortcut (`Cmd/Ctrl + K`) or navigation bar.
- [x] **Certificate Generator (`CertificateModal.tsx`)**:
  - High-resolution SVG/DOM certificate design.
  - Real-time client-side PDF export utilizing `html2canvas` and `jsPDF`.
- [x] **Dark / Light Theme System**:
  - Default futuristic dark theme with cyan/violet cyber-gradients.
  - Full Light Mode overrides in `src/app/globals.css` with instant toggle in `Navbar`.

### C. Database & Infrastructure
- [x] **PostgreSQL Schema (`supabase/schema.sql`)**: 9 normalized relational tables with primary keys, foreign keys, cascading deletes, and `last_accessed_topic_id` / `last_accessed_at` resume location columns.
- [x] **Row Level Security (RLS)**: Public read access for curriculum; strict `auth.uid() = user_id` isolation for user data.
- [x] **Database Trigger**: `on_auth_user_created` trigger automatically populating `public.user_profiles` upon Supabase auth signup.
- [x] **Student Authentication System (`src/lib/supabaseAuth.ts`)**: Email & Password registration and login via Supabase Auth, with automatic 8-hour inactivity session timeout enforcement.
- [x] **Bi-Directional Cloud Progress Sync (`src/lib/store.ts`)**: Automatic bi-directional cloud fetch & optimistic local update of user progress, streak, bookmarks, badges, quiz attempts, and last-accessed topic location.
- [x] **Resume Learning Navigation**: Dedicated "Resume Learning" shortcuts on Navbar and Dashboard pointing directly to the last visited lesson.
- [x] **Vercel Deployment**: Live production deployment configured with Next.js edge optimization.

---

## 2. What is IN PROGRESS Right Now

- [ ] **Topic Quiz Expansion**: Expanding the remaining topics (beyond `t-1`, `t-2`, `t-6`, `t-7`, `t-54`, `t-55`) from placeholder/short quizzes to full 10–20 question comprehensive masterclass quizzes.
- [ ] **Bunny.net Stream Tokenization**: Upgrading `VideoPlayer.tsx` from standard iframe/direct URL embeds to signed token URLs and Bunny Stream Player API for tracking exact 90% watch milestones automatically.

---

## 3. What is NOT STARTED / Backlog

- [ ] **Community Discussions & Discussion Threads**: Per-topic Q&A forum where learners can discuss coding hurdles and post code solutions.
- [ ] **Interactive In-Browser Code Sandbox / REPL**: Embedding an interactive Python/AI execution runtime (e.g., Pyodide / WebAssembly) inside topic lesson pages.
- [ ] **Admin Content CMS**: Admin UI to create, edit, or reorder topics, modules, and quiz questions dynamically in Supabase without modifying static TypeScript files.
- [ ] **Automated GitHub Actions CI/CD Test Pipeline**: Linting, type-checking, and bundle verification workflows on PRs.

---

## 4. Known Bugs, Fragile Areas & Recent Patches

### Recent Patches & Workarounds (from Git History)
1. **Direct Topic String ID Database Persistence (`commit 3aaab42`)**:
   - *Issue*: `user_progress.topic_id` was previously defined as `UUID references public.topics(id)`. Because `public.topics` table in Supabase was unseeded and frontend topic IDs are strings (`'t-1'`, `'t-2'`), Postgres rejected inserts with `invalid input syntax for type uuid: "t-1"`, causing `user_progress` table to stay empty.
   - *Fix*: Changed `topic_id` column type in `user_progress`, `user_bookmarks`, and `user_quiz_attempts` to `text not null`, allowing direct 1-step upsert/insert of string topic IDs (`'t-1'`, `'t-2'`).
2. **Instant Visual Button State Synchronization (`commit a2c7b31`)**:
   - *Issue*: Clicking "Mark as Complete" updated Supabase DB, but the visual button text and color did not update instantly because an early return inside `useEffect` in `useWaynauticStore` prevented `window.addEventListener('waynautic_storage_change')` from registering when `isSupabaseConfigured` was true. Also, `updatedStatus` forced completed topics permanently into `completed` status.
   - *Fix*: Re-architected `useEffect` in `useWaynauticStore` to register storage listeners unconditionally and set `updatedStatus = status` directly to allow instant UI button transformations (**Mark as Complete** &harr; **Completed ✓**).
3. **Safe Profile Payload Construction (`commit 2f47463`)**:
   - *Issue*: `saveProfile()` sent `last_accessed_topic_id` and `last_accessed_at` in all Supabase upserts, throwing PostgREST `400 Bad Request (PGRST204)` if the columns were not yet created in Supabase DB.
   - *Fix*: Dynamically constructed profile payloads and wrapped Supabase upserts in `try/catch` blocks so UI and local state never fail or stall.
4. **t-55 Quiz Key Binding Fix (`commit 7742b2e`)**:
   - *Issue*: Quiz questions for topic `t-55` were previously keyed incorrectly or omitted from `QUIZ_QUESTIONS` map in `seedTopics.ts`.
   - *Fix*: Bound `t-55` explicitly to its 20-question Grounding & Evaluation question bank.
5. **SkillTree Grid Layout Transformation (`commit b9361ad`)**:
   - *Issue*: The original vertical timeline layout caused extreme vertical scrolling on mobile and desktop viewports with 10 modules.
   - *Fix*: Transformed `SkillTree.tsx` into a modern 3-column responsive card grid layout with visual step counters.

### Fragile Areas to Watch
- **LocalStorage / SSR Hydration**: Any new component reading `loadProfile()` or `loadProgress()` during initial render must either use `useEffect` or check `typeof window !== 'undefined'` to avoid Next.js hydration mismatch errors (`Text content does not match server-rendered HTML`).
- **Large `seedTopics.ts` File Size (~94KB / 2300+ lines)**: As more 20-question quiz banks and markdown notes are added, consider modularizing `seedTopics.ts` into sub-files per module (e.g. `src/data/topics/python.ts`, `rag.ts`, etc.) to prevent IDE lag and git merge conflicts.
