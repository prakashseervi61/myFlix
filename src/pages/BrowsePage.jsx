import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { Grid, List, Loader2 } from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { tmdbService } from '../services/tmdbService.js';
import { useFilters } from '../hooks/useFilters.js';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver.js';
import FilterPanel from '../components/layout/FilterPanel.jsx';
import MovieCard from '../components/ui/MovieCard.jsx';
import MovieCardSkeleton from '../components/ui/MovieCardSkeleton.jsx';
import MovieListItem from '../components/ui/MovieListItem.jsx';
import MovieListItemSkeleton from '../components/ui/MovieListItemSkeleton.jsx';
import BackToTop from '../components/ui/BackToTop.jsx';
import { useUIStore } from '../store/uiStore.js';

/**
 * Browse page with advanced filtering and infinite scroll.
 * Filters are debounced to reduce API calls.
 * Trailer filter requires client-side checking (not supported by TMDB API).
 */
function BrowsePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { browseState, updateBrowseState } = useUIStore();
  const { filters, updateFilter, resetFilters } = useFilters();
  const [debouncedFilters] = useDebounce(filters, 500);
  
  const [genres, setGenres] = useState(browseState.genres || []);
  const location = useLocation();

  const viewMode = searchParams.get('view') || 'grid';

  // Check if filters changed since last visit
  const prevFiltersStr = JSON.stringify(browseState.lastFilters);
  const currFiltersStr = JSON.stringify(debouncedFilters);
  const filtersChanged = prevFiltersStr !== currFiltersStr;

  const handleViewModeChange = (mode) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('view', mode);
    setSearchParams(newParams, { replace: true });
  };
  
  // Intercept genre query block
  useEffect(() => {
    const genreParam = searchParams.get('genre');
    if (genreParam) {
      resetFilters({ with_genres: [Number(genreParam)] });
      setSearchParams(prev => {
        prev.delete('genre');
        return prev;
      }, { replace: true });
    } else if (location.state?.reset) {
      // Force clear all filters if a generic browse link was clicked
      resetFilters();
      updateBrowseState({ scrollPosition: 0 });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [searchParams, setSearchParams, resetFilters, location.state, location.pathname, navigate, updateBrowseState]);

  // Infinite Query
  const {
    data,
    fetchNextPage,
    refetch,
    hasNextPage: hasMore,
    isFetching: loading,
    isFetchingNextPage: isLoadingMore,
    error: queryError
  } = useInfiniteQuery({
    queryKey: ['browse', debouncedFilters],
    queryFn: async ({ pageParam = 1, signal }) => {
      const params = {
        ...debouncedFilters,
        with_genres: debouncedFilters.with_genres.join(','),
        page: pageParam
      };

      let results = await tmdbService.discoverMovies(params, signal);

      if (debouncedFilters.only_with_trailer && results.length > 0) {
         const trailerChecks = await Promise.allSettled(
           results.map(movie => tmdbService.getMovieVideos(movie.id)) // removed signal here to prevent cascade abort
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

      return results;
    },
    getNextPageParam: (lastPage, allPages) => lastPage.length > 0 ? allPages.length + 1 : undefined,
    staleTime: 1000 * 60 * 5,
  });

  const movies = data?.pages.flat() || [];
  const error = queryError?.message || null;

  /** Sentinel element for infinite scroll trigger */
  const loadMoreRef = useIntersectionObserver({
    enabled: !loading && hasMore && movies.length > 0,
    onIntersect: () => fetchNextPage()
  });

  // Sync state to context
  useEffect(() => {
    updateBrowseState({ 
      genres, 
      lastFilters: debouncedFilters 
    });
  }, [genres, debouncedFilters, updateBrowseState]);

  // Handle scroll saving on unmount
  useEffect(() => {
    return () => {
      updateBrowseState({ scrollPosition: window.scrollY });
    };
  }, [updateBrowseState]);

  // Restore scroll position
  useEffect(() => {
    if (browseState.scrollPosition > 0 && movies.length > 0 && !filtersChanged) {
      const timer = setTimeout(() => {
        window.scrollTo({ top: browseState.scrollPosition, behavior: 'auto' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [movies.length, browseState.scrollPosition, filtersChanged]);

  useEffect(() => {
    if (genres.length === 0) {
      const fetchGenres = async () => {
        try {
          const genreList = await tmdbService.getGenres();
          setGenres(genreList);
        } catch (e) {
          console.error('Failed to load genres');
        }
      };
      fetchGenres();
    }
  }, [genres.length]);

  useEffect(() => {
    if (filtersChanged) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [filtersChanged]);

  const handleMovieClick = (movie) => {
    if (movie?.id) {
      navigate(`/movie/${movie.id}`);
    }
  };

  const initialLoading = loading && movies.length === 0;

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-6 md:mb-8">
          <div className="flex items-center gap-6 mb-4">
            <button className="text-2xl sm:text-3xl md:text-4xl font-bold text-white border-b-4 border-primary pb-1">Movies</button>
            <button onClick={() => navigate('/browse/tv')} className="text-2xl sm:text-3xl md:text-4xl font-bold text-white/50 hover:text-white transition-colors pb-1 border-b-4 border-transparent">TV Shows</button>
          </div>
          <p className="text-sm sm:text-lg text-muted mt-1">Discover your next favorite film.</p>
        </header>

        <div className="flex flex-col md:flex-row gap-6">
          <aside className="md:w-80 flex-shrink-0">
             <FilterPanel 
               filters={filters} 
               onChange={updateFilter} 
               onReset={resetFilters} 
               genres={genres}
               className="rounded-xl border border-muted/20"
             />
          </aside>

          <div className="flex-1">
            <div className="flex justify-end mb-4">
               <div className="flex items-center gap-2 bg-surface p-1 rounded-lg border border-muted/20">
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

                {error && movies.length === 0 && (
                  <div className="text-center py-20 bg-surface rounded-xl border border-muted/20 mt-4">
                    <h2 className="text-xl font-semibold text-white">Error</h2>
                    <p className="text-muted mt-2">{error}</p>
                    <button onClick={() => refetch()} className="mt-4 text-primary hover:underline font-bold">Retry</button>
                  </div>
                )}
                
                {error && movies.length > 0 && (
                  <div className="text-center py-8">
                     <p className="text-primary mb-2 font-medium">Failed to load more.</p>
                     <button onClick={() => fetchNextPage()} className="text-primary hover:underline font-bold">Try Again</button>
                  </div>
                )}

                {!hasMore && movies.length > 0 && (
                   <div className="text-center py-10 text-muted/50 text-sm font-medium italic">
                     You've reached the end of the list.
                   </div>
                )}

                {movies.length === 0 && !loading && !error && (
                  <div className="text-center py-20 bg-surface rounded-xl border border-muted/20">
                    <h2 className="text-xl font-semibold text-white">No Movies Found</h2>
                    <p className="text-muted mt-2">Try adjusting your filters.</p>
                    <button onClick={resetFilters} className="mt-4 text-primary hover:underline font-bold">Reset Filters</button>
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
        ? 'bg-primary text-white shadow-sm'
        : 'text-muted hover:text-white hover:bg-surface-secondary'
    }`}
    aria-label={`Switch to ${mode} view`}
  >
    {children}
  </button>
);

export default BrowsePage;
