import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Calendar, User, Plus, Check } from 'lucide-react';
import { useMovieDetails } from '../hooks/useMovieDetails';
import { useWatchlist } from '../hooks/useWatchlist';

function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { movie, loading, error } = useMovieDetails(id);
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-32 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="aspect-[2/3] bg-gray-700 rounded-xl"></div>
              </div>
              <div className="lg:col-span-2 space-y-4">
                <div className="h-12 bg-gray-700 rounded w-3/4"></div>
                <div className="h-6 bg-gray-800 rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-800 rounded"></div>
                  <div className="h-4 bg-gray-800 rounded"></div>
                  <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold text-white mb-4">Movie Not Found</h1>
          <p className="text-gray-400 mb-6">{error || 'The requested movie could not be found.'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-[#ff6f61] text-white rounded-lg hover:bg-[#ff523d] transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const inWatchlist = isInWatchlist(movie.id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white hover:text-[#ff6f61] transition-colors mb-6 touch-manipulation"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Movie Poster */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              {movie.poster ? (
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full aspect-[2/3] object-cover rounded-xl shadow-2xl"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center">
                  <div className="text-center text-white/60">
                    <div className="text-6xl mb-4">🎬</div>
                    <p className="text-lg font-medium">{movie.title}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Movie Details */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Title and Basic Info */}
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                  {movie.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-6">
                  {movie.year && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{movie.year}</span>
                    </div>
                  )}
                  {movie.runtime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{movie.runtime}</span>
                    </div>
                  )}
                  {movie.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{movie.rating}/10</span>
                    </div>
                  )}
                </div>

                {/* Genres */}
                {movie.genre && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {movie.genre.split(', ').map((genre, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white/10 text-white rounded-full text-sm"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Button */}
                <div className="mb-8">
                  <button
                    onClick={() => toggleWatchlist(movie)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all touch-manipulation ${
                      inWatchlist
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {inWatchlist ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span>In My List</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        <span>Add to List</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Plot */}
              {movie.plot && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">Plot</h2>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    {movie.plot}
                  </p>
                </div>
              )}

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {movie.director && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Director
                    </h3>
                    <p className="text-gray-300">{movie.director}</p>
                  </div>
                )}

                {movie.actors && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Cast</h3>
                    <p className="text-gray-300">{movie.actors}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;