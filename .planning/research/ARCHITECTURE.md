# Architecture Research

**Domain:** Client-Side Movie Discovery Web Application (SPA)
**Researched:** 2026-06-26
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                       Component Layer                       │
│  [Layout/App]     [Home/Pages]     [MovieCard]    [Skeletons]│
├─────────────────────────────────────────────────────────────┤
│                    Hooks & Local State Layer                │
│  [useMovies]      [useTV]          [useQueries]   [uiStore]  │
├─────────────────────────────────────────────────────────────┤
│                        Services Layer                       │
│  [tmdbService]    [omdbService]    [tvMazeService]          │
├─────────────────────────────────────────────────────────────┤
│                        Context/Store Layer                  │
│  [WatchlistContext] [AuthContext]   [LocalStorage]          │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| App Shell (`App.jsx`) | Sets up routing, layout structure (Navbar/Sidebar), context providers. | React Router DOM `HashRouter`, Context Providers. |
| Page Views (`src/pages/*`) | Coordinate data hooks, loading skeletons, and row render layouts. | Page containers with React Query queries. |
| UI Widgets (`src/components/*`) | Atomic reusable display blocks (e.g. MovieCard, rating badge, skeleton blocks). | Functional React components styled with Tailwind CSS. |

## Recommended Project Structure

No folders are added, but we define files in the existing structure:
```
src/
├── components/          # Reusable UI elements
│   ├── layout/          # Layout blocks (Navbar, Sidebar, Footer)
│   └── ui/              # Buttons, Cards, Skeletons
├── config/              # API keys and environment setups
├── contexts/            # Global Contexts (Watchlist)
├── hooks/               # Custom React hooks (useAuth, useMovies)
├── pages/               # Routed page containers
├── services/            # API wrapper files (tmdb, omdb, tvmaze)
└── store/               # State store files (Zustand uiStore)
```

## Architectural Patterns

### Pattern 1: On-Demand Rating Fetching with React Query Cache

**What:** Instead of querying OMDb for all movies returned by TMDB trending lists simultaneously on mounting, ratings are fetched on-demand (e.g., when a card is hovered, or inside the `<MovieCard>` once it enters the viewport via IntersectionObserver, or exclusively on the detail page).
**When to use:** When rendering list grids or carousels where external secondary metadata (OMDb) is required per item.
**Trade-offs:** Avoids rate limits but introduces a slight delay before ratings appear on card widgets.

### Pattern 2: Skeleton Layout Alignments

**What:** Rendering dummy card rows with explicit heights and widths matching the loaded card states.
**When to use:** Prior to API resolutions on initial mount.
**Trade-offs:** Eliminates Cumulative Layout Shift (CLS), improving SEO and user experience.

## Data Flow

### Request Flow for OMDb Ratings

```
[MovieCard Mounts]
       ↓
[IntersectionObserver detects viewport]
       ↓
[React Query fires query for IMDb ID]
       ↓
[Checks cache first]
  ├─(Hit)──> [Return cached rating]
  └─(Miss)─> [Fetch from OMDb] ──> [Cache in React Query] ──> [Render badge]
```

### State Management

```
[LocalStorage] ──> [Context Provider (Watchlist/Auth)] ──> [React Components]
                                  ↑ (Actions)
                         [User add/remove watchlist]
```

## Scaling Considerations

Since the project operates as a static client-side SPA, traditional scaling limits apply to API rate thresholds:

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1-1k daily users | TMDB/OMDb client-side direct API keys are sufficient (daily limit ~1,000 requests per key). |
| 1k-10k daily users | LocalStorage rating caching: storing fetched OMDb ratings in local storage to eliminate repeated OMDb requests for the same movie across page reloads. |

## Anti-Patterns

### Anti-Pattern 1: Parallel fetch spam on Mount

**What people do:** Let the parent container map over 20 movies and trigger 20 immediate parallel fetch calls to OMDb API inside `useEffect`.
**Why it's wrong:** Spams the client's network queue, triggers rate-limiting blocks on public keys, and stalls page rendering.
**Do this instead:** Load rating badges lazily using a viewport-aware ratings loader or deferred details.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| TMDB API | React Query Service Fetches | Retrieves trending lists, search grids, and posters. |
| OMDb API | Viewport-Lazy hook queries | Retrieves specific IMDb rating scores using the TMDB imdb_id. |
| TVMaze API | React Query Fetches | Retrieves structured episodic listings for TV shows. |

## Sources

- [Vite Config Guidelines](https://vite.dev/config/) — Hot module replacement and client environment injection.
- [React Query Caching Strategy](https://tanstack.com/query/v5/docs/framework/react/guides/caching) — Query key architecture and background synchronization.

---
*Architecture research for: Client-Side Movie Discovery Web Application (SPA)*
*Researched: 2026-06-26*
