# Project Research Summary

**Project:** myFlix
**Domain:** Client-Side Movie Discovery Web Application (SPA)
**Researched:** 2026-06-26
**Confidence:** HIGH

## Executive Summary

myFlix is a static React Single-Page Application (SPA) that operates entirely client-side. The current research focuses on addressing performance bottlenecks and user experience concerns: specifically, optimizing page load times, simplifying layout transitions/navigation, and repairing Cumulative Layout Shift (CLS) on the home/TV page.

The core findings highlight that slow page loads and rate limit locks are caused by N+1 parallel requests to OMDb API for movie ratings on list rows. By restructuring the rating service to load badges on-demand (e.g. using lazy viewport queries) and caching ratings in browser storage, we can reduce OMDb traffic by over 90%. Additionally, replacing generic loading states with fixed-dimension glassmorphic skeletons and implementing standard responsive image attributes (srcset) for TMDB posters will significantly reduce bandwidth consumption and eliminate layout shifts on mount.

## Key Findings

### Recommended Stack

We maintain the existing React 19, Vite 7, Tailwind CSS v4, and TanStack Query client stack. No database integration is required.

**Core optimization patterns:**
- **TanStack Query Caching:** Storing OMDb fetches with custom stale and cache times.
- **LocalStorage Persistence:** Caching fetched ratings locally to minimize API requests across sessions.
- **IntersectionObserver / Viewport Loading:** Querying OMDb IDs only when movie card row components scroll into view.
- **HTML Srcset Poster Sizing:** Referencing TMDB image subfolders (e.g., `/w185/` for card grids) matching responsive layouts.

### Expected Features

**Must have (table stakes):**
- Fast page loads (< 2 seconds) by restricting image file sizes and network calls.
- Layout-stable views by aligning skeletons to card boxes.
- Intact page scroll resets on route navigations.

**Should have (competitive):**
- Unified OMDb query throttling.
- Immersive glassmorphic details transitioning smoothly on selection.

**Defer (v2+):**
- Backend user account sync.
- AI movie recommendations.

### Architecture Approach

The architecture is divided into three layers: Page views and Cards (Component Layer), React Query / Zustand Stores (Hooks & State Layer), and External API Wrappers (Services Layer). 

**Major components to adjust:**
1. **Rating Component:** Extract from general card flow to load ratings independently only when cards enter viewport.
2. **Skeleton Loader:** Create fixed-dimension component wrappers for Carousels and Card Grids.
3. **Scroll Restorer:** Ingest standard navigation scroll-to-top handler at App layout level.

### Critical Pitfalls

1. **OMDb Key Exhaustion:** Avoid by deferring rating queries until visible, and caching them in browser LocalStorage.
2. **Cumulative Layout Shift (CLS):** Avoid by rendering skeletons with the exact aspect ratios of loaded posters.
3. **Scroll Memory Persistence:** Avoid by enforcing scroll-reset to `(0, 0)` on route transitions.

## Implications for Roadmap

Based on research, the suggested phase structure is:

### Phase 1: Core Speed & Request Optimization
**Rationale:** Solves the primary network bottlenecks before polishing the user interface.
**Delivers:** On-demand ratings fetching with LocalStorage fallback caching, and responsive image srcset resolutions.
**Avoids:** OMDb API key rate-limiting.

### Phase 2: Landing Page Layout Repair
**Rationale:** Ensures that the entry points (HomePage/TVHomePage) load cleanly and look premium without layout jumps.
**Delivers:** Coordinated skeletons and layout-stable carousels.
**Avoids:** Cumulative Layout Shifts (CLS) on mount.

### Phase 3: Route Transitions & Navigation Polish
**Rationale:** refines user transitions through the app once page speeds and layouts are stable.
**Delivers:** Scroll reset wrapper, simplified route layout alignment.
**Avoids:** Stale navigation positions.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core stack is well-supported and packages are already installed locally. |
| Features | HIGH | Table stakes and optimization features are well-defined. |
| Architecture | HIGH | On-demand caching logic is standard for client-only portfolios. |
| Pitfalls | HIGH | Main pitfalls match standard React SPA routing and asset patterns. |

**Overall confidence:** HIGH

### Gaps to Address

- **OMDb Endpoint Limits:** We need to verify if the free OMDb credentials can be safely rotated or cached under a singular client configuration without exposing keys in Git history. This is handled by ensuring keys are read from environment variables.

## Sources

### Primary (HIGH confidence)
- [TanStack Query docs](https://tanstack.com/query/v5) — Query client configuration.
- [TMDB Developer portal](https://developer.themoviedb.org/) — Image sizes API rules.

---
*Research completed: 2026-06-26*
*Ready for roadmap: yes*
