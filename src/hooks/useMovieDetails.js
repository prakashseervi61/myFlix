import { useState, useEffect } from 'react';
import { omdbService } from '../services/omdb';

export function useMovieDetails(movieId) {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!movieId) {
      setError(null);
      setMovie(null);
      setLoading(false);
      return;
    }

    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const movieData = await omdbService.getMovieById(movieId);
        const formattedMovie = omdbService.formatMovie(movieData);
        
        setMovie(formattedMovie);
      } catch (err) {
        console.error('Failed to fetch movie details:', err);
        setError(err.message || 'Failed to load movie details');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movieId]);

  return { movie, loading, error };
}