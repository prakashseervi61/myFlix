import React from 'react';
import CastCard from './CastCard.jsx';
import { Users } from 'lucide-react';

const CastSection = ({ cast = [] }) => {
  if (!cast || cast.length === 0) return null;

  return (
    <div className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <Users className="text-cyan-500" size={24} />
        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Full Cast</h2>
        <span className="bg-white/10 text-white/60 px-2 py-0.5 rounded-full text-xs font-medium">
          {cast.length}
        </span>
      </div>

      <div className="relative group">
        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 pt-2 scrollbar-hide snap-x transition-all duration-300">
          {cast.map((actor) => (
            <div key={actor.id} className="snap-start">
              <CastCard actor={actor} />
            </div>
          ))}
          {/* Spacer for horizontal scroll ending */}
          <div className="w-4 sm:w-8 flex-shrink-0" />
        </div>
      </div>
    </div>
  );
};

export default React.memo(CastSection);
