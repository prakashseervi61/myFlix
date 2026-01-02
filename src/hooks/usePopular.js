import { useState, useEffect, useMemo } from 'react';
import { omdb } from '../services/omdb';

// Cache for popular movies
let popularCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export function usePopular() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Popular search terms to simulate categories
  const searchTerms = useMemo(() => [
    'action', 'comedy', 'drama', 'thriller', 'horror', 'romance'
  ], []);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first
        const now = Date.now();
        if (popularCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
          setMovies(popularCache);
          setLoading(false);
          return;
        }

        // Fetch movies with staggered requests
        const moviePromises = searchTerms.slice(0, 4).map(async (term, index) => {
          try {
            await new Promise(resolve => setTimeout(resolve, index * 150));
            const results = await omdb.search(term);
            return results.slice(0, 4); // Limit per category
          } catch (err) {
            console.warn(`Popular search failed for "${term}":`, err.message);
            return [];
          }
        });

        const results = await Promise.all(moviePromises);
        const allMovies = results.flat();
        
        // Remove duplicates and format
        const uniqueMovies = allMovies.filter((movie, index, self) => 
          movie && index === self.findIndex(m => m && m.imdbID === movie.imdbID)
        );
        
        const formattedMovies = uniqueMovies
          .map(omdb.formatMovie)
          .filter(movie => movie !== null)
          .slice(0, 16);

        // Update cache
        popularCache = formattedMovies;
        cacheTimestamp = now;
        
        setMovies(formattedMovies);
      } catch (err) {
        console.error('Failed to fetch popular movies:', err);
        setError(err.message || 'Failed to load popular movies');
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPopular();
  }, [searchTerms]);

  return { movies, loading, error };
}