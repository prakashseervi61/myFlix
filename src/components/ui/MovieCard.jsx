import React, { useState } from "react";
import { Star, Plus, Check } from "lucide-react";
import { useWatchlist } from "../../hooks/useWatchlist";

function MovieCard({ movie, onClick }) {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const [imageError, setImageError] = useState(false);
  
  if (!movie) return null;

  const handleCardClick = () => {
    if (onClick) onClick(movie);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  const handleWatchlistClick = (e) => {
    e.stopPropagation();
    toggleWatchlist(movie);
  };

  const inWatchlist = isInWatchlist(movie.id);

  return (
    <div 
      className="group relative min-w-[140px] sm:min-w-[200px] md:min-w-[280px] cursor-pointer transition-all duration-300 hover:scale-105 rounded-xl" 
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${movie.title}`}
    >
      <div className="aspect-[2/3] sm:aspect-[16/9] overflow-hidden rounded-xl bg-gray-800 shadow-lg">
        {movie.poster && !imageError ? (
          <img
            src={movie.poster}
            alt={movie.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 select-none"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
            <div className="text-center text-white/60">
              <div className="text-3xl sm:text-4xl mb-2">🎬</div>
              <p className="text-xs sm:text-sm font-medium px-2 line-clamp-2">{movie.title}</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl flex flex-col justify-end p-3 sm:p-4">
        <div className="text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-bold text-sm sm:text-base md:text-lg mb-2 line-clamp-1 leading-tight">{movie.title}</h3>
          
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300 mb-3">
            {movie.rating && (
              <>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <span>{movie.rating}</span>
                </div>
                {movie.genre && <span>•</span>}
              </>
            )}
            {movie.genre && <span>{movie.genre.split(', ')[0]}</span>}
            {movie.year && <span>• {movie.year}</span>}
          </div>
          
          {/* Watchlist Button */}
          <button
            onClick={handleWatchlistClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all touch-manipulation ${
              inWatchlist 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {inWatchlist ? (
              <>
                <Check className="w-3 h-3" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-3 h-3" />
                <span>My List</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MovieCard;