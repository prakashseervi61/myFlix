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

const initialState = Object.keys(CATEGORIES).reduce((acc, key) => {
  acc[key] = { movies: [], loading: true, error: null };
  return acc;
}, {});

export function useMovieCategories() {
  const [categories, setCategories] = useState(initialState);

  useEffect(() => {
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
            movies,
            loading: false,
            error: movies.length === 0 ? 'No movies found.' : null,
          },
        };
      } catch (error) {
        if (signal.aborted) return null;
        return {
          key: categoryName,
          data: {
            movies: [],
            loading: false,
            error: error.message,
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