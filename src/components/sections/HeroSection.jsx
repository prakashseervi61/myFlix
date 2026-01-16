import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Play, Plus, Check, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWatchlist } from "../../contexts/WatchlistContext.jsx";
import { useAuth } from "../../hooks/useAuth.jsx";
import "./HeroSection.css";

const SLIDE_DURATION = 8000;

/** Pagination dots with animated progress fill */
const Pagination = React.memo(({ count, current, goToSlide, duration }) => (
  <div 
    className="absolute bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-12 md:translate-x-0 md:bottom-12 z-30 flex gap-2"
    role="tablist"
    aria-label="Slideshow controls"
  >
    {Array.from({ length: count }).map((_, index) => {
      const isActive = index === current;
      return (
        <button
          key={index}
          onClick={() => goToSlide(index)}
          className="group flex items-center justify-center p-1 outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full"
          role="tab"
          aria-selected={isActive}
          aria-label={`Go to slide ${index + 1}`}
          tabIndex={0}
        >
          <div
            className={`pagination-dot ${isActive ? 'active' : ''}`}
            style={{ '--duration': `${duration}ms` }}
          >
            {isActive && <div className="progress-fill" />}
          </div>
        </button>
      );
    })}
  </div>
));

/**
 * Hero carousel with auto-advance, swipe support, and animated pagination.
 * Preloads next image for smooth transitions.
 * Uses CSS transforms for GPU-accelerated animations.
 */
