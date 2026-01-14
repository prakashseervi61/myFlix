import { useState, useCallback, useRef } from 'react';
import { apiService } from '../services/apiService.js';

export function useSearch() {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const abortControllerRef = useRef(null);

  const searchMovies = useCallback(async (query, page = 1) => {
    // Cancel any pending request
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
    
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setLoading(true);
    if (page === 1) setError(null);

    try {
      const results = await apiService.searchMovies(query, page, signal);
      if (!signal.aborted) {
        if (page === 1) {
          setSearchResults(results || []);
        } else {
          setSearchResults(prev => [...prev, ...(results || [])]);
        }
        setHasMore(results && results.length >= 20);
      }
    } catch (err) {
      if (!signal.aborted) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to search movies');
        }
        if (page === 1) setSearchResults([]);
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  const clearResults = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setSearchResults([]);
    setError(null);
    setLoading(false);
    setHasMore(true);
  }, []);

  return {
    searchResults,
    loading,
    error,
    hasMore,
    searchMovies,
    clearResults
  };
}
