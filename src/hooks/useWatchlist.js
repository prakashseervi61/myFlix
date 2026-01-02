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
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
    } catch (error) {
      console.error('Failed to save watchlist:', error);
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