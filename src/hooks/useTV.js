import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/apiService.js';

export function useTrendingTV() {
  return useQuery({
    queryKey: ['tv', 'trending'],
    queryFn: ({ signal }) => apiService.getTrendingTV(signal),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function usePopularTV() {
  return useQuery({
    queryKey: ['tv', 'popular'],
    queryFn: ({ signal }) => apiService.getPopularTV(signal),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useTopRatedTV() {
  return useQuery({
    queryKey: ['tv', 'topRated'],
    queryFn: ({ signal }) => apiService.getTopRatedTV(signal),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useTVDetails(id) {
  return useQuery({
    queryKey: ['tv', 'details', id],
    queryFn: ({ signal }) => apiService.getTVDetails(id, signal),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: !!id,
  });
}

export function useTVEpisodes(tvMazeId) {
  return useQuery({
    queryKey: ['tv', 'episodes', tvMazeId],
    queryFn: ({ signal }) => apiService.getEpisodes(tvMazeId, signal),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: !!tvMazeId,
  });
}

export function useTVGenres() {
  return useQuery({
    queryKey: ['tv', 'genres'],
    queryFn: ({ signal }) => apiService.getTVGenres(signal),
    staleTime: Infinity,
  });
}

export function useIMDbRating(title) {
  return useQuery({
    queryKey: ['tv', 'imdbRating', title],
    queryFn: ({ signal }) => apiService.getIMDbRatingForTV(title), // assuming apiService.getIMDbRatingForTV doesn't support signal but that's fine
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: !!title,
  });
}
