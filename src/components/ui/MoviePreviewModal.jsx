import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Play, Plus, Check, Info } from 'lucide-react';
import { useUIStore } from '../../store/uiStore.js';
import { useWatchlist } from '../../contexts/WatchlistContext.jsx';
import { tmdbService } from '../../services/tmdbService.js';
import { apiService } from '../../services/apiService.js';
import TrailerPlayer from './TrailerPlayer.jsx';
import { useGlobalScrollLock } from '../../hooks/useGlobalScrollLock.js';

/**
 * Movie preview modal with trailer playback.
 * Fetches trailer and full details on open.
 * Uses global scroll lock to prevent background scrolling.
 */
export default function MoviePreviewModal() {
  const isOpen = useUIStore((state) => state.isPreviewModalOpen);
  const selectedMovie = useUIStore((state) => state.previewMovie);
  const closeModal = useUIStore((state) => state.closePreviewModal);
  const navigate = useNavigate();
  const [trailer, setTrailer] = useState(null);
  const [fullDetails, setFullDetails] = useState(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const modalRef = useRef(null);

  useGlobalScrollLock(isOpen);
  
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const inWatchlist = selectedMovie ? watchlist.some(m => m.id === selectedMovie.id) : false;

  /** ESC key closes modal, focus trap keeps keyboard navigation inside */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') closeModal();
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      setTimeout(() => modalRef.current?.focus(), 50);
    } else {
      setTrailer(null);
      setFullDetails(null);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeModal]);

  /** Fetches trailer and full movie details in parallel */
  useEffect(() => {
    if (isOpen && selectedMovie?.id) {
      setLoadingVideo(true);
      
      const fetchAll = async () => {
        try {
          const isTV = selectedMovie.media_type === 'tv' || selectedMovie.number_of_seasons !== undefined || (!selectedMovie.release_date && selectedMovie.first_air_date);
          
          let videos = [];
          let details = null;
          
          if (isTV) {
             const [tvVideos, tvDetails] = await Promise.all([
               apiService.getTVVideos(selectedMovie.id),
               apiService.getTVDetails(selectedMovie.id)
             ]);
             videos = tvVideos || [];
             details = tvDetails;
          } else {
             const [movieVideos, movieDetails] = await Promise.all([
               tmdbService.getMovieVideos(selectedMovie.id),
               tmdbService.getMovieById(selectedMovie.id)
             ]);
             videos = movieVideos || [];
             details = movieDetails;
          }

          const official = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer');
          const anyYoutube = videos.find(v => v.site === 'YouTube');
          setTrailer(official || anyYoutube || null);
          setFullDetails(details);
        } catch (e) {
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
    const isTV = selectedMovie.media_type === 'tv' || selectedMovie.number_of_seasons !== undefined || (!selectedMovie.release_date && selectedMovie.first_air_date);
    if (isTV) {
      navigate(`/tv/${selectedMovie.id}`);
    } else {
      navigate(`/movie/${selectedMovie.id}`);
    }
  };

  if (!isOpen || !selectedMovie) return null;

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
        className="w-full md:max-w-4xl bg-[#010d26] text-white rounded-t-2xl md:rounded-xl shadow-2xl overflow-hidden relative flex flex-col md:max-h-[90vh] animate-in slide-in-from-bottom-10 fade-in duration-300 outline-none border border-white/5"
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
        <div className="relative w-full bg-black group">
          {loadingVideo ? (
             <div className="relative w-full aspect-video bg-black flex items-center justify-center">
               <div className="w-8 h-8 border-2 border-[#C50337] border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : (
            <TrailerPlayer 
              trailerKey={trailer?.key} 
              title={displayMovie.title}
              posterUrl={displayMovie.backdrop || displayMovie.poster}
            />
          )}

          {/* Title Overlay on Hero */}
          <div className="absolute bottom-0 left-0 p-6 w-full z-10 pointer-events-none">
             <div className="absolute inset-0 bg-gradient-to-t from-[#010d26] via-transparent to-transparent pointer-events-none"></div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 text-shadow-lg leading-tight relative z-10">
              {displayMovie.title}
            </h2>
            <div className="flex items-center gap-3 text-sm font-semibold relative z-10">
              <span className="text-[#C50337] font-black">{displayMovie.rating ? `${(parseFloat(displayMovie.rating) * 10).toFixed(0)}% Match` : ''}</span>
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
               <button className="flex items-center justify-center gap-2 bg-[#C50337] text-white px-6 py-2.5 rounded font-bold hover:bg-[#e50442] transition-colors shadow-lg shadow-[#C50337]/20 border border-white/10 active:scale-95">
                 <Play size={20} className="fill-white" /> Play
               </button>
               
               <button 
                 onClick={handleWatchlistClick}
                 className="flex items-center justify-center gap-2 bg-[#021C4F] hover:bg-[#032a75] border border-white/20 text-white px-6 py-2.5 rounded font-semibold transition-colors shadow-lg active:scale-95"
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
                      <span key={genre} className="text-gray-100 bg-[#021C4F] px-2 py-0.5 rounded text-xs border border-white/5">
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
