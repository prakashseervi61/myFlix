import { useState, useEffect, useRef } from 'react';
import { omdbService } from '../services/omdb';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Clear results if query is empty
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Don't search for very short queries
    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Debounce search
    const timeoutId = setTimeout(async () => {
      try {
        // Create new controller after timeout
        abortControllerRef.current = new AbortController();
        const currentController = abortControllerRef.current;
        
        const searchResult = await omdbService.searchMovies(query.trim(), 1, currentController.signal);
        
        // Check if this request is still current
        if (currentController !== abortControllerRef.current || currentController.signal.aborted) {
          return;
        }

        const formattedResults = (searchResult.Search || [])
          .map(omdbService.formatMovie)
          .filter(movie => movie !== null)
          .slice(0, 8); // Limit results

        setResults(formattedResults);
      } catch (err) {
        if (err.name === 'AbortError') {
          return; // Request was cancelled
        }
        
        console.error('Search error:', err);
        setError(err.message || 'Search failed');
        setResults([]);
      } finally {
        // Only update loading if this is still the current request
        if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
          setLoading(false);
        }
      }
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [query]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    clearResults: () => {
      setQuery('');
      setResults([]);
      setError(null);
    }
  };
}