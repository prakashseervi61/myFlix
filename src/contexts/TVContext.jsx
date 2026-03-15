import React, { createContext, useContext } from 'react';
import { useTVCategories } from '../hooks/useTVCategories.js';

/**
 * TV context providing TV category data to homepage.
 */
const TVContext = createContext();

export const useTV = () => {
  const context = useContext(TVContext);
  if (!context) {
    throw new Error('useTV must be used within TVProvider');
  }
  return context;
};

export const TVProvider = ({ children }) => {
  const categories = useTVCategories();
  
  return (
    <TVContext.Provider value={categories}>
      {children}
    </TVContext.Provider>
  );
};
