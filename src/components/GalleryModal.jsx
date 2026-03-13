import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { useGlobalScrollLock } from '../hooks/useGlobalScrollLock.js';

const GalleryModal = ({ isOpen, images, currentIndex, onClose, onPrev, onNext }) => {
  useGlobalScrollLock(isOpen);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onPrev, onNext]);

  if (!isOpen || !images || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm transition-all duration-300 animate-in fade-in"
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 z-50 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-all hover:rotate-90"
      >
        <X size={28} />
      </button>

      <div className="absolute top-6 left-6 z-50 flex items-center gap-4">
        <span className="text-white/60 font-medium text-sm">
          {currentIndex + 1} / {images.length}
        </span>
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-4 md:left-8 z-50 p-4 text-white/40 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-full"
      >
        <ChevronLeft size={48} />
      </button>

      <div 
        className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img 
          src={currentImage.full} 
          alt={`Screenshot ${currentIndex + 1}`} 
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
        />
        
        <div className="absolute -bottom-12 left-0 right-0 flex justify-center">
            <a 
              href={currentImage.full} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/60 hover:text-cyan-400 transition-colors text-sm font-bold uppercase tracking-widest"
              onClick={(e) => e.stopPropagation()}
            >
              <Download size={16} /> Open Full Resolution
            </a>
        </div>
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-4 md:right-8 z-50 p-4 text-white/40 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-full"
      >
        <ChevronRight size={48} />
      </button>
    </div>
  );
};

export default GalleryModal;
