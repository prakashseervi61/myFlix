import React, { useState, useEffect, useMemo } from "react";
import { Play, Plus, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWatchlist } from "../../hooks/useWatchlist";

function HeroSection({ movies = [] }) {
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Use first 5 movies for hero carousel with infinite loop
  const featuredMovies = useMemo(() => {
    if (!movies || movies.length === 0) return [];
    
    const movieSlides = movies.slice(0, 5).map(movie => ({
      id: movie.id,
      title: movie.title,
      description: movie.plot || `${movie.title} (${movie.year}) - ${movie.genre || 'Movie'}`,
      backgroundImage: movie.poster
    }));
    
    // Add first slide at end and last slide at beginning for infinite loop with unique keys
    return movieSlides.length > 1 ? [
      { ...movieSlides[movieSlides.length - 1], id: `${movieSlides[movieSlides.length - 1].id}-clone-start` },
      ...movieSlides,
      { ...movieSlides[0], id: `${movieSlides[0].id}-clone-end` }
    ] : movieSlides;
  }, [movies]);

  // Fallback for loading state
  const defaultMovies = useMemo(() => [{
    id: 'loading',
    title: "Loading Movies...",
    description: "Discovering amazing content for you",
    backgroundImage: null
  }], []);

  const slidesToShow = featuredMovies.length > 0 ? featuredMovies : defaultMovies;
  const actualSlideCount = featuredMovies.length > 0 ? featuredMovies.length - 2 : 1;

  // Auto-slide functionality
  useEffect(() => {
    if (!isPaused && slidesToShow.length > 1) {
      const interval = setInterval(() => {
        setIsTransitioning(true);
        setCurrentSlide((prev) => prev + 1);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isPaused, slidesToShow.length]);

  // Handle infinite loop transitions
  useEffect(() => {
    if (!isTransitioning) return;
    
    const timer = setTimeout(() => {
      if (currentSlide >= slidesToShow.length - 1) {
        setCurrentSlide(1);
        setIsTransitioning(false);
      } else if (currentSlide <= 0) {
        setCurrentSlide(slidesToShow.length - 2);
        setIsTransitioning(false);
      } else {
        setIsTransitioning(false);
      }
    }, 700);
    
    return () => clearTimeout(timer);
  }, [currentSlide, isTransitioning, slidesToShow.length]);

  // Initialize to first actual slide
  useEffect(() => {
    if (slidesToShow.length > 1 && currentSlide === 0) {
      setCurrentSlide(1);
    }
  }, [slidesToShow.length]);

  const goToSlide = (direction) => {
    if (slidesToShow.length <= 1 || isTransitioning) return;
    setIsTransitioning(true);
    if (direction === 'next') {
      setCurrentSlide((prev) => prev + 1);
    } else {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleTouchStart = (e) => {
    if (isTransitioning) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (isTransitioning) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || isTransitioning) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) goToSlide('next');
      else goToSlide('prev');
    }
  };

  return (
    <section 
      className="relative w-full h-screen overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className={`flex h-full ${isTransitioning ? 'transition-transform duration-700 ease-in-out' : ''}`}
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slidesToShow.map((movie) => (
          <div key={movie.id} className="min-w-full h-full relative">
            {movie.backgroundImage ? (
              <img
                src={movie.backgroundImage}
                alt={movie.title}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.querySelector('.fallback-bg').style.display = 'flex';
                }}
                onLoad={(e) => {
                  if (e.target.naturalWidth === 0) {
                    e.target.style.display = 'none';
                    e.target.parentElement.querySelector('.fallback-bg').style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div className={`fallback-bg w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 items-center justify-center ${movie.backgroundImage ? 'hidden' : 'flex'}`}>
              <div className="text-center text-white/50">
                <div className="text-6xl mb-4">🎬</div>
                <p className="text-lg font-medium">{movie.title}</p>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      {slidesToShow.length > 1 && (
        <>
          <button
            onClick={() => goToSlide('prev')}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => goToSlide('next')}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-12 lg:p-16 pb-32 sm:pb-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            {slidesToShow[currentSlide]?.title}
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 sm:mb-8 leading-relaxed line-clamp-3">
            {slidesToShow[currentSlide]?.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button 
              onClick={() => navigate(`/movie/${slidesToShow[currentSlide]?.id}`)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Play className="w-5 h-5 fill-current" />
              Watch Now
            </button>
            
            <button 
              onClick={() => toggleWatchlist(slidesToShow[currentSlide])}
              className={`flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-lg transition-colors backdrop-blur-sm border ${
                isInWatchlist(slidesToShow[currentSlide]?.id) 
                  ? 'bg-green-600 text-white border-green-600 hover:bg-green-700' 
                  : 'bg-black/40 text-white border-white/20 hover:bg-black/60'
              }`}
            >
              {isInWatchlist(slidesToShow[currentSlide]?.id) ? (
                <>
                  <Check className="w-5 h-5" />
                  In My List
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  My List
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      {actualSlideCount > 1 && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          {Array.from({ length: actualSlideCount }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsTransitioning(true);
                setCurrentSlide(index + 1);
              }}
              className={`w-2 h-6 rounded-full transition-all ${
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