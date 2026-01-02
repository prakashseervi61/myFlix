import React, { useState, useEffect, useMemo } from "react";
import { Play, Plus, ChevronLeft, ChevronRight } from "lucide-react";

function HeroSection({ movies = [] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Use first 3 movies for hero carousel
  const featuredMovies = useMemo(() => {
    if (!movies || movies.length === 0) return [];
    
    return movies.slice(0, 3).map(movie => ({
      id: movie.id,
      title: movie.title,
      description: movie.plot || `${movie.title} (${movie.year}) - ${movie.genre || 'Movie'}`,
      backgroundImage: movie.poster
    }));
  }, [movies]);

  // Fallback for loading state
  const defaultMovies = useMemo(() => [{
    id: 'loading',
    title: "Loading Movies...",
    description: "Discovering amazing content for you",
    backgroundImage: null
  }], []);

  const slidesToShow = featuredMovies.length > 0 ? featuredMovies : defaultMovies;

  // Auto-slide functionality
  useEffect(() => {
    if (!isPaused && slidesToShow.length > 1) {
      const interval = setInterval(() => {
        setIsTransitioning(true);
        setCurrentSlide((prev) => (prev + 1) % slidesToShow.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isPaused, slidesToShow.length]);

  const goToSlide = (direction) => {
    if (slidesToShow.length <= 1) return;
    setIsTransitioning(true);
    if (direction === 'next') {
      setCurrentSlide((prev) => (prev + 1) % slidesToShow.length);
    } else {
      setCurrentSlide((prev) => (prev - 1 + slidesToShow.length) % slidesToShow.length);
    }
  };

  return (
    <section 
      className="relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[90vh] overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div 
        className={`flex h-full ${isTransitioning ? 'transition-transform duration-1000 ease-in-out' : ''}`}
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        onTransitionEnd={() => setIsTransitioning(false)}
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
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center text-white/50">
                  <div className="text-6xl mb-4">🎬</div>
                  <p className="text-lg font-medium">{movie.title}</p>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      {slidesToShow.length > 1 && (
        <>
          <button
            onClick={() => goToSlide('prev')}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => goToSlide('next')}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-12 lg:p-16">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            {slidesToShow[currentSlide]?.title}
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 sm:mb-8 leading-relaxed line-clamp-3">
            {slidesToShow[currentSlide]?.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors">
              <Play className="w-5 h-5 fill-current" />
              Watch Now
            </button>
            
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-black/40 text-white font-semibold rounded-lg hover:bg-black/60 transition-colors backdrop-blur-sm border border-white/20">
              <Plus className="w-5 h-5" />
              My List
            </button>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      {slidesToShow.length > 1 && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          {slidesToShow.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsTransitioning(true);
                setCurrentSlide(index);
              }}
              className={`w-2 h-6 rounded-full transition-all ${
                index === currentSlide ? 'bg-white' : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default HeroSection;