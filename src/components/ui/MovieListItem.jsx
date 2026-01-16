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
    <div className="flex bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden transition-all duration-300 hover:bg-gray-800/60 hover:border-gray-700">
      <div className="w-24 sm:w-28 flex-shrink-0" onClick={handleNavigate}>
        <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover cursor-pointer" />
      </div>
      <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between">
        <div>
          <h3
            onClick={handleNavigate}
            className="text-base sm:text-lg font-bold text-white cursor-pointer hover:text-cyan-400 transition-colors"
          >
            {movie.title}
          </h3>
          <div className="flex items-center text-xs sm:text-sm text-gray-400 mt-1 space-x-3">
            <span>{year}</span>
            <div className="flex items-center">
              <Star size={14} className="text-yellow-500 mr-1" />
              <span>{rating}</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 sm:mt-3 line-clamp-2">
            {movie.overview}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-4">
          <button
            onClick={handleToggleWatchlist}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs rounded-md transition-colors ${
              isMovieInWatchlist
                ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                : 'bg-gray-700/70 text-gray-200 hover:bg-gray-700'
            }`}
          >
            <Bookmark size={14} />
            <span className="hidden sm:inline">{isMovieInWatchlist ? 'Added' : 'Watchlist'}</span>
          </button>
          <button
            onClick={handleNavigate}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs bg-gray-700/70 text-gray-200 hover:bg-gray-700 rounded-md transition-colors"
          >
            <Eye size={14} />
            <span className="hidden sm:inline">Details</span>
          </button>
          {movie.has_trailer && (
            <button
              onClick={handleOpenPreview}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs bg-gray-700/70 text-gray-200 hover:bg-gray-700 rounded-md transition-colors"
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
