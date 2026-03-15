import { tmdbService } from './tmdbService.js';
import { omdbService } from './omdbService.js';
import { movieService } from './movieService.js';
import { tvService } from './tvService.js';


/**
 * Unified API service layer.
 * Currently delegates to TMDB but designed to aggregate multiple sources.
 * Extension point: Add fallback to OMDB/IMDB when TMDB fails.
 */
class ApiService {
  async getTrendingMovies(signal) {
    const results = await tmdbService.getTrendingMovies(signal);
    return results || [];
  }

  async getMoviesByGenre(genreId, signal) {
    const results = await tmdbService.getMoviesByGenre(genreId, signal);
    return results || [];
  }

  async searchMovies(query, page = 1, signal) {
    // Upgraded to multi-search to return both movies and TV shows
    const results = await tmdbService.searchMulti(query, page, signal);
    return results || [];
  }

  async getMovieDetails(id, signal) {
    return tmdbService.getMovieById(id, signal);
  }

  // --- TV API Delegations ---
  async getTrendingTV() {
    return tvService.getTrendingTV();
  }

  async getPopularTV() {
    return tvService.getPopularTV();
  }

  async getTopRatedTV() {
    return tvService.getTopRatedTV();
  }

  async getTVDetails(id) {
    return tvService.getTVDetails(id);
  }

  async getEpisodes(tvMazeId) {
    return tvService.getEpisodes(tvMazeId);
  }

  async getEpisodesByTmdbId(tmdbId) {
    return tvService.getEpisodesByTmdbId(tmdbId);
  }

  async getIMDbRatingForTV(title) {
    return tvService.getIMDbRating(title);
  }

  async discoverTV(params, signal) {
    return tvService.discoverTV(params, signal);
  }

  async getTVGenres(signal) {
    return tvService.getTVGenres(signal);
  }

  async getTVVideos(tvId, signal) {
    return tvService.getTVVideos(tvId, signal);
  }
}

export const apiService = new ApiService();