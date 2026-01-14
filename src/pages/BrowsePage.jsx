import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { Grid, List, Loader2 } from 'lucide-react';
import { tmdbService } from '../services/tmdbService.js';
import { useFilters } from '../hooks/useFilters.js';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver.js';
import FilterPanel from '../components/FilterPanel.jsx';
import MovieCard from '../components/ui/MovieCard.jsx';
import MovieCardSkeleton from '../components/ui/MovieCardSkeleton.jsx';

function BrowsePage() {
  const navigate = useNavigate();
  const { filters, updateFilter, resetFilters } = useFilters();
  const [debouncedFilters] = useDebounce(filters, 500);
  
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreRef = useIntersectionObserver({
    enabled: !loading && hasMore,
    onIntersect: () => setPage(p => p + 1)
  });

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genreList = await tmdbService.getGenres();
        setGenres(genreList);
      } catch (e) {
        console.error('Failed to load genres');
      }
    };
    fetchGenres();
  }, []);

  // Reset on filter change
  useEffect(() => {
    setPage(1);
    setMovies([]);
    setHasMore(true);
    window.scrollTo(0, 0);
  }, [debouncedFilters]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = {
          ...debouncedFilters,
          with_genres: debouncedFilters.with_genres.join(','),
          page
        };

        let results = await tmdbService.discoverMovies(params, controller.signal);

        if (debouncedFilters.only_with_trailer && results.length > 0) {
           const trailerChecks = await Promise.allSettled(
             results.map(movie => tmdbService.getMovieVideos(movie.id))
           );
           
           const moviesWithTrailers = new Set();
           trailerChecks.forEach((result, index) => {
             if (result.status === 'fulfilled' && result.value && result.value.some(v => v.site === 'YouTube' && v.type === 'Trailer')) {
               moviesWithTrailers.add(results[index].id);
             }
           });
           
           results = results.filter(m => moviesWithTrailers.has(Number(m.id)));
        }

        if (isMounted) {
          if (results.length < 20) setHasMore(false);
          setMovies(prev => page === 1 ? results : [...prev, ...results]);
        }
      } catch (err) {
        if (isMounted && err.name !== 'AbortError') {
          setError('Failed to load movies. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMovies();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [debouncedFilters, page]);

  const handleMovieClick = (movie) => {
    if (movie?.id) {
      navigate(`/movie/${movie.id}`);
    }
  };

  const initialLoading = loading && page === 1;

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Browse Movies</h1>
          <p className="text-sm sm:text-lg text-gray-400 mt-1">Discover your next favorite film.</p>
        </header>

        <div className="flex flex-col md:flex-row gap-6">
          <aside className="md:w-80 flex-shrink-0">
             <FilterPanel 
               filters={filters} 
               onChange={updateFilter} 
               onReset={resetFilters} 
               genres={genres}
               className="rounded-xl border border-gray-800"
             />
          </aside>

          <div className="flex-1">
            <div className="flex justify-end mb-4">
               <div className="flex items-center gap-2 bg-gray-900 p-1 rounded-lg border border-gray-800">
                <ViewModeButton current={viewMode} mode="grid" setViewMode={setViewMode}><Grid size={18} /></ViewModeButton>
                <ViewModeButton current={viewMode} mode="list" setViewMode={setViewMode}><List size={18} /></ViewModeButton>
              </div>
            </div>

            {initialLoading ? (
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
                {Array.from({ length: 10 }).map((_, i) => <MovieCardSkeleton key={i} />)}
              </div>
            ) : (
              <>
                <div className={`transition-all duration-300 ${
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4'
                    : 'grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4'
                }`}>
                  {movies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} onClick={handleMovieClick} />
                  ))}
                  
                  {loading && !initialLoading && Array.from({ length: 5 }).map((_, i) => (
                    <MovieCardSkeleton key={`skeleton-${i}`} />
                  ))}
                </div>

                {/* Sentinel for infinite scroll */}
                <div ref={loadMoreRef} className="h-4 w-full" />

                {error && page === 1 && (
                  <div className="text-center py-20 bg-gray-900 rounded-xl border border-gray-800 mt-4">
                    <h2 className="text-xl font-semibold text-white">Error</h2>
                    <p className="text-gray-400 mt-2">{error}</p>
                    <button onClick={() => setPage(1)} className="mt-4 text-cyan-400 hover:underline">Retry</button>
                  </div>
                )}
                
                {error && page > 1 && (
                  <div className="text-center py-8">
                     <p className="text-red-400 mb-2">Failed to load more.</p>
                     <button onClick={() => setPage(p => p)} className="text-cyan-400 hover:underline">Try Again</button>
                  </div>
                )}

                {!hasMore && movies.length > 0 && (
                   <div className="text-center py-10 text-gray-500 text-sm">
                     You've reached the end of the list.
                   </div>
                )}

                {movies.length === 0 && !loading && !error && (
                  <div className="text-center py-20 bg-gray-900 rounded-xl border border-gray-800">
                    <h2 className="text-xl font-semibold text-white">No Movies Found</h2>
                    <p className="text-gray-400 mt-2">Try adjusting your filters.</p>
                    <button onClick={resetFilters} className="mt-4 text-cyan-400 hover:underline">Reset Filters</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const ViewModeButton = ({ current, mode, setViewMode, children }) => (
  <button
    onClick={() => setViewMode(mode)}
    className={`p-2 rounded-md transition-colors ${
      current === mode
        ? 'bg-cyan-600 text-white shadow-sm'
        : 'text-gray-400 hover:text-white hover:bg-gray-800'
    }`}
    aria-label={`Switch to ${mode} view`}
  >
    {children}
  </button>
);

export default BrowsePage;
