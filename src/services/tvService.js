import { apiConfig } from '../config/apiConfig.js';
import { tmdbService } from './tmdbService.js'; // To reuse logic if needed, or we implement our own

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TVMAZE_BASE_URL = 'https://api.tvmaze.com';
const OMDB_BASE_URL = 'https://www.omdbapi.com';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';
const REQUEST_TIMEOUT = 15000;

class TVService {
  /** Helper to build TMDB URLs */
  buildTmdbUrl(endpoint, params = {}) {
    const apiKey = apiConfig.getTmdbKey();
    if (!apiKey) throw new Error('TMDB API key not available');
    
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.set('api_key', apiKey);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
    return url.toString();
  }

  /** Unified fetch request with timeout */
  async fetchWithTimeout(url, options = {}) {
    const { timeout = REQUEST_TIMEOUT } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal  
    });
    clearTimeout(id);
    return response;
  }

  /** Normalize TMDB TV Show data */
  normalizeTVData(show) {
    if (!show || !show.id || (!show.name && !show.original_name)) return null;

    return {
      id: String(show.id),
      title: show.name || show.original_name, // Map name to title for consistent UI rendering
      year: show.first_air_date ? show.first_air_date.split('-')[0] : 'N/A',
      first_air_date: show.first_air_date || null,
      poster: show.poster_path ? `${IMAGE_BASE_URL}${show.poster_path}` : null,
      backdrop: show.backdrop_path ? `${BACKDROP_BASE_URL}${show.backdrop_path}` : null,
      rating: typeof show.vote_average === 'number' ? show.vote_average.toFixed(1) : '0.0',
      plot: show.overview || 'No overview available.',
      media_type: 'tv',
      genres: show.genres ? show.genres.map(g => g.name) : [],
      number_of_seasons: show.number_of_seasons || null,
      seasons: show.seasons || [],
    };
  }

  // 1. Fetch Trending TV
  async getTrendingTV() {
    try {
      const url = this.buildTmdbUrl('/trending/tv/week');
      const response = await this.fetchWithTimeout(url);
      if (!response.ok) throw new Error(`TMDB error: ${response.status}`);
      const data = await response.json();
      return (data.results || []).map(show => this.normalizeTVData(show)).filter(Boolean);
    } catch (error) {
      console.error("Error fetching Trending TV:", error);
      return [];
    }
  }

  // 2. Fetch Popular TV
  async getPopularTV() {
    try {
      const url = this.buildTmdbUrl('/tv/popular');
      const response = await this.fetchWithTimeout(url);
      if (!response.ok) throw new Error(`TMDB error: ${response.status}`);
      const data = await response.json();
      return (data.results || []).map(show => this.normalizeTVData(show)).filter(Boolean);
    } catch (error) {
      console.error("Error fetching Popular TV:", error);
      return [];
    }
  }
  
  // 3. Fetch Top Rated TV
  async getTopRatedTV() {
    try {
      const url = this.buildTmdbUrl('/tv/top_rated');
      const response = await this.fetchWithTimeout(url);
      if (!response.ok) throw new Error(`TMDB error: ${response.status}`);
      const data = await response.json();
      return (data.results || []).map(show => this.normalizeTVData(show)).filter(Boolean);
    } catch (error) {
      console.error("Error fetching Top Rated TV:", error);
      return [];
    }
  }

  // 4. Fetch TV Details (TMDB)
  async getTVDetails(tvId) {
    try {
      const url = this.buildTmdbUrl(`/tv/${tvId}`, { append_to_response: 'credits,videos' });
      const response = await this.fetchWithTimeout(url);
      if (!response.ok) throw new Error(`TMDB error: ${response.status}`);
      const data = await response.json();
      
      const normalized = this.normalizeTVData(data);
      if (normalized) {
        normalized.cast = data.credits?.cast?.slice(0, 15).map(c => ({
          id: c.id,
          name: c.name,
          character: c.character,
          profile_path: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null
        })) || [];
        normalized.videos = data.videos?.results || [];
      }
      return normalized;
    } catch (error) {
      console.error(`Error fetching TV Details for ${tvId}:`, error);
      return null;
    }
  }

  // 5. Fetch Seasons (TMDB)
  async getSeasons(tvId) {
    // The details endpoint already returns a lightweight seasons array
    // This fetches full season details if needed, but here we just return seasons from details
    // Alternatively, we can use the details endpoint directly.
    const details = await this.getTVDetails(tvId);
    return details ? details.seasons : [];
  }

  // 6. Fetch Episodes (TVMaze)
  // Maps a show's external TMDB id to TVMaze, then gets episodes.
  async getEpisodesByTmdbId(tmdbId) {
    try {
      // Step 1: Lookup TVMaze ID using TMDB ID
      const lookupUrl = `${TVMAZE_BASE_URL}/lookup/shows?thetvdb=${tmdbId}`; // Note: TVMaze lookup prefers thetvdb or imdb. Wait, TVMaze has /lookup/shows?thetvdb=... or imdb=...
      // Since TMDB is not an explicit parameter in TVMaze lookup, we must query TVMaze by IMDB id.
      // Fetch IMDB ID from TMDB
      const tmdbExternalUrl = this.buildTmdbUrl(`/tv/${tmdbId}/external_ids`);
      const tmdbExtRes = await this.fetchWithTimeout(tmdbExternalUrl);
      const extData = await tmdbExtRes.json();
      
      const imdbId = extData.imdb_id;
      if (!imdbId) return [];

      // Step 2: Get TVMaze show by IMDB ID
      const tvMazeLookupUrl = `${TVMAZE_BASE_URL}/lookup/shows?imdb=${imdbId}`;
      const tvMazeRes = await this.fetchWithTimeout(tvMazeLookupUrl);
      if (!tvMazeRes.ok) throw new Error('Show not found on TVMaze');
      const tvMazeShow = await tvMazeRes.json();

      // Step 3: Get episodes
      const episodesUrl = `${TVMAZE_BASE_URL}/shows/${tvMazeShow.id}/episodes`;
      const epRes = await this.fetchWithTimeout(episodesUrl);
      if (!epRes.ok) throw new Error('Episodes not found');
      return await epRes.json();
      
    } catch (error) {
      console.error(`Error fetching episodes for TMDB ID ${tmdbId}:`, error);
      return [];
    }
  }

  /** Optional: Fetch directly by existing TVMaze ID if we have it */
  async getEpisodes(tvMazeId) {
     try {
      const episodesUrl = `${TVMAZE_BASE_URL}/shows/${tvMazeId}/episodes`;
      const epRes = await this.fetchWithTimeout(episodesUrl);
      if (!epRes.ok) throw new Error('Episodes not found');
      return await epRes.json();
    } catch (error) {
      console.error(`Error fetching episodes from TVMaze:`, error);
      return [];
    }
  }

  // 7. Fetch OMDb Rating
  async getIMDbRating(title) {
    if (!title) return null;
    try {
      const apiKey = apiConfig.getOmdbKey();
      if (!apiKey) return null;
      
      const url = new URL(OMDB_BASE_URL);
      url.searchParams.set('apikey', apiKey);
      url.searchParams.set('t', title);
      url.searchParams.set('type', 'series'); // explicit series search
      
      const response = await this.fetchWithTimeout(url.toString());
      if (!response.ok) throw new Error(`OMDb error: ${response.status}`);
      
      const data = await response.json();
      if (data.Response === 'True' && data.imdbRating && data.imdbRating !== 'N/A') {
        return parseFloat(data.imdbRating);
      }
      return null;
    } catch (error) {
      console.error(`Error fetching OMDb rating for ${title}:`, error);
      return null;
    }
  }

  // 8. Discover TV Shows
  async discoverTV(params = {}, signal) {
    const queryParams = {
      page: params.page || 1,
      sort_by: params.sort_by || 'popularity.desc',
      include_adult: false,
      ...params
    };
    
    if (params.year_min) queryParams['first_air_date.gte'] = `${params.year_min}-01-01`;
    if (params.year_max) queryParams['first_air_date.lte'] = `${params.year_max}-12-31`;
    if (params.min_rating) queryParams['vote_average.gte'] = params.min_rating;
    
    delete queryParams.year_min;
    delete queryParams.year_max;
    delete queryParams.min_rating;
    delete queryParams.only_with_trailer;

    try {
      const url = this.buildTmdbUrl('/discover/tv', queryParams);
      const response = await this.fetchWithTimeout(url, { signal });
      if (!response.ok) throw new Error(`TMDB error: ${response.status}`);
      const data = await response.json();
      return (data.results || []).map(show => this.normalizeTVData(show)).filter(Boolean);
    } catch (error) {
       console.error("Error discovering TV shows:", error);
       return [];
    }
  }

  // 9. Get TV Genres
  async getTVGenres(signal) {
    try {
      const url = this.buildTmdbUrl('/genre/tv/list');
      const response = await this.fetchWithTimeout(url, { signal });
      if (!response.ok) throw new Error(`TMDB error: ${response.status}`);
      const data = await response.json();
      return data.genres || [];
    } catch (error) {
       console.error("Error fetching TV genres:", error);
       return [];
    }
  }

  // 10. Get TV Videos
  async getTVVideos(tvId, signal) {
    try {
      const url = this.buildTmdbUrl(`/tv/${tvId}/videos`);
      const response = await this.fetchWithTimeout(url, { signal });
      if (!response.ok) return [];
      const data = await response.json();
      return data.results || [];
    } catch (error) {
       console.error("Error fetching TV videos:", error);
       return [];
    }
  }
}

export const tvService = new TVService();
