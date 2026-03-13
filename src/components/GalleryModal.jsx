import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/98 backdrop-blur-md transition-all duration-300 animate-in fade-in"
      onClick={onClose}
    >
      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 h-20 flex items-center justify-between px-6 z-50 bg-gradient-to-b from-black/50 to-transparent">
        <div className="text-white/80 font-medium">
          <span className="text-cyan-400 font-bold">{currentIndex + 1}</span>
          <span className="mx-2 text-white/20">/</span>
          <span>{images.length}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <a 
            href={currentImage.full} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest hidden sm:flex"
            onClick={(e) => e.stopPropagation()}
          >
            <Download size={18} /> Full Res
          </a>
          <button 
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all hover:rotate-90"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Navigation Controls */}
      <button 
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-4 md:left-10 z-[60] p-4 text-white/20 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-full active:scale-90"
      >
        <ChevronLeft size={48} />
      </button>

      <button 
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-4 md:right-10 z-[60] p-4 text-white/20 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-full active:scale-90"
      >
        <ChevronRight size={48} />
      </button>

      {/* Main Image Container - Dynamic Viewport Sizing */}
      <div 
        className="relative w-full h-full flex items-center justify-center p-4 md:p-12 lg:p-20"
        onClick={(e) => e.stopPropagation()}
      >
        <img 
          src={currentImage.full} 
          alt={`Screenshot ${currentIndex + 1}`} 
          className="max-w-full max-h-full object-contain rounded-lg shadow-[0_0_100px_rgba(0,0,0,0.8)] z-10 transition-transform duration-500"
          loading="eager"
        />
        
        <div className="absolute bottom-6 left-0 right-0 flex justify-center sm:hidden">
            <a 
              href={currentImage.full} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]"
              onClick={(e) => e.stopPropagation()}
            >
              <Download size={14} /> Download Image
            </a>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default GalleryModal;
