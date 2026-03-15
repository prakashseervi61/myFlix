import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/apiService.js';

/**
 * Fetches movie details with React Query caching.
 * @param {string} movieId - TMDB movie ID
 * @returns {Object} { movie, loading, error }
 */
export function useMovieDetails(movieId) {
  const { data: movie, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['movie', movieId],
    queryFn: async ({ signal }) => {
      const movieData = await apiService.getMovieDetails(movieId, signal);
      if (!movieData || !movieData.id) {
        throw new Error('Movie not found or data is invalid');
      }
      return movieData;
    },
    enabled: !!movieId,
    staleTime: 1000 * 60 * 15, // Cache movie details for 15 mins
  });

  return { 
    movie: movie || null, 
    loading, 
    error: queryError?.message || null 
  };
}
