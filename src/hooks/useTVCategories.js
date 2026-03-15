import { useQueries } from '@tanstack/react-query';
import { apiService } from '../services/apiService.js';

export const TV_CATEGORIES = {
  'Trending TV Shows': 'trending',
  'Popular Series': 'popular',
  'Top Rated Series': 'top_rated',
};

/**
 * Fetches and caches TV categories for homepage using React Query.
 */
export function useTVCategories() {
  const categoryEntries = Object.entries(TV_CATEGORIES);

  const queryResults = useQueries({
    queries: categoryEntries.map(([name, endpointId]) => ({
      queryKey: ['tv_category', name],
      queryFn: async () => {
        if (endpointId === 'trending') return await apiService.getTrendingTV();
        if (endpointId === 'popular') return await apiService.getPopularTV();
        if (endpointId === 'top_rated') return await apiService.getTopRatedTV();
        return [];
      },
      staleTime: 1000 * 60 * 30, // Keep fresh for 30 minutes
    })),
  });

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
