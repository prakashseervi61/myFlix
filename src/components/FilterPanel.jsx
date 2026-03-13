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
        className="md:hidden flex items-center justify-between px-4 py-3 bg-[#7B3A3C] text-white rounded-xl border border-[#C0927C]/30 mb-6 w-full shadow-lg active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C1372C]"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="filter-panel-content"
      >
        <div className="flex items-center gap-2">
          <FilterIcon size={18} className="text-[#C1372C]" aria-hidden="true" />
          <span className="font-bold tracking-tight">Filters & Sort</span>
        </div>
        {Object.values(filters).some(v => v && (Array.isArray(v) ? v.length > 0 : v !== 0 && v !== false && v !== 'popularity.desc')) && (
          <span className="flex items-center justify-center bg-[#C1372C] text-white text-[10px] font-black w-5 h-5 rounded-full shadow-sm">
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
          fixed inset-y-0 left-0 z-[70] w-[280px] bg-[#20151A] border-r border-[#C0927C]/20 transform transition-transform duration-300 ease-out shadow-2xl
          md:translate-x-0 md:static md:w-full md:bg-transparent md:border-0 md:shadow-none md:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${className}
        `}
      >
        <div className="h-full flex flex-col md:h-auto md:block bg-[#20151A] md:bg-transparent">
          
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#C0927C]/10 md:hidden bg-[#20151A]">
            <h2 className="text-xl font-black text-white flex items-center gap-2 tracking-tighter">
              <FilterIcon size={20} className="text-[#C1372C]" aria-hidden="true" /> FILTERS
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-[#C0927C] hover:text-white bg-[#5E4A65] rounded-full transition-colors active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C1372C]"
              aria-label="Close filters"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 md:bg-[#5E4A65]/50 md:backdrop-blur-sm md:border md:border-[#C0927C]/20 md:rounded-2xl md:sticky md:top-24 scrollbar-thin scrollbar-thumb-[#7B3A3C] bg-[#20151A] md:bg-[#5E4A65]/50">
            
            {/* Desktop Section Header */}
            <div className="hidden md:flex items-center justify-between mb-4">
               <h2 className="text-sm font-black text-[#C0927C] uppercase tracking-widest flex items-center gap-2">
                 <FilterIcon size={14} className="text-[#C1372C]" aria-hidden="true" /> Filters
               </h2>
               <button 
                 onClick={onReset} 
                 className="text-[10px] font-black text-[#C1372C] hover:text-[#d43f33] uppercase tracking-tighter transition-colors focus-visible:outline-none focus-visible:underline"
               >
                 Reset All
               </button>
            </div>

            {/* Sort By */}
            <section className="space-y-3">
              <label htmlFor="sort-select" className="text-[10px] font-black text-[#C0927C]/60 uppercase tracking-[0.2em]">Sort Results</label>
              <div className="relative">
                <select
                  id="sort-select"
                  value={filters.sort_by}
                  onChange={(e) => onChange('sort_by', e.target.value)}
                  className="w-full bg-[#5E4A65] text-white border border-[#C0927C]/20 rounded-xl pl-4 pr-10 py-3 text-sm appearance-none focus:ring-2 focus:ring-[#C1372C]/50 focus:border-[#C1372C] focus:outline-none transition-all cursor-pointer font-medium"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C0927C] pointer-events-none" size={16} aria-hidden="true" />
              </div>
            </section>

            {/* Genres */}
            <section className="space-y-3">
              <span className="text-[10px] font-black text-[#C0927C]/60 uppercase tracking-[0.2em] block" id="genres-label">Genres</span>
              <div className="flex flex-wrap gap-2" role="group" aria-labelledby="genres-label">
                {genres.map(genre => {
                  const isActive = (filters.with_genres || []).includes(genre.id);
                  return (
                    <button
                      key={genre.id}
                      onClick={() => toggleGenre(genre.id)}
                      aria-pressed={isActive}
                      className={`
                        px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C1372C]
                        ${isActive
                          ? 'bg-[#C1372C] border-[#C1372C] text-white shadow-lg shadow-black/40 scale-105'
                          : 'bg-[#5E4A65] border-[#C0927C]/20 text-[#C0927C] hover:bg-[#7B3A3C] hover:text-white'}
                      `}
                    >
                      {genre.name}
                    </button>
                  );
                })}
              </div>
            </section>

            <div className="h-px bg-[#C0927C]/10" aria-hidden="true" />

            {/* Year Range */}
            <section className="space-y-3">
              <span className="text-[10px] font-black text-[#C0927C]/60 uppercase tracking-[0.2em] block">Release Year</span>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="From"
                  aria-label="Year From"
                  value={filters.year_min}
                  onChange={(e) => onChange('year_min', e.target.value)}
                  className="w-full bg-[#5E4A65] text-white border border-[#C0927C]/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#C1372C]/50 focus:border-[#C1372C] focus:outline-none transition-all font-medium placeholder:text-[#C0927C]/40"
                />
                <input
                  type="number"
                  placeholder="To"
                  aria-label="Year To"
                  value={filters.year_max}
                  onChange={(e) => onChange('year_max', e.target.value)}
                  className="w-full bg-[#5E4A65] text-white border border-[#C0927C]/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#C1372C]/50 focus:border-[#C1372C] focus:outline-none transition-all font-medium placeholder:text-[#C0927C]/40"
                />
              </div>
            </section>

            {/* Minimum Rating */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="rating-range" className="text-[10px] font-black text-[#C0927C] uppercase tracking-[0.2em]">Min Rating</label>
                <span className="text-xs font-black text-[#C1372C] bg-[#C1372C]/10 px-2 py-0.5 rounded border border-[#C1372C]/20">{filters.min_rating}+</span>
              </div>
              <input
                id="rating-range"
                type="range"
                min="0"
                max="10"
                step="1"
                value={filters.min_rating}
                onChange={(e) => onChange('min_rating', Number(e.target.value))}
                className="w-full h-1.5 bg-[#5E4A65] rounded-lg appearance-none cursor-pointer accent-[#C1372C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C1372C]"
              />
            </section>

            {/* Language */}
            <section className="space-y-3">
              <label htmlFor="language-select" className="text-[10px] font-black text-[#C0927C]/60 uppercase tracking-[0.2em]">Language</label>
              <div className="relative">
                <select
                  id="language-select"
                  value={filters.with_original_language}
                  onChange={(e) => onChange('with_original_language', e.target.value)}
                  className="w-full bg-[#5E4A65] text-white border border-[#C0927C]/20 rounded-xl pl-4 pr-10 py-3 text-sm appearance-none focus:ring-2 focus:ring-[#C1372C]/50 focus:border-[#C1372C] focus:outline-none transition-all cursor-pointer font-medium"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C0927C] pointer-events-none" size={16} aria-hidden="true" />
              </div>
            </section>

            {/* Only with Trailer */}
            <button 
              className="w-full flex items-center gap-3 p-4 bg-[#5E4A65] rounded-xl border border-[#C0927C]/20 hover:border-[#C1372C]/40 transition-all cursor-pointer group active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C1372C] text-left" 
              onClick={() => onChange('only_with_trailer', !filters.only_with_trailer)}
              role="switch"
              aria-checked={filters.only_with_trailer}
            >
               <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${filters.only_with_trailer ? 'bg-[#C1372C] border-[#C1372C]' : 'bg-[#5E4A65] border-[#C0927C]/30'}`}>
                 {filters.only_with_trailer && <Check size={14} className="text-white stroke-[3]" aria-hidden="true" />} 
               </div>
               <span className="text-xs font-bold text-white uppercase tracking-wider">Only with Trailer</span>
            </button>

            {/* Mobile Action Buttons */}
            <div className="pt-4 pb-12 md:hidden">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-4 bg-[#C1372C] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-black/40 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Apply Filters
              </button>
              <button
                onClick={() => { onReset(); setIsOpen(false); }}
                className="w-full py-4 mt-4 text-[#C0927C] text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 active:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C1372C]"
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