import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { Search, X } from 'lucide-react';
import { useSearch } from '../hooks/useSearch.js';
import MovieCard from '../components/ui/MovieCard.jsx';
import MovieCardSkeleton from '../components/ui/MovieCardSkeleton.jsx';

function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 500);
  const { searchResults, loading, error, searchMovies, clearResults } = useSearch();

  useEffect(() => {
    if (debouncedQuery.trim()) {
      searchMovies(debouncedQuery);
    } else {
      clearResults();
    }
  }, [debouncedQuery, searchMovies, clearResults]);

  const handleMovieClick = (movie) => {
    if (movie?.id) {
      navigate(`/movie/${movie.id}`);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Search</h1>
          <p className="text-lg text-gray-400 mt-1">Find your next favorite movie.</p>
        </header>

        <div className="relative mb-8 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for movies, actors, directors..."
            className="w-full pl-12 pr-10 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              aria-label="Clear search"
            >
              <X size={20} />
            </button>
          )}
        </div>
        
        <RenderContent
          loading={loading}
          error={error}
          query={debouncedQuery}
          results={searchResults}
          onClick={handleMovieClick}
        />
      </div>
    </div>
  );
}

const RenderContent = ({ loading, error, query, results, onClick }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => <MovieCardSkeleton key={i} />)}
      </div>
    );
  }

  if (error) {
    return <StatusDisplay title="Search Error" message={error} />;
  }

  if (query && results.length === 0) {
    return <StatusDisplay title="No Results Found" message={`No movies found for "${query}".`} />;
  }
  
  if (results.length > 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {results.map(movie => (
          <MovieCard key={movie.id} movie={movie} onClick={onClick} />
        ))}
      </div>
    );
  }

  return <StatusDisplay title="Find a Movie" message="Enter a search term to begin." />;
};

const StatusDisplay = ({ title, message }) => (
  <div className="text-center py-16">
    <h2 className="text-2xl font-semibold text-white">{title}</h2>
    <p className="text-gray-400 mt-2">{message}</p>
  </div>
);

export default SearchPage;