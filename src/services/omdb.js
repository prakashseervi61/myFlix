// OMDb API Service
const API_KEY = import.meta.env.VITE_OMDB_API_KEY;
const BASE_URL = 'https://www.omdbapi.com';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const MAX_CACHE_SIZE = 50;
const REQUEST_TIMEOUT = 20000; // 20 seconds - increased for slower connections

// LRU Cache implementation
class LRUCache {
  constructor(maxSize) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (this.cache.has(key)) {
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear() {
    this.cache.clear();
  }
}

const cache = new LRUCache(MAX_CACHE_SIZE);

// Input sanitization
function sanitizeInput(input) {
  if (!input || typeof input !== 'string') return '';
  return input.replace(/[<>"'&]/g, '').trim().slice(0, 100);
}

class OMDbService {
  constructor() {
    this.hasValidApiKey = Boolean(API_KEY);
    // Don't throw - allow app to start but provide degraded experience
  }

  // Check if service is available
  isAvailable() {
    return this.hasValidApiKey;
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
  async request(url, cacheKey, signal) {
    // Return mock data if API key is missing
    if (!this.hasValidApiKey) {
      throw new Error('Movie service unavailable. Please check configuration.');
    }

    // Check cache first
    if (cacheKey && cache.get(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }
    }

    try {
      // Add timeout to prevent hanging requests
      const timeoutController = new AbortController();
      const timeoutId = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT);
      
      const combinedSignal = signal ? this.combineAbortSignals([signal, timeoutController.signal]) : timeoutController.signal;
      
      const response = await fetch(url, { signal: combinedSignal });
      clearTimeout(timeoutId);
      
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
      if (error.name === 'AbortError') {
        throw new Error('Request timeout or cancelled');
      }
      console.error('OMDb API Error:', error);
      throw error;
    }
  }

  // Combine multiple abort signals
  combineAbortSignals(signals) {
    const controller = new AbortController();
    signals.forEach(signal => {
      if (signal.aborted) {
        controller.abort();
      } else {
        signal.addEventListener('abort', () => controller.abort());
      }
    });
    return controller.signal;
  }

  // Search movies by title
  async searchMovies(query, page = 1, signal) {
    const sanitizedQuery = sanitizeInput(query);
    if (!sanitizedQuery) return { Search: [], totalResults: 0 };
    
    const url = this.buildUrl({ s: sanitizedQuery, page });
    const cacheKey = `search_${sanitizedQuery}_${page}`;
    
    const data = await this.request(url, cacheKey, signal);
    return {
      Search: data.Search || [],
      totalResults: parseInt(data.totalResults) || 0
    };
  }

  // Get movie details by ID
  async getMovieById(id, signal) {
    const sanitizedId = sanitizeInput(id);
    if (!sanitizedId) throw new Error('Movie ID is required');
    
    const url = this.buildUrl({ i: sanitizedId, plot: 'full' });
    const cacheKey = `movie_${sanitizedId}`;
    
    return await this.request(url, cacheKey, signal);
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