import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService.js';

/** Genre IDs from TMDB API. null = trending endpoint instead of genre filter */
const CATEGORIES = {
  'Trending Now': null,
  Action: 28,
  Comedy: 35,
  Drama: 18,
  Horror: 27,
  Romance: 10749,
};

const CACHE_KEY = 'myflix_categories_cache';
const CACHE_DURATION = 1000 * 60 * 30;

/** Loads cached categories from sessionStorage if still valid */
const getInitialState = () => {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        Object.keys(data).forEach(key => {
          data[key].loading = false;
        });
        return data;
      }
    }
  } catch (e) {
  }
  return Object.keys(CATEGORIES).reduce((acc, key) => {
    acc[key] = { movies: [], loading: true, error: null };
    return acc;
  }, {});
};

/**
 * Fetches and caches movie categories for homepage.
 * Uses sessionStorage to avoid refetching on navigation.
 * Fetches all categories in parallel for faster initial load.
 * @returns {Object} Category map: { [categoryName]: { movies, loading, error } }
 */
export function useMovieCategories() {
  const [categories, setCategories] = useState(getInitialState);

  const fetchAllCategories = useCallback(async (signal) => {
    const fetchCategory = async (categoryName, genreId) => {
      try {
        const movies = categoryName === 'Trending Now'
          ? await apiService.getTrendingMovies(signal)
          : await apiService.getMoviesByGenre(genreId, signal);
        
        if (signal.aborted) return null;

        return {
          key: categoryName,
          data: {
            movies: movies || [],
            loading: false,
            error: null,
          },
        };
      } catch (error) {
        if (signal.aborted) return null;
        return {
          key: categoryName,
          data: { movies: [], loading: false, error: error.message },
        };
      }
    };

    const promises = Object.entries(CATEGORIES).map(([name, id]) =>
      fetchCategory(name, id)
    );
    
    const results = await Promise.all(promises);
    if (signal.aborted) return;

    const newState = { ...categories };
    results.forEach(result => {
      if (result) newState[result.key] = result.data;
    });

    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        data: newState,
      }));
    } catch (e) {
    }
    
    setCategories(newState);
  }, []);

  useEffect(() => {
    const isAlreadyLoading = categories['Trending Now']?.loading;
    const hasData = categories['Trending Now']?.movies?.length > 0;
    
    if (hasData || isAlreadyLoading === false || !navigator.onLine) {
      return;
    }

    const abortController = new AbortController();
    fetchAllCategories(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [fetchAllCategories]);

  return categories;
}
