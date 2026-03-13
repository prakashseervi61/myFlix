import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { Grid, List, Loader2 } from 'lucide-react';
import { tmdbService } from '../services/tmdbService.js';
import { useFilters } from '../hooks/useFilters.js';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver.js';
import FilterPanel from '../components/FilterPanel.jsx';
import MovieCard from '../components/ui/MovieCard.jsx';
import MovieCardSkeleton from '../components/ui/MovieCardSkeleton.jsx';
import MovieListItem from '../components/ui/MovieListItem.jsx';
import MovieListItemSkeleton from '../components/ui/MovieListItemSkeleton.jsx';
import BackToTop from '../components/ui/BackToTop.jsx';

/**
 * Browse page with advanced filtering and infinite scroll.
 * Filters are debounced to reduce API calls.
 * Trailer filter requires client-side checking (not supported by TMDB API).
 */
function BrowsePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { filters, updateFilter, resetFilters } = useFilters();
  const [debouncedFilters] = useDebounce(filters, 500);
  
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const viewMode = searchParams.get('view') || 'grid';

  const handleViewModeChange = (mode) => {
    setSearchParams(prev => {
      prev.set('view', mode);
      return prev;
    }, { replace: true });
  };

  /** Sentinel element for infinite scroll trigger */
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

  useEffect(() => {
    setPage(1);
    setMovies([]);
    setHasMore(true);
  }, [debouncedFilters]);

  useEffect(() => {
    if (page === 1) {
      window.scrollTo(0, 0);
    }
  }, [debouncedFilters, page]);

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

        /** Client-side trailer filtering since TMDB API doesn't support it */
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

           results = results
             .filter(m => moviesWithTrailers.has(String(m.id)))
             .map(m => ({ ...m, has_trailer: true }));
        } else {
          results = results.map(m => ({ ...m, has_trailer: false }));
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
          <p className="text-sm sm:text-lg text-[#C0927C] mt-1">Discover your next favorite film.</p>
        </header>

        <div className="flex flex-col md:flex-row gap-6">
          <aside className="md:w-80 flex-shrink-0">
             <FilterPanel 
               filters={filters} 
               onChange={updateFilter} 
               onReset={resetFilters} 
               genres={genres}
               className="rounded-xl border border-[#C0927C]/20"
             />
          </aside>

          <div className="flex-1">
            <div className="flex justify-end mb-4">
               <div className="flex items-center gap-2 bg-[#5E4A65] p-1 rounded-lg border border-[#C0927C]/20">
                <ViewModeButton current={viewMode} mode="grid" setViewMode={handleViewModeChange}><Grid size={18} /></ViewModeButton>
                <ViewModeButton current={viewMode} mode="list" setViewMode={handleViewModeChange}><List size={18} /></ViewModeButton>
              </div>
            </div>

            {initialLoading ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' : 'flex flex-col gap-4'}>
                {Array.from({ length: 10 }).map((_, i) =>
                  viewMode === 'grid' ? <MovieCardSkeleton key={i} /> : <MovieListItemSkeleton key={i} />
                )}
              </div>
            ) : (
              <>
                <div className={`transition-all duration-300 ${
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4'
                    : 'flex flex-col gap-3 sm:gap-4'
                }`}>
                  {movies.map((movie) =>
                    viewMode === 'grid' ? (
                      <MovieCard key={movie.id} movie={movie} onClick={handleMovieClick} />
                    ) : (
                      <MovieListItem key={movie.id} movie={movie} />
                    )
                  )}
                  
                  {loading && !initialLoading && Array.from({ length: 5 }).map((_, i) =>
                    viewMode === 'grid' ? <MovieCardSkeleton key={`skeleton-${i}`} /> : <MovieListItemSkeleton key={`skeleton-${i}`} />
                  )}
                </div>

                <div ref={loadMoreRef} className="h-4 w-full" />

                {error && page === 1 && (
                  <div className="text-center py-20 bg-[#5E4A65] rounded-xl border border-[#C0927C]/20 mt-4">
                    <h2 className="text-xl font-semibold text-white">Error</h2>
                    <p className="text-[#C0927C] mt-2">{error}</p>
                    <button onClick={() => setPage(1)} className="mt-4 text-[#C1372C] hover:underline font-bold">Retry</button>
                  </div>
                )}
                
                {error && page > 1 && (
                  <div className="text-center py-8">
                     <p className="text-[#C1372C] mb-2 font-medium">Failed to load more.</p>
                     <button onClick={() => setPage(p => p)} className="text-[#C1372C] hover:underline font-bold">Try Again</button>
                  </div>
                )}

                {!hasMore && movies.length > 0 && (
                   <div className="text-center py-10 text-[#C0927C]/50 text-sm font-medium italic">
                     You've reached the end of the list.
                   </div>
                )}

                {movies.length === 0 && !loading && !error && (
                  <div className="text-center py-20 bg-[#5E4A65] rounded-xl border border-[#C0927C]/20">
                    <h2 className="text-xl font-semibold text-white">No Movies Found</h2>
                    <p className="text-[#C0927C] mt-2">Try adjusting your filters.</p>
                    <button onClick={resetFilters} className="mt-4 text-[#C1372C] hover:underline font-bold">Reset Filters</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <BackToTop />
    </div>
  );
}

const ViewModeButton = ({ current, mode, setViewMode, children }) => (
  <button
    onClick={() => setViewMode(mode)}
    className={`p-2 rounded-md transition-colors ${
      current === mode
        ? 'bg-[#C1372C] text-white shadow-sm'
        : 'text-[#C0927C] hover:text-white hover:bg-[#7B3A3C]'
    }`}
    aria-label={`Switch to ${mode} view`}
  >
    {children}
  </button>
);

export default BrowsePage;
