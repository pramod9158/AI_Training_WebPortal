# Onboarding Guide — Waynautic Academy

Welcome to **Waynautic Academy**! This guide is designed to get any software engineer or AI developer fully productive and running locally within **10 minutes**.

---

## 1. Quickstart: 3-Step Setup

### Step 1: Install Dependencies
Ensure you are using **Node.js 18.x or 20.x+**:
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy or create a `.env.local` file in the project root:
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-jwt-key]
```
> [!TIP]
> **No Supabase project yet?** No problem. If you leave `.env.local` blank or unconfigured, the app automatically boots into **Demo Mode** using browser `localStorage` for all progress, streaks, badges, and bookmarks.

### Step 3: Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 2. Where to Look First (Task Locator)

Use this quick-reference table to find the relevant code for common tasks:

| If you want to work on... | Go to this file / directory | What you'll find there |
| :--- | :--- | :--- |
| **Landing Page & Hero** | [`src/app/page.tsx`](file:///c:/Users/User/OneDrive/Documents/ai%20training/ai%20training%20web%20portal/src/app/page.tsx) | Hero headline, CTA buttons, metrics counters, feature highlights, and module preview. |
| **Curriculum Catalog** | [`src/app/curriculum/page.tsx`](file:///c:/Users/User/OneDrive/Documents/ai%20training/ai%20training%20web%20portal/src/app/curriculum/page.tsx) | Catalog listing all 10 modules with difficulty filters and completion trackers. |
| **Topic Lesson Page** | [`src/app/curriculum/[moduleSlug]/[topicSlug]/page.tsx`](file:///c:/Users/User/OneDrive/Documents/ai%20training/ai%20training%20web%20portal/src/app/curriculum/[moduleSlug]/[topicSlug]/page.tsx) | The primary lesson view: video player, markdown notes renderer, and quiz engine. |
| **Video Player (YouTube/Bunny)** | [`src/components/VideoPlayer.tsx`](file:///c:/Users/User/OneDrive/Documents/ai%20training/ai%20training%20web%20portal/src/components/VideoPlayer.tsx) | Dual-provider embed container, aspect-ratio wrapper, and 90% watch-time completion trigger. |
| **Markdown Notes & Code Formatting** | [`src/components/MarkdownNotes.tsx`](file:///c:/Users/User/OneDrive/Documents/ai%20training/ai%20training%20web%20portal/src/components/MarkdownNotes.tsx) | Syntax highlighter, GitHub-flavored markdown renderer, callout alerts (`[!NOTE]`, `[!TIP]`). |
| **Quiz Engine & Scoring** | [`src/components/QuizEngine.tsx`](file:///c:/Users/User/OneDrive/Documents/ai%20training/ai%20training%20web%20portal/src/components/QuizEngine.tsx) | Interactive multi-question quiz runner with immediate explanations and score recording. |
| **Skill Tree Visualization** | [`src/components/SkillTree.tsx`](file:///c:/Users/User/OneDrive/Documents/ai%20training/ai%20training%20web%20portal/src/components/SkillTree.tsx) | 3-column responsive card grid displaying module progress and step indicators. |
| **Certificate Generator & PDF** | [`src/components/CertificateModal.tsx`](file:///c:/Users/User/OneDrive/Documents/ai%20training/ai%20training%20web%20portal/src/components/CertificateModal.tsx) | Certificate modal with real-time `html2canvas` rasterization and `jsPDF` export. |
| **User State & Progress Store** | [`src/lib/store.ts`](file:///c:/Users/User/OneDrive/Documents/ai%20training/ai%20training%20web%20portal/src/lib/store.ts) | LocalStorage state manager, streak calculator, badge evaluation engine, and event bus. |
| **Curriculum Content & Quizzes** | [`src/data/seedModules.ts`](file:///c:/Users/User/OneDrive/Documents/ai%20training/ai%20training%20web%20portal/src/data/seedModules.ts) & [`seedTopics.ts`](file:///c:/Users/User/OneDrive/Documents/ai%20training/ai%20training%20web%20portal/src/data/seedTopics.ts) | The 10 modules, 56 topics, markdown text content, and quiz question banks. |
| **Database Schema & RLS** | [`supabase/schema.sql`](file:///c:/Users/User/OneDrive/Documents/ai%20training/ai%20training%20web%20portal/supabase/schema.sql) | PostgreSQL schema DDL (9 tables), Row Level Security policies, and trigger functions. |
| **Authentication Flow** | [`src/app/login/page.tsx`](file:///c:/Users/User/OneDrive/Documents/ai%20training/ai%20training%20web%20portal/src/app/login/page.tsx) & [`signup/page.tsx`](file:///c:/Users/User/OneDrive/Documents/ai%20training/ai%20training%20web%20portal/src/app/signup/page.tsx) | Supabase Auth login/signup with demo mode fallback. |
| **Global Theme & Styling** | [`src/app/globals.css`](file:///c:/Users/User/OneDrive/Documents/ai%20training/ai%20training%20web%20portal/src/app/globals.css) & [`tailwind.config.ts`](file:///c:/Users/User/OneDrive/Documents/ai%20training/ai%20training%20web%20portal/tailwind.config.ts) | Dark theme tokens, cyber-glow effects, scrollbars, and light mode class overrides. |

---

## 3. Key Development Commands

```bash
npm run dev        # Starts Next.js development server at http://localhost:3000
npm run build      # Compiles production Next.js bundle and validates types
npm run start      # Runs the production server locally
npm run lint       # Runs ESLint checks across the codebase
```

---

## 4. Architectural Rules & Governance

Before proposing or implementing significant structural changes:
1. **Consult [`DECISIONS.md`](file:///c:/Users/User/OneDrive/Documents/ai%20training/ai%20training%20web%20portal/ai-memory/DECISIONS.md)** to understand past architectural trade-offs (e.g., why we use a hybrid LocalStorage store, 3-column skill tree, client-side PDF generation).
2. **Preserve SSR Hydration Safety**: Avoid reading from `window` or `localStorage` during initial component render; use `useEffect` or `typeof window === 'undefined'` guards.
3. **Log New ADRs**: If you make a significant design or library choice, add a new entry to [`DECISIONS.md`](file:///c:/Users/User/OneDrive/Documents/ai%20training/ai%20training%20web%20portal/ai-memory/DECISIONS.md).
4. **Log Your Session**: At the end of your development sprint, create a new file in `ai-memory/sessions/YYYY-MM-DD.md` using the provided [TEMPLATE.md](file:///c:/Users/User/OneDrive/Documents/ai%20training/ai%20training%20web%20portal/ai-memory/sessions/TEMPLATE.md).
