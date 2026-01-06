import { useState, useEffect } from 'react';
import { useAuth } from './useAuth.jsx';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const { user } = useAuth();
  
  const getWatchlistKey = () => {
    return user ? `myflix-watchlist-${user.id}` : 'myflix-watchlist-guest';
  };

  // Load watchlist from localStorage on mount or user change
  useEffect(() => {
    if (!user) {
      setWatchlist([]);
      return;
    }
    
    try {
      const saved = localStorage.getItem(getWatchlistKey());
      if (saved) {
        setWatchlist(JSON.parse(saved));
      } else {
        setWatchlist([]);
      }
    } catch (error) {
      console.error('Failed to load watchlist:', error);
      setWatchlist([]);
    }
  }, [user]);

  // Save to localStorage whenever watchlist changes
  useEffect(() => {
    if (!user) return;
    
    try {
      const data = JSON.stringify(watchlist);
      // Check if data is too large (rough estimate)
      if (data.length > 1024 * 1024) { // 1MB limit
        console.warn('Watchlist data too large, truncating oldest items');
        const truncated = watchlist.slice(-50); // Keep last 50 items
        localStorage.setItem(getWatchlistKey(), JSON.stringify(truncated));
        setWatchlist(truncated);
      } else {
        localStorage.setItem(getWatchlistKey(), data);
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
          localStorage.setItem(getWatchlistKey(), JSON.stringify(essential));
          setWatchlist(essential);
        } catch (fallbackError) {
          console.error('Failed to save even essential watchlist data:', fallbackError);
          // Continue without localStorage
        }
      } else {
        console.error('Failed to save watchlist:', error);
      }
    }
  }, [watchlist, user]);

  const addToWatchlist = (movie) => {
    if (!movie || !movie.id) {
      console.warn('Cannot add invalid movie to watchlist:', movie);
      return;
    }
    setWatchlist(prev => {
      const exists = prev.find(item => item.id === movie.id);
      if (exists) return prev;
      return [...prev, { ...movie, addedAt: Date.now() }];
    });
  };

  const removeFromWatchlist = (movieId) => {
    if (!movieId) {
      console.warn('Cannot remove movie without ID from watchlist');
      return;
    }
    setWatchlist(prev => prev.filter(item => item.id !== movieId));
  };

  const isInWatchlist = (movieId) => {
    if (!movieId) return false;
    return watchlist.some(item => item.id === movieId);
  };

  const toggleWatchlist = (movie) => {
    if (!movie || !movie.id) {
      console.warn('Cannot toggle invalid movie in watchlist:', movie);
      return;
    }
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