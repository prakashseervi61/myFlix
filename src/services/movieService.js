const TMDB_API_KEYS = import.meta.env.VITE_TMDB_API_KEYS?.split(',') || [];
const IMDB_API_KEYS = import.meta.env.VITE_IMDB_API_KEYS?.split(',') || [];
const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY;

let currentTMDBIndex = 0;
let currentIMDBIndex = 0;

class MovieService {
  async searchMovies(query, page = 1) {
    try {
      const tmdbResult = await this.searchTMDB(query, page);
      if (tmdbResult.results?.length > 0) {
        const formatted = tmdbResult.results.map(this.formatTMDBMovie);
        return { Search: formatted };
      }
    } catch (error) {
    }

    try {
      const imdbResult = await this.searchIMDB(query, page);
      if (imdbResult.Search?.length > 0) {
        return imdbResult;
      }
    } catch (error) {
    }

    try {
      const omdbResult = await this.searchOMDB(query, page);
      return omdbResult;
    } catch (error) {
      return { Search: [] };
    }
  }

  async searchTMDB(query, page) {
    const apiKey = TMDB_API_KEYS[currentTMDBIndex % TMDB_API_KEYS.length];
    if (!apiKey) throw new Error('No TMDB API key available');
    
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=${page}`
    );
    
    if (!response.ok) {
      currentTMDBIndex++;
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    return await response.json();
  }

  async searchIMDB(query, page) {
    const apiKey = IMDB_API_KEYS[currentIMDBIndex % IMDB_API_KEYS.length];
    if (!apiKey) throw new Error('No IMDB API key available');
    
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(query)}&page=${page}`
    );
    
    if (!response.ok) {
      currentIMDBIndex++;
      throw new Error(`IMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.Response === 'False') {
      throw new Error(data.Error || 'IMDB search failed');
    }
    
    return data;
  }

  async searchOMDB(query, page) {
    if (!OMDB_API_KEY) throw new Error('No OMDB API key available');
    
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query)}&page=${page}`
    );
    
    if (!response.ok) {
      throw new Error(`OMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.Response === 'False') {
      throw new Error(data.Error || 'OMDB search failed');
    }
    
    return data;
  }

  formatTMDBMovie(movie) {
    const formatted = {
      id: movie.id?.toString(),
      title: movie.title,
      year: movie.release_date?.split('-')[0],
      poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      genre: null,
      rating: movie.vote_average,
      plot: movie.overview,
      type: 'movie'
    };
    return formatted;
  }

  formatMovie(movie) {
    if (!movie) return null;
    
    return {
      id: movie.imdbID || movie.id,
      title: movie.Title || movie.title,
      year: movie.Year || movie.release_date?.split('-')[0],
      poster: movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : 
              movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      genre: movie.Genre,
      rating: movie.imdbRating && movie.imdbRating !== 'N/A' ? parseFloat(movie.imdbRating) : movie.vote_average,
      plot: movie.Plot || movie.overview,
      runtime: movie.Runtime,
      director: movie.Director,
      actors: movie.Actors,
      type: movie.Type || 'movie'
    };
  }
}

export const movieService = new MovieService();