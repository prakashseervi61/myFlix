// Movie category configuration
export const MOVIE_CATEGORIES = {
  trending: ['marvel', 'batman', 'star wars', 'avengers'],
  action: ['action', 'fast furious', 'mission impossible', 'john wick'],
  comedy: ['comedy', 'funny', 'laugh', 'humor'],
  drama: ['drama', 'oscar', 'award', 'story']
};

export const CATEGORY_LIMITS = {
  PER_SEARCH: 4,
  TOTAL_PER_CATEGORY: 12,
  SEARCH_RESULTS: 8
};

export const API_CONFIG = {
  STAGGER_DELAY: 500, // ms between requests - increased further
  DEBOUNCE_DELAY: 300, // ms for search debounce
  CACHE_DURATION: 10 * 60 * 1000, // 10 minutes
  REQUEST_TIMEOUT: 20000 // 20 seconds - increased timeout
};