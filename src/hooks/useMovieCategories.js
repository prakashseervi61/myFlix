import { useState, useEffect } from 'react';
import { omdbService } from '../services/omdb';

// Curated search terms to simulate movie categories
const MOVIE_CATEGORIES = {
  trending: ['marvel', 'batman', 'star wars', 'avengers'],
  action: ['action', 'fast furious', 'mission impossible', 'john wick'],
  comedy: ['comedy', 'funny', 'laugh', 'humor'],
  drama: ['drama', 'oscar', 'award', 'story']
};

export function useMovieCategories() {
  const [categories, setCategories] = useState({
    trending: { movies: [], loading: true, error: null },
    action: { movies: [], loading: true, error: null },
    comedy: { movies: [], loading: true, error: null },
    drama: { movies: [], loading: true, error: null }
  });

  useEffect(() => {
    const fetchCategoryMovies = async (categoryName, searchTerms) => {
      try {
        // Fetch movies from multiple search terms
        const searchPromises = searchTerms.map(async (term, index) => {
          // Stagger requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, index * 200));
          try {
            const result = await omdbService.searchMovies(term);
            return (result.Search || []).slice(0, 4); // Limit per search
          } catch (error) {
            console.warn(`Search failed for "${term}":`, error.message);
            return [];
          }
        });

        const results = await Promise.all(searchPromises);
        const allMovies = results.flat();
        
        // Remove duplicates and format
        const uniqueMovies = allMovies.filter((movie, index, self) => 
          movie && index === self.findIndex(m => m && m.imdbID === movie.imdbID)
        );
        
        const formattedMovies = uniqueMovies
          .map(omdbService.formatMovie)
          .filter(movie => movie !== null)
          .slice(0, 12); // Limit total per category

        setCategories(prev => ({
          ...prev,
          [categoryName]: {
            movies: formattedMovies,
            loading: false,
            error: null
          }
        }));
      } catch (error) {
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

    // Fetch all categories
    Object.entries(MOVIE_CATEGORIES).forEach(([categoryName, searchTerms]) => {
      fetchCategoryMovies(categoryName, searchTerms);
    });
  }, []);

  return categories;
}