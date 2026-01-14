import React, { useRef, useState, useMemo, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MovieCard from "../ui/MovieCard";
import MovieCardSkeleton from "../ui/MovieCardSkeleton";

function Row({ title, subtitle, movies = [], loading = false, onMovieClick }) {
  const scrollRef = useRef(null);
  const [showButtons, setShowButtons] = useState({ left: false, right: false });

  const skeletons = useMemo(() => 
    Array(8).fill(0).map((_, i) => (
      <li key={i} className="snap-start w-32 xs:w-36 sm:w-44 md:w-48 lg:w-56 flex-shrink-0">
        <MovieCardSkeleton />
      </li>
    )),
    []
  );

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    // Buffer of 10px to avoid floating point issues
    const isAtStart = scrollLeft <= 10;
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
  }, [movies.length, loading, handleScroll]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const viewWidth = scrollRef.current.clientWidth;
    const scrollAmount = viewWidth * 0.8 * (direction === 'left' ? -1 : 1);
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };
  
  if (!loading && (!movies || movies.length === 0)) return null;

  return (
    <section className="mb-8 md:mb-14 animate-in fade-in duration-700 slide-in-from-bottom-4 relative group/row" aria-labelledby={`${title.replace(/\s+/g, '-')}-heading`}>
      <div className="px-4 sm:px-6 lg:px-8 mb-3 flex items-baseline gap-3">
        <h2 id={`${title.replace(/\s+/g, '-')}-heading`} className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-100 group-hover/row:text-white transition-colors cursor-pointer flex items-center gap-2">
          {title}
          <span className="hidden group-hover/row:inline-block text-cyan-500 text-xs md:text-sm font-semibold opacity-0 -translate-x-2 group-hover/row:opacity-100 group-hover/row:translate-x-0 transition-all duration-300">Explore All</span>
        </h2>
        {subtitle && (
          <span className="hidden xs:inline-block text-[10px] sm:text-xs font-semibold text-cyan-500 uppercase tracking-wider bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-500/10">
            {subtitle}
          </span>
        )}
      </div>
      
      <div className="relative">
        {/* Desktop Navigation Buttons - Full Height Overlay */}
        <div className="hidden md:block">
          <button
            onClick={() => scroll('left')}
            className={`absolute left-0 top-0 bottom-0 z-40 w-12 lg:w-16 bg-gradient-to-r from-black/90 via-black/50 to-transparent flex items-center justify-center transition-all duration-300 ease-out ${
              showButtons.left ? 'opacity-0 group-hover/row:opacity-100 translate-x-0' : 'opacity-0 pointer-events-none -translate-x-full'
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeft size={48} className="text-white drop-shadow-lg transform transition-transform hover:scale-125" />
          </button>
          
          <button
            onClick={() => scroll('right')}
            className={`absolute right-0 top-0 bottom-0 z-40 w-12 lg:w-16 bg-gradient-to-l from-black/90 via-black/50 to-transparent flex items-center justify-center transition-all duration-300 ease-out ${
              showButtons.right ? 'opacity-0 group-hover/row:opacity-100 translate-x-0' : 'opacity-0 pointer-events-none translate-x-full'
            }`}
            aria-label="Scroll right"
          >
            <ChevronRight size={48} className="text-white drop-shadow-lg transform transition-transform hover:scale-125" />
          </button>
        </div>
        
        {/* Scroll Container - Added padding y for hover scale effects */}
        <ul
          ref={scrollRef} 
          className="flex gap-3 sm:gap-4 md:gap-5 overflow-x-auto overflow-y-visible snap-x snap-mandatory scrollbar-hide px-4 sm:px-6 lg:px-8 py-4 -my-4"
          style={{ scrollPaddingLeft: '4%', scrollPaddingRight: '4%' }}
        >
          {loading ? skeletons : movies.map((movie) => (
            <li key={movie.id} className="snap-start w-32 xs:w-36 sm:w-44 md:w-48 lg:w-56 flex-shrink-0">
              <MovieCard movie={movie} onClick={onMovieClick} />
            </li>
          ))}
          {/* Spacer for end of list */}
          <li className="w-8 md:w-12 flex-shrink-0" aria-hidden="true" />
        </ul>
      </div>
    </section>
  );
}

export default React.memo(Row);
