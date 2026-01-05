import { useState, useEffect } from 'react';
import { omdbService } from '../services/omdb';
import { MOVIE_CATEGORIES, CATEGORY_LIMITS, API_CONFIG } from '../utils/config';

export function useMovieCategories() {
  const [categories, setCategories] = useState({
    trending: { movies: [], loading: true, error: null },
    action: { movies: [], loading: true, error: null },
    comedy: { movies: [], loading: true, error: null },
    drama: { movies: [], loading: true, error: null }
  });

  useEffect(() => {
    const abortController = new AbortController();
    
    const fetchCategoryMovies = async (categoryName, searchTerms) => {
      try {
        // Check if service is available
        if (!omdbService.isAvailable()) {
          throw new Error('Movie service is currently unavailable');
        }

        // Reduce concurrent requests - fetch sequentially instead of parallel
        const allMovies = [];
        for (let i = 0; i < searchTerms.length && i < 2; i++) { // Limit to 2 terms per category
          const term = searchTerms[i];
          try {
            await new Promise(resolve => setTimeout(resolve, i * API_CONFIG.STAGGER_DELAY));
            const result = await omdbService.searchMovies(term, 1, abortController.signal);
            const movies = (result.Search || []).slice(0, CATEGORY_LIMITS.PER_SEARCH);
            allMovies.push(...movies);
          } catch (error) {
            console.warn(`Search failed for "${term}":`, error.message);
            // Continue with other terms instead of failing completely
          }
        }
        
        // Check if component is still mounted
        if (abortController.signal.aborted) return;
        
        // Remove duplicates and format
        const uniqueMovies = allMovies.filter((movie, index, self) => 
          movie && index === self.findIndex(m => m && m.imdbID === movie.imdbID)
        );
        
        const formattedMovies = uniqueMovies
          .map(omdbService.formatMovie)
          .filter(movie => movie !== null)
          .slice(0, CATEGORY_LIMITS.TOTAL_PER_CATEGORY);

        setCategories(prev => ({
          ...prev,
          [categoryName]: {
            movies: formattedMovies,
            loading: false,
            error: formattedMovies.length === 0 ? 'No movies found for this category' : null
          }
        }));
      } catch (error) {
        if (abortController.signal.aborted) return;
        
        console.error(`Failed to fetch ${categoryName} movies:`, error);
        setCategories(prev => ({
          ...prev,
          [categoryName]: {
            movies: [],
            loading: false,
            error: error.message
          }
        }));
      }
    };

    // Fetch categories sequentially to reduce server load
    const fetchAllCategories = async () => {
      const categoryEntries = Object.entries(MOVIE_CATEGORIES);
      for (let i = 0; i < categoryEntries.length; i++) {
        const [categoryName, searchTerms] = categoryEntries[i];
        await fetchCategoryMovies(categoryName, searchTerms);
        // Add delay between categories
        if (i < categoryEntries.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    };

    fetchAllCategories();

    return () => {
      abortController.abort();
    };
  }, []);

  return categories;
}