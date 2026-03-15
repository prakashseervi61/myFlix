import React, { useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import HeroSection from '../components/sections/HeroSection';
import Row from '../components/sections/Row';
import LandingSkeleton from '../components/ui/LandingSkeleton';
import { useTrendingTV, usePopularTV, useTopRatedTV } from '../hooks/useTV';

function TVHomePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const qsTTV = useTrendingTV();
  const qsPTV = usePopularTV();
  const qsTRTV = useTopRatedTV();

  const categoriesData = useMemo(() => [
    { title: 'Trending Series', query: qsTTV, exploreParams: null },
    { title: 'Popular Series', query: qsPTV, exploreParams: null },
    { title: 'Top Rated Series', query: qsTRTV, exploreParams: null },
  ], [qsTTV, qsPTV, qsTRTV]);

  const handleShowClick = (show) => {
    if (show?.id) {
       navigate(`/tv/${show.id}`);
    }
  };
  
  const handleExplore = (genreId) => {
    if (genreId) {
      navigate(`/tvshows?genre=${genreId}`);
    } else {
      navigate('/tvshows', { state: { reset: true } });
    }
  };

  const isLoading = [qsTTV, qsPTV, qsTRTV].some(q => q.isLoading);
  const hasError = [qsTTV, qsPTV, qsTRTV].some(q => q.isError);

  useEffect(() => {
    if (location.state?.reset) {
       window.scrollTo({ top: 0, behavior: 'smooth' });
       navigate('/tv', { replace: true, state: {} });
    } else {
       window.scrollTo(0, 0);
    }
  }, [location.state, navigate]);

  return (
    <div className="min-h-screen">
      <LandingSkeleton isLoading={isLoading} />
      <HeroSection movies={qsTTV.data || []} />
      <main className="relative z-10 pt-8">
        {hasError ? <ErrorDisplay /> : (
           <div className="space-y-8 md:space-y-12 py-12">
             {categoriesData.map(({ title, query, exploreParams }) => (
               <Row
                 key={title}
                 title={title}
                 movies={query.data || []}
                 loading={query.isLoading}
                 onMovieClick={handleShowClick}
                 onExplore={null} /* Usually no explore string for basic TV mixed rows yet */
               />
             ))}
           </div>
        )}
      </main>
    </div>
  );
}

const ErrorDisplay = () => (
  <div className="flex items-center justify-center h-96 text-center px-4">
    <div className="max-w-md">
      <h2 className="text-2xl font-bold text-white mb-2">Unable to Load TV Shows</h2>
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

export default TVHomePage;
