import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, Filter as FilterIcon, RotateCcw } from 'lucide-react';

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

export default function FilterPanel({ filters, onChange, onReset, genres, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleGenre = (genreId) => {
    const current = filters.with_genres || [];
    const updated = current.includes(genreId)
      ? current.filter(id => id !== genreId)
      : [...current, genreId];
    onChange('with_genres', updated);
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="md:hidden flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 mb-4 w-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FilterIcon size={18} />
        <span>{isOpen ? 'Hide Filters' : 'Show Filters'}</span>
        {Object.values(filters).some(v => v && (Array.isArray(v) ? v.length > 0 : v !== 0 && v !== false && v !== 'popularity.desc')) && (
          <span className="ml-auto w-2 h-2 bg-cyan-500 rounded-full"></span>
        )}
      </button>

      {/* Panel */}
      <div className={`
        bg-gray-900 border-r border-gray-800 p-4 sm:p-6 w-full md:w-80 h-full overflow-y-auto
        fixed md:relative inset-0 z-40 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${className}
      `}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FilterIcon size={20} /> Filters
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1 text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Sort By */}
          <section>
            <label className="block text-sm font-medium text-gray-400 mb-2">Sort By</label>
            <div className="relative">
              <select
                value={filters.sort_by}
                onChange={(e) => onChange('sort_by', e.target.value)}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm appearance-none focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16} />
            </div>
          </section>

          {/* Genres */}
          <section>
            <label className="block text-sm font-medium text-gray-400 mb-2">Genres</label>
            <div className="flex flex-wrap gap-2">
              {genres.map(genre => (
                <button
                  key={genre.id}
                  onClick={() => toggleGenre(genre.id)}
                  className={`
                    px-3 py-1 text-xs rounded-full border transition-colors
                    ${(filters.with_genres || []).includes(genre.id)
                      ? 'bg-cyan-600 border-cyan-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'}
                  `}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </section>

          {/* Year Range */}
          <section>
            <label className="block text-sm font-medium text-gray-400 mb-2">Release Year</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="From"
                value={filters.year_min}
                onChange={(e) => onChange('year_min', e.target.value)}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="To"
                value={filters.year_max}
                onChange={(e) => onChange('year_max', e.target.value)}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
          </section>

          {/* Minimum Rating */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-400">Min Rating</label>
              <span className="text-sm text-cyan-400 font-bold">{filters.min_rating}+</span>
            </div>
            <input
              type="range"
              min="0"
              max="9"
              step="1"
              value={filters.min_rating}
              onChange={(e) => onChange('min_rating', Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>10</span>
            </div>
          </section>

          {/* Language */}
          <section>
            <label className="block text-sm font-medium text-gray-400 mb-2">Language</label>
            <div className="relative">
              <select
                value={filters.with_original_language}
                onChange={(e) => onChange('with_original_language', e.target.value)}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm appearance-none focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16} />
            </div>
          </section>

          {/* Only with Trailer */}
          <section className="flex items-center gap-3">
             <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200 ease-in">
                <input 
                  type="checkbox" 
                  name="toggle" 
                  id="trailer-toggle"
                  checked={filters.only_with_trailer}
                  onChange={(e) => onChange('only_with_trailer', e.target.checked)}
                  className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300 ease-in-out left-1 top-1 checked:left-5 checked:border-cyan-500 checked:bg-cyan-500"
                  style={filters.only_with_trailer ? { left: '1.25rem', borderColor: '#06b6d4', backgroundColor: '#06b6d4' } : {}}
                />
                <label 
                  htmlFor="trailer-toggle" 
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer border ${filters.only_with_trailer ? 'bg-gray-700 border-cyan-500' : 'bg-gray-800 border-gray-700'}`}
                ></label>
            </div>
            <label htmlFor="trailer-toggle" className="text-sm font-medium text-gray-300 cursor-pointer">
              Only with Trailer
            </label>
          </section>

          {/* Reset */}
          <button
            onClick={onReset}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors border border-gray-700"
          >
            <RotateCcw size={16} /> Reset Filters
          </button>
        </div>
      </div>
      
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
