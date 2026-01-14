import React, { createContext, useContext, useState, useCallback } from 'react';

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
    // Delay clearing movie to allow animation to finish if needed, 
    // or just clear immediately. Clearning immediately is safer for next open.
    // But for fade out, we might want to keep it.
    // For now, let's keep it until next open or timeout, but strictly 
    // we just need `isOpen` false to hide it. 
    // We'll let the modal handle the exit animation using `AnimatePresence` 
    // or CSS transitions while `isOpen` changes.
    // Actually, to avoid content flashing, keep `selectedMovie` populated until new one opens
    // or explicitly clear it after a delay.
    // Simple approach: keep it.
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
