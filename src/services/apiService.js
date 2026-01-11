class CentralizedAPIService {
  constructor() {
    this.tmdbKeys = import.meta.env.VITE_TMDB_API_KEYS?.split(',') || [];
    this.imdbKeys = import.meta.env.VITE_IMDB_API_KEYS?.split(',') || [];
    this.omdbKey = import.meta.env.VITE_OMDB_API_KEY;
    this.currentTMDBIndex = 0;
    this.currentIMDBIndex = 0;
    this.cache = new Map();
  }

  async makeRequest(url, options = {}) {
    const cacheKey = `${url}_${JSON.stringify(options)}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 300000) {
        return cached.data;
      }
    }

    const response = await fetch(url, {
      timeout: 10000,
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    
    return data;
  }

  async searchMovies(query, page = 1) {
    // Try TMDB first
    if (this.tmdbKeys.length > 0) {
      try {
        const apiKey = this.tmdbKeys[this.currentTMDBIndex % this.tmdbKeys.length];
        const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=${page}`;
        const data = await this.makeRequest(url);
        
        if (data.results?.length > 0) {
          const formatted = data.results.map(this.formatTMDBMovie);
          return {
            Search: formatted,
            totalResults: data.total_results
          };
        }
      } catch (error) {
        this.currentTMDBIndex++;
      }
    }

    // Try IMDB/OMDB fallback
    if (this.imdbKeys.length > 0) {
      try {
        const apiKey = this.imdbKeys[this.currentIMDBIndex % this.imdbKeys.length];
        const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(query)}&page=${page}`;
        const data = await this.makeRequest(url);
        
        if (data.Response !== 'False' && data.Search) {
          return {
            Search: data.Search.map(this.formatOMDBMovie),
            totalResults: parseInt(data.totalResults) || 0
          };
        }
      } catch (error) {
        this.currentIMDBIndex++;
      }
    }

    // Final OMDB fallback
    if (this.omdbKey) {
      const url = `https://www.omdbapi.com/?apikey=${this.omdbKey}&s=${encodeURIComponent(query)}&page=${page}`;
      const data = await this.makeRequest(url);
      
      if (data.Response !== 'False' && data.Search) {
        return {
          Search: data.Search.map(this.formatOMDBMovie),
          totalResults: parseInt(data.totalResults) || 0
        };
      }
    }

    throw new Error('All movie APIs failed or returned no results');
  }

  async getMovieDetails(id) {
    // Try TMDB first
    if (this.tmdbKeys.length > 0) {
      try {
        const apiKey = this.tmdbKeys[this.currentTMDBIndex % this.tmdbKeys.length];
        const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&append_to_response=videos,credits`;
        const data = await this.makeRequest(url);
        return this.formatTMDBMovieDetails(data);
      } catch (error) {
        console.warn('TMDB details failed:', error.message);
      }
    }

    // Fallback to OMDB
    if (this.omdbKey) {
      const url = `https://www.omdbapi.com/?apikey=${this.omdbKey}&i=${id}&plot=full`;
      const data = await this.makeRequest(url);
      
      if (data.Response !== 'False') {
        return this.formatOMDBMovie(data);
      }
    }

    throw new Error('Failed to fetch movie details');
  }

  formatTMDBMovie(movie) {
    return {
      id: movie.id?.toString(),
      title: movie.title,
      year: movie.release_date?.split('-')[0],
      poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      genre: null,
      rating: movie.vote_average,
      plot: movie.overview,
      type: 'movie'
    };
  }

  formatTMDBMovieDetails(movie) {
    const trailer = movie.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    
    return {
      id: movie.id?.toString(),
      title: movie.title,
      year: movie.release_date?.split('-')[0],
      poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null,
      genre: movie.genres?.map(g => g.name).join(', '),
      rating: movie.vote_average,
      plot: movie.overview,
      runtime: movie.runtime ? `${movie.runtime} min` : null,
      director: movie.credits?.crew?.find(c => c.job === 'Director')?.name,
      actors: movie.credits?.cast?.slice(0, 5).map(a => a.name).join(', '),
      trailer: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
      type: 'movie'
    };
  }

  formatOMDBMovie(movie) {
    return {
      id: movie.imdbID,
      title: movie.Title,
      year: movie.Year,
      poster: movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : null,
      genre: movie.Genre,
      rating: movie.imdbRating && movie.imdbRating !== 'N/A' ? parseFloat(movie.imdbRating) : null,
      plot: movie.Plot,
      runtime: movie.Runtime,
      director: movie.Director,
      actors: movie.Actors,
      type: movie.Type || 'movie'
    };
  }

  clearCache() {
    this.cache.clear();
  }
}

export const apiService = new CentralizedAPIService();