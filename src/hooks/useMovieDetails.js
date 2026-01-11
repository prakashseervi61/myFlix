import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService.js';

export function useMovieDetails(movieId) {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!movieId) {
      setLoading(false);
      setMovie(null);
      setError(null);
      return;
    }

    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchMovieDetails = async () => {
      setLoading(true);
      setError(null);
      setMovie(null);

      try {
        const movieData = await apiService.getMovieDetails(movieId, signal);
        
        if (!signal.aborted) {
          if (movieData && movieData.id) {
            setMovie(movieData);
          } else {
            throw new Error('Movie not found or data is invalid');
          }
        }
      } catch (err) {
        if (!signal.aborted) {
          setError(err.message || 'Failed to load movie details');
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchMovieDetails();

    return () => {
      abortController.abort();
    };
  }, [movieId]);

  return { movie, loading, error };
}
