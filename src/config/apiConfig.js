const parseApiKeys = (envValue) => {
  if (!envValue || typeof envValue !== 'string') return [];
  return envValue.split(',').map(key => key.trim()).filter(key => key.length > 0);
};

const getRandomKey = (keys) => {
  if (!keys || keys.length === 0) return null;
  return keys[Math.floor(Math.random() * keys.length)];
};

class ApiConfig {
  constructor() {
    this.omdbKeys = parseApiKeys(import.meta.env.VITE_OMDB_API_KEY);
    this.tmdbKeys = parseApiKeys(import.meta.env.VITE_TMDB_API_KEYS);
    this.imdbKeys = parseApiKeys(import.meta.env.VITE_IMDB_API_KEYS);
    
    this.currentOmdbIndex = 0;
    this.currentTmdbIndex = 0;
    this.currentImdbIndex = 0;
  }

  getOmdbKey() {
    if (this.omdbKeys.length === 0) return null;
    return this.omdbKeys[this.currentOmdbIndex % this.omdbKeys.length];
  }

  getTmdbKey() {
    if (this.tmdbKeys.length === 0) return null;
    return this.tmdbKeys[this.currentTmdbIndex % this.tmdbKeys.length];
  }

  getImdbKey() {
    if (this.imdbKeys.length === 0) return null;
    return this.imdbKeys[this.currentImdbIndex % this.imdbKeys.length];
  }

  rotateOmdbKey() {
    if (this.omdbKeys.length > 1) {
      this.currentOmdbIndex = (this.currentOmdbIndex + 1) % this.omdbKeys.length;
    }
    return this.getOmdbKey();
  }

  rotateTmdbKey() {
    if (this.tmdbKeys.length > 1) {
      this.currentTmdbIndex = (this.currentTmdbIndex + 1) % this.tmdbKeys.length;
    }
    return this.getTmdbKey();
  }

  rotateImdbKey() {
    if (this.imdbKeys.length > 1) {
      this.currentImdbIndex = (this.currentImdbIndex + 1) % this.imdbKeys.length;
    }
    return this.getImdbKey();
  }

  hasOmdbKeys() {
    return this.omdbKeys.length > 0;
  }

  hasTmdbKeys() {
    return this.tmdbKeys.length > 0;
  }

  hasImdbKeys() {
    return this.imdbKeys.length > 0;
  }

  hasAnyKeys() {
    return this.hasOmdbKeys() || this.hasTmdbKeys() || this.hasImdbKeys();
  }
}

export const apiConfig = new ApiConfig();