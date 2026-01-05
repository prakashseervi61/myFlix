import React, { useRef, useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MovieCard from "../ui/MovieCard";
import MovieCardSkeleton from "../ui/MovieCardSkeleton";

// Stable default to prevent re-renders
const EMPTY_MOVIES = [];

function Row({ title, movies, loading = false, onMovieClick }) {
  const scrollRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  // Use stable reference for movies array
  const stableMovies = movies || EMPTY_MOVIES;
  
  // Memoize skeleton array to prevent recreation
  const skeletonItems = useMemo(() => 
    Array.from({ length: 8 }, (_, index) => (
      <MovieCardSkeleton key={`skeleton-${title}-${index}`} />
    )), [title]
  );

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
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
    
    if (isLeftSwipe) scroll('right');
    if (isRightSwipe) scroll('left');
  };

  return (
    <section className="mb-8 sm:mb-10 md:mb-12" role="region" aria-labelledby={`${title.replace(/\s+/g, '-').toLowerCase()}-heading`}>
      <h2 id={`${title.replace(/\s+/g, '-').toLowerCase()}-heading`} className="text-white text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-5 md:mb-6 px-4 sm:px-6 leading-tight">{title}</h2>
      <div className="relative">
        <div className="group">
          <button
            onClick={() => scroll('left')}
            aria-label={`Scroll ${title} left`}
            type="button"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-black/70 hover:bg-black/90 focus:bg-black/90 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 md:opacity-100 transition-all duration-300 shadow-lg backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label={`Scroll ${title} right`}
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-black/70 hover:bg-black/90 focus:bg-black/90 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 md:opacity-100 transition-all duration-300 shadow-lg backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
          </button>
        </div>
        <div 
          ref={scrollRef} 
          className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide px-4 sm:px-6 pb-3 sm:pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          role="list"
          aria-label={`${title} movies`}
        >
          {loading ? (
            skeletonItems
          ) : (
            stableMovies.map((movie) => (
              <div key={movie.id} role="listitem">
                <MovieCard movie={movie} onClick={onMovieClick} />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default Row;