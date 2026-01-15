import { apiConfig } from '../config/apiConfig.js';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';
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
    // Basic validation: must have ID and title/original_title
    if (!movie || !movie.id || (!movie.title && !movie.original_title)) {
      return null;
    }

    const title = movie.title || movie.original_title;
    
    // Fallback for poster if needed (though UI might show placeholder)
    const poster = movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null;
    const backdrop = movie.backdrop_path ? `${BACKDROP_BASE_URL}${movie.backdrop_path}` : null;

    return {
      id: String(movie.id), // Ensure ID is string for consistency
      title: title,
      year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
      release_date: movie.release_date || null,
      poster: poster,
      backdrop: backdrop,
      rating: typeof movie.vote_average === 'number' ? movie.vote_average.toFixed(1) : '0.0',
      plot: movie.overview || 'No overview available.',
      genre_ids: Array.isArray(movie.genre_ids) ? movie.genre_ids : [],
      genres: Array.isArray(movie.genres) ? movie.genres.map(g => g.name) : [],
      runtime: movie.runtime || null,
      original_language: movie.original_language || 'en',
      popularity: movie.popularity || 0,
      director: movie.credits?.crew?.find(c => c.job === 'Director')?.name || null,
      actors: movie.credits?.cast?.slice(0, 3).map(c => c.name).join(', ') || null
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
    // Append credits to get director/actors in one call
    const url = this.buildUrl(`/movie/${id}`, { append_to_response: 'videos,credits' });
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
      include_video: false, // Usually false for discover to get more results
      ...params
    };
    
    // Handle year range
    if (params.year_min) queryParams['primary_release_date.gte'] = `${params.year_min}-01-01`;
    if (params.year_max) queryParams['primary_release_date.lte'] = `${params.year_max}-12-31`;
    
    // Handle specific mappings
    if (params.min_rating) queryParams['vote_average.gte'] = params.min_rating;
    
    // Clean up internal keys
    delete queryParams.year_min;
    delete queryParams.year_max;
    delete queryParams.min_rating;
    delete queryParams.only_with_trailer; // Handle externally or if API supports it (it doesn't directly)

    const url = this.buildUrl('/discover/movie', queryParams);
    // Create a specific cache key for the filter combination
    const cacheKey = `discover_${JSON.stringify(queryParams)}`;
    const data = await this.request(url, cacheKey, signal);
    return (data.results || []).map(m => this.normalizeMovieData(m)).filter(Boolean);
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