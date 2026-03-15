import React, { useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import HeroSection from '../components/sections/HeroSection';
import Row from '../components/sections/Row';
import LandingSkeleton from '../components/ui/LandingSkeleton';
import { useTrendingMovies, useMoviesByGenre } from '../hooks/useMovies';

function MoviesHomePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const qsTM = useTrendingMovies();
  const qsAM = useMoviesByGenre('28', 'Action');
  const qsCM = useMoviesByGenre('35', 'Comedy');
  const qsDM = useMoviesByGenre('18', 'Drama');
  const qsHM = useMoviesByGenre('27', 'Horror');
  const qsRM = useMoviesByGenre('10749', 'Romance');

  const categoriesData = useMemo(() => [
    { title: 'Trending Movies', query: qsTM, exploreParams: null },
    { title: 'Action Movies', query: qsAM, exploreParams: '28' },
    { title: 'Comedy Movies', query: qsCM, exploreParams: '35' },
    { title: 'Drama Movies', query: qsDM, exploreParams: '18' },
    { title: 'Horror Movies', query: qsHM, exploreParams: '27' },
    { title: 'Romance Movies', query: qsRM, exploreParams: '10749' },
  ], [qsTM, qsAM, qsCM, qsDM, qsHM, qsRM]);

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

  const isLoading = [qsTM, qsAM, qsCM, qsDM, qsHM, qsRM].some(q => q.isLoading);
  const hasError = [qsTM, qsAM, qsCM, qsDM, qsHM, qsRM].some(q => q.isError);

  useEffect(() => {
    if (location.state?.reset) {
       window.scrollTo({ top: 0, behavior: 'smooth' });
       navigate('/movies', { replace: true, state: {} });
    } else {
       window.scrollTo(0, 0);
    }
  }, [location.state, navigate]);

  return (
    <div className="min-h-screen">
      <LandingSkeleton isLoading={isLoading} />
      <HeroSection movies={qsTM.data || []} />
      <main className="relative z-10 pt-8">
        {hasError ? <ErrorDisplay /> : (
           <div className="space-y-8 md:space-y-12 py-12">
             {categoriesData.map(({ title, query, exploreParams }) => (
               <Row
                 key={title}
                 title={title}
                 movies={query.data || []}
                 loading={query.isLoading}
                 onMovieClick={handleMovieClick}
                 onExplore={() => handleExplore(exploreParams)}
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

export default MoviesHomePage;
