import { useState, useEffect, useCallback } from 'react';

const DEFAULT_KEY = 'myflix_filters_v1';

const DEFAULT_FILTERS = {
  sort_by: 'popularity.desc',
  with_genres: [],
  year_min: '',
  year_max: '',
  min_rating: 0,
  with_original_language: '',
  only_with_trailer: false
};

export function useFilters(storageKey = DEFAULT_KEY, initialOverrides = {}) {
  const [filters, setFilters] = useState(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      return saved ? { ...DEFAULT_FILTERS, ...JSON.parse(saved), ...initialOverrides } : { ...DEFAULT_FILTERS, ...initialOverrides };
    } catch {
      return { ...DEFAULT_FILTERS, ...initialOverrides };
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(filters));
    } catch (e) {
      // Ignore storage errors
    }
  }, [filters, storageKey]);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return { filters, updateFilter, resetFilters };
}
