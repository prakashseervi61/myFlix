import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMovies } from '../contexts/MovieContext.jsx';
import MovieCard from '../components/ui/MovieCard.jsx';
import { Filter, Grid, List } from 'lucide-react';

const CATEGORIES = [
  { key: 'all', label: 'All Movies' },
  { key: 'trending', label: 'Trending' },
  { key: 'action', label: 'Action' },
  { key: 'comedy', label: 'Comedy' },
  { key: 'drama', label: 'Drama' },
  { key: 'horror', label: 'Horror' },
  { key: 'romance', label: 'Romance' }
];

function BrowsePage() {
  const navigate = useNavigate();
  const categories = useMovies();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const handleMovieClick = (movie) => {
    if (movie?.id) {
      navigate(`/movie/${movie.id}`);
    }
  };

  const allMovies = useMemo(() => {
    const uniqueMovies = new Map();
    Object.values(categories).forEach(cat => {
      (cat.movies || []).forEach(movie => {
        if (movie && !uniqueMovies.has(movie.id)) {
          uniqueMovies.set(movie.id, movie);
        }
      });
    });
    return Array.from(uniqueMovies.values());
  }, [categories]);

  const filteredMovies = useMemo(() =>
    selectedCategory === 'all'
      ? allMovies
      : categories[selectedCategory]?.movies || [],
    [selectedCategory, allMovies, categories]
  );

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Browse Movies</h1>
          <p className="text-lg text-gray-400 mt-1">Discover your next favorite film.</p>
        </header>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {CATEGORIES.map(option => (
                <option key={option.key} value={option.key}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <ViewModeButton current={viewMode} mode="grid" setViewMode={setViewMode}><Grid size={20} /></ViewModeButton>
            <ViewModeButton current={viewMode} mode="list" setViewMode={setViewMode}><List size={20} /></ViewModeButton>
          </div>
        </div>

        {filteredMovies.length > 0 ? (
          <div className={`transition-all duration-300 ${
            viewMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
              : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          }`}>
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} onClick={handleMovieClick} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold text-white">No Movies Found</h2>
            <p className="text-gray-400 mt-2">Try a different category or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const ViewModeButton = ({ current, mode, setViewMode, children }) => (
  <button
    onClick={() => setViewMode(mode)}
    className={`p-2 rounded-md transition-colors ${
      current === mode
        ? 'bg-cyan-600 text-white'
        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
    }`}
    aria-label={`Switch to ${mode} view`}
  >
    {children}
  </button>
);

export default BrowsePage;