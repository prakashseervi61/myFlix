import { useState, useEffect, useCallback } from 'react';

const getUserDataKey = (user) => 
  user ? `myflix-userdata-${user.id}` : 'myflix-userdata-guest';

const loadDataFromStorage = (user) => {
  try {
    const saved = localStorage.getItem(getUserDataKey(user));
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        watchlist: parsed.watchlist || [],
        watched: parsed.watched || [],
        progress: parsed.progress || {},
      };
    }
  } catch (error) {
    
  }
  return { watchlist: [], watched: [], progress: {} };
};

const saveDataToStorage = (user, data) => {
  try {
    localStorage.setItem(getUserDataKey(user), JSON.stringify(data));
  } catch (error) {
    
  }
};

export function useWatchlist(user) {
  const [data, setData] = useState(() => loadDataFromStorage(user));

  useEffect(() => {
    setData(loadDataFromStorage(user));
  }, [user]);

  useEffect(() => {
    if (user) {
      saveDataToStorage(user, data);
    }
  }, [user, data]);

  const addToWatchlist = useCallback((movie) => {
    if (!movie?.id) return;
    setData(prev => {
      if (prev.watchlist.some(item => item.id === movie.id)) {
        return prev;
      }
      return { ...prev, watchlist: [...prev.watchlist, { ...movie, addedAt: Date.now() }] };
    });
  }, []);

  const removeFromWatchlist = useCallback((movieId) => {
    if (!movieId) return;
    setData(prev => ({
      ...prev,
      watchlist: prev.watchlist.filter(item => item.id !== movieId),
    }));
  }, []);

  const isInWatchlist = useCallback((movieId) => {
    if (!movieId) return false;
    return data.watchlist.some(item => item.id === movieId);
  }, [data.watchlist]);

  const toggleWatchlist = useCallback((movie) => {
    if (!movie?.id) return;
    setData(prev => {
      const exists = prev.watchlist.some(item => item.id === movie.id);
      if (exists) {
        return { ...prev, watchlist: prev.watchlist.filter(item => item.id !== movie.id) };
      }
      return { ...prev, watchlist: [...prev.watchlist, { ...movie, addedAt: Date.now() }] };
    });
  }, []);

  const markAsWatched = useCallback((movie) => {
    if (!movie?.id) return;
    setData(prev => {
      if (prev.watched.some(item => item.id === movie.id)) {
        return prev;
      }
      return { ...prev, watched: [...prev.watched, { ...movie, watchedAt: Date.now() }] };
    });
  }, []);
  
  const updateProgress = useCallback((movieId, progress) => {
    if (!movieId) return;
    setData(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        [movieId]: { ...progress, updatedAt: Date.now() }
      }
    }));
  }, []);

  const continueWatching = Object.entries(data.progress)
    .filter(([, p]) => p.currentTime > 0 && p.currentTime / p.duration < 0.95)
    .sort((a, b) => b[1].updatedAt - a[1].updatedAt)
    .map(([movieId, progress]) => {
      const movie = data.watchlist.find(m => m.id === movieId) || data.watched.find(m => m.id === movieId);
      return movie ? { ...movie, ...progress } : null;
    })
    .filter(Boolean);

  return {
    watchlist: data.watchlist,
    watchedMovies: data.watched,
    continueWatching,
    isInWatchlist,
    toggleWatchlist,
    markAsWatched,
    updateProgress,
    count: data.watchlist.length
  };
}
