import React from 'react';
import { User } from 'lucide-react';

const CastCard = ({ actor }) => {
  return (
    <div className="flex-shrink-0 w-[125px] md:w-[140px] group cursor-pointer scroll-snap-align-start transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden rounded-xl mb-3 shadow-lg bg-[#021C4F] border border-white/5 group-hover:shadow-[#C50337]/10 transition-all">
        {actor.profile_path ? (
          <img 
            src={actor.profile_path} 
            alt={actor.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 bg-[#021C4F]/50">
            <User size={32} strokeWidth={1} />
            <span className="text-[9px] uppercase font-bold mt-2 opacity-20">No Image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#021C4F] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="space-y-1">
        <h4 className="text-white font-bold text-[13px] leading-tight group-hover:text-[#C50337] transition-colors line-clamp-2">
          {actor.name}
        </h4>
        <p className="text-gray-500 text-[10px] font-medium leading-tight line-clamp-1">
          {actor.character}
        </p>
      </div>
    </div>
  );
};

export default React.memo(CastCard);
