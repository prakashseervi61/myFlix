import { useQueries } from '@tanstack/react-query';
import { apiService } from '../services/apiService.js';

/** Genre IDs from TMDB API. null = trending endpoint instead of genre filter */
export const CATEGORIES = {
  'Trending Now': null,
  Action: 28,
  Comedy: 35,
  Drama: 18,
  Horror: 27,
  Romance: 10749,
};

/**
 * Fetches and caches movie categories for homepage using React Query.
 * background fetching, deduping, and caching handled automatically.
 * @returns {Object} Category map: { [categoryName]: { movies, loading, error } }
 */
export function useMovieCategories() {
  const categoryEntries = Object.entries(CATEGORIES);

  const queryResults = useQueries({
    queries: categoryEntries.map(([name, genreId]) => ({
      queryKey: ['category', name],
      queryFn: async ({ signal }) => {
        return name === 'Trending Now'
          ? await apiService.getTrendingMovies(signal)
          : await apiService.getMoviesByGenre(genreId, signal);
      },
      staleTime: 1000 * 60 * 30, // Keep fresh for 30 minutes
    })),
  });

  // Transform queries result back into the format HomePage expects
  return categoryEntries.reduce((acc, [name], index) => {
    const query = queryResults[index];
    acc[name] = {
      movies: query.data || [],
      loading: query.isLoading,
      error: query.error ? query.error.message : null,
    };
    return acc;
  }, {});
}
