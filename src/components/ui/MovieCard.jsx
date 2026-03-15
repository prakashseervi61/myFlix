import React, { useState, useCallback } from "react";
import { Plus, Check, Play, Film, Info, Eye } from "lucide-react";
import { useMovieCardLogic } from '../../hooks/useMovieCardLogic.js';
import { useUIStore } from '../../store/uiStore.js';
import { flushSync } from 'react-dom';

/**
 * Movie card with hover effects (desktop) and tap actions (mobile).
 * Lazy loads images with skeleton fallback.
 * Desktop: Hover reveals details and actions
 * Mobile: Always shows minimal info with action buttons
 */
function MovieCard({ movie, onClick }) {
  const { isMovieInWatchlist: inWatchlist, handleToggleWatchlist: handleWatchlistClick } = useMovieCardLogic(movie);
  const openPreviewModal = useUIStore((state) => state.openPreviewModal);
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleCardClick = useCallback((e) => {
    e.preventDefault();
    if (!onClick) return;

    if (!document.startViewTransition) {
      onClick(movie);
      return;
    }

    const cardElement = e.currentTarget.querySelector('.card-poster-image');
    if (cardElement) {
      cardElement.style.viewTransitionName = 'shared-movie-poster';
    }

    document.startViewTransition(() => {
      flushSync(() => {
        onClick(movie);
      });
    });
  }, [movie, onClick]);

  const handlePreviewClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    openPreviewModal(movie);
  }, [movie, openPreviewModal]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleCardClick(e);
    }
  }, [handleCardClick]);

  if (!movie) return null;

  return (
    <div
      className="group/card relative w-full aspect-[2/3] movie-card shadow-sm ring-1 ring-muted/10 
        transition-all duration-300 ease-out 
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:z-20"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${movie.title}`}
    >
      <div className={`w-full h-full bg-surface rounded-lg sm:rounded-xl overflow-hidden relative isolate transform-gpu transition-transform duration-300 ease-out md:group-hover/card:scale-105 md:group-hover/card:shadow-xl md:group-hover/card:shadow-black/40 md:group-hover/card:z-20 md:group-hover/card:ring-1 md:group-hover/card:ring-muted/20 card-poster-image`}>
        <div className={`w-full h-full transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <Image 
            poster={movie.poster} 
            poster_path={movie.poster_path}
            title={movie.title} 
            imageError={imageError} 
            setImageError={setImageError}
            onLoad={() => setIsLoaded(true)}
          />
        </div>
        
        {!isLoaded && !imageError && (
          <div className="absolute inset-0 skeleton-loader" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-0 md:group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 pointer-events-none md:group-hover/card:pointer-events-auto">
          <div className="transform translate-y-4 md:group-hover/card:translate-y-0 transition-transform duration-300 will-change-transform">
             <h3 className="font-bold text-white text-sm sm:text-base mb-1 line-clamp-2 leading-snug tracking-tight">{movie.title}</h3>
             <div className="flex items-center gap-2 text-xs text-gray-300 mb-3 font-medium">
               <span className="text-primary font-black">{movie.rating ? `${(parseFloat(movie.rating) * 10).toFixed(0)}% Match` : ''}</span>
               <span className="bg-surface-secondary px-1.5 py-0.5 rounded text-[10px] uppercase border border-muted/20">{movie.year || 'N/A'}</span>
             </div>
             
             <div className="flex items-center gap-2">
               <button 
                 onClick={handlePreviewClick}
                 className="flex-1 primary-button text-white py-2 rounded-md font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-black/20 active:scale-95 transition-all"
                 tabIndex={-1}
               >
                 <Eye size={14} className="stroke-white stroke-[2.5]" /> Quick View
               </button>
               <button
                  onClick={(e) => { e.stopPropagation(); handleWatchlistClick(e); }}
                  className="p-2 border border-muted/20 rounded-full hover:border-primary hover:bg-primary/10 text-white transition-colors bg-background/60"
                  title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                  tabIndex={-1}
               >
                 {inWatchlist ? <Check size={16} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2.5} />}
               </button>
             </div>
          </div>
        </div>
      </div>

      <div className="md:hidden absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-100 rounded-lg sm:rounded-xl pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col justify-end h-full">
           <h3 className="font-bold text-xs text-white mb-1 line-clamp-1 text-shadow tracking-tight leading-snug">{movie.title}</h3>
           <div className="flex items-center gap-2 pointer-events-auto mt-1">
             <button 
               onClick={handlePreviewClick}
               className="flex-1 primary-button text-white text-[10px] px-2 py-1.5 rounded border border-muted/20 flex items-center justify-center gap-1 font-bold shadow-sm"
             >
               <Info size={12} strokeWidth={2.5} /> Info
             </button>
             <button 
               onClick={(e) => { e.stopPropagation(); handleWatchlistClick(e); }}
               className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${inWatchlist ? 'bg-primary border-primary text-white' : 'bg-background/80 border-muted/30 text-white'}`}
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

const Image = ({ poster, poster_path, title, imageError, setImageError, onLoad }) => {
  if (imageError || !poster) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center text-muted p-2 bg-surface">
        <Film size={24} className="mb-1 opacity-50 text-muted" />
        <p className="text-[10px] font-medium line-clamp-2">{title}</p>
      </div>
    );
  }

  // TMDB supports these poster widths: w92, w154, w185, w342, w500, w780, original
  const srcSet = poster_path ? 
    `https://image.tmdb.org/t/p/w185${poster_path} 185w,
     https://image.tmdb.org/t/p/w342${poster_path} 342w,
     https://image.tmdb.org/t/p/w500${poster_path} 500w,
     https://image.tmdb.org/t/p/w780${poster_path} 780w` : undefined;

  // On phones (xs/sm grid columns) cards are ~150px wide. On tablets ~200px. On Desktop ~250px.
  const sizes = "(max-width: 640px) 185px, (max-width: 1024px) 342px, 500px";

  return (
    <img
      src={poster}
      srcSet={srcSet}
      sizes={sizes}
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