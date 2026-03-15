import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { apiService } from '../services/apiService.js';

export function useTrendingMovies() {
  return useQuery({
    queryKey: ['movies', 'trending'],
    queryFn: ({ signal }) => apiService.getTrendingMovies(signal),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useMoviesByGenre(genreId, name) {
  return useQuery({
    queryKey: ['movies', 'genre', genreId, name],
    queryFn: ({ signal }) => apiService.getMoviesByGenre(genreId, signal),
    staleTime: 1000 * 60 * 30, // 30 minutes
    enabled: !!genreId,
  });
}

export function useMovieDetails(id) {
  return useQuery({
    queryKey: ['movies', 'details', id],
    queryFn: ({ signal }) => apiService.getMovieDetails(id, signal),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: !!id,
  });
}

export function useMovieGenres() {
  return useQuery({
    queryKey: ['movies', 'genres'],
    queryFn: ({ signal }) => apiService.getMovieGenres(signal),
    staleTime: Infinity,
  });
}

export function useSearchMovies(query, page = 1) {
  return useQuery({
    queryKey: ['movies', 'search', query, page],
    queryFn: ({ signal }) => apiService.searchMovies(query, page, signal),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!query,
  });
}
