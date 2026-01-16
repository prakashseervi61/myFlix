import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * Preview modal context for movie quick view.
 * Manages modal open/close state and selected movie.
 */
const PreviewModalContext = createContext(null);

export function PreviewModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const openModal = useCallback((movie) => {
    setSelectedMovie(movie);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <PreviewModalContext.Provider value={{ isOpen, selectedMovie, openModal, closeModal }}>
      {children}
    </PreviewModalContext.Provider>
  );
}

export function usePreviewModal() {
  const context = useContext(PreviewModalContext);
  if (!context) {
    throw new Error('usePreviewModal must be used within a PreviewModalProvider');
  }
  return context;
}
