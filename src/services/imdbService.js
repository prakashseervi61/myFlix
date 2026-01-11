import { apiConfig } from '../config/apiConfig.js';

const BASE_URL = 'https://imdb-api.com/en/API';

class IMDbService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000;
  }

  isAvailable() {
    return apiConfig.hasImdbKeys();
  }

  buildUrl(endpoint, params = {}) {
    const apiKey = apiConfig.getImdbKey();
    if (!apiKey) throw new Error('IMDb API key not available');
    
    const url = new URL(`${BASE_URL}${endpoint}/${apiKey}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
    return url.toString();
  }

  async request(url, cacheKey, signal) {
    if (cacheKey && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    const response = await fetch(url, { signal });
    if (!response.ok) {
      if (response.status === 401) {
        apiConfig.rotateImdbKey();
      }
      throw new Error(`IMDb API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.errorMessage) {
      throw new Error(data.errorMessage);
    }

    if (cacheKey) {
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
    }
    return data;
  }

  async searchMovies(query, page = 1, signal) {
    if (!this.isAvailable()) return { results: [], total: 0 };
    
    const url = this.buildUrl('/SearchMovie', { expression: query });
    const cacheKey = `imdb_search_${query}_${page}`;
    
    try {
      const data = await this.request(url, cacheKey, signal);
      return {
        results: data.results || [],
        total: data.results?.length || 0
      };
    } catch (error) {
      return { results: [], total: 0 };
    }
  }

  async getMovieById(id, signal) {
    if (!this.isAvailable()) throw new Error('IMDb API not available');
    
    const url = this.buildUrl('/Title', { id });
    const cacheKey = `imdb_movie_${id}`;
    
    return await this.request(url, cacheKey, signal);
  }

  formatMovie(movie) {
    if (!movie) return null;
    
    return {
      id: movie.id,
      title: movie.title || movie.fullTitle,
      year: movie.year,
      poster: movie.image,
      genre: movie.genres,
      rating: movie.imDbRating ? parseFloat(movie.imDbRating) : null,
      plot: movie.plot,
      runtime: movie.runtimeStr,
      director: movie.directors,
      actors: movie.stars,
      type: 'movie'
    };
  }
}

export const imdbService = new IMDbService();