import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Eye, Play, Star } from 'lucide-react';
import { useMovieCardLogic } from '../../hooks/useMovieCardLogic.js';
import { apiConfig } from '../../config/apiConfig.js';

const MovieListItem = ({ movie }) => {
  const navigate = useNavigate();
  const {
    isMovieInWatchlist,
    handleToggleWatchlist,
    handleOpenPreview,
  } = useMovieCardLogic(movie);

  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  const posterUrl = movie.poster
    ? movie.poster.replace('w500', 'w342')
    : 'https://via.placeholder.com/150x225.png?text=No+Image';

  const handleNavigate = () => {
    if (movie?.id) {
      navigate(`/movie/${movie.id}`);
    }
  };

  return (
    <div className="flex bg-surface/40 border border-muted/20 rounded-xl overflow-hidden transition-all duration-300 hover:bg-surface/60 hover:border-primary/40 shadow-lg backdrop-blur-sm group/item">
      <div className="w-24 sm:w-28 flex-shrink-0" onClick={handleNavigate}>
        <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover cursor-pointer" />
      </div>
      <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between">
        <div>
          <h3
            onClick={handleNavigate}
            className="text-base sm:text-lg font-bold text-white cursor-pointer hover:text-primary transition-colors"
          >
            {movie.title}
          </h3>
          <div className="flex items-center text-xs sm:text-sm text-muted mt-1 space-x-3">
            <span>{year}</span>
            <div className="flex items-center">
              <Star size={14} className="text-yellow-500 mr-1" />
              <span>{rating}</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted/80 mt-2 sm:mt-3 line-clamp-2">
            {movie.overview}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-4">
          <button
            onClick={handleToggleWatchlist}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all active:scale-95 ${
              isMovieInWatchlist
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-white/5 text-muted hover:bg-white/10 border border-muted/20'
            }`}
          >
            <Bookmark size={14} className={isMovieInWatchlist ? 'fill-current' : ''} />
            <span className="hidden sm:inline">{isMovieInWatchlist ? 'Added' : 'Watchlist'}</span>
          </button>
          <button
            onClick={handleNavigate}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-white/5 text-muted hover:bg-white/10 rounded-xl transition-all active:scale-95 border border-muted/20"
          >
            <Eye size={14} />
            <span className="hidden sm:inline">Details</span>
          </button>
          {movie.has_trailer && (
            <button
              onClick={handleOpenPreview}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-white/5 text-muted hover:bg-white/10 rounded-xl transition-all active:scale-95 border border-muted/20"
            >
              <Play size={14} />
              <span className="hidden sm:inline">Trailer</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieListItem;
