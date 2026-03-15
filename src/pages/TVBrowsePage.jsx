import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { Grid, List, Loader2 } from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { apiService } from '../services/apiService.js';
import { useFilters } from '../hooks/useFilters.js';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver.js';
import FilterPanel from '../components/layout/FilterPanel.jsx';
import MovieCard from '../components/ui/MovieCard.jsx';
import MovieCardSkeleton from '../components/ui/MovieCardSkeleton.jsx';
import MovieListItem from '../components/ui/MovieListItem.jsx';
import MovieListItemSkeleton from '../components/ui/MovieListItemSkeleton.jsx';
import BackToTop from '../components/ui/BackToTop.jsx';
import { useBrowseState } from '../contexts/BrowseContext.jsx';

/**
 * TV Browse page with advanced filtering and infinite scroll.
 */
function TVBrowsePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { tvBrowseState, updateTvBrowseState } = useBrowseState();
  const { filters, updateFilter, resetFilters } = useFilters('myflix_tv_filters');
  const [debouncedFilters] = useDebounce(filters, 500);
  
  const [genres, setGenres] = useState(tvBrowseState.genres || []);
  const location = useLocation();

  const viewMode = searchParams.get('view') || 'grid';

  const prevFiltersStr = JSON.stringify(tvBrowseState.lastFilters);
  const currFiltersStr = JSON.stringify(debouncedFilters);
  const filtersChanged = prevFiltersStr !== currFiltersStr;

  const handleViewModeChange = (mode) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('view', mode);
    setSearchParams(newParams, { replace: true });
  };
  
  useEffect(() => {
    const genreParam = searchParams.get('genre');
    if (genreParam) {
      resetFilters({ with_genres: [Number(genreParam)] });
      setSearchParams(prev => {
        prev.delete('genre');
        return prev;
      }, { replace: true });
    } else if (location.state?.reset) {
      resetFilters();
      updateTvBrowseState({ scrollPosition: 0 });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [searchParams, setSearchParams, resetFilters, location.state, location.pathname, navigate, updateTvBrowseState]);

  const {
    data,
    fetchNextPage,
    refetch,
    hasNextPage: hasMore,
    isFetching: loading,
    isFetchingNextPage: isLoadingMore,
    error: queryError
  } = useInfiniteQuery({
    queryKey: ['browseTV', debouncedFilters],
    queryFn: async ({ pageParam = 1, signal }) => {
      const params = {
        ...debouncedFilters,
        with_genres: debouncedFilters.with_genres.join(','),
        page: pageParam
      };

      let results = await apiService.discoverTV(params, signal);

      if (debouncedFilters.only_with_trailer && results.length > 0) {
         const trailerChecks = await Promise.allSettled(
           results.map(show => apiService.getTVVideos(show.id, signal)) 
         );
         
         const showsWithTrailers = new Set();
         trailerChecks.forEach((result, index) => {
           if (result.status === 'fulfilled' && result.value && result.value.some(v => v.site === 'YouTube' && v.type === 'Trailer')) {
             showsWithTrailers.add(results[index].id);
           }
         });

         results = results
           .filter(s => showsWithTrailers.has(String(s.id)))
           .map(s => ({ ...s, has_trailer: true }));
      } else {
         results = results.map(s => ({ ...s, has_trailer: false }));
      }

      return results;
    },
    getNextPageParam: (lastPage, allPages) => lastPage.length > 0 ? allPages.length + 1 : undefined,
    staleTime: 1000 * 60 * 5,
  });

  const shows = data?.pages.flat() || [];
  const error = queryError?.message || null;

  const loadMoreRef = useIntersectionObserver({
    enabled: !loading && hasMore && shows.length > 0,
    onIntersect: () => fetchNextPage()
  });

  useEffect(() => {
    updateTvBrowseState({ 
      genres, 
      lastFilters: debouncedFilters 
    });
  }, [genres, debouncedFilters, updateTvBrowseState]);

  useEffect(() => {
    return () => {
      updateTvBrowseState({ scrollPosition: window.scrollY });
    };
  }, [updateTvBrowseState]);

  useEffect(() => {
    if (tvBrowseState.scrollPosition > 0 && shows.length > 0 && !filtersChanged) {
      const timer = setTimeout(() => {
        window.scrollTo({ top: tvBrowseState.scrollPosition, behavior: 'auto' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [shows.length, tvBrowseState.scrollPosition, filtersChanged]);

  useEffect(() => {
    if (genres.length === 0) {
      const fetchGenres = async () => {
        try {
          const genreList = await apiService.getTVGenres();
          setGenres(genreList);
        } catch (e) {
          console.error('Failed to load TV genres');
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

  const handleShowClick = (show) => {
    if (show?.id) {
      navigate(`/tv/${show.id}`);
    }
  };

  const initialLoading = loading && shows.length === 0;

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">TV Shows & Series</h1>
          <p className="text-sm sm:text-lg text-muted mt-1">Discover your next favorite binge.</p>
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
                  {shows.map((show) =>
                    viewMode === 'grid' ? (
                      <MovieCard key={show.id} movie={show} onClick={handleShowClick} />
                    ) : (
                      <MovieListItem key={show.id} movie={show} onClick={handleShowClick} />
                    )
                  )}
                  
                  {loading && !initialLoading && Array.from({ length: 5 }).map((_, i) =>
                    viewMode === 'grid' ? <MovieCardSkeleton key={`skeleton-${i}`} /> : <MovieListItemSkeleton key={`skeleton-${i}`} />
                  )}
                </div>

                <div ref={loadMoreRef} className="h-4 w-full" />

                {error && shows.length === 0 && (
                  <div className="text-center py-20 bg-surface rounded-xl border border-muted/20 mt-4">
                    <h2 className="text-xl font-semibold text-white">Error</h2>
                    <p className="text-muted mt-2">{error}</p>
                    <button onClick={() => refetch()} className="mt-4 text-primary hover:underline font-bold">Retry</button>
                  </div>
                )}
                
                {error && shows.length > 0 && (
                  <div className="text-center py-8">
                     <p className="text-primary mb-2 font-medium">Failed to load more.</p>
                     <button onClick={() => fetchNextPage()} className="text-primary hover:underline font-bold">Try Again</button>
                  </div>
                )}

                {!hasMore && shows.length > 0 && (
                   <div className="text-center py-10 text-muted/50 text-sm font-medium italic">
                     You've reached the end of the list.
                   </div>
                )}

                {shows.length === 0 && !loading && !error && (
                  <div className="text-center py-20 bg-surface rounded-xl border border-muted/20">
                    <h2 className="text-xl font-semibold text-white">No TV Shows Found</h2>
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

export default TVBrowsePage;
