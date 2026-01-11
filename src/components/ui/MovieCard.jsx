import React, { useState, useCallback } from "react";
import { Star, Plus, Check, Play, Film } from "lucide-react";
import { useMovieCardLogic } from '../../hooks/useMovieCardLogic.js';

function MovieCard({ movie, onClick }) {
  const { inWatchlist, handleWatchlistClick } = useMovieCardLogic(movie);
  const [imageError, setImageError] = useState(false);

  const handleCardClick = useCallback((e) => {
    e.preventDefault();
    if (onClick) onClick(movie);
  }, [movie, onClick]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleCardClick(e);
    }
  }, [handleCardClick]);

  if (!movie) return null;

  return (
    <div
      className="relative w-full aspect-[2/3] rounded-lg overflow-hidden cursor-pointer bg-gray-800 shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:z-10 focus-within:scale-105 focus-within:z-10"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${movie.title}`}
    >
      <Image poster={movie.poster} title={movie.title} imageError={imageError} setImageError={setImageError} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      <CardContent movie={movie} inWatchlist={inWatchlist} onWatchlistClick={handleWatchlistClick} onPlayClick={handleCardClick} />
    </div>
  );
}

const Image = ({ poster, title, imageError, setImageError }) => {
  if (imageError || !poster) {
    return (
      <div className="w-full h-full flex items-center justify-center text-center text-gray-400 p-4">
        <div>
          <Film size={40} className="mx-auto mb-2" />
          <p className="text-sm font-semibold">{title}</p>
        </div>
      </div>
    );
  }
  return (
    <img
      src={poster}
      alt={title}
      onError={() => setImageError(true)}
      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
      draggable={false}
    />
  );
};

const CardContent = ({ movie, inWatchlist, onWatchlistClick, onPlayClick }) => (
  <div className="absolute inset-0 p-4 flex flex-col justify-end opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
    <div className="transform transition-transform duration-300 hover:translate-y-0 focus-within:translate-y-0 translate-y-4">
      <h3 className="font-bold text-lg text-white mb-1 line-clamp-2">{movie.title}</h3>
      <div className="flex items-center gap-2 text-xs text-gray-300 mb-3">
        {movie.rating && (
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
            <span>{movie.rating}</span>
          </div>
        )}
        {movie.year && <span>{movie.year}</span>}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onWatchlistClick(e); }}
          aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
          className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${
            inWatchlist 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          {inWatchlist ? <Check size={18} /> : <Plus size={18} />}
        </button>
        <button
          onClick={onPlayClick}
          aria-label={`Play ${movie.title}`}
          className="flex-1 flex items-center justify-center gap-2 h-9 px-4 bg-red-600 text-white rounded-full text-sm font-semibold hover:bg-red-700 transition-colors"
        >
          <Play size={16} fill="currentColor"/>
          <span>Play</span>
        </button>
      </div>
    </div>
  </div>
);

export default React.memo(MovieCard);