import React, { useRef, useState, useMemo, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MovieCard from "../ui/MovieCard";
import MovieCardSkeleton from "../ui/MovieCardSkeleton";

function Row({ title, subtitle, movies = [], loading = false, onMovieClick }) {
  const scrollRef = useRef(null);
  const [showButtons, setShowButtons] = useState({ left: false, right: false });

  const skeletons = useMemo(() => 
    Array(10).fill(0).map((_, i) => <li key={i} className="w-40 sm:w-48 md:w-56 flex-shrink-0"><MovieCardSkeleton /></li>),
    []
  );

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const isAtStart = scrollLeft < 10;
    const isAtEnd = scrollLeft >= scrollWidth - clientWidth - 10;
    setShowButtons({ left: !isAtStart, right: !isAtEnd });
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (element) {
      handleScroll();
      element.addEventListener('scroll', handleScroll, { passive: true });
      const resizeObserver = new ResizeObserver(handleScroll);
      resizeObserver.observe(element);
      
      return () => {
        element.removeEventListener('scroll', handleScroll);
        resizeObserver.unobserve(element);
      };
    }
  }, [movies, loading, handleScroll]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = (scrollRef.current.clientWidth * 0.7) * (direction === 'left' ? -1 : 1);
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };
  
  const hasMovies = movies.length > 0;

  return (
    <section className="mb-8 md:mb-12" aria-labelledby={`${title.replace(/\s+/g, '-')}-heading`}>
      <div className="px-4 sm:px-6 lg:px-8 mb-4">
        <h2 id={`${title.replace(/\s+/g, '-')}-heading`} className="text-xl sm:text-2xl font-bold text-white">
          {title}
        </h2>
        {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      </div>
      
      <div className="relative group">
        {showButtons.left && (
          <button
            onClick={() => scroll('left')}
            aria-label={`Scroll ${title} left`}
            className="absolute left-0 top-0 bottom-0 z-20 w-12 bg-gradient-to-r from-gray-900 via-gray-900/70 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={32} />
          </button>
        )}
        
        <ul
          ref={scrollRef} 
          className="flex gap-4 overflow-x-auto overflow-y-hidden scrollbar-hide px-4 sm:px-6 lg:px-8 py-2"
        >
          {loading && !hasMovies ? skeletons : movies.map((movie) => (
            <li key={movie.id} className="w-40 sm:w-48 md:w-56 flex-shrink-0">
              <MovieCard movie={movie} onClick={onMovieClick} />
            </li>
          ))}
        </ul>
        
        {showButtons.right && (
          <button
            onClick={() => scroll('right')}
            aria-label={`Scroll ${title} right`}
            className="absolute right-0 top-0 bottom-0 z-20 w-12 bg-gradient-to-l from-gray-900 via-gray-900/70 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={32} />
          </button>
        )}
      </div>
    </section>
  );
}

export default React.memo(Row);