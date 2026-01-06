import React, { createContext, useContext } from 'react';
import { useWatchlist as useWatchlistHook } from '../hooks/useWatchlist';

const WatchlistContext = createContext();

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within WatchlistProvider');
  }
  return context;
};

export const WatchlistProvider = ({ children }) => {
  const watchlistData = useWatchlistHook();
  
  return (
    <WatchlistContext.Provider value={watchlistData}>
      {children}
    </WatchlistContext.Provider>
  );
};