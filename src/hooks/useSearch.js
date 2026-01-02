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
        abortControllerRef.current = new AbortController();
        
        const searchResult = await omdbService.searchMovies(query.trim());
        
        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
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
        if (!abortControllerRef.current?.signal.aborted) {
          setLoading(false);
        }
      }
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
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