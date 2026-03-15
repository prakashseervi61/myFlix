import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import HeroSection from '../components/sections/HeroSection';
import Row from '../components/sections/Row';
import LandingSkeleton from '../components/ui/LandingSkeleton';
import { useMovies } from '../contexts/MovieContext';
import { useTV } from '../contexts/TVContext';
import { useBrowseState } from '../contexts/BrowseContext';

const MIXED_CATEGORIES = [
  { type: 'movie', key: 'Trending Now', title: 'Trending Movies', genreId: null },
  { type: 'tv', key: 'Trending TV Shows', title: 'Trending TV Shows', genreId: null },
  { type: 'tv', key: 'Popular Series', title: 'Popular Series', genreId: null },
  { type: 'movie', key: 'Action', title: 'Action Movies', genreId: '28' },
  { type: 'tv', key: 'Top Rated Series', title: 'Top Rated Series', genreId: null },
  { type: 'movie', key: 'Comedy', title: 'Comedy Movies', genreId: '35' },
  { type: 'movie', key: 'Drama', title: 'Drama Movies', genreId: '18' },
  { type: 'movie', key: 'Horror', title: 'Horror Movies', genreId: '27' },
  { type: 'movie', key: 'Romance', title: 'Romance Movies', genreId: '10749' },
];

/**
 * Homepage with hero carousel and categorized movie/TV rows.
 * Categories are fetched and cached by Contexts.
 */
function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const movieCategories = useMovies();
  const tvCategories = useTV();
  const { homeScrollPosition, setHomeScrollPosition } = useBrowseState();

  const handleMovieClick = (item) => {
    if (item?.id) {
      if (item.media_type === 'tv' || item.number_of_seasons !== undefined || (!item.release_date && item.first_air_date)) {
         navigate(`/tv/${item.id}`);
      } else {
         navigate(`/movie/${item.id}`);
      }
    }
  };
  
  const handleExplore = (genreId) => {
    if (genreId) {
      navigate(`/browse?genre=${genreId}`);
    } else {
      navigate('/browse', { state: { reset: true } });
    }
  };

  const isLoading = Object.values(movieCategories).some(cat => cat.loading) || Object.values(tvCategories).some(cat => cat.loading);
  const hasData = Object.values(movieCategories).some(cat => cat.movies?.length > 0) || Object.values(tvCategories).some(cat => cat.movies?.length > 0);
  const hasError = Object.values(movieCategories).some(cat => cat.error && cat.error !== 'No movies found.');

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

  // Mix Movies and TV Shows for Hero Section (Max 5)
  const trendingMovies = movieCategories['Trending Now']?.movies || [];
  const trendingTV = tvCategories['Trending TV Shows']?.movies || [];
  const mixedHeroItems = [];
  const maxLength = Math.max(trendingMovies.length, trendingTV.length);
  for (let i = 0; i < maxLength; i++) {
    if (trendingMovies[i]) mixedHeroItems.push(trendingMovies[i]);
    if (trendingTV[i]) mixedHeroItems.push(trendingTV[i]);
    if (mixedHeroItems.length >= 5) break;
  }
  const heroItems = mixedHeroItems.slice(0, 5);

  return (
    <div className="min-h-screen">
      <LandingSkeleton isLoading={isLoading} />
      <HeroSection movies={heroItems} />
      <main className="relative z-10 pt-8">
        {hasError ? <ErrorDisplay /> : <ContentRows movieCategories={movieCategories} tvCategories={tvCategories} onMovieClick={handleMovieClick} onExplore={handleExplore} />}
      </main>
    </div>
  );
}

const ContentRows = ({ movieCategories, tvCategories, onMovieClick, onExplore }) => (
  <div className="space-y-8 md:space-y-12 py-12">
    {MIXED_CATEGORIES.map(({ type, key, title, genreId }) => {
      const categoryData = type === 'tv' ? tvCategories[key] : movieCategories[key];
      return (
        <Row
          key={`${type}-${key}`}
          title={title}
          movies={categoryData?.movies || []}
          loading={categoryData?.loading}
          onMovieClick={onMovieClick}
          onExplore={type === 'movie' ? () => onExplore(genreId) : undefined}
        />
      );
    })}
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
