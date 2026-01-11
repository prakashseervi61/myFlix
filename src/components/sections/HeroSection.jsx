import React, { useState, useEffect, useMemo } from "react";
import { Play, Plus, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWatchlist } from "../../contexts/WatchlistContext.jsx";
import { useAuth } from "../../hooks/useAuth.jsx";

function HeroSection({ movies = [] }) {
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const featuredMovies = useMemo(() => {
    if (!movies || movies.length === 0) return [];
    
    const movieSlides = movies.slice(0, 5).map(movie => ({
      id: movie.id,
      title: movie.title,
      description: movie.plot || `${movie.title} (${movie.year}) - ${movie.genre || 'Movie'}`,
      backgroundImage: movie.poster
    }));
    
    return movieSlides.length > 1 ? [
      { ...movieSlides[movieSlides.length - 1], id: `${movieSlides[movieSlides.length - 1].id}-clone-start` },
      ...movieSlides,
      { ...movieSlides[0], id: `${movieSlides[0].id}-clone-end` }
    ] : movieSlides;
  }, [movies]);

  const defaultMovies = useMemo(() => [{
    id: 'loading',
    title: "Loading Movies...",
    description: "Discovering amazing content for you",
    backgroundImage: null
  }], []);

  const slidesToShow = featuredMovies.length > 0 ? featuredMovies : defaultMovies;
  const actualSlideCount = featuredMovies.length > 0 ? featuredMovies.length - 2 : 1;

  const handleWatchlistClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const actualIndex = currentSlide - 1;
    const currentMovie = movies && movies.length > 0 && actualIndex >= 0 && actualIndex < movies.length 
      ? movies[actualIndex] 
      : null;
    if (currentMovie) {
      toggleWatchlist(currentMovie);
    }
  };

  // Auto-slide functionality
  useEffect(() => {
    if (!isPaused && slidesToShow.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => prev + 1);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isPaused, slidesToShow.length]);

  // Handle infinite loop transitions
  useEffect(() => {
    if (currentSlide >= slidesToShow.length - 1) {
      setTimeout(() => setCurrentSlide(1), 500);
    } else if (currentSlide <= 0) {
      setTimeout(() => setCurrentSlide(slidesToShow.length - 2), 500);
    }
  }, [currentSlide, slidesToShow.length]);

  // Initialize to first actual slide
  useEffect(() => {
    if (slidesToShow.length > 1 && currentSlide === 0) {
      setCurrentSlide(1);
    }
  }, [slidesToShow.length]);

  const goToSlide = (direction) => {
    if (slidesToShow.length <= 1) return;
    if (direction === 'next') {
      setCurrentSlide((prev) => prev + 1);
    } else {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  return (
    <section 
      className="relative w-full h-screen overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Images */}
      <div 
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slidesToShow.map((movie) => (
          <div key={movie.id} className="min-w-full h-full relative">
            {movie.backgroundImage ? (
              <img
                src={movie.backgroundImage}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center text-white/50">
                  <div className="text-6xl mb-4">🎬</div>
                  <p className="text-lg font-medium">{movie.title}</p>
                </div>
              </div>
            )}
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent"></div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      {slidesToShow.length > 1 && (
        <>
          <button
            onClick={() => goToSlide('prev')}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={() => goToSlide('next')}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-end justify-start z-10">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pb-8 sm:pb-12 md:pb-16">
          <div className="max-w-2xl lg:max-w-3xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 md:mb-6 leading-tight">
              {slidesToShow[currentSlide]?.title}
            </h1>

            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 mb-6 sm:mb-8 md:mb-10 leading-relaxed line-clamp-2 sm:line-clamp-3">
              {slidesToShow[currentSlide]?.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => {
                  const actualIndex = currentSlide - 1;
                  const currentMovie = movies && movies.length > 0 && actualIndex >= 0 && actualIndex < movies.length
                    ? movies[actualIndex]
                    : null;
                  if (currentMovie?.id) {
                    navigate(`/movie/${currentMovie.id}`);
                  }
                }}
                className="flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-white text-black rounded-lg font-bold text-sm sm:text-base md:text-lg hover:bg-gray-200 transition-all"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-current" />
                Watch Now
              </button>

              <button
                onClick={handleWatchlistClick}
                className={`flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 md:px-10 py-3 sm:py-4 font-bold text-sm sm:text-base md:text-lg rounded-lg transition-all ${
                  (() => {
                    const actualIndex = currentSlide - 1;
                    const currentMovie = movies && movies.length > 0 && actualIndex >= 0 && actualIndex < movies.length
                      ? movies[actualIndex]
                      : null;
                    return isInWatchlist(currentMovie?.id);
                  })()
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                }`}
              >
                {(() => {
                  const actualIndex = currentSlide - 1;
                  const currentMovie = movies && movies.length > 0 && actualIndex >= 0 && actualIndex < movies.length
                    ? movies[actualIndex]
                    : null;
                  return isInWatchlist(currentMovie?.id);
                })() ? (
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

      {/* Slide Indicators */}
      {actualSlideCount > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 hidden sm:flex gap-1">
          {Array.from({ length: actualSlideCount }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index + 1)}
              className={`w-1.5 h-1.5 sm:w-2 sm:h-6 md:w-3 md:h-8 rounded-full transition-all ${
                (currentSlide === index + 1) || (currentSlide === 0 && index === actualSlideCount - 1) || (currentSlide === slidesToShow.length - 1 && index === 0)
                  ? 'bg-white' : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default HeroSection;