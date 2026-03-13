import React, { useState } from 'react';
import { Image as ImageIcon, Maximize2 } from 'lucide-react';
import GalleryModal from './GalleryModal.jsx';

const GallerySection = ({ images = [] }) => {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [showAll, setShowAll] = useState(false);

  if (!images || images.length === 0) return null;

  const handleOpen = (idx) => setSelectedIdx(idx);
  const handleClose = () => setSelectedIdx(null);
  const handlePrev = () => setSelectedIdx(prev => (prev === 0 ? images.length - 1 : prev - 1));
  const handleNext = () => setSelectedIdx(prev => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <div className="mt-0 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <ImageIcon className="text-[#C50337]" size={24} />
        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Gallery</h2>
        <span className="bg-white/10 text-white/60 px-2 py-0.5 rounded-full text-xs font-medium">
          {images.length}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {(showAll ? images : images.slice(0, 6)).map((img, idx) => (
          <div 
            key={idx}
            className="group relative aspect-video overflow-hidden rounded-xl bg-[#021C4F]/50 border border-white/5 cursor-pointer shadow-lg hover:shadow-[#C50337]/10 transition-all"
            onClick={() => handleOpen(idx)}
          >
            <img 
              src={img.url} 
              alt={`Gallery Screenshot ${idx + 1}`} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-[#021C4F]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="bg-[#C50337] p-2 rounded-full text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg shadow-[#C50337]/40">
                <Maximize2 size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {images.length > 6 && !showAll && (
        <div className="flex justify-center pt-4">
          <button 
            onClick={() => setShowAll(true)}
            className="px-8 py-3 bg-[#021C4F]/50 hover:bg-[#C50337] border border-white/10 rounded-full text-white font-bold text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl hover:shadow-[#C50337]/20"
          >
            Show All Images ({images.length})
          </button>
        </div>
      )}

      <GalleryModal 
        isOpen={selectedIdx !== null}
        images={images}
        currentIndex={selectedIdx}
        onClose={handleClose}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  );
};

export default React.memo(GallerySection);
