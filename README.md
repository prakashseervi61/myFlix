# myFlix

A modern React single-page application for discovering movies and managing personal watchlists. Built with React 19, Vite, and Tailwind CSS, featuring a Netflix-inspired interface.

## Features

- **Movie Discovery** - Browse trending, action, comedy, and drama categories
- **Real-time Search** - Instant search with dropdown results
- **Movie Details** - Comprehensive information including cast, plot, and ratings
- **Personal Watchlist** - User-specific movie lists with persistence
- **User Authentication** - Local signup/login system
- **Responsive Design** - Mobile-first interface with touch support
- **Hero Carousel** - Auto-sliding featured movies section

## Tech Stack

- **Frontend**: React 19, React Router, Tailwind CSS
- **Build Tool**: Vite
- **Icons**: Lucide React
- **API**: OMDb API for movie data
- **Storage**: localStorage for user data and watchlists
- **Deployment**: GitHub Pages with HashRouter

## Project Structure

```
src/
├── components/
│   ├── layout/          # Header, Footer
│   ├── sections/        # HeroSection, Row
│   ├── ui/             # MovieCard, SearchDropdown, Skeletons
│   └── ErrorBoundary.jsx
├── contexts/           # React Context providers
│   ├── MovieContext.jsx
│   └── WatchlistContext.jsx
├── hooks/              # Custom React hooks
│   ├── useAuth.jsx
│   ├── useWatchlist.js
│   ├── useMovieCategories.js
│   ├── useMovieDetails.js
│   ├── useSearch.js
│   └── useMovieCardLogic.js
├── pages/              # Route components
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── WatchlistPage.jsx
│   ├── MovieDetail.jsx
│   ├── PlaceholderPage.jsx
│   └── LegalPage.jsx
├── services/
│   └── omdb.js         # API integration
├── utils/
│   └── config.js       # App configuration
└── App.jsx
```

## Routing

The app uses HashRouter for GitHub Pages compatibility:

- `/` - Home page with movie categories
- `/movies`, `/series` - Home page aliases
- `/movie/:id` - Movie details page
- `/watchlist` - User's watchlist (auth required)
- `/login`, `/signup` - Authentication pages
- `/anime`, `/new-releases` - Placeholder pages
- `/privacy`, `/terms`, `/cookies` - Legal pages

**Navigation Features:**
- True SPA behavior with no page reloads
- Proper browser back/forward support
- Automatic scroll management
- Authentication-protected routes

## Authentication

**Client-side authentication** using localStorage:
- User registration with name, email, password
- Session persistence across browser restarts
- User-specific data isolation
- No backend required

**Storage Keys:**
- `myflix_users` - All registered users
- `myflix_user` - Current user session
- `myflix-watchlist-{userId}` - User watchlists

## Watchlist System

**How it works:**
1. Users must be authenticated to add movies
2. Each user has a separate watchlist in localStorage
3. Global state management via React Context
4. Instant UI updates and persistence

**Access points:**
- Movie cards "Add to List" buttons
- Hero section "My List" button
- Movie detail page actions
- Header dropdown (desktop)
- Mobile sidebar menu

## API Integration

**OMDb API** with advanced features:
- LRU cache with 10-minute expiration
- Request rate limiting and staggering
- 20-second timeout handling
- Graceful error fallbacks
- Input sanitization and validation

**Movie Categories:**
- Trending: Marvel, Batman, Star Wars, Avengers
- Action: Fast & Furious, Mission Impossible, John Wick
- Comedy: Comedy movies and humor content
- Drama: Award-winning films and stories

## Data Flow

1. **App Load** - MovieContext fetches all categories
2. **Global Cache** - Data shared across components
3. **Search** - Real-time with debounced queries
4. **Details** - On-demand movie information
5. **No Refetch** - Navigation preserves loaded data

## Error Handling

- **Error Boundary** - Catches React component errors
- **API Failures** - Graceful degradation with user feedback
- **Storage Issues** - Fallback to in-memory state
- **Network Timeouts** - Automatic retry mechanisms
- **Invalid Data** - Input validation and sanitization

## GitHub Pages Deployment

- **HashRouter** for static hosting compatibility
- **Optimized builds** with Vite
- **Asset bundling** and compression
- **Automated deployment** via GitHub Actions

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/prakashseervi61/myFlix.git
cd myFlix

# Install dependencies
npm install

# Create environment file
echo "VITE_OMDB_API_KEY=your_api_key_here" > .env
```

### Environment Variables

```bash
# Required: Get your free API key from https://www.omdbapi.com/
VITE_OMDB_API_KEY=your_api_key_here
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

**Live Demo**: [https://prakashseervi61.github.io/myFlix](https://prakashseervi61.github.io/myFlix)