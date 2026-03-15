import React, { createContext, useContext, useState } from 'react';

/**
 * Context to persist UI state across navigations for Browse and Search pages.
 * Helps avoid duplicate API calls and maintain scroll position.
 */
const BrowseContext = createContext();

export const useBrowseState = () => {
  const context = useContext(BrowseContext);
  if (!context) {
    throw new Error('useBrowseState must be used within a BrowseProvider');
  }
  return context;
};

export const BrowseProvider = ({ children }) => {
  // Persistence for BrowsePage
  const [browseState, setBrowseState] = useState({
    movies: [],
    page: 1,
    hasMore: true,
    scrollPosition: 0,
    genres: [],
    lastFilters: null
  });

  // Persistence for SearchPage
  const [searchPageState, setSearchPageState] = useState({
    query: '',
    movies: [],
    page: 1,
    scrollPosition: 0,
    lastFilters: null,
    viewMode: 'grid'
  });

  // Persistence for HomePage scroll
  const [homeScrollPosition, setHomeScrollPosition] = useState(0);
  
  // Persistence for WatchlistPage
  const [watchlistScrollPosition, setWatchlistScrollPosition] = useState(0);

  const updateBrowseState = React.useCallback((updates) => {
    setBrowseState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateSearchPageState = React.useCallback((updates) => {
    setSearchPageState(prev => ({ ...prev, ...updates }));
  }, []);

  const value = React.useMemo(() => ({
    browseState, 
    updateBrowseState,
    searchPageState,
    updateSearchPageState,
    homeScrollPosition,
    setHomeScrollPosition,
    watchlistScrollPosition,
    setWatchlistScrollPosition
  }), [
    browseState, 
    updateBrowseState,
    searchPageState,
    updateSearchPageState,
    homeScrollPosition,
    setHomeScrollPosition,
    watchlistScrollPosition,
    setWatchlistScrollPosition
  ]);

  return (
    <BrowseContext.Provider value={value}>
      {children}
    </BrowseContext.Provider>
  );
};
