# Pitfalls Research

**Domain:** Client-Side Movie Discovery Web Application (SPA)
**Researched:** 2026-06-26
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: OMDb API Rate Limit Exhaustion (N+1 Query Issue)

**What goes wrong:**
Every page load triggers dozens of requests to OMDb. This quickly eats up the 1,000 requests/day limit on free OMDb API keys, causing the app to return `401 Unauthorized` or `402 Payment Required` errors for subsequent users.

**Why it happens:**
TMDB lists do not return IMDb rating scores. The app fetches TMDB trending arrays first, then iterates over each movie to query OMDb by its IMDb ID.

**How to avoid:**
Implement on-demand rating fetching (only fetch when a card is visible/hovered) and cache ratings in browser LocalStorage alongside React Query.

**Warning signs:**
Check browser console for failing network requests to `omdbapi.com` or missing rating badges.

**Phase to address:**
Phase 1 (Core Speed & Batching)

---

### Pitfall 2: Cumulative Layout Shift (CLS) on Mounting

**What goes wrong:**
When pages load, rows and carousels jump up and down as images and text complete loading. This ruins the "premium cinematic" feel and hurts user experience metrics.

**Why it happens:**
Loading state renders text placeholders without specifying dimensions. When images resolve, the browser recalculates heights, shifting content downwards.

**How to avoid:**
Write layout-stable skeleton components with fixed aspect ratios matching the poster sizes (e.g., aspect-ratio of 2/3 for posters).

**Warning signs:**
Visual layout jumps when refreshing the page on slow 3G network simulation in devtools.

**Phase to address:**
Phase 2 (Landing Page Repair)

---

### Pitfall 3: Navigation Scroll Position Persistence Bug

**What goes wrong:**
When a user clicks a movie card at the bottom of the homepage, the detail page loads scrolled to the bottom instead of starting at the top.

**Why it happens:**
In React Router SPAs (especially with HashRouter), page navigation preserves browser scroll state unless explicitly scrolled to the top using a scroll-to-top layout wrapper.

**How to avoid:**
Add a global `ScrollToTop` wrapper component that listens to route location changes and triggers `window.scrollTo(0, 0)`.

**Warning signs:**
Detail pages mounting with content scrolled halfway down the screen.

**Phase to address:**
Phase 3 (Navigation Refinement)

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Compiling API keys in production JS | Easy configuration setup, zero backend needed. | Keys can be stolen or abused by third parties. | Acceptable only for open sandbox keys or portfolios. |
| Storing Watchlist in raw LocalStorage | Instant state persistence with zero server setup. | Watchlist is lost if user clears browser data or changes devices. | Acceptable for MVP. |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| OMDb API | Fetching rating immediately on render. | Fetch only when element is visible in viewport using Intersection Observer. |
| TMDB Image | Loading `original` resolutions for mobile list cards. | Use `w185` or `w342` sizing prefixes. |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Parallel Query Spam | High network latency, browser network requests queued. | Configure `staleTime` and pre-load caches. | >= 3 active scroll rows |
| Big Image Downloads | Stuttering page scrolling on mobile, heavy data footprint. | Add `srcSet` and size attributes to posters. | >= 20 images on screen |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Committing API Keys to Github | Keys scraped and abused by bots. | Store in `.env.local` (ensure `.env*` is in `.gitignore`). |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Missing Loading Skeletons | UI flashes blank or jumps on render. | Render clean skeleton cards with glassmorphic gradients. |
| Blocked Back Navigation | Clicking browser Back loops to the same sub-route. | Standardize routing histories and clear active state params. |

## "Looks Done But Isn't" Checklist

- [ ] **Movie Details:** Often missing IMDb ratings due to keys rate-limit — verify fallback placeholders.
- [ ] **Search Box:** Often runs API fetches on every keystroke — verify debounce search inputs.
- [ ] **Mobile Sidebar:** Often locks the viewport or gets cut off — verify sidebar layout fits 100dvh.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| API key rate-limited | LOW | Swap the API key in the environment configuration, or switch to a fallback TMDB rating. |
| Persistent scroll overlap | LOW | Re-initialize the layout container height wrapper on route changes. |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| N+1 OMDb Query limits | Phase 1 (Core Speed) | Verify network tab shows zero requests to OMDb for off-screen items. |
| Cumulative Layout Shift | Phase 2 (Landing Page) | Verify Lighthouse performance audit scores >= 90 for CLS. |
| Persistent scroll offset | Phase 3 (Navigation) | Verify detail page scrolls to top on navigation. |

## Sources

- [Vercel SEO & Performance Core Web Vitals Guides](https://vercel.com/docs/concepts/speed/core-web-vitals) — Visual layout shift prevention techniques.
- [Chrome Developer Tools: Network Throttling](https://developer.chrome.com/docs/devtools/network/reference/) — Emulating slow networks to expose rendering glitches.

---
*Pitfalls research for: Client-Side Movie Discovery Web Application (SPA)*
*Researched: 2026-06-26*
