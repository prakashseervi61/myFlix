import { useState, useEffect } from 'react';
import { movieService } from '../services/movieService.js';

export function useMovieTrailers(id) {
  const [trailers, setTrailers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setTrailers([]);
      setLoading(false);
      setError(null);
      return;
    }

    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchTrailers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await movieService.getMovieTrailers(id, signal);
        if (!signal.aborted) {
          setTrailers(data || []);
        }
      } catch (err) {
        if (!signal.aborted) {
          setError(err.message || 'Failed to load trailers.');
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchTrailers();

    return () => {
      abortController.abort();
    };
  }, [id]);

  return { trailers, loading, error };
}
