# Architecture Decision Records (ADRs) — Waynautic Academy

This document logs all key architectural, technical, and structural decisions made across the lifecycle of the Waynautic Academy codebase.

---

## ADR Index

- [ADR-001: Hybrid LocalStorage Store with Supabase Cloud Sync](#adr-001-hybrid-localstorage-store-with-supabase-cloud-sync)
- [ADR-002: Next.js 15 App Router with Client-Side Hydration Boundaries](#adr-002-nextjs-15-app-router-with-client-side-hydration-boundaries)
- [ADR-003: 3-Column Responsive Skill Tree Grid Layout over Vertical Timeline](#adr-003-3-column-responsive-skill-tree-grid-layout-over-vertical-timeline)
- [ADR-004: In-Memory Static TypeScript Dataset for Instant Curriculum Delivery](#adr-004-in-memory-static-typescript-dataset-for-instant-curriculum-delivery)
- [ADR-005: Client-Side PDF Certificate Generation with jsPDF & html2canvas](#adr-005-client-side-pdf-certificate-generation-with-jspdf--html2canvas)
- [ADR-006: Dual-Provider Video Player (YouTube & Bunny.net Stream)](#adr-006-dual-provider-video-player-youtube--bunnynet-stream)
- [ADR-007: Tailwind CSS Class-Based Theming with Custom Light Mode CSS Overrides](#adr-007-tailwind-css-class-based-theming-with-custom-light-mode-css-overrides)
- [ADR-008: Custom Window Event Bus for Cross-Component LocalStorage Synchronization](#adr-008-custom-window-event-bus-for-cross-component-localstorage-synchronization)

---

### ADR-001: Hybrid LocalStorage Store with Supabase Cloud Sync
* **Date**: 2026-08-15
* **Status**: Accepted / Implemented
* **Decision**: Implement a client-first LocalStorage state management layer (`src/lib/store.ts`) that functions seamlessly in offline/demo mode, with optional cloud persistence via Supabase when credentials are configured.
* **Why**: Allows immediate, frictionless evaluation of the platform without requiring users to create an account or developers to configure Supabase instances just to test features.
* **Alternatives Considered**:
  - *Strict Supabase Auth gating*: Requires every user to authenticate before tracking progress; increases initial bounce rate.
  - *Full Redux / Zustand store*: Adds unnecessary boilerplate without native localStorage persistence benefits.

---

### ADR-002: Next.js 15 App Router with Client-Side Hydration Boundaries
* **Date**: 2026-08-15
* **Status**: Accepted / Implemented
* **Decision**: Utilize Next.js 15 App Router nested dynamic routes (`/curriculum/[moduleSlug]/[topicSlug]`), with `'use client'` components for interactive UI elements guarded by `typeof window === 'undefined'` checks.
* **Why**: Combines Next.js modern routing and fast Vercel edge deployment with rich client-side state transitions (quiz submissions, confetti triggers, video watch trackers).
* **Alternatives Considered**:
  - *Next.js Pages Router*: Older architecture; lacks modern nested layouts and React 19 server/client boundary features.
  - *Pure Single-Page Application (Vite/CRA)*: Lacks SEO optimization, pre-rendered open-graph tags, and server-optimized routing.

---

### ADR-003: 3-Column Responsive Skill Tree Grid Layout over Vertical Timeline
* **Date**: 2026-08-18 (Commit `b9361ad`)
* **Status**: Accepted / Implemented
* **Decision**: Redesign the curriculum visualization component (`SkillTree.tsx`) from a linear vertical timeline to a 3-column responsive card grid with prominent step badges (01–10), difficulty chips, and micro-progress bars.
* **Why**: The vertical timeline caused excessive page scrolling across 10 modules on desktop monitors and made high-level curriculum navigation tedious. The 3-column grid maximizes screen real estate and enhances scannability.
* **Alternatives Considered**:
  - *Horizontal SVG node-graph*: High complexity, difficult to make fully responsive across mobile screens.
  - *Accordion list*: Hides module descriptions and progress until expanded.

---

### ADR-004: In-Memory Static TypeScript Dataset for Instant Curriculum Delivery
* **Date**: 2026-08-16
* **Status**: Accepted / Implemented
* **Decision**: Store the 10 modules and 56 topics with full markdown text and quiz banks directly in static TypeScript datasets (`src/data/seedModules.ts` and `src/data/seedTopics.ts`), alongside the SQL schema/seeds (`supabase/schema.sql` and `supabase/seed.sql`).
* **Why**: Delivers instant 0ms latency page loads for curriculum content without requiring roundtrip database queries or caching layers, while maintaining full type safety across module and topic definitions.
* **Alternatives Considered**:
  - *Database-only queries on every page request*: Adds network latency, cold-start delays, and dependency on Supabase uptime for read operations.
  - *Headless CMS (Sanity / Strapi)*: Introduces third-party subscription costs and API maintenance overhead.

---

### ADR-005: Client-Side PDF Certificate Generation with jsPDF & html2canvas
* **Date**: 2026-08-17
* **Status**: Accepted / Implemented
* **Decision**: Generate downloadable verified course completion certificates entirely in the browser using `html2canvas` for DOM rasterization and `jsPDF` for PDF compilation (`CertificateModal.tsx`).
* **Why**: Zero serverless function compute cost, no headless Chromium / Puppeteer dependencies on Vercel, and instantaneous client-side PDF downloads.
* **Alternatives Considered**:
  - *Server-side PDF generation via Puppeteer*: Heavy serverless function size, prone to Vercel memory/timeout limits.
  - *Static PNG download*: Less professional for formal credentials compared to vector/print-ready PDF documents.

---

### ADR-006: Dual-Provider Video Player (YouTube & Bunny.net Stream)
* **Date**: 2026-08-17
* **Status**: Accepted / Implemented
* **Decision**: Implement a unified `VideoPlayer.tsx` component that detects video provider type (`youtube`, `bunny`, `cloudflare`) and automatically formats iframe embeds, ambient background glowing effects, and simulated 90% watch-time completion hooks.
* **Why**: Provides flexibility to embed public high-quality YouTube lectures for open modules while allowing private, DRM-protected video hosting on Bunny.net Stream for proprietary masterclasses.
* **Alternatives Considered**:
  - *YouTube-only player*: Prevents future monetization or private masterclass content protection.
  - *Custom video.js / HLS.js custom player*: Higher maintenance cost than native provider embed SDKs.

---

### ADR-007: Tailwind CSS Class-Based Theming with Custom Light Mode CSS Overrides
* **Date**: 2026-08-19 (Commit `0df10d7`)
* **Status**: Accepted / Implemented
* **Decision**: Use Tailwind CSS `darkMode: "class"` with a global dark theme by default, and provide explicit CSS variable/class overrides in `src/app/globals.css` for `.light` mode.
* **Why**: Maintains precise control over dark/light contrast ratios, cybernetic cyan/violet neon glows in dark mode, and clean crisp readability in light mode without style regressions.
* **Alternatives Considered**:
  - *Tailwind `dark:` utility classes on every element*: Increases JSX clutter across 20+ components and makes custom palette tuning difficult.

---

### ADR-008: Custom Window Event Bus for Cross-Component LocalStorage Synchronization
* **Date**: 2026-08-16
* **Status**: Accepted / Implemented
* **Decision**: Dispatch a custom DOM event `window.dispatchEvent(new Event('waynautic_storage_change'))` on every mutation in `src/lib/store.ts`, which all consuming components subscribe to via `useWaynauticStore()`.
* **Why**: Standard browser `storage` events only fire across separate browser tabs, not within the same window. The custom event ensures instantaneous UI updates across navigation bars, dashboards, and topic cards without requiring a heavy global state library.
* **Alternatives Considered**:
  - *React Context Provider*: Requires wrapping the entire DOM tree in providers and can trigger unnecessary re-renders across unaffected child components.
