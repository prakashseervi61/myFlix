import { useState, useEffect, useMemo } from 'react';
import { omdb } from '../services/omdb';

// Cache for trending movies to avoid repeated API calls
let trendingCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export function useTrending() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoized search terms to prevent recreation on every render
  const searchTerms = useMemo(() => [
    'money', 'spider', 'avengers', 'star wars', 'marvel', 'superman'
  ], []);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first
        const now = Date.now();
        if (trendingCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
          setMovies(trendingCache);
          setLoading(false);
          return;
        }

        // Fetch movies with controlled concurrency
        const moviePromises = searchTerms.slice(0, 4).map(async (term, index) => {
          try {
            // Stagger requests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, index * 100));
            const results = await omdb.search(term);
            return results.slice(0, 5); // Limit results per search
          } catch (err) {
            console.warn(`Search failed for "${term}":`, err.message);
            return [];
          }
        });

        const results = await Promise.all(moviePromises);
        const allMovies = results.flat();
        
        // Remove duplicates and format movies
        const uniqueMovies = allMovies.filter((movie, index, self) => 
          movie && index === self.findIndex(m => m && m.imdbID === movie.imdbID)
        );
        
        const formattedMovies = uniqueMovies
          .map(omdb.formatMovie)
          .filter(movie => movie !== null)
          .slice(0, 20); // Limit total movies

        // Update cache
        trendingCache = formattedMovies;
        cacheTimestamp = now;
        
        setMovies(formattedMovies);
      } catch (err) {
        console.error('Failed to fetch trending movies:', err);
        setError(err.message || 'Failed to load movies');
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [searchTerms]);

  return { movies, loading, error };
}