import { useState, useEffect } from 'react';

const WATCHLIST_KEY = 'myflix-watchlist';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState([]);

  // Load watchlist from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(WATCHLIST_KEY);
      if (saved) {
        setWatchlist(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load watchlist:', error);
    }
  }, []);

  // Save to localStorage whenever watchlist changes
  useEffect(() => {
    try {
      const data = JSON.stringify(watchlist);
      // Check if data is too large (rough estimate)
      if (data.length > 1024 * 1024) { // 1MB limit
        console.warn('Watchlist data too large, truncating oldest items');
        const truncated = watchlist.slice(-50); // Keep last 50 items
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(truncated));
        setWatchlist(truncated);
      } else {
        localStorage.setItem(WATCHLIST_KEY, data);
      }
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, clearing old data');
        try {
          // Try to save a smaller version
          const essential = watchlist.slice(-20).map(movie => ({
            id: movie.id,
            title: movie.title,
            poster: movie.poster,
            addedAt: movie.addedAt
          }));
          localStorage.setItem(WATCHLIST_KEY, JSON.stringify(essential));
          setWatchlist(essential);
        } catch (fallbackError) {
          console.error('Failed to save even essential watchlist data:', fallbackError);
          // Continue without localStorage
        }
      } else {
        console.error('Failed to save watchlist:', error);
      }
    }
  }, [watchlist]);

  const addToWatchlist = (movie) => {
    setWatchlist(prev => {
      const exists = prev.find(item => item.id === movie.id);
      if (exists) return prev;
      return [...prev, { ...movie, addedAt: Date.now() }];
    });
  };

  const removeFromWatchlist = (movieId) => {
    setWatchlist(prev => prev.filter(item => item.id !== movieId));
  };

  const isInWatchlist = (movieId) => {
    return watchlist.some(item => item.id === movieId);
  };

  const toggleWatchlist = (movie) => {
    if (isInWatchlist(movie.id)) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie);
    }
  };

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    toggleWatchlist,
    count: watchlist.length
  };
}