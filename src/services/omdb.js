// OMDb API Service
const API_KEY = import.meta.env.VITE_OMDB_API_KEY;
const BASE_URL = 'https://www.omdbapi.com';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Simple cache implementation
const cache = new Map();

class OMDbService {
  constructor() {
    if (!API_KEY) {
      throw new Error('OMDb API key is missing. Set VITE_OMDB_API_KEY in .env file.');
    }
  }

  // Build API URL with parameters
  buildUrl(params) {
    const url = new URL(BASE_URL);
    url.searchParams.set('apikey', API_KEY);
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
    return url.toString();
  }

  // Generic API request with caching
  async request(url, cacheKey) {
    // Check cache first
    if (cacheKey && cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }
      cache.delete(cacheKey);
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.Response === 'False') {
        throw new Error(data.Error || 'API request failed');
      }

      // Cache successful response
      if (cacheKey) {
        cache.set(cacheKey, { data, timestamp: Date.now() });
      }

      return data;
    } catch (error) {
      console.error('OMDb API Error:', error);
      throw error;
    }
  }

  // Search movies by title
  async searchMovies(query, page = 1) {
    if (!query?.trim()) return { Search: [], totalResults: 0 };
    
    const url = this.buildUrl({ s: query.trim(), page });
    const cacheKey = `search_${query}_${page}`;
    
    const data = await this.request(url, cacheKey);
    return {
      Search: data.Search || [],
      totalResults: parseInt(data.totalResults) || 0
    };
  }

  // Get movie details by ID
  async getMovieById(id) {
    if (!id?.trim()) throw new Error('Movie ID is required');
    
    const url = this.buildUrl({ i: id.trim(), plot: 'full' });
    const cacheKey = `movie_${id}`;
    
    return await this.request(url, cacheKey);
  }

  // Format movie data for UI components
  formatMovie(movie) {
    if (!movie) return null;
    
    // Use a placeholder service for invalid/blocked images
    const getPosterUrl = (poster) => {
      if (!poster || poster === 'N/A') return null;
      // Return original poster URL - fallback handled in component
      return poster;
    };
    
    return {
      id: movie.imdbID,
      title: movie.Title || 'Unknown Title',
      year: movie.Year || null,
      poster: getPosterUrl(movie.Poster),
      genre: movie.Genre || null,
      rating: movie.imdbRating && movie.imdbRating !== 'N/A' ? parseFloat(movie.imdbRating) : null,
      plot: movie.Plot || null,
      runtime: movie.Runtime || null,
      director: movie.Director || null,
      actors: movie.Actors || null,
      type: movie.Type || 'movie'
    };
  }

  // Clear cache (useful for testing)
  clearCache() {
    cache.clear();
  }
}

export const omdbService = new OMDbService();