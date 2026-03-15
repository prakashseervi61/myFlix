import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { Search, X, Grid, List } from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useFilters } from '../hooks/useFilters.js';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver.js';
import { tmdbService } from '../services/tmdbService.js';
import { apiService } from '../services/apiService.js';
import FilterPanel from '../components/layout/FilterPanel.jsx';
import MovieCard from '../components/ui/MovieCard.jsx';
import MovieCardSkeleton from '../components/ui/MovieCardSkeleton.jsx';
import { useUIStore } from '../store/uiStore.js';

/**
 * Search page with client-side filtering of results.
 * Search is handled by useInfiniteQuery, filters applied locally.
 * Supports both grid and list view modes.
 */
function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { searchPageState, updateSearchPageState } = useUIStore();
  const urlQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(urlQuery || searchPageState.query);
  const [debouncedQuery] = useDebounce(query, 500);

  // Sync URL query to state
  useEffect(() => {
    if (urlQuery && urlQuery !== query) {
      setQuery(urlQuery);
    }
  }, [urlQuery]);
  
  const {
    data,
    fetchNextPage,
    hasNextPage: searchHasMore,
    isFetching: searchLoading,
    isFetchingNextPage,
    error: queryError
  } = useInfiniteQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: ({ pageParam = 1, signal }) => apiService.searchMovies(debouncedQuery, pageParam, signal),
    getNextPageParam: (lastPage, allPages) => lastPage.length >= 20 ? allPages.length + 1 : undefined,
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  });

  const searchResults = data?.pages.flat() || [];
  const searchError = queryError?.message || null;

  const { filters, updateFilter, resetFilters } = useFilters('myflix_search_filters');
  const [debouncedFilters] = useDebounce(filters, 500);

  const [filteredMovies, setFilteredMovies] = useState(searchPageState.movies);
  const [filtering, setFiltering] = useState(false);
  const [genres, setGenres] = useState([]);
  const [viewMode, setViewMode] = useState(searchPageState.viewMode || 'grid');

  // Check if filters changed since last visit
  const prevFiltersStr = JSON.stringify(searchPageState.lastFilters);
  const currFiltersStr = JSON.stringify(debouncedFilters);
  const filtersChanged = prevFiltersStr !== currFiltersStr;

  /** Sentinel for infinite scroll */
  const loadMoreRef = useIntersectionObserver({
    enabled: !searchLoading && searchHasMore && debouncedQuery.trim().length > 0,
    onIntersect: () => fetchNextPage()
  });

  // Sync state to context
  useEffect(() => {
    updateSearchPageState({
      query,
      movies: filteredMovies,
      lastFilters: debouncedFilters,
      viewMode
    });
  }, [query, filteredMovies, debouncedFilters, viewMode, updateSearchPageState]);

  // Save scroll on unmount
  useEffect(() => {
    return () => {
      updateSearchPageState({ scrollPosition: window.scrollY });
    };
  }, [updateSearchPageState]);

  // Restore scroll position
  useEffect(() => {
    if (searchPageState.scrollPosition > 0 && filteredMovies.length > 0 && !filtersChanged) {
      const timer = setTimeout(() => {
        window.scrollTo({ top: searchPageState.scrollPosition, behavior: 'auto' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [filteredMovies.length, searchPageState.scrollPosition, filtersChanged]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genreList = await tmdbService.getGenres();
        setGenres(genreList);
      } catch (e) {
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const applyFilters = async () => {
      if (!searchResults.length) {
        setFilteredMovies([]);
        return;
      }

      setFiltering(true);
      
      try {
        let results = [...searchResults];

        /** Apply filters to search results */
        if (debouncedFilters.with_genres && debouncedFilters.with_genres.length > 0) {
          results = results.filter(movie => 
            movie.genre_ids && debouncedFilters.with_genres.some(g => movie.genre_ids.includes(g))
          );
        }

        if (debouncedFilters.year_min) {
          results = results.filter(movie => parseInt(movie.year) >= parseInt(debouncedFilters.year_min));
        }
        if (debouncedFilters.year_max) {
          results = results.filter(movie => parseInt(movie.year) <= parseInt(debouncedFilters.year_max));
        }

        if (debouncedFilters.min_rating > 0) {
          results = results.filter(movie => parseFloat(movie.rating) >= debouncedFilters.min_rating);
        }

        if (debouncedFilters.with_original_language) {
          results = results.filter(movie => movie.original_language === debouncedFilters.with_original_language);
        }

        if (debouncedFilters.only_with_trailer) {
           const trailerChecks = await Promise.allSettled(
             results.map(movie => tmdbService.getMovieVideos(movie.id))
           );
           
           const moviesWithTrailers = new Set();
           trailerChecks.forEach((result, index) => {
             if (result.status === 'fulfilled' && result.value && result.value.some(v => v.site === 'YouTube' && v.type === 'Trailer')) {
               moviesWithTrailers.add(results[index].id);
             }
           });
           
           results = results.filter(m => moviesWithTrailers.has(String(m.id)));
        }

        if (debouncedFilters.sort_by) {
          results.sort((a, b) => {
             switch (debouncedFilters.sort_by) {
               case 'popularity.desc': return (b.popularity || 0) - (a.popularity || 0);
               case 'vote_average.desc': return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
               case 'primary_release_date.desc': return new Date(b.release_date || 0) - new Date(a.release_date || 0);
               case 'revenue.desc': return 0;
               default: return 0;
             }
          });
        }

        if (isMounted) {
          setFilteredMovies(results);
        }
      } catch (e) {
        console.error("Filter error", e);
      } finally {
        if (isMounted) setFiltering(false);
      }
    };

    applyFilters();

    return () => { isMounted = false; };
  }, [searchResults, debouncedFilters]);

  const handleMovieClick = (movie) => {
    if (movie?.id) {
      if (movie.media_type === 'tv' || movie.number_of_seasons !== undefined || (!movie.release_date && movie.first_air_date)) {
         navigate(`/tv/${movie.id}`);
      } else {
         navigate(`/movie/${movie.id}`);
      }
    }
  };

  const initialLoading = searchLoading && searchResults.length === 0;
  const isLoadingMore = searchLoading && searchResults.length > 0;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Search</h1>
          <p className="text-lg text-muted mt-1">Find your next favorite movie or TV show.</p>
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
            <div className="relative mb-10 group">
              <div className="flex items-center bg-transparent border-b-2 border-muted/30 group-focus-within:border-primary transition-all duration-300 pb-2">
                <Search className="text-muted/40 mr-4 shrink-0 group-focus-within:text-primary transition-colors" size={24} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for movies or TV shows..."
                  className="flex-1 bg-transparent border-none text-xl md:text-2xl text-white placeholder:text-muted/40 focus:outline-none focus:ring-0 p-0 font-medium"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="ml-4 p-1.5 text-muted hover:text-primary transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end mb-4">
              <div className="flex items-center gap-2 bg-surface p-1 rounded-lg border border-muted/20">
                <ViewModeButton current={viewMode} mode="grid" setViewMode={setViewMode}><Grid size={18} /></ViewModeButton>
                <ViewModeButton current={viewMode} mode="list" setViewMode={setViewMode}><List size={18} /></ViewModeButton>
              </div>
            </div>
            
            <RenderContent
              initialLoading={initialLoading}
              isLoadingMore={isLoadingMore}
              error={searchError}
              query={debouncedQuery}
              results={filteredMovies}
              onClick={handleMovieClick}
              viewMode={viewMode}
              loadMoreRef={loadMoreRef}
              hasMore={searchHasMore}
              filtering={filtering}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const RenderContent = ({ initialLoading, isLoadingMore, error, query, results, onClick, viewMode, loadMoreRef, hasMore, filtering }) => {
  if (initialLoading) {
    return (
      <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
        {Array.from({ length: 10 }).map((_, i) => <MovieCardSkeleton key={i} />)}
      </div>
    );
  }

  if (error) {
    return <StatusDisplay title="Search Error" message={error} />;
  }

  if (query && results.length === 0 && !filtering) {
    return <StatusDisplay title="No Results Found" message={`No titles found for "${query}" matching your filters.`} />;
  }
  
  if (results.length > 0 || filtering) {
    return (
      <>
        <div className={`transition-all duration-300 ${
          viewMode === 'grid'
            ? 'grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4'
            : 'grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4'
        }`}>
          {results.map(movie => (
            <MovieCard key={movie.id} movie={movie} onClick={onClick} />
          ))}
          
          {(isLoadingMore || filtering) && Array.from({ length: 5 }).map((_, i) => (
             <MovieCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
        
        <div ref={loadMoreRef} className="h-4 w-full" />
        
        {!hasMore && results.length > 0 && (
           <div className="text-center py-10 text-muted/50 text-sm font-medium italic">
             You've reached the end of the list.
           </div>
        )}
      </>
    );
  }

  return <StatusDisplay title="Find a Movie" message="Enter a search term to begin." />;
};

const StatusDisplay = ({ title, message }) => (
  <div className="text-center py-16 bg-surface/30 backdrop-blur-md rounded-xl border border-muted/20 shadow-xl">
    <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
    <p className="text-muted mt-2 font-medium">{message}</p>
  </div>
);

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

export default SearchPage;