import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Trailer player component with YouTube embed.
 * Falls back to poster image when no trailer available.
 */
const TrailerPlayer = ({ trailerKey, title, posterUrl, showControls = false }) => {
  if (!trailerKey) {
    return (
      <div className="relative w-full aspect-video bg-black flex items-center justify-center">
        <img 
          src={posterUrl} 
          alt={title}
          className="w-full h-full object-cover opacity-30"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute flex flex-col items-center gap-2 text-gray-400">
          <AlertTriangle size={32} />
          <p className="font-medium text-lg">No Trailer Available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black overflow-hidden">
      <iframe
        className="absolute top-0 left-0 w-full h-full"
        src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=${showControls ? 1 : 0}&modestbranding=1&rel=0&loop=1&playlist=${trailerKey}`}
        title={`Trailer for ${title}`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default React.memo(TrailerPlayer);
