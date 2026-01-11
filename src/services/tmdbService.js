import { apiConfig } from '../config/apiConfig.js';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const REQUEST_TIMEOUT = 15000;

class TMDBService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000;
    this.requestCount = 0;
    this.lastRequestTime = 0;
  }

  isAvailable() {
    return apiConfig.hasTmdbKeys();
  }

  buildUrl(endpoint, params = {}) {
    const apiKey = apiConfig.getTmdbKey();
    if (!apiKey) throw new Error('TMDB API key not available');
    
    const url = new URL(`${BASE_URL}${endpoint}`);
    url.searchParams.set('api_key', apiKey);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
    return url.toString();
  }

  async throttleRequest() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < 50) {
      await new Promise(resolve => setTimeout(resolve, 50 - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  async request(url, cacheKey, signal) {
    if (cacheKey && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    await this.throttleRequest();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    const combinedSignal = signal ? this.combineAbortSignals([signal, controller.signal]) : controller.signal;

    try {
      const response = await fetch(url, { 
        signal: combinedSignal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'myFlix/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 401) {
          apiConfig.rotateTmdbKey();
          throw new Error('Invalid API key');
        }
        if (response.status === 429) {
          throw new Error('Rate limit exceeded');
        }
        throw new Error(`TMDB API error: ${response.status}`);
      }

      const data = await response.json();
      if (cacheKey) {
        this.cache.set(cacheKey, { data, timestamp: Date.now() });
      }
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request cancelled');
      }
      throw error;
    }
  }

  combineAbortSignals(signals) {
    const controller = new AbortController();
    signals.forEach(signal => {
      if (signal && signal.aborted) {
        controller.abort();
      } else if (signal) {
        signal.addEventListener('abort', () => controller.abort(), { once: true });
      }
    });
    return controller.signal;
  }

  async searchMovies(query, page = 1, signal) {
    if (!this.isAvailable()) {
      return { results: [], total_results: 0 };
    }
    
    const url = this.buildUrl('/search/movie', { query, page });
    const cacheKey = `tmdb_search_${query}_${page}`;
    
    try {
      const data = await this.request(url, cacheKey, signal);
      return {
        results: data.results || [],
        total_results: data.total_results || 0
      };
    } catch (error) {
      console.warn('TMDB search failed:', error.message);
      return { results: [], total_results: 0 };
    }
  }

  async getMovieById(id, signal) {
    if (!this.isAvailable()) {
      throw new Error('TMDB API not available');
    }
    
    const url = this.buildUrl(`/movie/${id}`);
    const cacheKey = `tmdb_movie_${id}`;
    
    try {
      return await this.request(url, cacheKey, signal);
    } catch (error) {
      console.warn('TMDB movie fetch failed:', error.message);
      throw error;
    }
  }

  formatMovie(movie) {
    if (!movie) return null;
    
    return {
      id: movie.id?.toString(),
      title: movie.title || movie.original_title,
      year: movie.release_date ? new Date(movie.release_date).getFullYear().toString() : null,
      poster: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null,
      genre: movie.genres ? movie.genres.map(g => g.name).join(', ') : null,
      rating: movie.vote_average ? parseFloat(movie.vote_average.toFixed(1)) : null,
      plot: movie.overview || null,
      runtime: movie.runtime ? `${movie.runtime} min` : null,
      director: null,
      actors: null,
      type: 'movie'
    };
  }
}

export const tmdbService = new TMDBService();