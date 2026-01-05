import React, { useRef, useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MovieCard from "../ui/MovieCard";
import MovieCardSkeleton from "../ui/MovieCardSkeleton";

// Stable default to prevent re-renders
const EMPTY_MOVIES = [];

function Row({ title, movies, loading = false, onMovieClick }) {
  const scrollRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);
  
  // Use stable reference for movies array
  const stableMovies = movies || EMPTY_MOVIES;
  
  // Memoize skeleton array to prevent recreation
  const skeletonItems = useMemo(() => 
    Array.from({ length: 8 }, (_, index) => (
      <MovieCardSkeleton key={`skeleton-${title}-${index}`} />
    )), [title]
  );

  const updateButtonVisibility = () => {
    const { current } = scrollRef;
    if (current) {
      const { scrollLeft, scrollWidth, clientWidth } = current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    const { current } = scrollRef;
    if (current) {
      current.addEventListener('scroll', updateButtonVisibility);
      updateButtonVisibility(); // Initial check
      return () => current.removeEventListener('scroll', updateButtonVisibility);
    }
  }, [stableMovies]);

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
        {showLeftButton && (
          <button
            onClick={() => scroll('left')}
            aria-label={`Scroll ${title} left`}
            type="button"
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-40 bg-gradient-to-r from-black/90 to-transparent text-white items-center justify-center transition-opacity duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {showRightButton && (
          <button
            onClick={() => scroll('right')}
            aria-label={`Scroll ${title} right`}
            type="button"
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-40 bg-gradient-to-l from-black/90 to-transparent text-white items-center justify-center transition-opacity duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
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