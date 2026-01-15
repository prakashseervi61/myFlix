import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Play, Plus, Check, Info, Volume2, VolumeX } from 'lucide-react';
import { usePreviewModal } from '../../contexts/PreviewModalContext.jsx';
import { useWatchlist } from '../../contexts/WatchlistContext.jsx';
import { tmdbService } from '../../services/tmdbService.js';

export default function MoviePreviewModal() {
  const { isOpen, selectedMovie, closeModal } = usePreviewModal();
  const navigate = useNavigate();
  const [trailer, setTrailer] = useState(null);
  const [fullDetails, setFullDetails] = useState(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const modalRef = useRef(null);
  
  // Watchlist logic
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const inWatchlist = selectedMovie ? watchlist.some(m => m.id === selectedMovie.id) : false;

  // Handle ESC key and Focus Trap
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') closeModal();
    };
    
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      setTimeout(() => modalRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
      setTrailer(null);
      setFullDetails(null);
      setIsMuted(true);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeModal]);

  // Fetch Trailer & Details
  useEffect(() => {
    if (isOpen && selectedMovie?.id) {
      setLoadingVideo(true);
      
      const fetchAll = async () => {
        try {
          const [videos, details] = await Promise.all([
             tmdbService.getMovieVideos(selectedMovie.id),
             tmdbService.getMovieById(selectedMovie.id)
          ]);

          // Prioritize Youtube Trailers
          const official = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer');
          const anyYoutube = videos.find(v => v.site === 'YouTube');
          setTrailer(official || anyYoutube || null);
          setFullDetails(details);
        } catch (e) {
          // Fallback
        } finally {
          setLoadingVideo(false);
        }
      };
      
      fetchAll();
    }
  }, [isOpen, selectedMovie]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) closeModal();
  };

  const handleWatchlistClick = (e) => {
    e.stopPropagation();
    if (inWatchlist) {
      removeFromWatchlist(selectedMovie.id);
    }
    else {
      addToWatchlist(selectedMovie);
    }
  };

  const handleDetailsClick = () => {
    closeModal();
    navigate(`/movie/${selectedMovie.id}`);
  };

  if (!isOpen || !selectedMovie) return null;

  // Use fullDetails if available, otherwise fallback to selectedMovie (which has basics)
  const displayMovie = fullDetails || selectedMovie;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4 transition-opacity duration-300"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div 
        ref={modalRef}
        tabIndex={-1}
        className="w-full md:max-w-4xl bg-[#141414] text-white rounded-t-2xl md:rounded-xl shadow-2xl overflow-hidden relative flex flex-col md:max-h-[90vh] animate-in slide-in-from-bottom-10 fade-in duration-300 outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={closeModal}
          className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {/* Hero / Video Section */}
        <div className="relative aspect-video w-full bg-black group">
          {loadingVideo ? (
             <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : trailer ? (
            <div className="absolute inset-0 w-full h-full">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&modestbranding=1&rel=0&loop=1&playlist=${trailer.key}`}
                title={displayMovie.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
               <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent pointer-events-none"></div>
               
               {/* Mute Toggle */}
               <button 
                 onClick={() => setIsMuted(!isMuted)}
                 className="absolute bottom-4 right-4 z-20 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white border border-white/20 hidden md:block"
               >
                 {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
               </button>
            </div>
          ) : (
             <>
               <img 
                 src={displayMovie.backdrop || displayMovie.poster} 
                 alt={displayMovie.title}
                 className="w-full h-full object-cover opacity-60"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                 <p className="text-gray-400 font-medium">No trailer available</p>
               </div>
             </>
          )}

          {/* Title Overlay on Hero */}
          <div className="absolute bottom-0 left-0 p-6 w-full z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 text-shadow-lg leading-tight">
              {displayMovie.title}
            </h2>
            <div className="flex items-center gap-3 text-sm font-semibold">
              <span className="text-green-400">{displayMovie.rating ? `${(parseFloat(displayMovie.rating) * 10).toFixed(0)}% Match` : ''}</span>
              <span className="text-gray-300">{displayMovie.year}</span>
              {displayMovie.runtime && (
                 <span className="text-gray-400">{displayMovie.runtime} min</span>
              )}
              {displayMovie.original_language && (
                 <span className="border border-gray-500 px-1 text-[10px] uppercase rounded text-gray-300">
                   {displayMovie.original_language}
                 </span>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 grid md:grid-cols-[2fr_1fr] gap-6 md:gap-8 overflow-y-auto">
          {/* Left Column: Actions & Overview */}
          <div className="space-y-6">
             <div className="flex flex-wrap items-center gap-3">
               <button className="flex items-center justify-center gap-2 bg-white text-black px-6 py-2.5 rounded font-bold hover:bg-gray-200 transition-colors">
                 <Play size={20} className="fill-black" /> Play
               </button>
               
               <button 
                 onClick={handleWatchlistClick}
                 className="flex items-center justify-center gap-2 bg-gray-600/60 hover:bg-gray-600/80 border border-white/20 text-white px-6 py-2.5 rounded font-semibold transition-colors"
               >
                 {inWatchlist ? <Check size={20} /> : <Plus size={20} />} 
                 {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
               </button>

               <button 
                 onClick={handleDetailsClick}
                 className="flex items-center justify-center w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2.5 rounded-full md:rounded border border-gray-500 text-gray-300 hover:border-white hover:text-white transition-colors"
                 title="More Info"
               >
                 <Info size={20} /> <span className="hidden md:inline ml-2">More Info</span>
               </button>
             </div>

             <div className="text-gray-300 text-sm md:text-base leading-relaxed">
               {displayMovie.plot || 'No overview available for this movie.'}
             </div>
          </div>

          {/* Right Column: Meta Details */}
          <div className="space-y-4 text-sm text-gray-400">
             <div>
               <span className="block text-gray-500 mb-1">Genres:</span>
               <div className="flex flex-wrap gap-2">
                 {displayMovie.genres?.length > 0 ? (
                    displayMovie.genres.map(genre => (
                      <span key={genre} className="text-gray-300 bg-gray-800 px-2 py-0.5 rounded text-xs border border-gray-700">
                        {genre}
                      </span>
                    ))
                 ) : (
                    <span className="text-gray-500 italic">N/A</span>
                 )}
               </div>
             </div>
             
             <div>
               <span className="block text-gray-500 mb-1">Original Title:</span>
               <span className="text-white">{displayMovie.title}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
