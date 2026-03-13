import React, { useRef } from 'react';
import CastCard from './CastCard.jsx';
import { Users, ChevronLeft, ChevronRight } from 'lucide-react';

const CastSection = ({ cast = [] }) => {
  const scrollRef = useRef(null);

  if (!cast || cast.length === 0) return null;

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.8 
        : scrollLeft + clientWidth * 0.8;
      
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="mt-0 space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <Users className="text-[#C50337]" size={24} />
          <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Full Cast</h2>
          <span className="bg-white/10 text-white/60 px-2 py-0.5 rounded-full text-xs font-medium">
            {cast.length}
          </span>
        </div>
        
        {/* Nav Buttons (Hidden on touch devices, shown on hover/desktop) */}
        <div className="hidden md:flex items-center gap-2">
          <button 
            onClick={() => scroll('left')}
            className="p-2 bg-white/5 hover:bg-[#C50337] rounded-full text-white/40 hover:text-white transition-all active:scale-90 border border-white/5 shadow-lg group"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="p-2 bg-white/5 hover:bg-[#C50337] rounded-full text-white/40 hover:text-white transition-all active:scale-90 border border-white/5 shadow-lg group"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="relative">
        <div 
          ref={scrollRef}
          className="flex gap-4 md:gap-6 overflow-x-auto pb-6 pt-2 scrollbar-hide snap-x"
        >
          {cast.map((actor) => (
            <div key={actor.id} className="snap-start">
              <CastCard actor={actor} />
            </div>
          ))}
          {/* Spacer for horizontal scroll ending */}
          <div className="w-10 flex-shrink-0" />
        </div>
      </div>
    </div>
  );
};

export default React.memo(CastSection);
