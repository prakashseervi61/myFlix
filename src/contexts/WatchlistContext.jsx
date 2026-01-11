import React, { createContext, useContext } from 'react';
import { useWatchlist as useWatchlistHook } from '../hooks/useWatchlist.js';
import { useAuth } from '../hooks/useAuth.jsx';

const WatchlistContext = createContext(null);

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};

export const WatchlistProvider = ({ children }) => {
  const { user, loading } = useAuth();
  const watchlistData = useWatchlistHook(user);

  if (loading) {
    return null;
  }

  return (
    <WatchlistContext.Provider value={watchlistData}>
      {children}
    </WatchlistContext.Provider>
  );
};