import React, { createContext, useContext } from 'react';
import { useMovieCategories } from '../hooks/useMovieCategories.js';

/**
 * Movie context providing category data to homepage.
 * Wraps useMovieCategories hook for global access.
 */
const MovieContext = createContext();

export const useMovies = () => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error('useMovies must be used within MovieProvider');
  }
  return context;
};

export const MovieProvider = ({ children }) => {
  const categories = useMovieCategories();
  
  return (
    <MovieContext.Provider value={categories}>
      {children}
    </MovieContext.Provider>
  );
};