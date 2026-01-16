import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { Search, X, Grid, List } from 'lucide-react';
import { useSearch } from '../hooks/useSearch.js';
import { useFilters } from '../hooks/useFilters.js';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver.js';
import { tmdbService } from '../services/tmdbService.js';
import FilterPanel from '../components/FilterPanel.jsx';
import MovieCard from '../components/ui/MovieCard.jsx';
import MovieCardSkeleton from '../components/ui/MovieCardSkeleton.jsx';

/**
 * Search page with client-side filtering of results.
 * Search is handled by useSearch hook, filters applied locally.
 * Supports both grid and list view modes.
 */
function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 500);
  const [page, setPage] = useState(1);
  
  const { searchResults, loading: searchLoading, error: searchError, hasMore: searchHasMore, searchMovies, clearResults } = useSearch();
  const { filters, updateFilter, resetFilters } = useFilters('myflix_search_filters');
  const [debouncedFilters] = useDebounce(filters, 500);

  const [filteredMovies, setFilteredMovies] = useState([]);
  const [filtering, setFiltering] = useState(false);
  const [genres, setGenres] = useState([]);
  const [viewMode, setViewMode] = useState('grid');

  /** Sentinel for infinite scroll */
  const loadMoreRef = useIntersectionObserver({
    enabled: !searchLoading && searchHasMore && debouncedQuery.trim().length > 0,
    onIntersect: () => setPage(p => p + 1)
  });

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
    setPage(1);
  }, [debouncedQuery]);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      searchMovies(debouncedQuery, page);
    } else {
      clearResults();
    }
  }, [debouncedQuery, page, searchMovies, clearResults]);

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
           
           results = results.filter(m => moviesWithTrailers.has(Number(m.id)));
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
      navigate(`/movie/${movie.id}`);
    }
  };

  const initialLoading = searchLoading && page === 1;
  const isLoadingMore = searchLoading && page > 1;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Search</h1>
          <p className="text-lg text-gray-400 mt-1">Find your next favorite movie.</p>
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
            <div className="relative mb-10 group">
              <div className="flex items-center bg-transparent border-b-2 border-gray-800 group-focus-within:border-cyan-500 transition-all duration-300 pb-2">
                <Search className="text-gray-500 mr-4 shrink-0 group-focus-within:text-cyan-500 transition-colors" size={24} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for movies..."
                  className="flex-1 bg-transparent border-none text-xl md:text-2xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-0 p-0 font-medium"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="ml-4 p-1.5 text-gray-500 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end mb-4">
              <div className="flex items-center gap-2 bg-gray-900 p-1 rounded-lg border border-gray-800">
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
    return <StatusDisplay title="No Results Found" message={`No movies found for "${query}" matching your filters.`} />;
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
        
        {!hasMore && !filtering && (
           <div className="text-center py-10 text-gray-500 text-sm">
             End of results.
           </div>
        )}
      </>
    );
  }

  return <StatusDisplay title="Find a Movie" message="Enter a search term to begin." />;
};

const StatusDisplay = ({ title, message }) => (
  <div className="text-center py-16 bg-gray-900 rounded-xl border border-gray-800">
    <h2 className="text-2xl font-semibold text-white">{title}</h2>
    <p className="text-gray-400 mt-2">{message}</p>
  </div>
);

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

export default SearchPage;