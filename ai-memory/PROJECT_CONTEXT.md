# Project Context — Waynautic Academy

## 1. Executive Summary
**Waynautic Academy** is an interactive, production-grade learning portal designed to train software engineers and AI developers in modern generative AI and engineering disciplines. The platform features curated curriculum sequences, video-assisted interactive lessons, rich markdown masterclass notes with syntax-highlighted code samples, multi-question topic quizzes, progress/streak gamification with badges, and verifiable PDF certificate generation.

---

## 2. Tech Stack & Exact Versions

The project is built on the modern React 19 / Next.js 15 App Router ecosystem with strict TypeScript typing:

| Dependency | Version | Purpose |
| :--- | :--- | :--- |
| **Next.js** | `^15.5.22` | Core framework utilizing App Router, Server/Client components, and dynamic route parameters |
| **React / React DOM** | `^19.2.8` | UI library and virtual DOM rendering |
| **TypeScript** | `^5.x` | Strict static typing across components, models, and data stores |
| **Tailwind CSS** | `^3.4.17` | Utility-first styling with custom dark/light color schemes and class-based theming |
| **@tailwindcss/typography** | `^0.5.16` | Prose rendering and styling for markdown lesson notes |
| **@supabase/supabase-js** | `^2.112.0` | Client library for Supabase database queries, Auth, and RLS |
| **@supabase/ssr** | `^0.12.4` | SSR cookie/session utility helpers for Supabase |
| **Lucide React** | `^1.28.0` | Iconography suite for UI components and badges |
| **Framer Motion** | `^12.43.0` | Micro-animations, page transitions, and interactive UI states |
| **Canvas Confetti** | `^1.9.4` | Particle celebration animations upon quiz completion and milestone unlocks |
| **Driver.js** | `^1.8.0` | Interactive step-by-step visual onboarding tour |
| **jsPDF** | `^4.2.1` | Client-side PDF generation for completion certificates |
| **html2canvas** | `^1.4.1` | Canvas rendering of React certificate DOM for PDF rasterization |
| **react-markdown** | `^10.1.0` | Markdown parser for lesson text, instructions, and cheatsheets |
| **remark-gfm** | `^4.0.1` | GitHub Flavored Markdown support (tables, autolinks, task lists) |
| **Deployment Target** | Vercel | Production hosting platform with automated edge deployment |

---

## 3. High-Level Architecture

### Directory Layout
```
├── .env.local                    # Local environment variables
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript compiler configuration
├── tailwind.config.ts            # Tailwind CSS design system config
├── supabase/
│   ├── schema.sql                # Complete PostgreSQL DDL (9 tables, RLS, triggers)
│   └── seed.sql                  # Initial module and learning path seed SQL
├── src/
│   ├── app/                      # Next.js App Router routes
│   │   ├── layout.tsx            # Global layout, fonts (Space Grotesk + Inter), ClientAppWrapper
│   │   ├── globals.css           # Custom CSS utilities, scrollbars, glowing badges, light mode overrides
│   │   ├── page.tsx              # Landing page (Hero, metrics, module preview, testimonials, CTA)
│   │   ├── curriculum/           # Curriculum catalog
│   │   │   ├── page.tsx          # Full module directory listing with filter & progress
│   │   │   └── [moduleSlug]/     # Dynamic module view
│   │   │       ├── page.tsx      # Module topic index & stats
│   │   │       └── [topicSlug]/  # Dynamic topic lesson view
│   │   │           └── page.tsx  # Topic player (Video + Markdown + Quiz + Bookmarks)
│   │   ├── dashboard/page.tsx    # User command center (Streak, Skill Tree, Badges, Certs)
│   │   ├── paths/page.tsx        # Learning path selection (Path A vs Path B)
│   │   ├── profile/page.tsx      # Profile stats, badge showcase, bookmarked topics, data management
│   │   ├── search/page.tsx       # Search interface
│   │   ├── login/page.tsx        # Auth login (Supabase Auth + Demo Fallback)
│   │   ├── signup/page.tsx       # Auth signup
│   │   ├── onboarding/page.tsx   # Interactive questionnaire & skill level calibration
│   │   └── about/page.tsx        # Platform mission & curriculum overview
│   ├── components/               # Reusable React components
│   │   ├── Navbar.tsx            # Global top navigation with path switcher, search, & theme toggle
│   │   ├── Footer.tsx            # Global footer with navigation links and copyright
│   │   ├── ClientAppWrapper.tsx  # Global client wrapper handling theme synchronization
│   │   ├── VideoPlayer.tsx       # Dual-provider video player (YouTube / Bunny.net Stream)
│   │   ├── MarkdownNotes.tsx     # Enhanced markdown renderer with code block styling & callouts
│   │   ├── QuizEngine.tsx        # Interactive quiz engine with immediate feedback & score tallying
│   │   ├── SkillTree.tsx         # 3-column responsive visual curriculum progress tree
│   │   ├── SearchModal.tsx       # Instant modal search across 56 topics
│   │   ├── OnboardingTour.tsx    # Driver.js interactive product walkthrough
│   │   └── CertificateModal.tsx  # PDF exportable certification generator
│   ├── data/                     # Seed datasets and static models
│   │   ├── seedModules.ts        # 10 core modules & 2 learning paths definitions
│   │   └── seedTopics.ts         # 56 rich topic units & multi-question quiz banks
│   └── lib/                      # Core platform utilities
│       ├── types.ts              # Global application TypeScript definitions
│       ├── store.ts              # LocalStorage state management with custom event bus
│       └── supabaseClient.ts     # Supabase client initializer with configuration detection
└── ai-memory/                    # Persistent AI & developer context memory
```

