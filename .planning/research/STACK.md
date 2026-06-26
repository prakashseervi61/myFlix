# Stack Research

**Domain:** Client-Side Movie Discovery Web Application (SPA)
**Researched:** 2026-06-26
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | 19.2.0 | Frontend UI Rendering | Core framework in use. React 19 provides concurrent rendering features which help coordinate UI loading transitions smoothly. |
| Vite | 7.2.2 | Development Server & Build Tool | Fast build/bundling and hot module replacement. Needs config tuning for proxying external assets/requests. |
| Tailwind CSS | v4.1.17 | Utility-First Styling | Implements rapid UI layout design, transitions, and responsive styles without complex custom stylesheets. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tanstack/react-query | 5.90.21 | Server State Caching & Fetching | Deduplicates, caches, and handles query states (loading, errors, success) for TMDB/OMDb API responses. Essential for solving N+1 fetches. |
| Zustand | 5.0.11 | UI Global State Management | Manages client-only UI configurations like navigation sidebars, scroll layout synchronization, active route tabs. |
| React Router DOM | 7.10.1 | Client Router | Handles URL synchronization and page routing transitions via HashRouter for static deployment environments. |
| Lucide React | 0.554.0 | SVG Icons | Elegant and performant vector icon library for smooth, responsive UI widgets. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Vite Dev Server Proxy | Bypasses local CORS limitations and acts as a minor gateway during local development. | Add proxy configuration in `vite.config.js` to simulate routing or throttle requests during load-speed testing. |

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| React Query Caching & Batching | Custom Local Cache System | If we wanted to avoid the TanStack Query dependency footprint, but TanStack Query is already installed and handles background refetching and cache invalidation. |
| Native TMDB Image Srcset | Dedicated Image CDN proxy | If we wanted dynamic resizing/compression, but TMDB already supports multiple poster sizes natively via path names (`w92`, `w154`, `w185`, `w342`, `w500`, `w780`, `original`). |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Multiple Custom Axios Instances | Multiplies configuration overhead, complicates request interceptors and token rotation. | Fetch API with standard client wrappers or unified fetch utilities. |
| Hardcoded API Keys in Components | Exposes developer credentials in Git repository history and client files. | Secure environment variables `.env` and client-side config wrappers. |

## Stack Patterns by Variant

**If optimizing N+1 queries:**
- Use TanStack Query's `useQueries` hook or a query batching utility.
- Because it allows parallel fetches to be batched and cached together, avoiding blocking the main thread.

**If loading responsive posters:**
- Use the native HTML `<img>` tag with `src` and `srcSet` referencing TMDB's native sizes (`w185` for mobile, `w500` for tablet/desktop, and `original` for backgrounds).
- Because it lets the browser determine and download the smallest necessary image size based on the layout resolution, saving mobile bandwidth.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| React 19.2.0 | TanStack Query v5 | Fully compatible. React Query v5 supports React 19 out of the box with `useQueryClient` and concurrent render utilities. |

## Sources

- [TanStack Query Documentation](https://tanstack.com/query/v5) — Query cache configuration and parallel query execution logic.
- [TMDB API Documentation](https://developer.themoviedb.org/) — Image sizes configuration (w185, w500, original) and backdrop URL schema.
- [MDN Web Docs: Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images) — Guidelines on setting up responsive image srcSet attributes.

---
*Stack research for: Client-Side Movie Discovery Web Application (SPA)*
*Researched: 2026-06-26*
