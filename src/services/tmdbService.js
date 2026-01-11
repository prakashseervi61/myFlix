import { apiConfig } from '../config/apiConfig.js';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const REQUEST_TIMEOUT = 15000;

class TMDBService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000;
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

  async request(url, cacheKey, signal) {
    if (cacheKey && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    const combinedSignal = signal ? this.combineAbortSignals([signal, controller.signal]) : controller.signal;

    try {
      const response = await fetch(url, { signal: combinedSignal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }

      const data = await response.json();
      if (cacheKey) {
        this.cache.set(cacheKey, { data, timestamp: Date.now() });
      }
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') return { results: [] };
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

  normalizeMovieData(movie) {
    if (!movie || !movie.poster_path || !movie.title || movie.popularity === 0) {
      return null;
    }
    return {
      id: movie.id.toString(),
      title: movie.title,
      year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
      poster: `${IMAGE_BASE_URL}${movie.poster_path}`,
      rating: movie.vote_average.toFixed(1),
      plot: movie.overview,
    };
  }

  async getTrendingMovies(signal) {
    const url = this.buildUrl('/trending/movie/week');
    const data = await this.request(url, 'trending_movies', signal);
    return data.results.map(this.normalizeMovieData).filter(Boolean);
  }

  async getMoviesByGenre(genreId, signal) {
    const params = {
      with_genres: genreId,
      sort_by: 'popularity.desc',
      include_adult: false,
      page: 1,
    };
    const url = this.buildUrl('/discover/movie', params);
    const cacheKey = `genre_${genreId}`;
    const data = await this.request(url, cacheKey, signal);
    return data.results.map(this.normalizeMovieData).filter(Boolean);
  }

  async searchMovies(query, page = 1, signal) {
    const url = this.buildUrl('/search/movie', { query, page });
    const data = await this.request(url, `search_${query}_${page}`, signal);
    return data.results.map(this.normalizeMovieData).filter(Boolean);
  }

  async getMovieById(id, signal) {
    const url = this.buildUrl(`/movie/${id}`, { append_to_response: 'videos' });
    const data = await this.request(url, `movie_${id}`, signal);
    return this.normalizeMovieData(data);
  }
}

export const tmdbService = new TMDBService();