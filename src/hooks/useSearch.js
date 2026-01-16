import { useState, useCallback, useRef } from 'react';
import { apiService } from '../services/apiService.js';

/**
 * Search hook with pagination and abort signal support.
 * Results are appended for infinite scroll (page > 1).
 * @returns {Object} { searchResults, loading, error, hasMore, searchMovies, clearResults }
 */
export function useSearch() {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const abortControllerRef = useRef(null);

  /** Aborts previous request before starting new one to prevent race conditions */
  const searchMovies = useCallback(async (query, page = 1) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!query || !query.trim()) {
      setSearchResults([]);
      setLoading(false);
      setError(null);
      setHasMore(false);
      return;
    }
    
    if (!navigator.onLine) {
      setError("You are offline. Please check your connection.");
      setLoading(false);
      return;
    }

    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setLoading(true);
    if (page === 1) setError(null);

    try {
      const results = await apiService.searchMovies(query, page, signal);
      if (signal.aborted) return;

      if (page === 1) {
        setSearchResults(results || []);
      } else {
        setSearchResults(prev => [...prev, ...(results || [])]);
      }
      setHasMore(results && results.length > 0);
    } catch (err) {
      if (signal.aborted) return;
      
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to search movies');
      }
      if (page === 1) {
        setSearchResults([]);
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [setSearchResults, setLoading, setError, setHasMore]);

  const clearResults = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setSearchResults([]);
    setError(null);
    setLoading(false);
    setHasMore(true);
  }, [setSearchResults, setLoading, setError, setHasMore]);

  return {
    searchResults,
    loading,
    error,
    hasMore,
    searchMovies,
    clearResults
  };
}
