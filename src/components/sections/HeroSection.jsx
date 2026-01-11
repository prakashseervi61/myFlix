import React from "react";
import { Play, Plus, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWatchlist } from "../../contexts/WatchlistContext.jsx";
import { useAuth } from "../../hooks/useAuth.jsx";

function HeroSection({ movies = [] }) {
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { user } = useAuth();

  const featuredMovie = movies && movies.length > 0 ? movies[0] : null;

  const handleWatchlistClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (featuredMovie) {
      toggleWatchlist(featuredMovie);
    }
  };

  if (!featuredMovie) {
    return (
      <section className="relative w-full h-screen bg-gray-900 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute inset-0 flex items-end justify-start z-10 p-8">
          <div className="w-full max-w-3xl">
            <div className="h-14 bg-gray-800 rounded w-3/4 mb-6"></div>
            <div className="h-5 bg-gray-800 rounded w-full mb-2"></div>
            <div className="h-5 bg-gray-800 rounded w-2/3 mb-10"></div>
            <div className="flex gap-4">
              <div className="h-16 w-48 bg-gray-800 rounded-lg"></div>
              <div className="h-16 w-48 bg-gray-800 rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const { id, title, plot, poster } = featuredMovie;
  const description = plot || `${title} - A must-watch movie.`;
  const isBookmarked = isInWatchlist(id);

  return (
    <section className="relative w-full h-screen overflow-hidden">
      <div className="w-full h-full relative">
        <img
          src={poster}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent"></div>
      </div>

      <div className="absolute inset-0 flex items-end justify-start z-10">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pb-8 sm:pb-12 md:pb-16">
          <div className="max-w-2xl lg:max-w-3xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 md:mb-6 leading-tight">
              {title}
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 mb-6 sm:mb-8 md:mb-10 leading-relaxed line-clamp-2 sm:line-clamp-3">
              {description}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => navigate(`/movie/${id}`)}
                className="flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-white text-black rounded-lg font-bold text-sm sm:text-base md:text-lg hover:bg-gray-200 transition-all"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-current" />
                Watch Now
              </button>
              <button
                onClick={handleWatchlistClick}
                className={`flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 md:px-10 py-3 sm:py-4 font-bold text-sm sm:text-base md:text-lg rounded-lg transition-all ${
                  isBookmarked
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                }`}
              >
                {isBookmarked ? (
                  <>
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    In My List
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    My List
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;