import { apiConfig } from '../config/apiConfig.js';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const POSTER_HIGH_URL = 'https://image.tmdb.org/t/p/w780';
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';
const REQUEST_TIMEOUT = 15000;

/**
 * TMDB API service with caching and request timeout.
 * Normalizes movie data to consistent shape for UI consumption.
 */
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

  async request(url, cacheKey, signal, retryCount = 0) {
    const MAX_RETRIES = apiConfig.tmdbKeys.length;

    if (cacheKey && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    const combinedSignals = [controller.signal];
    if (signal) combinedSignals.push(signal);
    const combinedSignal = this.combineAbortSignals(combinedSignals);

    try {
      const response = await fetch(url, { signal: combinedSignal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // Rotate key on rate limit or auth error
        if ((response.status === 429 || response.status === 401) && retryCount < MAX_RETRIES) {
          const newKey = apiConfig.rotateTmdbKey();
          const newUrl = new URL(url);
          newUrl.searchParams.set('api_key', newKey);
          return this.request(newUrl.toString(), cacheKey, signal, retryCount + 1);
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
        if (signal?.aborted) return { results: [] };
        // If it was our timeout, try another key
        if (retryCount < MAX_RETRIES) {
          const newKey = apiConfig.rotateTmdbKey();
          const newUrl = new URL(url);
          newUrl.searchParams.set('api_key', newKey);
          return this.request(newUrl.toString(), cacheKey, signal, retryCount + 1);
        }
        return { results: [] };
      }
      
      // For network errors (like ECONNRESET), also rotate and retry
      if (retryCount < MAX_RETRIES) {
        const newKey = apiConfig.rotateTmdbKey();
        const newUrl = new URL(url);
        newUrl.searchParams.set('api_key', newKey);
        return this.request(newUrl.toString(), cacheKey, signal, retryCount + 1);
      }
      
      throw error;
    }
  }

  /** Combines multiple abort signals for timeout + manual cancellation */
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

  /**
   * Normalizes TMDB movie data to consistent shape.
   * Ensures all movies have required fields with fallbacks.
   * @returns {Object|null} Normalized movie or null if invalid
   */
  normalizeMovieData(movie) {
    if (!movie || !movie.id || (!movie.title && !movie.original_title)) {
      return null;
    }

    const title = movie.title || movie.original_title;
    
    const poster = movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null;
    const poster_high = movie.poster_path ? `${POSTER_HIGH_URL}${movie.poster_path}` : null;
    const backdrop = movie.backdrop_path ? `${BACKDROP_BASE_URL}${movie.backdrop_path}` : null;

    return {
      id: String(movie.id),
      title: title,
      year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
      release_date: movie.release_date || null,
      poster: poster,
      backdrop: backdrop,
      poster_high: poster_high,
      rating: typeof movie.vote_average === 'number' ? movie.vote_average.toFixed(1) : '0.0',
      plot: movie.overview || 'No overview available.',
      genre_ids: Array.isArray(movie.genre_ids) ? movie.genre_ids : [],
      genres: Array.isArray(movie.genres) ? movie.genres.map(g => g.name) : [],
      runtime: movie.runtime || null,
      original_language: movie.original_language || 'en',
      popularity: movie.popularity || 0,
      director: movie.credits?.crew?.find(c => c.job === 'Director')?.name || null,
      actors: movie.credits?.cast?.slice(0, 3).map(c => c.name).join(', ') || null,
      cast: movie.credits?.cast?.slice(0, 15).map(c => ({
        id: c.id,
        name: c.name,
        character: c.character,
        profile_path: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null
      })) || [],
      images: (movie.images?.backdrops || []).slice(0, 12).map(img => ({
        file_path: img.file_path,
        aspect_ratio: img.aspect_ratio,
        url: `https://image.tmdb.org/t/p/w500${img.file_path}`,
        full: `https://image.tmdb.org/t/p/w1280${img.file_path}`
      }))
    };
  }

  async getTrendingMovies(signal) {
    const url = this.buildUrl('/trending/movie/week');
    const data = await this.request(url, 'trending_movies', signal);
    return (data.results || []).map(m => this.normalizeMovieData(m)).filter(Boolean);
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
    return (data.results || []).map(m => this.normalizeMovieData(m)).filter(Boolean);
  }

  async searchMovies(query, page = 1, signal) {
    if (!query) return [];
    const url = this.buildUrl('/search/movie', { query, page });
    const data = await this.request(url, `search_${query}_${page}`, signal);
    return (data.results || []).map(m => this.normalizeMovieData(m)).filter(Boolean);
  }

  async getMovieById(id, signal) {
    const url = this.buildUrl(`/movie/${id}`, { append_to_response: 'videos,credits,images' });
    const data = await this.request(url, `movie_${id}`, signal);
    return this.normalizeMovieData(data);
  }

  async getGenres(signal) {
    const url = this.buildUrl('/genre/movie/list');
    const data = await this.request(url, 'genres_list', signal);
    return data.genres || [];
  }

  /**
   * Discover movies with advanced filtering.
   * Transforms filter params to TMDB API format.
   * Note: only_with_trailer must be filtered client-side (not supported by API).
   */
  async discoverMovies(params = {}, signal) {
    const queryParams = {
      page: params.page || 1,
      sort_by: params.sort_by || 'popularity.desc',
      include_adult: false,
      include_video: false,
      ...params
    };
    
    if (params.year_min) queryParams['primary_release_date.gte'] = `${params.year_min}-01-01`;
    if (params.year_max) queryParams['primary_release_date.lte'] = `${params.year_max}-12-31`;
    
    if (params.min_rating) queryParams['vote_average.gte'] = params.min_rating;
    
    delete queryParams.year_min;
    delete queryParams.year_max;
    delete queryParams.min_rating;
    delete queryParams.only_with_trailer;

    const url = this.buildUrl('/discover/movie', queryParams);
    const cacheKey = `discover_${JSON.stringify(queryParams)}`;
    const data = await this.request(url, cacheKey, signal);
    return (data.results || []).map(m => this.normalizeMovieData(m)).filter(Boolean);
  }

  async getMovieVideos(movieId, signal) {
    const url = this.buildUrl(`/movie/${movieId}/videos`);
    const cacheKey = `videos_${movieId}`;
    const data = await this.request(url, cacheKey, signal);
    return data.results || [];
  }
}

export const tmdbService = new TMDBService();