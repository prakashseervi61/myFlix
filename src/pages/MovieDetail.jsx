import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Calendar, Plus, Check, Film, AlertTriangle, Video } from 'lucide-react';
import { useMovieDetails } from '../hooks/useMovieDetails.js';
import { useMovieTrailers } from '../hooks/useMovieTrailers.js';
import { useWatchlist } from '../contexts/WatchlistContext.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import TrailerPlayer from '../components/ui/TrailerPlayer.jsx';
import ReviewSection from '../components/ReviewSection.jsx';
import DiscussionSection from '../components/DiscussionSection.jsx';
import CastSection from '../components/CastSection.jsx';
import GallerySection from '../components/GallerySection.jsx';

/**
 * Movie detail page with trailer, metadata, and watchlist actions.
 * Fetches full movie details and available trailers.
 */
function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { movie, loading, error } = useMovieDetails(id);
  const { trailers, loading: trailersLoading } = useMovieTrailers(id);
  const { user } = useAuth();
  const watchlistContext = useWatchlist();
  
  /** Memoized to avoid recalculation on every render */
  const isInWatchlist = useMemo(() => 
    watchlistContext ? watchlistContext.isInWatchlist(id) : false, 
    [watchlistContext, id]
  );

  /** Prioritizes official trailer, falls back to any YouTube video */
  const officialTrailer = useMemo(() => {
    if (!trailers || trailers.length === 0) return null;
    const official = trailers.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    const anyYoutube = trailers.find(v => v.site === 'YouTube');
    return official || anyYoutube || null;
  }, [trailers]);

  const handleWatchlistClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (movie && watchlistContext) {
      watchlistContext.toggleWatchlist(movie);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay error={error} navigate={navigate} />;
  if (!movie) return <ErrorDisplay error="Movie not found." navigate={navigate} />;

  const backdropUrl = movie.backdrop || movie.poster;

  return (
    <div className="min-h-screen bg-[#010d26] text-white selection:bg-[#C50337]/30">
      {/* 1. Movie Hero Section */}
      <div className="relative w-full h-[50vh] md:h-[70vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#010d26] via-[#010d26]/40 to-transparent" />
          <div className="absolute inset-0 bg-[#021C4F]/30 mix-blend-multiply" />
        </div>
        
        <button
          onClick={() => navigate(-1)}
          className="absolute top-20 left-4 md:left-8 z-30 flex items-center justify-center p-3 rounded-full text-white bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl transition-all duration-300 hover:bg-black/60 hover:scale-110 active:scale-90"
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      {/* Main Content Container */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 pb-32 relative z-10 -mt-32 md:-mt-64">
        
        {/* 2. Movie Info Section (Poster + Title + Metadata) */}
        <section className="flex flex-col md:flex-row gap-8 lg:gap-12 items-center md:items-start text-center md:text-left">
          <div className="w-48 lg:w-72 flex-shrink-0 shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden ring-1 ring-white/10 group transition-transform duration-500 hover:scale-[1.02]">
            <MoviePoster poster={movie.poster} title={movie.title} />
          </div>

          <div className="flex-1 space-y-8 pt-4 md:pt-28">
            <MovieDetailsHeader movie={movie} />
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
               <WatchlistButton inWatchlist={isInWatchlist} onClick={handleWatchlistClick} />
               <div className="flex items-center gap-6 text-sm font-bold text-gray-400 border-l border-white/10 pl-6 h-12">
                 <div className="flex items-center gap-2">
                   <Star size={20} className="text-[#C50337] fill-[#C50337]" /> 
                   <span className="text-white text-lg font-black italic">{movie.rating}</span>
                 </div>
                 <div className="opacity-30">|</div>
                 <div className="uppercase tracking-widest">{movie.year}</div>
               </div>
            </div>
            <MoviePlot plot={movie.plot} />
            <MovieDetailsGrid movie={movie} />
          </div>
        </section>

        <div className="mt-20 border-t border-white/5" />

        {/* 3. Trailer Section (Centered 16:9, max-width optimized) */}
        <section className="mt-20 max-w-[950px] mx-auto scroll-mt-24">
          <div className="flex items-center gap-3 mb-8">
            <Video className="text-[#C50337]" size={24} />
            <h2 className="text-2xl font-bold uppercase tracking-widest">Official Trailer</h2>
          </div>
          <div className="bg-gray-900 shadow-2xl rounded-2xl overflow-hidden ring-1 ring-white/10 aspect-video group">
            {trailersLoading ? (
              <div className="w-full h-full bg-gray-900 animate-pulse" />
            ) : (
              <TrailerPlayer 
                trailerKey={officialTrailer?.key}
                title={movie.title}
                posterUrl={backdropUrl}
                showControls={true}
              />
            )}
          </div>
        </section>

        <div className="mt-20 border-t border-white/5" />

        {/* 4. Cast Section */}
        <section className="mt-20">
          <CastSection cast={movie.cast} />
        </section>

        <div className="mt-20 border-t border-white/5" />

        {/* 5. Gallery Section */}
        <section className="mt-20">
          <GallerySection images={movie.images} />
        </section>

        <div className="mt-20 border-t border-white/5" />

        {/* 6. Community Section (Reviews / Discussions side by side) */}
        <section className="mt-20">
          <div className="community-section grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="min-w-0">
              <ReviewSection movieId={id} user={user} />
            </div>
            <div className="min-w-0">
              <DiscussionSection movieId={id} user={user} />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-[#0a0a0a]">
    <div className="w-full h-[50vh] bg-gray-900/50 animate-pulse" />
    <div className="max-w-[1300px] mx-auto px-4 md:px-8 -mt-32 relative z-10">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-48 lg:w-64 aspect-[2/3] bg-gray-900 rounded-2xl animate-pulse ring-1 ring-white/10" />
        <div className="flex-1 space-y-4 pt-10 md:pt-20">
          <div className="h-10 bg-gray-900 rounded-lg w-3/4 animate-pulse" />
          <div className="h-6 bg-gray-900 rounded-lg w-1/2 animate-pulse" />
          <div className="h-32 bg-gray-900 rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

const ErrorDisplay = ({ error, navigate }) => (
  <div className="min-h-screen bg-black flex items-center justify-center text-center px-4">
    <div className="glass-morphism p-6 md:p-8 rounded-xl max-w-md w-full border border-white/10">
      <AlertTriangle className="mx-auto text-red-500 mb-4" size={40} />
      <h1 className="text-xl md:text-2xl font-bold text-white mb-2">Movie Not Found</h1>
      <p className="text-gray-400 text-sm md:text-base mb-6">{typeof error === 'string' ? error : 'The requested movie could not be loaded.'}</p>
      <button
        onClick={() => navigate('/')}
        className="w-full px-6 py-3 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-500 transition-colors"
      >
        Back to Home
      </button>
    </div>
  </div>
);

const MoviePoster = ({ poster, title }) => (
  <div className="relative rounded-lg shadow-2xl ring-1 ring-white/10 overflow-hidden bg-gray-800">
    {poster ? (
      <img src={poster} alt={title} className="w-full aspect-[2/3] object-cover" />
    ) : (
      <div className="w-full aspect-[2/3] flex items-center justify-center">
        <Film className="text-gray-600" size={48} />
      </div>
    )}
  </div>
);

const MovieDetailsHeader = ({ movie }) => (
  <div>
    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-2">{movie.title}</h1>
    
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-400">
      {movie.year && <span className="flex items-center gap-1.5"><Calendar size={14} className="text-cyan-500" /> {movie.year}</span>}
      {movie.runtime && <span className="flex items-center gap-1.5"><Clock size={14} className="text-cyan-500" /> {movie.runtime}</span>}
      {movie.rating && <span className="flex items-center gap-1.5"><Star size={14} className="text-yellow-500 fill-yellow-500" /> {movie.rating}</span>}
    </div>
    
    {movie.genre && (
      <div className="mt-4 flex flex-wrap gap-2">
        {movie.genre.split(', ').map(g => (
          <span key={g} className="px-2.5 py-1 bg-gray-800 border border-gray-700 text-gray-300 rounded-md text-[10px] sm:text-xs font-medium uppercase tracking-wide">
            {g}
          </span>
        ))}
      </div>
    )}
  </div>
);

const WatchlistButton = ({ inWatchlist, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all w-full md:w-auto active:scale-95 ${
      inWatchlist
        ? 'bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-900/20'
        : 'bg-white text-black hover:bg-gray-200'
    }`}
  >
    {inWatchlist ? <Check size={18} strokeWidth={3} /> : <Plus size={18} strokeWidth={3} />}
    <span>{inWatchlist ? 'In Your List' : 'Add to List'}</span>
  </button>
);

const MoviePlot = ({ plot }) => plot && (
  <div className="bg-gray-900/50 p-4 rounded-xl border border-white/5">
    <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">Plot</h2>
    <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{plot}</p>
  </div>
);

const MovieDetailsGrid = ({ movie }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
    {movie.director && (
      <div className="bg-gray-900/30 p-3 rounded-lg border border-white/5">
        <h3 className="text-gray-500 text-xs uppercase tracking-wider mb-1">Director</h3>
        <p className="text-white font-medium">{movie.director}</p>
      </div>
    )}
    {movie.actors && (
      <div className="bg-gray-900/30 p-3 rounded-lg border border-white/5">
        <h3 className="text-gray-500 text-xs uppercase tracking-wider mb-1">Cast</h3>
        <p className="text-white font-medium">{movie.actors}</p>
      </div>
    )}
  </div>
);

export default MovieDetail;
