import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/sections/HeroSection';
import Row from '../components/sections/Row';
import { useMovies } from '../contexts/MovieContext';

const MOVIE_CATEGORIES = [
  { key: 'trending', title: 'Trending Now' },
  { key: 'action', title: 'Action & Adventure' },
  { key: 'comedy', title: 'Comedy' },
  { key: 'drama', title: 'Drama' },
  { key: 'horror', title: 'Horror' },
  { key: 'romance', title: 'Romance' },
];

function HomePage() {
  const navigate = useNavigate();
  const categories = useMovies();

  const handleMovieClick = (movie) => {
    if (movie?.id) {
      navigate(`/movie/${movie.id}`);
    }
  };

  const isLoading = Object.values(categories).some(cat => cat.loading);
  const hasData = Object.values(categories).some(cat => cat.movies.length > 0);
  const hasError = Object.values(categories).some(cat => cat.error && cat.error !== 'No movies found.');

  if (isLoading && !hasData) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen">
      <HeroSection movies={categories.trending?.movies || []} />
      <main className="relative z-10 bg-gray-900 pt-8">
        {hasError ? <ErrorDisplay /> : <MovieRows categories={categories} onMovieClick={handleMovieClick} />}
      </main>
    </div>
  );
}

const MovieRows = ({ categories, onMovieClick }) => (
  <div className="space-y-8 md:space-y-12 py-12">
    {MOVIE_CATEGORIES.map(({ key, title }) => (
      <Row
        key={key}
        title={title}
        movies={categories[key]?.movies || []}
        loading={categories[key]?.loading}
        onMovieClick={onMovieClick}
      />
    ))}
  </div>
);

const LoadingSkeleton = () => (
  <div className="min-h-screen">
    <div className="h-screen bg-gray-900 animate-pulse"></div>
    <div className="space-y-8 md:space-y-12 py-12 -mt-24">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="px-4 sm:px-6 lg:px-8">
          <div className="h-8 bg-gray-800 rounded-md w-1/4 mb-4"></div>
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-40 sm:w-48 md:w-56 flex-shrink-0">
                <div className="w-full aspect-[2/3] rounded-lg bg-gray-800"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ErrorDisplay = () => (
  <div className="flex items-center justify-center h-96 text-center px-4">
    <div className="max-w-md">
      <h2 className="text-2xl font-bold text-white mb-2">Unable to Load Movies</h2>
      <p className="text-gray-400 mb-6">Please check your connection and try again.</p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

export default HomePage;
