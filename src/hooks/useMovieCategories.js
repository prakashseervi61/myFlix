import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService.js';

const CATEGORIES = {
  'Trending Now': null,
  Action: 28,
  Comedy: 35,
  Drama: 18,
  Horror: 27,
  Romance: 10749,
};

const CACHE_KEY = 'myflix_categories_cache';
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

const initialState = Object.keys(CATEGORIES).reduce((acc, key) => {
  acc[key] = { movies: [], loading: true, error: null };
  return acc;
}, {});

export function useMovieCategories() {
  const [categories, setCategories] = useState(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { timestamp, data } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          return data;
        }
      }
    } catch (e) {
      // Ignore cache errors
    }
    return initialState;
  });

  useEffect(() => {
    // If we have data loaded from cache (and it's not just the initial empty structure), don't refetch
    // We check if "Trending Now" has movies as a proxy for valid data
    const hasData = categories['Trending Now']?.movies?.length > 0;
    if (hasData) return;

    const abortController = new AbortController();
    const { signal } = abortController;

    const fetchCategory = async (categoryName, genreId) => {
      try {
        let movies;
        if (categoryName === 'Trending Now') {
          movies = await apiService.getTrendingMovies(signal);
        } else {
          movies = await apiService.getMoviesByGenre(genreId, signal);
        }
        
        return {
          key: categoryName,
          data: {
            movies: movies || [],
            loading: false,
            error: (!movies || movies.length === 0) ? 'No movies found.' : null,
          },
        };
      } catch (error) {
        if (signal.aborted) return null;
        return {
          key: categoryName,
          data: {
            movies: [],
            loading: false,
            error: error.message || 'Failed to load category',
          },
        };
      }
    };

    const fetchAllCategories = async () => {
      const promises = Object.entries(CATEGORIES).map(([name, id]) =>
        fetchCategory(name, id)
      );
      
      const results = await Promise.all(promises);

      if (!signal.aborted) {
        setCategories(prev => {
          const newState = { ...prev };
          let hasUpdates = false;
          
          results.forEach(result => {
            if (result) {
              newState[result.key] = result.data;
              hasUpdates = true;
            }
          });

          if (hasUpdates) {
             try {
               sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                 timestamp: Date.now(),
                 data: newState
               }));
             } catch (e) {}
             return newState;
          }
          return prev;
        });
      }
    };

    fetchAllCategories();

    return () => {
      abortController.abort();
    };
  }, []); // Run once on mount

  return categories;
}
