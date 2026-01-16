import React, { useState } from 'react';
import { X, ChevronDown, Filter as FilterIcon, RotateCcw, Check } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Top Rated' },
  { value: 'primary_release_date.desc', label: 'Newest Releases' },
  { value: 'revenue.desc', label: 'Highest Revenue' }
];

const LANGUAGES = [
  { value: '', label: 'All Languages' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'hi', label: 'Hindi' }
];

/**
 * Filter panel with mobile drawer and desktop sidebar modes.
 * Supports genre, year, rating, language, and trailer filters.
 * State managed by parent via controlled component pattern.
 */
export default function FilterPanel({ filters, onChange, onReset, genres, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);

  /** Toggles genre in array filter */
  const toggleGenre = (genreId) => {
    const current = filters.with_genres || [];
    const updated = current.includes(genreId)
      ? current.filter(id => id !== genreId)
      : [...current, genreId];
    onChange('with_genres', updated);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden flex items-center justify-between px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 mb-6 w-full shadow-lg active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="filter-panel-content"
      >
        <div className="flex items-center gap-2">
          <FilterIcon size={18} className="text-cyan-400" aria-hidden="true" />
          <span className="font-bold tracking-tight">Filters & Sort</span>
        </div>
        {Object.values(filters).some(v => v && (Array.isArray(v) ? v.length > 0 : v !== 0 && v !== false && v !== 'popularity.desc')) && (
          <span className="flex items-center justify-center bg-cyan-500 text-white text-[10px] font-black w-5 h-5 rounded-full shadow-sm">
             !
          </span>
        )}
      </button>

      {/* Backdrop Overlay for Mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/90 z-[60] transition-opacity duration-300 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Panel Content - Drawer on Mobile / Sticky on Desktop */}
      <div 
        id="filter-panel-content"
        className={`
          fixed inset-y-0 left-0 z-[70] w-[280px] bg-gray-950 border-r border-gray-800 transform transition-transform duration-300 ease-out shadow-2xl
          md:translate-x-0 md:static md:w-full md:bg-transparent md:border-0 md:shadow-none md:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${className}
        `}
      >
        <div className="h-full flex flex-col md:h-auto md:block bg-gray-950 md:bg-transparent">
          
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800 md:hidden bg-gray-950">
            <h2 className="text-xl font-black text-white flex items-center gap-2 tracking-tighter">
              <FilterIcon size={20} className="text-cyan-500" aria-hidden="true" /> FILTERS
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-400 hover:text-white bg-gray-900 rounded-full transition-colors active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              aria-label="Close filters"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 md:bg-gray-900 md:border md:border-gray-800 md:rounded-2xl md:sticky md:top-24 scrollbar-thin scrollbar-thumb-gray-800 bg-gray-950 md:bg-gray-900">
            
            {/* Desktop Section Header */}
            <div className="hidden md:flex items-center justify-between mb-4">
               <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                 <FilterIcon size={14} className="text-cyan-500" aria-hidden="true" /> Filters
               </h2>
               <button 
                 onClick={onReset} 
                 className="text-[10px] font-black text-cyan-500 hover:text-cyan-400 uppercase tracking-tighter transition-colors focus-visible:outline-none focus-visible:underline"
               >
                 Reset All
               </button>
            </div>

            {/* Sort By */}
            <section className="space-y-3">
              <label htmlFor="sort-select" className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Sort Results</label>
              <div className="relative">
                <select
                  id="sort-select"
                  value={filters.sort_by}
                  onChange={(e) => onChange('sort_by', e.target.value)}
                  className="w-full bg-gray-900 text-white border border-gray-800 rounded-xl pl-4 pr-10 py-3 text-sm appearance-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:outline-none transition-all cursor-pointer font-medium"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} aria-hidden="true" />
              </div>
            </section>

            {/* Genres */}
            <section className="space-y-3">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] block" id="genres-label">Genres</span>
              <div className="flex flex-wrap gap-2" role="group" aria-labelledby="genres-label">
                {genres.map(genre => {
                  const isActive = (filters.with_genres || []).includes(genre.id);
                  return (
                    <button
                      key={genre.id}
                      onClick={() => toggleGenre(genre.id)}
                      aria-pressed={isActive}
                      className={`
                        px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500
                        ${isActive
                          ? 'bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-900/40 scale-105'
                          : 'bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-gray-200'}
                      `}
                    >
                      {genre.name}
                    </button>
                  );
                })}
              </div>
            </section>

            <div className="h-px bg-gray-800/50" aria-hidden="true" />

            {/* Year Range */}
            <section className="space-y-3">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] block">Release Year</span>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="From"
                  aria-label="Year From"
                  value={filters.year_min}
                  onChange={(e) => onChange('year_min', e.target.value)}
                  className="w-full bg-gray-900 text-white border border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:outline-none transition-all font-medium placeholder:text-gray-700"
                />
                <input
                  type="number"
                  placeholder="To"
                  aria-label="Year To"
                  value={filters.year_max}
                  onChange={(e) => onChange('year_max', e.target.value)}
                  className="w-full bg-gray-900 text-white border border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:outline-none transition-all font-medium placeholder:text-gray-700"
                />
              </div>
            </section>

            {/* Minimum Rating */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="rating-range" className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Min Rating</label>
                <span className="text-xs font-black text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">{filters.min_rating}+</span>
              </div>
              <input
                id="rating-range"
                type="range"
                min="0"
                max="10"
                step="1"
                value={filters.min_rating}
                onChange={(e) => onChange('min_rating', Number(e.target.value))}
                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              />
            </section>

            {/* Language */}
            <section className="space-y-3">
              <label htmlFor="language-select" className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Language</label>
              <div className="relative">
                <select
                  id="language-select"
                  value={filters.with_original_language}
                  onChange={(e) => onChange('with_original_language', e.target.value)}
                  className="w-full bg-gray-900 text-white border border-gray-800 rounded-xl pl-4 pr-10 py-3 text-sm appearance-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:outline-none transition-all cursor-pointer font-medium"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} aria-hidden="true" />
              </div>
            </section>

            {/* Only with Trailer */}
            <button 
              className="w-full flex items-center gap-3 p-4 bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 transition-all cursor-pointer group active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 text-left" 
              onClick={() => onChange('only_with_trailer', !filters.only_with_trailer)}
              role="switch"
              aria-checked={filters.only_with_trailer}
            >
               <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${filters.only_with_trailer ? 'bg-cyan-600 border-cyan-500' : 'bg-gray-800 border-gray-700'}`}>
                 {filters.only_with_trailer && <Check size={14} className="text-white stroke-[3]" aria-hidden="true" />} 
               </div>
               <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">Only with Trailer</span>
            </button>

            {/* Mobile Action Buttons */}
            <div className="pt-4 pb-12 md:hidden">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-4 bg-cyan-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-cyan-900/40 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Apply Filters
              </button>
              <button
                onClick={() => { onReset(); setIsOpen(false); }}
                className="w-full py-4 mt-4 text-gray-500 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 active:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              >
                <RotateCcw size={14} aria-hidden="true" /> Reset Everything
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}