import React from 'react';
import { Star, AlertCircle, Clock, Search as SearchIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function SearchDropdown({ results, loading, error, onClose }) {
  const navigate = useNavigate();

  if ((!results || !results.length) && !loading && !error) return null;

  const handleMovieClick = (movie, e) => {
    e?.preventDefault();
    onClose();
    navigate(`/movie/${movie.id}`);
  };

  const handleTouchEnd = (movie, e) => {
    e.preventDefault();
    e.stopPropagation();
    handleMovieClick(movie, e);
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-black/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
      {loading ? (
        <div className="p-6 text-center">
          <div className="inline-flex items-center gap-3 text-white/80">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span className="text-sm sm:text-base font-medium">Searching movies...</span>
          </div>
        </div>
      ) : error ? (
        <div className="p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Search Failed</h3>
              <p className="text-xs sm:text-sm text-gray-400">{error}</p>
            </div>
          </div>
        </div>
      ) : results.length === 0 ? (
        <div className="p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-gray-700/50 rounded-full flex items-center justify-center">
              <SearchIcon className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">No Results</h3>
              <p className="text-xs sm:text-sm text-gray-400">Try a different search term</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-2 text-white/80">
              <SearchIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{results.length} result{results.length !== 1 ? 's' : ''} found</span>
            </div>
          </div>
          
          {/* Results */}
          <div className="scrollbar-hide" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {results.slice(0, 6).map((movie, index) => (
              <div
                key={movie.id}
                className={`group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-white/10 cursor-pointer transition-all duration-200 border-b border-white/5 last:border-b-0 touch-manipulation ${
                  index === 0 ? 'bg-white/5' : ''
                }`}
                onClick={(e) => handleMovieClick(movie, e)}
                onTouchEnd={(e) => handleTouchEnd(movie, e)}
              >
                {/* Movie Poster */}
                <div className="relative flex-shrink-0">
                  {movie.poster ? (
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-10 h-14 sm:w-12 sm:h-16 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-10 h-14 sm:w-12 sm:h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center shadow-md ${movie.poster ? 'hidden' : 'flex'}`}>
                    <span className="text-white/60 text-sm sm:text-lg">🎬</span>
                  </div>
                  
                  {/* Rating Badge */}
                  {movie.rating && (
                    <div className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs font-bold px-1 py-0.5 rounded-full shadow-lg">
                      {movie.rating}
                    </div>
                  )}
                </div>

                {/* Movie Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm sm:text-base mb-1 line-clamp-1 group-hover:text-[#ff6f61] transition-colors">
                    {movie.title}
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-gray-400 mb-1 sm:mb-2">
                    {movie.year && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{movie.year}</span>
                      </div>
                    )}
                    {movie.genre && (
                      <div className="px-1.5 sm:px-2 py-0.5 bg-white/10 rounded-full text-xs">
                        {movie.genre.split(', ')[0]}
                      </div>
                    )}
                  </div>
                  
                  {/* Rating Stars - Hidden on mobile */}
                  {movie.rating && (
                    <div className="hidden sm:flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(movie.rating / 2)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-600'
                          }`}
                        />
                      ))}
                      <span className="text-xs text-gray-400 ml-1">
                        ({movie.rating}/10)
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Indicator */}
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#ff6f61] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs sm:text-sm">→</span>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Show more indicator if results > 6 */}
            {results.length > 6 && (
              <div className="p-3 text-center border-t border-white/10 bg-white/5">
                <span className="text-xs text-gray-400">
                  +{results.length - 6} more results available
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default SearchDropdown;