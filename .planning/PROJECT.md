# myFlix

## What This Is

myFlix is a premium, cinematic experience built for film lovers and television watchers. It is a client-side Single-Page Application (SPA) that merges Movie and TV Show metadata from TMDB, IMDb ratings from OMDb, and episodic data from TVMaze into an intuitive, responsive glassmorphic dark-themed interface to discover, track, and watchlist content.

## Core Value

Enable users to seamlessly discover, track, and watchlist movies and TV shows in a fast, beautiful, and intuitive interface without requiring a backend database.

## Requirements

### Validated

- **Separate Native Homepages**: Separate homepage routes for Movies and TV Series with zero overlap.
- **Browse Panel**: Unified Browse page with multi-layered filters and native Movie/TV tab toggling.
- **Instant Multi-Search**: Unified search component that queries TMDB for Movies, TV, and Actors simultaneously.
- **Glassmorphic Dark UI**: Dark theme styling using utility-first Tailwind CSS, animated transitions, and elegant glassmorphism.
- **Personal Watchlist**: Client-side watchlist collections persisted in browser LocalStorage.
- **Authentication**: Local-only session authentication persisted in LocalStorage.

### Active

- [ ] **Optimized Webpage Load Speed**: Resolve client-side N+1 OMDb API queries, optimize image sizes via responsive srcset resolutions, and address concurrent fetch proxy delays.
- [ ] **Easy and Seamless Navigation**: Streamline HashRouter transitions, fix route/tab overlaps, and optimize UI page-to-page navigation flow.
- [ ] **Repaired Landing Page**: Eliminate page-mount layout shifts on the homepage and TV homepage, coordinate carousel/row loaders, and fix visual styling issues.

### Out of Scope

- **Backend Database**: No server-side database integration (Supabase, MySQL, Postgres, etc.) as the application operates purely client-side.
- **AI Content/Recommendations**: No AI engine or AI-powered recommendation systems.
- **User Reviews & Community Ratings**: Community review/rating systems are deferred to future milestones.

## Context

- The project is a brownfield client-side React SPA built with React 19, Vite 7, and Tailwind CSS v4.
- High number of concurrent fetches on the homepage triggers browser delay and layout shifts.
- Single-page transitions sometimes suffer from scroll reset or overlap issues in HashRouter.

## Constraints

- **Tech Stack**: React 19, Vite 7, Tailwind CSS v4, HashRouter, TanStack Query, and Zustand.
- **Database-less**: No backend data storage; browser LocalStorage must be used for watchlist and auth persistence.
- **Security**: Client-side compilation means API keys are public; logic must fetch securely without exposing critical infrastructure (e.g. proxying or key rotation on-client).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Client-only State | Pure static deployment requirement; user data is kept locally in browser `LocalStorage`. | ✓ Good |
| HashRouter for Routing | Allows simple static page hosting (like GitHub Pages) without server-side rewrite rules. | ✓ Good |

## Current Milestone: v1.0 Performance & UX Optimization

**Goal:** Optimize page loading speed, refine navigation transitions, and repair the landing page layout shifts.

**Target features:**
- Eliminate N+1 fetches for OMDb IMDb ratings using batching or caching.
- Optimize image sizes using TMDB `srcset` poster sizes.
- Resolve homepage mount layout shifts and coordinate loaders.
- Improve/cleanup route navigation transitions and layout.

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-26 after starting milestone v1.0*
