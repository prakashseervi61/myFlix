import { useState, useCallback, useRef } from 'react';
import { apiService } from '../services/apiService.js';

export function useSearch() {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const searchMovies = useCallback(async (query) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!query.trim()) {
      setSearchResults([]);
      setLoading(false);
      setError(null);
      return;
    }
    
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setLoading(true);
    setError(null);

    try {
      const result = await apiService.searchMovies(query, 1, signal);
      if (!signal.aborted) {
        setSearchResults(result.Search || []);
      }
    } catch (err) {
      if (!signal.aborted) {
        setError(err.message);
        setSearchResults([]);
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
  }, []);

  return {
    searchResults,
    loading,
    error,
    searchMovies,
    clearResults
  };
}