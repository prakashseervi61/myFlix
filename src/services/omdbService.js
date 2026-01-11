import { apiConfig } from '../config/apiConfig.js';

const BASE_URL = 'https://www.omdbapi.com';
const REQUEST_TIMEOUT = 15000;

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

const cache = new LRUCache(50);
const CACHE_DURATION = 10 * 60 * 1000;

function sanitizeInput(input) {
  if (!input || typeof input !== 'string') return '';
  return input.replace(/[<>"'&]/g, '').trim().slice(0, 100);
}

class OMDbService {
  constructor() {
    this.requestCount = 0;
    this.lastRequestTime = 0;
  }

  isAvailable() {
    return apiConfig.hasOmdbKeys();
  }

  buildUrl(params) {
    const apiKey = apiConfig.getOmdbKey();
    if (!apiKey) throw new Error('OMDb API key not available');
    
    const url = new URL(BASE_URL);
    url.searchParams.set('apikey', apiKey);
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
    if (timeSinceLastRequest < 100) {
      await new Promise(resolve => setTimeout(resolve, 100 - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  async request(url, cacheKey, signal) {
    if (!apiConfig.hasOmdbKeys()) {
      throw new Error('OMDb API not available');
    }

    if (cacheKey && cache.get(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
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
          apiConfig.rotateOmdbKey();
          throw new Error('Invalid API key');
        }
        if (response.status === 429) {
          throw new Error('Rate limit exceeded');
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.Response === 'False') {
        if (data.Error === 'Invalid API key!') {
          apiConfig.rotateOmdbKey();
        }
        throw new Error(data.Error || 'API request failed');
      }

      if (cacheKey) {
        cache.set(cacheKey, { data, timestamp: Date.now() });
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
    const sanitizedQuery = sanitizeInput(query);
    if (!sanitizedQuery) return { Search: [], totalResults: 0 };

    if (!apiConfig.hasOmdbKeys()) {
      return this.getMockSearchData();
    }

    const url = this.buildUrl({ s: sanitizedQuery, page, type: 'movie' });
    const cacheKey = `omdb_search_${sanitizedQuery}_${page}`;

    try {
      const data = await this.request(url, cacheKey, signal);
      return {
        Search: data.Search || [],
        totalResults: parseInt(data.totalResults) || 0
      };
    } catch (error) {
      console.warn('OMDb search failed:', error.message);
      return this.getMockSearchData();
    }
  }

  async getMovieById(id, signal) {
    const sanitizedId = sanitizeInput(id);
    if (!sanitizedId) throw new Error('Movie ID is required');

    if (!apiConfig.hasOmdbKeys()) {
      return this.getMockMovieData(sanitizedId);
    }

    const url = this.buildUrl({ i: sanitizedId, plot: 'full' });
    const cacheKey = `omdb_movie_${sanitizedId}`;

    try {
      return await this.request(url, cacheKey, signal);
    } catch (error) {
      console.warn('OMDb movie fetch failed:', error.message);
      return this.getMockMovieData(sanitizedId);
    }
  }

  formatMovie(movie) {
    if (!movie) return null;
    
    return {
      id: movie.imdbID,
      title: movie.Title || 'Unknown Title',
      year: movie.Year || null,
      poster: movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : null,
      genre: movie.Genre || null,
      rating: movie.imdbRating && movie.imdbRating !== 'N/A' ? parseFloat(movie.imdbRating) : null,
      plot: movie.Plot || null,
      runtime: movie.Runtime || null,
      director: movie.Director || null,
      actors: movie.Actors || null,
      type: movie.Type || 'movie'
    };
  }

  getMockSearchData() {
    return {
      Search: [
        {
          Title: 'The Shawshank Redemption',
          Year: '1994',
          imdbID: 'tt0111161',
          Type: 'movie',
          Poster: 'https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg'
        },
        {
          Title: 'The Godfather',
          Year: '1972',
          imdbID: 'tt0068646',
          Type: 'movie',
          Poster: 'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg'
        },
        {
          Title: 'The Dark Knight',
          Year: '2008',
          imdbID: 'tt0468569',
          Type: 'movie',
          Poster: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg'
        }
      ],
      totalResults: 3
    };
  }

  getMockMovieData(id) {
    const mockData = {
      'tt0111161': {
        Title: 'The Shawshank Redemption',
        Year: '1994',
        Runtime: '142 min',
        Genre: 'Drama',
        Director: 'Frank Darabont',
        Actors: 'Tim Robbins, Morgan Freeman, Bob Gunton',
        Plot: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
        Poster: 'https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg',
        imdbRating: '9.3',
        imdbID: 'tt0111161',
        Type: 'movie',
        Response: 'True'
      }
    };
    return mockData[id] || mockData['tt0111161'];
  }

  clearCache() {
    cache.clear();
  }
}

export const omdbService = new OMDbService();