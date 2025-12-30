import React from "react";
import { Star } from "lucide-react";

function MovieCard({ movie }) {
  if (!movie) return null;

  const handleImageError = (e) => {
    e.target.src = '/src/assets/placeholder_1.jpeg';
  };

  return (
    <div className="group relative min-w-[140px] sm:min-w-[200px] md:min-w-[280px] cursor-pointer transition-all duration-300 hover:scale-105 touch-manipulation focus:outline-none focus:ring-2 focus:ring-white/50 rounded-xl" tabIndex={0}>
      <div className="aspect-[2/3] sm:aspect-[16/9] overflow-hidden rounded-xl bg-gray-800 shadow-lg">
        <img
          src={movie.poster}
          alt={movie.title || 'Movie poster'}
          onError={handleImageError}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 group-focus:scale-110 select-none"
          draggable={false}
        />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-all duration-300 rounded-xl flex flex-col justify-end p-3 sm:p-4">
        <div className="text-white transform translate-y-2 group-hover:translate-y-0 group-focus:translate-y-0 transition-transform duration-300">
          <h3 className="font-bold text-xs sm:text-sm md:text-base mb-1 line-clamp-1 leading-tight">{movie.title}</h3>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
            {movie.rating && (
              <>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>{movie.rating}</span>
                </div>
                {movie.genre && <span>•</span>}
              </>
            )}
            {movie.genre && <span>{movie.genre}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieCard;