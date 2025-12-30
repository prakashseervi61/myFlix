import React, { useState, useEffect } from "react";
import { Play, Plus, ChevronLeft, ChevronRight } from "lucide-react";

function HeroSection() {
  const featuredMovies = [
    {
      id: 1,
      title: "Breaking Bad",
      description: "A high school chemistry teacher turns to manufacturing drugs to secure his family's future.",
      backgroundImage: "/src/assets/placeholder_3.jpeg"
    },
    {
      id: 2,
      title: "Wednesday",
      description: "A coming-of-age supernatural mystery comedy following Wednesday Addams at Nevermore Academy.",
      backgroundImage: "/src/assets/placeholder_1.jpeg"
    },
    {
      id: 3,
      title: "Money Heist",
      description: "A criminal mastermind orchestrates the perfect heist at the Royal Mint of Spain.",
      backgroundImage: "/src/assets/placeholder_2.jpeg"
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setIsTransitioning(true);
        setCurrentSlide((prev) => (prev + 1) % featuredMovies.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [isPaused, featuredMovies.length]);

  const handleTransitionEnd = () => {
    setIsTransitioning(false);
  };

  const handleImageError = (e) => {
    e.target.src = '/src/assets/placeholder_1.jpeg';
  };

  const goToSlide = (direction) => {
    setIsTransitioning(true);
    if (direction === 'next') {
      setCurrentSlide((prev) => (prev + 1) % featuredMovies.length);
    } else {
      setCurrentSlide((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
    }
  };

  const handleTouchStart = (e) => {
    if (!e.targetTouches || e.targetTouches.length === 0) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!e.targetTouches || e.targetTouches.length === 0) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) goToSlide('next');
    if (isRightSwipe) goToSlide('prev');
  };

  return (
    <section 
      className="relative w-full h-[50vh] sm:h-[60vh] md:h-[75vh] lg:h-[90vh] overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="banner"
      aria-label="Featured movies carousel"
    >
      <div 
        className={`flex h-full ${isTransitioning ? 'transition-transform duration-1000 ease-in-out' : ''}`}
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        onTransitionEnd={handleTransitionEnd}
        role="group"
        aria-live="polite"
        aria-label={`Slide ${currentSlide + 1} of ${featuredMovies.length}`}
      >
        {featuredMovies.map((movie) => (
          <div key={movie.id} className="min-w-full h-full relative">
            <img
              src={movie.backgroundImage}
              alt={movie.title || 'Featured movie'}
              onError={handleImageError}
              className="w-full h-full object-cover object-center select-none"
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
          </div>
        ))}
      </div>

      <button
        onClick={() => goToSlide('prev')}
        aria-label="Previous featured movie"
        type="button"
        className="hidden sm:flex absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-black/50 hover:bg-black/70 focus:bg-black/70 text-white rounded-full items-center justify-center opacity-60 group-hover:opacity-100 md:opacity-100 transition-all duration-300 shadow-lg backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      <button
        onClick={() => goToSlide('next')}
        aria-label="Next featured movie"
        type="button"
        className="hidden sm:flex absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-black/50 hover:bg-black/70 focus:bg-black/70 text-white rounded-full items-center justify-center opacity-60 group-hover:opacity-100 md:opacity-100 transition-all duration-300 shadow-lg backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-12 lg:p-16">
        <div className="max-w-xs sm:max-w-lg md:max-w-xl lg:max-w-2xl">
          <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-8xl font-black text-white mb-2 sm:mb-3 md:mb-4 lg:mb-6 leading-none tracking-tight drop-shadow-lg">
            {featuredMovies[currentSlide].title}
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 mb-4 sm:mb-6 md:mb-8 lg:mb-10 leading-relaxed font-light line-clamp-2 sm:line-clamp-3 drop-shadow-md">
            {featuredMovies[currentSlide].description}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button 
              type="button"
              aria-label={`Watch ${featuredMovies[currentSlide].title}`}
              className="flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-white text-black font-semibold text-sm sm:text-base md:text-lg rounded-md hover:bg-gray-100 focus:bg-gray-100 transition-colors duration-200 min-h-[44px] touch-manipulation focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
            >
              <Play className="w-4 h-4 sm:w-5 h-5 md:w-6 md:h-6 fill-current" />
              Watch
            </button>
            
            <button 
              type="button"
              aria-label={`Add ${featuredMovies[currentSlide].title} to my list`}
              className="flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-black/40 text-white font-semibold text-sm sm:text-base md:text-lg rounded-md hover:bg-black/60 focus:bg-black/60 transition-colors duration-200 backdrop-blur-sm min-h-[44px] touch-manipulation focus:outline-none focus:ring-2 focus:ring-white/50 border border-white/20"
            >
              <Plus className="w-4 h-4 sm:w-5 h-5 md:w-6 md:h-6" />
              My List
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 lg:bottom-8 right-3 sm:right-4 md:right-6 lg:right-8 flex gap-2 sm:gap-3" role="tablist" aria-label="Movie slides">
        {featuredMovies.map((_, index) => (
          <button
            key={index}
            role="tab"
            aria-selected={index === currentSlide}
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => {
              setIsTransitioning(true);
              setCurrentSlide(index);
            }}
            className={`w-1 sm:w-2 h-3 sm:h-4 md:h-6 lg:h-8 rounded-full transition-all duration-500 focus:outline-none focus:ring-1 focus:ring-white/50 ${
              index === currentSlide ? 'bg-white' : 'bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  );
}

export default HeroSection;