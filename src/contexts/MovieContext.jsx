import React, { createContext, useContext } from 'react';
import { useMovieCategories } from '../hooks/useMovieCategories';

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