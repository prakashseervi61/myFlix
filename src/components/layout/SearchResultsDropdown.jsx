import React from 'react';
import { Star, Check } from 'lucide-react';

const SearchResultsDropdown = React.memo(({ results, loading, error, onMovieClick, isInWatchlist }) => (
  <div className="search-results fixed inset-x-0 top-[70px] h-[calc(100vh-70px)] md:h-auto md:absolute md:top-full md:inset-x-auto md:left-0 md:right-0 md:mt-2 bg-background md:border border-muted/20 md:rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden md:max-h-[60vh] overflow-y-auto z-[100] md:z-50 scrollbar-hide md:scrollbar-thin md:scrollbar-thumb-[#7B3A3C]">
    {loading && (
      <div className="p-4 md:p-4 space-y-4 md:space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4 md:gap-4 items-center">
            <div className="w-16 h-24 md:w-12 md:h-16 skeleton-loader rounded-md shrink-0" />
            <div className="flex-1 space-y-3 md:space-y-2 py-1">
              <div className="h-5 md:h-4 w-3/4 skeleton-loader rounded" />
              <div className="h-4 md:h-3 w-1/4 skeleton-loader rounded" />
            </div>
          </div>
        ))}
      </div>
    )}
    {error && <div className="p-4 text-center text-primary text-sm bg-primary/5 border-b border-primary/10">{error}</div>}
    {!loading && !error && results.length === 0 && <div className="p-8 text-center text-muted text-base font-medium">No movies found.</div>}
    
    <div className="divide-y divide-[#C0927C]/10">
      {results.map((movie) => {
        const inList = isInWatchlist ? isInWatchlist(movie.id) : false;
        return (
          <button 
            key={movie.id} 
            onClick={() => onMovieClick(movie)} 
            className="w-full p-4 md:p-3 flex items-center gap-4 hover:bg-surface/40 transition-colors text-left group focus:outline-none focus:bg-surface/60 border-b border-white/5 last:border-0"
          >
            <div className="relative w-16 h-24 md:w-12 md:h-16 bg-[#2A1F25] rounded-md overflow-hidden shrink-0 shadow-sm border border-white/10 group-hover:border-primary/50 transition-colors">
               <img src={movie.poster} alt="" className="w-full h-full object-cover" loading="lazy" />
               {inList && (
                 <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[1px]">
                   <Check size={18} className="text-green-500 font-bold" />
                 </div>
               )}
            </div>
            <div className="flex-1 min-w-0 py-1">
              <p className={`text-base md:text-sm font-bold truncate group-hover:text-primary transition-colors ${inList ? 'text-green-400' : 'text-white'}`}>
                {movie.title}
              </p>
              <div className="flex items-center gap-3 mt-2 md:mt-1">
                <span className="text-muted text-sm md:text-xs font-semibold">{movie.year || 'N/A'}</span>
                {inList && <span className="text-[10px] text-green-400 font-bold border border-green-500/20 px-1.5 py-0.5 rounded bg-green-500/5 uppercase tracking-wide">Added</span>}
                {movie.rating && <span className="text-xs md:text-[10px] text-yellow-500 flex items-center gap-1 font-bold bg-yellow-500/10 px-1.5 py-0.5 rounded"><Star size={12} fill="currentColor" /> {movie.rating}</span>}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  </div>
));

export default SearchResultsDropdown;
