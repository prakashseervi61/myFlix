import React, { useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import HeroSection from './components/sections/HeroSection'
import Row from './components/sections/Row'
import MovieDetail from './pages/MovieDetail'
import PlaceholderPage from './pages/PlaceholderPage'
import LegalPage from './pages/LegalPage'
import ErrorBoundary from './components/ErrorBoundary'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import { AuthProvider } from './hooks/useAuth.jsx'
import { MovieProvider, useMovies } from './contexts/MovieContext.jsx'

// Move HomePage outside App to prevent remounting
function HomePage() {
  const navigate = useNavigate();
  const categories = useMovies();

  const handleMovieClick = (movie) => {
    // Defensive check to prevent navigation crashes
    if (!movie?.id) {
      console.warn('Cannot navigate: movie ID is missing', movie);
      return;
    }
    navigate(`/movie/${movie.id}`);
  };

  const hasAnyError = Object.values(categories).some(cat => cat.error);
  const isAnyLoading = Object.values(categories).some(cat => cat.loading);
  const hasAnyData = Object.values(categories).some(cat => cat.movies.length > 0);

  // Show loading state on initial load
  if (isAnyLoading && !hasAnyData) {
    return (
      <>
        <div className="h-96 bg-gradient-to-r from-gray-800 to-gray-900 animate-pulse"></div>
        <main className="space-y-8 py-12">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="mb-8">
              <div className="h-8 bg-gray-700 rounded w-48 mb-6 mx-4"></div>
              <div className="flex gap-4 px-4 overflow-hidden">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="min-w-[200px] aspect-[2/3] md:aspect-[16/9] bg-gray-700 rounded-xl animate-pulse"></div>
                ))}
              </div>
            </div>
          ))}
        </main>
      </>
    );
  }

  return (
    <>
      <HeroSection movies={categories.trending?.movies} />
      <main>
        {hasAnyError ? (
          <div className="py-12 px-4 text-center">
            <div className="max-w-md mx-auto">
              <h2 className="text-white text-xl font-semibold mb-2">Unable to Load Movies</h2>
              <p className="text-gray-400 text-sm mb-4">Please check your connection and try again</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 py-12">
            <Row 
              title="Trending Now" 
              movies={categories.trending.movies} 
              loading={categories.trending.loading}
              onMovieClick={handleMovieClick}
            />
            <Row 
              title="Action & Adventure" 
              movies={categories.action.movies} 
              loading={categories.action.loading}
              onMovieClick={handleMovieClick}
            />
            <Row 
              title="Comedy" 
              movies={categories.comedy.movies} 
              loading={categories.comedy.loading}
              onMovieClick={handleMovieClick}
            />
            <Row 
              title="Drama" 
              movies={categories.drama.movies} 
              loading={categories.drama.loading}
              onMovieClick={handleMovieClick}
            />
          </div>
        )}
      </main>
    </>
  );
}

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  
  // Only scroll to top on mount, not on every navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <AuthProvider>
      <MovieProvider>
        <ErrorBoundary>
          <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
            {!isAuthPage && <Header />}
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/movies" element={<HomePage />} />
              <Route path="/series" element={<HomePage />} />
              <Route path="/anime" element={<PlaceholderPage />} />
              <Route path="/new-releases" element={<PlaceholderPage />} />
              <Route path="/movie/:id" element={<MovieDetail />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/page/:section" element={<PlaceholderPage />} />
              <Route path="/privacy" element={<LegalPage type="privacy" />} />
              <Route path="/terms" element={<LegalPage type="terms" />} />
              <Route path="/cookies" element={<LegalPage type="cookies" />} />
            </Routes>
            {!isAuthPage && <Footer />}
          </div>
        </ErrorBoundary>
      </MovieProvider>
    </AuthProvider>
  )
}

export default App