### Rendering Strategy & State Layer
1. **Next.js App Router**: Pages utilize React Client Components (`'use client'`) where rich client state, LocalStorage synchronization, and immediate DOM interactions are required.
2. **Hybrid State Management**:
   - Primary reactive client state is managed via `src/lib/store.ts` (`useWaynauticStore`).
   - The store persists progress, streaks, badges, bookmarks, and user profile data to `localStorage` under `waynautic_*` keys.
   - Cross-component state synchronization is handled via a window event listener dispatching custom `waynautic_storage_change` events alongside standard browser `storage` events.
   - When configured, Supabase Auth and database tables (`user_progress`, `user_badges`, `user_bookmarks`) provide cloud persistence.
3. **Hydration Protection**: All browser-dependent state initializers check `typeof window === 'undefined'` to prevent SSR hydration mismatch errors during Next.js build and initial load.

---

## 4. Core Domain Model (10 Modules / 56 Topics)

The curriculum is structured into **10 Modules** containing **56 Topics** ordered sequentially:

```
[01. Python] (10 Topics) ──> [02. Git] (6 Topics) ──> [03. Model Providers] (5 Topics)
       │
       ▼
[04. Prompt Engineering] (5 Topics) ──> [05. LLMs] (5 Topics) ──> [06. AI-Powered IDEs] (5 Topics)
       │
       ▼
[07. Vector Databases] (5 Topics) ──> [08. RAG Systems] (5 Topics) ──> [09. Prompt & MCP] (5 Topics)
       │
       ▼
[10. Local AI Deployment] (5 Topics)
```

### Module Breakdown
| Order | Module Slug | Module Title | Difficulty | Topics Count |
| :---: | :--- | :--- | :---: | :---: |
| 1 | `python-basics` | Python | Beginner | 10 |
| 2 | `git-fundamentals` | Git | Beginner | 6 |
| 3 | `model-providers` | Model Providers (OpenAI, Claude, Gemini) | Intermediate | 5 |
| 4 | `prompt-engineering` | Prompt Engineering | Intermediate | 5 |
| 5 | `llms` | LLMs | Intermediate | 5 |
| 6 | `ai-ides` | AI-Powered IDEs & Editors | Intermediate | 5 |
| 7 | `vector-databases` | Vector Databases | Advanced | 5 |
| 8 | `rag-systems` | Retrieval-Augmented Generation (RAG) | Advanced | 5 |
| 9 | `mcp-foundations` | Prompt & MCP Foundations | Advanced | 5 |
| 10 | `local-ai` | Local AI Deployment | Advanced | 5 |
| **Total** | **10 Modules** | | | **56 Topics** |

### Curated Learning Paths
- **Path A (`path-a`)**: *"New to AI Development"* — Covers Modules 1 through 6 (`python-basics`, `git-fundamentals`, `model-providers`, `prompt-engineering`, `llms`, `ai-ides`).
- **Path B (`path-b`)**: *"Building Production AI Systems"* — Covers Modules 7 through 10 (`vector-databases`, `rag-systems`, `mcp-foundations`, `local-ai`).

---

## 5. Key Third-Party Services

| Service | Purpose in Waynautic Academy | Status |
| :--- | :--- | :--- |
| **Supabase** | Cloud PostgreSQL database, user authentication (Email/Password & Google OAuth), and Row Level Security (RLS) policies. | Configured / Active |
| **Vercel** | Production hosting platform, continuous deployment from GitHub `main` branch, edge network caching. | Configured / Active |
| **Bunny.net Stream** | Enterprise video delivery network for protected lesson video hosting, responsive HLS streaming, and CDN delivery. | Integrated in VideoPlayer / In Progress |
| **YouTube** | Default video embed provider for open curriculum tutorials and educational video lessons. | Active |
| **Driver.js** | Client-side visual product onboarding tour overlay for highlighting key features. | Active |

---

## 6. Environment Variables

The project requires the following environment variable keys in `.env.local` or in Vercel project settings:

```env
# Supabase Configuration (Active Project: hbluortgosbgtumzxnyl)
NEXT_PUBLIC_SUPABASE_URL=https://hbluortgosbgtumzxnyl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
```

> [!NOTE]
> Connected to active Supabase project `hbluortgosbgtumzxnyl` (`https://hbluortgosbgtumzxnyl.supabase.co`). When unconfigured, the app falls back gracefully to **Demo Mode**, persisting progress locally in browser storage without throwing errors.
