import { tmdbService } from './tmdbService.js';
import { omdbService } from './omdbService.js';
import { movieService } from './movieService.js';


class ApiService {
  async getTrendingMovies(signal) {
    return tmdbService.getTrendingMovies(signal);
  }

  async getMoviesByGenre(genreId, signal) {
    return tmdbService.getMoviesByGenre(genreId, signal);
  }

  async searchMovies(query, page = 1, signal) {
    return tmdbService.searchMovies(query, page, signal);
  }

  async getMovieDetails(id, signal) {
    // This could be enhanced to aggregate data from multiple services
    return tmdbService.getMovieById(id, signal);
  }
}

export const apiService = new ApiService();