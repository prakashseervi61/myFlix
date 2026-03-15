import React from 'react';
import { Clock, Calendar } from 'lucide-react';

const EpisodeCard = ({ episode }) => {
  // TVMaze episode payload structure assumes: 
  // name, number, runtime, airdate, image, summary
  
  const formattedAirDate = episode.airdate 
    ? new Date(episode.airdate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Unknown';

  const imageUrl = episode.image?.medium || null;

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-surface rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
      {/* Thumbnail */}
      <div className="w-full sm:w-48 aspect-[16/9] bg-background rounded-lg overflow-hidden shrink-0 relative">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={episode.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            loading="lazy" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white/20 bg-surface/50 font-bold text-xl">
            S{episode.season || 'X'}E{episode.number}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-primary font-bold text-sm tracking-widest uppercase">
            Episode {episode.number}
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-white mb-2 leading-tight truncate">
          {episode.name || `Episode ${episode.number}`}
        </h3>
        
        <div className="flex items-center gap-4 text-xs font-medium text-white/50 mb-3">
          {episode.runtime && (
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span>{episode.runtime}m</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Calendar size={14} />
            <span>{formattedAirDate}</span>
          </div>
        </div>

        {episode.summary && (
           <p 
             className="text-sm text-white/70 line-clamp-2 md:line-clamp-3 leading-relaxed"
             dangerouslySetInnerHTML={{ __html: episode.summary }} // TVMaze summaries contain p/b tags
           />
        )}
      </div>
    </div>
  );
};

export default React.memo(EpisodeCard);
