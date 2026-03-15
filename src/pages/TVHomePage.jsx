import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import HeroSection from '../components/sections/HeroSection';
import Row from '../components/sections/Row';
import LandingSkeleton from '../components/ui/LandingSkeleton';
import { useTV } from '../contexts/TVContext';

const TV_CATEGORIES = [
  { key: 'Trending TV Shows', title: 'Trending Series', genreId: null },
  { key: 'Popular Series', title: 'Popular Series', genreId: null },
  { key: 'Top Rated Series', title: 'Top Rated Series', genreId: null },
];

function TVHomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const categories = useTV();

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

  const isLoading = Object.values(categories).some(cat => cat.loading);
  const hasError = Object.values(categories).some(cat => cat.error && cat.error !== 'No TV shows found.');

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
      <HeroSection movies={categories['Trending TV Shows']?.movies || []} />
      <main className="relative z-10 pt-8">
        {hasError ? <ErrorDisplay /> : (
           <div className="space-y-8 md:space-y-12 py-12">
             {TV_CATEGORIES.map(({ key, title, genreId }) => (
               <Row
                 key={key}
                 title={title}
                 movies={categories[key]?.movies || []}
                 loading={categories[key]?.loading}
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
