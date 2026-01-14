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
      release_date: movie.release_date,
      poster: `${IMAGE_BASE_URL}${movie.poster_path}`,
      backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
      rating: movie.vote_average.toFixed(1),
      plot: movie.overview,
      genre_ids: movie.genre_ids || [],
      genres: movie.genres ? movie.genres.map(g => g.name) : [],
      runtime: movie.runtime,
      original_language: movie.original_language,
      popularity: movie.popularity
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

  async getGenres(signal) {
    const url = this.buildUrl('/genre/movie/list');
    const data = await this.request(url, 'genres_list', signal);
    return data.genres || [];
  }

  async discoverMovies(params = {}, signal) {
    const queryParams = {
      page: params.page || 1,
      sort_by: params.sort_by || 'popularity.desc',
      include_adult: false,
      include_video: true,
      ...params
    };
    
    // Handle year range
    if (params.year_min) queryParams['primary_release_date.gte'] = `${params.year_min}-01-01`;
    if (params.year_max) queryParams['primary_release_date.lte'] = `${params.year_max}-12-31`;
    
    // Handle specific mappings
    if (params.min_rating) queryParams['vote_average.gte'] = params.min_rating;
    if (params.with_genres) queryParams.with_genres = params.with_genres;
    if (params.with_original_language) queryParams.with_original_language = params.with_original_language;

    // Remove internal params that shouldn't go to API
    delete queryParams.year_min;
    delete queryParams.year_max;
    delete queryParams.min_rating;

    const url = this.buildUrl('/discover/movie', queryParams);
    // Create a specific cache key for the filter combination
    const cacheKey = `discover_${JSON.stringify(queryParams)}`;
    const data = await this.request(url, cacheKey, signal);
    return data.results.map(this.normalizeMovieData).filter(Boolean);
  }

  async getMovieVideos(movieId, signal) {
    const url = this.buildUrl(`/movie/${movieId}/videos`);
    // Cache videos for a movie
    const cacheKey = `videos_${movieId}`;
    const data = await this.request(url, cacheKey, signal);
    return data.results || [];
  }
}

export const tmdbService = new TMDBService();