import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService.js';

const CATEGORIES = {
  trending: ['avengers', 'marvel'],
  action: ['action', 'fast and furious'],
  comedy: ['comedy', 'lol'],
  drama: ['drama', 'oscar winner'],
  horror: ['horror', 'scary'],
  romance: ['romance', 'love story']
};

const initialState = Object.keys(CATEGORIES).reduce((acc, key) => {
  acc[key] = { movies: [], loading: true, error: null };
  return acc;
}, {});

export function useMovieCategories() {
  const [categories, setCategories] = useState(initialState);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchCategory = async (key, searchTerms) => {
      try {
        const term = searchTerms[0];
        const result = await apiService.searchMovies(term, 1, signal);
        const movies = (result.Search || []).slice(0, 10);
        return {
          key,
          data: {
            movies,
            loading: false,
            error: movies.length === 0 ? 'No movies found.' : null,
          },
        };
      } catch (error) {
        if (signal.aborted) return null;
        return {
          key,
          data: {
            movies: [],
            loading: false,
            error: error.message,
          },
        };
      }
    };

    const fetchAllCategories = async () => {
      const promises = Object.entries(CATEGORIES).map(([key, searchTerms]) =>
        fetchCategory(key, searchTerms)
      );
      
      const results = await Promise.all(promises);

      if (!signal.aborted) {
        setCategories(prev => {
          const newState = { ...prev };
          results.forEach(result => {
            if (result) {
              newState[result.key] = result.data;
            }
          });
          return newState;
        });
      }
    };

    fetchAllCategories();

    return () => {
      abortController.abort();
    };
  }, []);

  return categories;
}