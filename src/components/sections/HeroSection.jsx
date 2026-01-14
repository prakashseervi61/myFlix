import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Play, Plus, Check, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWatchlist } from "../../contexts/WatchlistContext.jsx";
import { useAuth } from "../../hooks/useAuth.jsx";

const SLIDE_DURATION = 8000;

function HeroSection({ movies = [] }) {
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { user } = useAuth();
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const touchStartRef = useRef(null);

  const featuredMovies = useMemo(() => {
     const withBackdrops = movies.filter(m => m.backdrop);
     return (withBackdrops.length > 0 ? withBackdrops : movies).slice(0, 6);
  }, [movies]);

  const goToNext = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % featuredMovies.length);
  }, [featuredMovies.length]);

  const goToPrev = useCallback(() => {
    setCurrentSlide(prev => (prev - 1 + featuredMovies.length) % featuredMovies.length);
  }, [featuredMovies.length]);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  useEffect(() => {
    if (!isPaused && featuredMovies.length > 1) {
      const timer = setInterval(goToNext, SLIDE_DURATION);
      return () => clearInterval(timer);
    }
  }, [isPaused, featuredMovies.length, goToNext]);

  // Preload next image logic using Link rel=preload injection could be here,
  // but standard Image object prefetch is simpler and effective enough.
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
    // Enhanced Skeleton
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
      className="relative w-full h-[100vh] min-h-[100svh] overflow-hidden bg-black group contain-content"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Images - Optimized */}
      {featuredMovies.map((movie, index) => {
         const isCurrent = index === currentSlide;
         // Only render DOM nodes for current, prev, next to save memory if list is huge (it's only 6 here, so map all is fine for transitions)
         return (
          <div
            key={movie.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out will-change-opacity ${isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            aria-hidden={!isCurrent}
          >
             {/* Base dark layer */}
             <div className="absolute inset-0 bg-gray-900" />
             <img
               src={movie.backdrop || movie.poster}
               alt=""
               className={`w-full h-full object-cover ${isCurrent ? 'scale-105' : 'scale-100'} transition-transform duration-[12s] ease-linear will-change-transform`}
               loading={index === 0 ? "eager" : "lazy"}
               fetchPriority={isCurrent ? "high" : "low"}
               decoding="async"
             />
             {/* Vignette & Gradients - GPU Accelerated */}
             <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/30 to-transparent translate-z-0" />
             <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/40 to-transparent translate-z-0" />
             <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-gray-950 to-transparent translate-z-0" />
          </div>
         );
      })}

      {/* Desktop Navigation Arrows */}
      {featuredMovies.length > 1 && (
        <>
          <button onClick={goToPrev} className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full text-white/50 hover:text-white hover:bg-white/10 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100">
            <ChevronLeft size={48} className="drop-shadow-lg" />
          </button>
          <button onClick={goToNext} className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full text-white/50 hover:text-white hover:bg-white/10 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100">
            <ChevronRight size={48} className="drop-shadow-lg" />
          </button>
        </>
      )}

      {/* Content - Normalized State */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end pb-12 sm:pb-20 md:pb-24 lg:pb-32 px-4 sm:px-8 md:px-12 lg:px-16 pointer-events-none">
        <div className="max-w-4xl w-full mx-auto md:mx-0 pointer-events-auto">
          
          <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-5 opacity-0 animate-[fade-in_0.5s_ease-out_0.3s_forwards]">
            <span className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-lg shadow-cyan-900/40">
              #1 in Trending
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-3 sm:mb-6 leading-[0.9] tracking-tighter drop-shadow-2xl">
            {activeMovie.title}
          </h1>

          <div className="flex items-center gap-3 text-sm md:text-base text-gray-300 mb-4 font-medium opacity-0 animate-[fade-in_0.5s_ease-out_0.5s_forwards]">
             <span className="text-green-400 font-bold">{activeMovie.rating ? `${(parseFloat(activeMovie.rating) * 10).toFixed(0)}% Match` : ''}</span>
             <span className="text-gray-400">•</span>
             <span>{activeMovie.year}</span>
             <span className="text-gray-400">•</span>
             <span className="border border-gray-500 px-1.5 rounded text-xs">HD</span>
          </div>

          <p className="hidden xs:block text-gray-300 text-sm sm:text-lg leading-relaxed line-clamp-2 sm:line-clamp-3 max-w-2xl mb-6 sm:mb-8 drop-shadow-md opacity-0 animate-[fade-in_0.5s_ease-out_0.6s_forwards]">
            {activeMovie.plot}
          </p>

          <div className="flex items-center gap-3 sm:gap-4 mt-2 opacity-0 animate-[fade-in_0.5s_ease-out_0.7s_forwards]">
            <button
              onClick={() => navigate(`/movie/${activeMovie.id}`)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-3 sm:px-8 sm:py-4 bg-white text-black rounded-lg font-bold text-sm sm:text-base md:text-lg transition-transform hover:scale-105 active:scale-95 hover:bg-gray-100 shadow-lg shadow-white/10"
            >
              <Play className="fill-black w-5 h-5" />
              Watch Now
            </button>
            <button
              onClick={handleWatchlistClick}
              className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-bold text-sm sm:text-base md:text-lg backdrop-blur-md bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-105 active:scale-95 border border-white/20"
            >
              {isBookmarked ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {isBookmarked ? 'Added' : 'My List'}
            </button>
            <button 
              onClick={() => navigate(`/movie/${activeMovie.id}`)}
              className="hidden md:flex items-center justify-center w-14 h-14 rounded-full border border-gray-400 text-white hover:border-white hover:bg-white/10 transition-colors"
              title="More Info"
            >
               <Info size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Pagination Indicators */}
      <div className="absolute bottom-6 right-6 md:bottom-12 md:right-12 z-30 flex gap-2">
        {featuredMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`group flex flex-col gap-1 items-center justify-center p-2 outline-none`}
            aria-label={`Go to slide ${index + 1}`}
          >
             <div className={`transition-all duration-300 ease-out shadow-lg ${
               index === currentSlide
                 ? 'w-8 h-1.5 bg-white' 
                 : 'w-2 h-1.5 bg-white/30 hover:bg-white/60'
             } rounded-full`} />
          </button>
        ))}
      </div>
    </section>
  );
}

export default React.memo(HeroSection);
