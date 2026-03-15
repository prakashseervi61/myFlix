import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import HeroSection from '../components/sections/HeroSection';
import Row from '../components/sections/Row';
import LandingSkeleton from '../components/ui/LandingSkeleton';
import { useMovies } from '../contexts/MovieContext';
import { useBrowseState } from '../contexts/BrowseContext';

const MOVIE_CATEGORIES = [
  { key: 'Trending Now', title: 'Trending Now', genreId: null },
  { key: 'Action', title: 'Action', genreId: '28' },
  { key: 'Comedy', title: 'Comedy', genreId: '35' },
  { key: 'Drama', title: 'Drama', genreId: '18' },
  { key: 'Horror', title: 'Horror', genreId: '27' },
  { key: 'Romance', title: 'Romance', genreId: '10749' },
];

/**
 * Homepage with hero carousel and categorized movie rows.
 * Categories are fetched and cached by MovieContext.
 */
function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const categories = useMovies();
  const { homeScrollPosition, setHomeScrollPosition } = useBrowseState();

  const handleMovieClick = (movie) => {
    if (movie?.id) {
      navigate(`/movie/${movie.id}`);
    }
  };
  
  const handleExplore = (genreId) => {
    if (genreId) {
      navigate(`/browse?genre=${genreId}`);
    } else {
      navigate('/browse', { state: { reset: true } });
    }
  };

  const isLoading = Object.values(categories).some(cat => cat.loading);
  const hasData = Object.values(categories).some(cat => cat.movies.length > 0);
  const hasError = Object.values(categories).some(cat => cat.error && cat.error !== 'No movies found.');

  // Restore scroll position
  useEffect(() => {
    if (location.state?.reset) {
      setHomeScrollPosition(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      navigate('/', { replace: true, state: {} });
      return;
    }

    if (homeScrollPosition > 0 && hasData && !isLoading) {
      const timer = setTimeout(() => {
        window.scrollTo({ top: homeScrollPosition, behavior: 'auto' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [hasData, isLoading, homeScrollPosition, location.state, navigate, setHomeScrollPosition]);

  // Save scroll on unmount
  useEffect(() => {
    return () => {
      setHomeScrollPosition(window.scrollY);
    };
  }, [setHomeScrollPosition]);

  return (
    <div className="min-h-screen">
      <LandingSkeleton isLoading={isLoading} />
      <HeroSection movies={categories['Trending Now']?.movies || []} />
      <main className="relative z-10 pt-8">
        {hasError ? <ErrorDisplay /> : <MovieRows categories={categories} onMovieClick={handleMovieClick} onExplore={handleExplore} />}
      </main>
    </div>
  );
}

const MovieRows = ({ categories, onMovieClick, onExplore }) => (
  <div className="space-y-8 md:space-y-12 py-12">
    {MOVIE_CATEGORIES.map(({ key, title, genreId }) => (
      <Row
        key={key}
        title={title}
        movies={categories[key]?.movies || []}
        loading={categories[key]?.loading}
        onMovieClick={onMovieClick}
        onExplore={() => onExplore(genreId)}
      />
    ))}
  </div>
);

const ErrorDisplay = () => (
  <div className="flex items-center justify-center h-96 text-center px-4">
    <div className="max-w-md">
      <h2 className="text-2xl font-bold text-white mb-2">Unable to Load Movies</h2>
      <p className="text-muted mb-6">Please check your connection and try again.</p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-2 primary-button text-white font-semibold rounded-md shadow-lg shadow-black/20"
      >
        Try Again
      </button>
    </div>
  </div>
);

export default HomePage;
