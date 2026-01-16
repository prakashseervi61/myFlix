import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/sections/HeroSection';
import Row from '../components/sections/Row';
import { useMovies } from '../contexts/MovieContext';

const MOVIE_CATEGORIES = [
  { key: 'Trending Now', title: 'Trending Now' },
  { key: 'Action', title: 'Action' },
  { key: 'Comedy', title: 'Comedy' },
  { key: 'Drama', title: 'Drama' },
  { key: 'Horror', title: 'Horror' },
  { key: 'Romance', title: 'Romance' },
];

/**
 * Homepage with hero carousel and categorized movie rows.
 * Categories are fetched and cached by MovieContext.
 */
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

  return (
    <div className="min-h-screen">
      <HeroSection movies={categories['Trending Now']?.movies || []} />
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
