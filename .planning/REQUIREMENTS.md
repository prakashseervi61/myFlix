# Requirements: myFlix

**Defined:** 2026-06-26
**Core Value:** Enable users to seamlessly discover, track, and watchlist movies and TV shows in a fast, beautiful, and intuitive interface without requiring a backend database.

## v1 Requirements

### SPEED (Page speed optimizations)

- [ ] **SPEED-01**: The system must fetch IMDb ratings from OMDb on-demand (e.g., only when card enters viewport or when detail page is mounted) to prevent parallel network request spikes and avoid rate limiting.
- [ ] **SPEED-02**: The system must cache fetched OMDb ratings in LocalStorage and TanStack Query state to avoid redundant fetches.
- [ ] **SPEED-03**: The system must load poster images using responsive sizes (e.g. `w185` for cards, `w500` for details, `original` for backgrounds) from TMDB.

### NAV (Navigation & transitions)

- [ ] **NAV-01**: The system must reset the browser window scroll position to the top (0, 0) on every subroute navigation.
- [ ] **NAV-02**: The system must coordinate HashRouter transitions to prevent visual page overlapping or flashing during navigation.

### LAND (Landing Page Repairs)

- [ ] **LAND-01**: The Home page and TV Home page must render aspect-ratio matched loading card skeletons to eliminate Cumulative Layout Shift (CLS) during metadata resolving.
- [ ] **LAND-02**: The Home page and TV Home page hero sections must use coordinated skeleton carousels matching final rendering heights to prevent mounting shifts.

## v2 Requirements

### Watchlist

- **WCH-01**: User can categorize watchlist items by genre or format (movie/series).
- **WCH-02**: User can download their watchlist as a local JSON backup file and upload it to restore their state.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Server-Side Database Integration | Demands dedicated backend servers and hosting infrastructure, which violates the static client-side SPA architecture constraint. |
| User Comments and Reviews | Requires moderation logic, authentication servers, and database storage. |
| AI Recommendations Engine | High complexity, defer to v2+ after basic UX features are stabilized. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SPEED-01 | Phase 1 | Pending |
| SPEED-02 | Phase 1 | Pending |
| SPEED-03 | Phase 1 | Pending |
| NAV-01 | Phase 3 | Pending |
| NAV-02 | Phase 3 | Pending |
| LAND-01 | Phase 2 | Pending |
| LAND-02 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 7 total
- Mapped to phases: 7
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-26*
*Last updated: 2026-06-26 after initial definition*
