import React, { useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import HeroSection from '../components/sections/HeroSection';
import Row from '../components/sections/Row';
import LandingSkeleton from '../components/ui/LandingSkeleton';
import { useUIStore } from '../store/uiStore.js';
import { useTrendingMovies, useMoviesByGenre } from '../hooks/useMovies';
import { useTrendingTV, usePopularTV, useTopRatedTV } from '../hooks/useTV';

/**
 * Homepage with hero carousel and categorized movie/TV rows.
 * Categories are fetched using individual React Query hooks.
 */
function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { homeScrollPosition, setHomeScrollPosition } = useUIStore();

  // Fetch all rows
  const qsTM = useTrendingMovies();
  const qsTTV = useTrendingTV();
  const qsPTV = usePopularTV();
  const qsAM = useMoviesByGenre('28', 'Action');
  const qsTRTV = useTopRatedTV();
  const qsCM = useMoviesByGenre('35', 'Comedy');
  const qsDM = useMoviesByGenre('18', 'Drama');
  const qsHM = useMoviesByGenre('27', 'Horror');
  const qsRM = useMoviesByGenre('10749', 'Romance');

  const isLoading = [qsTM, qsTTV, qsPTV, qsAM, qsTRTV, qsCM, qsDM, qsHM, qsRM].some(q => q.isLoading);
  const hasError = [qsTM, qsTTV, qsPTV, qsAM, qsTRTV, qsCM, qsDM, qsHM, qsRM].some(q => q.isError);
  const hasData = [qsTM, qsTTV, qsPTV, qsAM, qsTRTV, qsCM, qsDM, qsHM, qsRM].some(q => q.data?.length > 0);

  const categoriesData = useMemo(() => [
    { title: 'Trending Movies', query: qsTM, exploreParams: null },
    { title: 'Trending TV Shows', query: qsTTV, exploreParams: null },
    { title: 'Popular Series', query: qsPTV, exploreParams: null },
    { title: 'Action Movies', query: qsAM, exploreParams: '28' },
    { title: 'Top Rated Series', query: qsTRTV, exploreParams: null },
    { title: 'Comedy Movies', query: qsCM, exploreParams: '35' },
    { title: 'Drama Movies', query: qsDM, exploreParams: '18' },
    { title: 'Horror Movies', query: qsHM, exploreParams: '27' },
    { title: 'Romance Movies', query: qsRM, exploreParams: '10749' },
  ], [qsTM, qsTTV, qsPTV, qsAM, qsTRTV, qsCM, qsDM, qsHM, qsRM]);


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
  const trendingMovies = qsTM.data || [];
  const trendingTV = qsTTV.data || [];
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
        {hasError ? <ErrorDisplay /> : <ContentRows categoriesData={categoriesData} onMovieClick={handleMovieClick} onExplore={handleExplore} />}
      </main>
    </div>
  );
}

const ContentRows = ({ categoriesData, onMovieClick, onExplore }) => (
  <div className="space-y-8 md:space-y-12 py-12">
    {categoriesData.map(({ title, query, exploreParams }) => (
      <Row
        key={title}
        title={title}
        movies={query.data || []}
        loading={query.isLoading}
        onMovieClick={onMovieClick}
        onExplore={exploreParams ? () => onExplore(exploreParams) : undefined}
      />
    ))}
  </div>
);

const ErrorDisplay = () => (
  <div className="flex items-center justify-center h-96 text-center px-4">
    <div className="max-w-md">
      <h2 className="text-2xl font-bold text-white mb-2">Unable to Load Content</h2>
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
