# Roadmap & Task List — Waynautic Academy

This document tracks prioritized development items categorized by execution timeframe (**Now**, **Next**, and **Later**).

---

## 1. NOW (Immediate Priority — Current Sprint)

| Task | Description | Status / Priority | Complexity |
| :--- | :--- | :---: | :---: |
| **Supabase Cloud Sync Layer** | Connect `src/lib/store.ts` mutations (`saveProgress`, `saveProfile`, `saveBadges`, `saveBookmarks`) to automatically push/pull from Supabase tables when a user is authenticated. | **Completed ✓** | **Medium** |
| **Topic Quiz Expansion** | Populate rich 10–20 question technical quiz banks with detailed explanations for remaining topics across Python, Git, Model Providers, LLMs, AI IDEs, Vector DBs, and Local AI. | **Immediate (NOW)** | **Medium** |
| **Split `seedTopics.ts` into Modular Files** | Refactor the 2,300+ line `src/data/seedTopics.ts` into individual per-module files under `src/data/topics/` and aggregate them in an index file. | **Immediate (NOW)** | **Small** |

---

## 2. NEXT (Upcoming Milestone)

| Task | Description | Why It Matters | Complexity |
| :--- | :--- | :--- | :---: |
| **Bunny.net Stream Secure Token Embeds** | Implement signed token URL generation for Bunny.net Stream video embeds and listen for real `timeupdate` (90% milestone) events using the Bunny Player SDK. | Prevents piracy/hotlinking of proprietary video lessons and guarantees accurate watch-time tracking. | **Medium** |
| **Public Certificate Verification Page (`/verify/[certId]`)** | Create a public verification route that looks up a certificate hash/ID and renders verified credential metadata for employers and social sharing. | Increases credential authenticity and drives organic platform referrals on LinkedIn and GitHub. | **Medium** |
| **Interactive Code Snippet Copy & Sandbox Runner** | Enhance code blocks in `MarkdownNotes.tsx` with one-click copy feedback, syntax line highlighting, and optional WebAssembly Python execution (Pyodide). | Enhances the practical hands-on experience without leaving the browser tab. | **Medium** |
| **Automated CI/CD Validation** | Configure a GitHub Actions workflow running `npm run lint`, `tsc --noEmit`, and `next build` on every pull request. | Catches regressions, broken types, and deployment issues before merging to `main`. | **Small** |

---

## 3. LATER (Future Horizons & Backlog)

| Task | Description | Why It Matters | Complexity |
| :--- | :--- | :--- | :---: |
| **Community Lesson Discussion Threads** | Build per-topic discussion forums where learners can ask clarifying questions, share solutions, and upvote helpful answers. | Fosters a vibrant developer community and peer-to-peer learning environment. | **Large** |
| **Admin Content Management CMS** | Build a protected Admin Portal (`/admin`) for creating, editing, and publishing modules, topics, markdown notes, and quizzes directly into Supabase. | Eliminates the need to commit code changes to update educational curriculum. | **Large** |
| **AI Teaching Assistant Chatbot** | Integrate an embedded AI tutor in topic pages that has access to the topic notes and can answer learner questions in context. | Provides immediate 24/7 unblocking for difficult technical topics. | **Large** |
| **Organization & Team Dashboards** | Support enterprise cohort tracking, manager dashboards, and bulk seat licensing. | Enables B2B enterprise training sales for tech companies upskilling their engineering teams. | **Large** |