function HeroSection({ movies = [] }) {
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { user } = useAuth();
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartRef = useRef(null);

  /** Filters movies with backdrops and limits to 6 for performance */
  const featuredMovies = useMemo(() => {
     if (!Array.isArray(movies) || movies.length === 0) return [];
     const withBackdrops = movies.filter(m => m.backdrop);
     return (withBackdrops.length > 0 ? withBackdrops : movies).slice(0, 6);
  }, [movies]);

  const goToNext = useCallback(() => {
    if (featuredMovies.length === 0) return;
    setCurrentSlide(prev => (prev + 1) % featuredMovies.length);
  }, [featuredMovies.length]);

  const goToPrev = useCallback(() => {
    if (featuredMovies.length === 0) return;
    setCurrentSlide(prev => (prev - 1 + featuredMovies.length) % featuredMovies.length);
  }, [featuredMovies.length]);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  useEffect(() => {
    if (featuredMovies.length > 1) {
      const timer = setInterval(goToNext, SLIDE_DURATION);
      return () => clearInterval(timer);
    }
  }, [featuredMovies.length, goToNext]);

  /** Preloads next slide image for instant transition */
  useEffect(() => {
    if (featuredMovies.length > 1) {
      const nextIndex = (currentSlide + 1) % featuredMovies.length;
      const img = new Image();
      img.src = featuredMovies[nextIndex]?.backdrop || featuredMovies[nextIndex]?.poster;
      img.decoding = 'async';
    }
  }, [currentSlide, featuredMovies]);

  const handleTouchStart = (e) => touchStartRef.current = e.touches[0].clientX;
  
  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    const distance = touchStartRef.current - e.changedTouches[0].clientX;
    if (Math.abs(distance) > 50) {
      distance > 0 ? goToNext() : goToPrev();
    }
    touchStartRef.current = null;
  };

  const handleWatchlistClick = useCallback(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const currentMovie = featuredMovies[currentSlide];
    if (currentMovie) toggleWatchlist(currentMovie);
  }, [user, navigate, featuredMovies, currentSlide, toggleWatchlist]);

  if (!featuredMovies.length) {
    return (
      <div className="relative w-full h-[100vh] min-h-[100svh] bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gray-800 animate-pulse" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-gray-950 to-transparent" />
        <div className="absolute bottom-20 left-12 space-y-4 max-w-xl">
           <div className="h-4 w-24 bg-gray-700 rounded animate-pulse" />
           <div className="h-16 w-3/4 bg-gray-700 rounded animate-pulse" />
           <div className="h-6 w-full bg-gray-700 rounded animate-pulse" />
           <div className="flex gap-4 pt-4">
             <div className="h-12 w-32 bg-gray-700 rounded animate-pulse" />
             <div className="h-12 w-32 bg-gray-700 rounded animate-pulse" />
           </div>
        </div>
      </div>
    );
  }

  const activeMovie = featuredMovies[currentSlide];
  const isBookmarked = isInWatchlist(activeMovie.id);

  return (
    <section 
      className="relative w-full h-[100vh] min-h-[100svh] overflow-hidden bg-black contain-content"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Featured Movies"
    >
      {featuredMovies.map((movie, index) => {
         const isCurrent = index === currentSlide;
         return (
          <div
            key={movie.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out will-change-opacity ${isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            aria-hidden={!isCurrent}
          >
             <div className="absolute inset-0 bg-gray-900" />
             <picture className="absolute inset-0">
               <source media="(max-width: 640px)" srcSet={movie.poster || movie.backdrop} />
               <img
                 src={movie.backdrop || movie.poster}
                 alt=""
                 className={`w-full h-full object-cover object-[center_20%] sm:object-center ${isCurrent ? 'sm:scale-105 scale-100' : 'scale-100'} sm:transition-transform sm:duration-[12s] ease-linear will-change-transform transform-gpu`}
                 loading={index === 0 ? "eager" : "lazy"}
                 fetchPriority={isCurrent ? "high" : "low"}
                 decoding="async"
               />
             </picture>
             
             <div 
               className="absolute inset-0 translate-z-0"
               style={{
                 background: 'radial-gradient(circle at center, transparent 0%, rgba(3, 7, 18, 0.4) 50%, rgba(3, 7, 18, 0.9) 100%), linear-gradient(to top, rgba(3, 7, 18, 1) 0%, rgba(3, 7, 18, 0.7) 40%, transparent 80%)'
               }}
             />
             <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/20 to-transparent sm:from-black/80 sm:via-transparent opacity-90 sm:opacity-80 translate-z-0" />
          </div>
         );
      })}

      {featuredMovies.length > 1 && (
        <>
          <button 
            onClick={goToPrev} 
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Previous slide"
          >
            <ChevronLeft size={48} className="drop-shadow-lg" />
          </button>
          <button 
            onClick={goToNext} 
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Next slide"
          >
            <ChevronRight size={48} className="drop-shadow-lg" />
          </button>
        </>
      )}

      <div className="absolute inset-0 z-20 flex flex-col justify-end pb-16 sm:pb-20 md:pb-24 lg:pb-32 px-4 sm:px-8 md:px-12 lg:px-16 pointer-events-none">
        <div className="max-w-4xl w-full mx-auto md:mx-0 pointer-events-auto">
          
          <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-5 opacity-100 sm:opacity-0 sm:animate-[fade-in_0.5s_ease-out_0.3s_forwards]">
            <span className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-lg shadow-cyan-900/40">
              #1 in Trending
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-3 sm:mb-6 leading-[0.9] tracking-tighter drop-shadow-2xl">
            {activeMovie.title}
          </h1>

          <div className="flex items-center gap-3 text-sm md:text-base text-gray-300 mb-4 font-medium opacity-100 sm:opacity-0 sm:animate-[fade-in_0.5s_ease-out_0.5s_forwards]">
             <span className="text-green-400 font-bold">{activeMovie.rating ? `${(parseFloat(activeMovie.rating) * 10).toFixed(0)}% Match` : ''}</span>
             <span className="text-gray-400" aria-hidden="true">•</span>
             <span>{activeMovie.year}</span>
             <span className="text-gray-400" aria-hidden="true">•</span>
             <span className="border border-gray-500 px-1.5 rounded text-xs">HD</span>
          </div>

          <p className="hidden xs:block text-gray-300 text-sm sm:text-lg leading-relaxed line-clamp-2 sm:line-clamp-3 max-w-2xl mb-6 sm:mb-8 drop-shadow-md opacity-100 sm:opacity-0 sm:animate-[fade-in_0.5s_ease-out_0.6s_forwards]">
            {activeMovie.plot}
          </p>

          <div className="flex items-center gap-3 sm:gap-4 mt-2 opacity-100 sm:opacity-0 sm:animate-[fade-in_0.5s_ease-out_0.7s_forwards]">
            <button
              onClick={() => navigate(`/movie/${activeMovie.id}`)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-3 sm:px-8 sm:py-4 bg-white text-black rounded-lg font-bold text-sm sm:text-base md:text-lg transition-transform active:scale-95 shadow-lg shadow-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              aria-label={`Watch ${activeMovie.title} now`}
            >
              <Play className="fill-black w-5 h-5" aria-hidden="true" />
              Watch Now
            </button>
            <button
              onClick={handleWatchlistClick}
              className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-bold text-sm sm:text-base md:text-lg bg-black/40 text-white transition-all active:scale-95 border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label={isBookmarked ? `Remove ${activeMovie.title} from watchlist` : `Add ${activeMovie.title} to watchlist`}
            >
              {isBookmarked ? <Check className="w-5 h-5" aria-hidden="true" /> : <Plus className="w-5 h-5" aria-hidden="true" />}
              {isBookmarked ? 'Added' : 'My List'}
            </button>
            <button 
              onClick={() => navigate(`/movie/${activeMovie.id}`)}
              className="hidden md:flex items-center justify-center w-14 h-14 rounded-full border border-gray-400 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              title="More Info"
              aria-label={`More info about ${activeMovie.title}`}
            >
               <Info size={24} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {featuredMovies.length > 1 && (
        <Pagination
          count={featuredMovies.length}
          current={currentSlide}
          goToSlide={goToSlide}
          duration={SLIDE_DURATION}
        />
      )}
    </section>
  );
}

export default React.memo(HeroSection);
