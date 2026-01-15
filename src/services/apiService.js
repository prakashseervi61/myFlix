import { tmdbService } from './tmdbService.js';
import { omdbService } from './omdbService.js';
import { movieService } from './movieService.js';


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
    const results = await tmdbService.searchMovies(query, page, signal);
    return results || [];
  }

  async getMovieDetails(id, signal) {
    // This could be enhanced to aggregate data from multiple services
    return tmdbService.getMovieById(id, signal);
  }
}

export const apiService = new ApiService();