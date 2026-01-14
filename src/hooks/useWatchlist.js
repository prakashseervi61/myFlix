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
    console.error('Failed to load watchlist data', error);
  }
  return { watchlist: [], watched: [], progress: {} };
};

const saveDataToStorage = (user, data) => {
  try {
    localStorage.setItem(getUserDataKey(user), JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save watchlist data', error);
  }
};

export function useWatchlist(user) {
  const [data, setData] = useState(() => loadDataFromStorage(user));

  // Reload data only when user ID changes (or user switches from null to object)
  useEffect(() => {
    setData(loadDataFromStorage(user));
  }, [user?.id]); 

  // Save data whenever it changes
  useEffect(() => {
    saveDataToStorage(user, data);
  }, [user, data]);

  const isInWatchlist = useCallback((movieId) => {
    if (!movieId) return false;
    const targetId = String(movieId);
    return data.watchlist.some(item => String(item.id) === targetId);
  }, [data.watchlist]);

  const toggleWatchlist = useCallback((movie) => {
    if (!movie?.id) return;
    const targetId = String(movie.id);
    
    setData(prev => {
      const exists = prev.watchlist.some(item => String(item.id) === targetId);
      let newWatchlist;
      
      if (exists) {
        newWatchlist = prev.watchlist.filter(item => String(item.id) !== targetId);
      } else {
        newWatchlist = [...prev.watchlist, { ...movie, id: targetId, addedAt: Date.now() }];
      }
      
      return { ...prev, watchlist: newWatchlist };
    });
  }, []);

  const addToWatchlist = useCallback((movie) => {
    if (!movie?.id) return;
    const targetId = String(movie.id);

    setData(prev => {
      if (prev.watchlist.some(item => String(item.id) === targetId)) {
        return prev;
      }
      return { ...prev, watchlist: [...prev.watchlist, { ...movie, id: targetId, addedAt: Date.now() }] };
    });
  }, []);

  const removeFromWatchlist = useCallback((movieId) => {
    if (!movieId) return;
    const targetId = String(movieId);
    
    setData(prev => ({
      ...prev,
      watchlist: prev.watchlist.filter(item => String(item.id) !== targetId),
    }));
  }, []);

  const markAsWatched = useCallback((movie) => {
    if (!movie?.id) return;
    const targetId = String(movie.id);

    setData(prev => {
      if (prev.watched.some(item => String(item.id) === targetId)) {
        return prev;
      }
      return { ...prev, watched: [...prev.watched, { ...movie, id: targetId, watchedAt: Date.now() }] };
    });
  }, []);
  
  const updateProgress = useCallback((movieId, progress) => {
    if (!movieId) return;
    const targetId = String(movieId);

    setData(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        [targetId]: { ...progress, updatedAt: Date.now() }
      }
    }));
  }, []);

  const continueWatching = Object.entries(data.progress)
    .filter(([, p]) => p.currentTime > 0 && p.currentTime / p.duration < 0.95)
    .sort((a, b) => b[1].updatedAt - a[1].updatedAt)
    .map(([movieId, progress]) => {
      const movie = data.watchlist.find(m => String(m.id) === movieId) || data.watched.find(m => String(m.id) === movieId);
      return movie ? { ...movie, ...progress } : null;
    })
    .filter(Boolean);

  return {
    watchlist: data.watchlist,
    watchedMovies: data.watched,
    continueWatching,
    isInWatchlist,
    toggleWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    markAsWatched,
    updateProgress,
    count: data.watchlist.length
  };
}