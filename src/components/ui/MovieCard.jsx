import React, { useState, useCallback } from "react";
import { Plus, Check, Play, Film, Info, Eye } from "lucide-react";
import { useMovieCardLogic } from '../../hooks/useMovieCardLogic.js';
import { usePreviewModal } from '../../contexts/PreviewModalContext.jsx';

function MovieCard({ movie, onClick }) {
  const { inWatchlist, handleWatchlistClick } = useMovieCardLogic(movie);
  const { openModal } = usePreviewModal();
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleCardClick = useCallback((e) => {
    e.preventDefault();
    if (onClick) onClick(movie);
  }, [movie, onClick]);

  const handlePreviewClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    openModal(movie);
  }, [movie, openModal]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleCardClick(e);
    }
  }, [handleCardClick]);

  if (!movie) return null;

  return (
    <div
      className="group/card relative w-full aspect-[2/3] rounded-lg sm:rounded-xl bg-gray-900 shadow-sm ring-1 ring-white/5 
        transition-all duration-300 ease-out 
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:z-20"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${movie.title}`}
    >
      <div className={`w-full h-full bg-gray-800 rounded-lg sm:rounded-xl overflow-hidden relative isolate transform-gpu transition-transform duration-300 ease-out md:group-hover/card:scale-105 md:group-hover/card:shadow-xl md:group-hover/card:z-20 md:group-hover/card:ring-1 md:group-hover/card:ring-white/20`}>
         {/* Image Container */}
        <div className={`w-full h-full transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <Image 
            poster={movie.poster} 
            title={movie.title} 
            imageError={imageError} 
            setImageError={setImageError}
            onLoad={() => setIsLoaded(true)}
          />
        </div>
        
        {/* Skeleton/Loader while image loads - reduces perceived latency */}
        {!isLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-800 animate-pulse" />
        )}

        {/* Desktop Hover Overlay - Gradient & Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 md:group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 pointer-events-none md:group-hover/card:pointer-events-auto">
          <div className="transform translate-y-4 md:group-hover/card:translate-y-0 transition-transform duration-300 will-change-transform">
             <h3 className="font-bold text-white text-sm sm:text-base mb-1 line-clamp-2 leading-snug tracking-tight">{movie.title}</h3>
             <div className="flex items-center gap-2 text-xs text-gray-300 mb-3 font-medium">
               <span className="text-green-400 font-bold">{movie.rating ? `${(parseFloat(movie.rating) * 10).toFixed(0)}% Match` : ''}</span>
               <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] uppercase border border-white/10">{movie.year || 'N/A'}</span>
             </div>
             
             <div className="flex items-center gap-2">
               <button 
                 onClick={handlePreviewClick}
                 className="flex-1 bg-white text-black py-2 rounded-md font-bold text-xs flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors shadow-lg"
                 tabIndex={-1}
               >
                 <Eye size={14} className="stroke-black stroke-[2.5]" /> Quick View
               </button>
               <button
                  onClick={(e) => { e.stopPropagation(); handleWatchlistClick(e); }}
                  className="p-2 border border-gray-500 rounded-full hover:border-white hover:bg-black/60 text-white transition-colors bg-black/40"
                  title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                  tabIndex={-1}
               >
                 {inWatchlist ? <Check size={16} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2.5} />}
               </button>
             </div>
          </div>
        </div>
      </div>

      {/* Mobile/Touch Content - Always Visible */}
      <div className="md:hidden absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-100 rounded-lg sm:rounded-xl pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col justify-end h-full">
           <h3 className="font-bold text-xs text-white mb-1 line-clamp-1 text-shadow tracking-tight leading-snug">{movie.title}</h3>
           <div className="flex items-center gap-2 pointer-events-auto mt-1">
             <button 
               onClick={handlePreviewClick}
               className="flex-1 bg-gray-900/90 text-white text-[10px] px-2 py-1.5 rounded border border-white/10 flex items-center justify-center gap-1 font-bold shadow-sm"
             >
               <Info size={12} strokeWidth={2.5} /> Info
             </button>
             <button 
               onClick={(e) => { e.stopPropagation(); handleWatchlistClick(e); }}
               className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${inWatchlist ? 'bg-green-600 border-green-600 text-white' : 'bg-gray-900/90 border-white/20 text-white'}`}
               aria-label={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
             >
               {inWatchlist ? <Check size={14} strokeWidth={3} /> : <Plus size={14} strokeWidth={3} />}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}

const Image = ({ poster, title, imageError, setImageError, onLoad }) => {
  if (imageError || !poster) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center text-gray-500 p-2 bg-gray-800">
        <Film size={24} className="mb-1 opacity-50" />
        <p className="text-[10px] font-medium line-clamp-2">{title}</p>
      </div>
    );
  }
  return (
    <img
      src={poster}
      alt={title}
      loading="lazy"
      decoding="async"
      onLoad={onLoad}
      onError={() => setImageError(true)}
      className="w-full h-full object-cover"
      draggable={false}
      width="200"
      height="300"
    />
  );
};

export default React.memo(MovieCard);