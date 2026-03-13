import React from 'react';
import { User } from 'lucide-react';

const CastCard = ({ actor }) => {
  return (
    <div className="flex-shrink-0 w-32 sm:w-40 group cursor-pointer">
      <div className="relative aspect-[1/1] overflow-hidden rounded-2xl mb-3 shadow-lg ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-cyan-500/20">
        {actor.profile_path ? (
          <img 
            src={actor.profile_path} 
            alt={actor.name} 
            className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-600">
            <User size={48} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="space-y-0.5 px-1">
        <h4 className="text-white font-bold text-sm sm:text-base truncate group-hover:text-cyan-400 transition-colors">
          {actor.name}
        </h4>
        <p className="text-gray-400 text-xs sm:text-sm truncate h-5">
          {actor.character}
        </p>
      </div>
    </div>
  );
};

export default React.memo(CastCard);
