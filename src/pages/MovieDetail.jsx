import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Calendar, Plus, Check, Film, AlertTriangle } from 'lucide-react';
import { useMovieDetails } from '../hooks/useMovieDetails.js';
import { useWatchlist } from '../contexts/WatchlistContext.jsx';
import { useAuth } from '../hooks/useAuth.jsx';

function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { movie, loading, error } = useMovieDetails(id);
  const { user } = useAuth();
  const watchlistContext = useWatchlist();
  
  const isInWatchlist = useMemo(() => 
    watchlistContext ? watchlistContext.isInWatchlist(id) : false, 
    [watchlistContext, id]
  );

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
    <div className="min-h-screen bg-black">
      {/* Mobile-first Hero Header */}
      <div className="relative w-full aspect-video md:aspect-[21/9] lg:h-[60vh]">
         <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        </div>
        
        <button
          onClick={() => navigate(-1)}
          className="absolute top-20 left-4 z-20 flex items-center justify-center p-3 rounded-full text-white bg-black/60 backdrop-blur-md border border-white/20 shadow-2xl transition-all duration-300 hover:bg-black/80 hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-black group"
          aria-label="Go back"
        >
          <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-20 md:-mt-32">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Poster - Hidden on very small screens, shown on md+ */}
          <div className="hidden md:block w-48 lg:w-64 flex-shrink-0">
            <MoviePoster poster={movie.poster} title={movie.title} />
          </div>

          {/* Mobile Poster (smaller, overlapping header) */}
          <div className="md:hidden w-32 -mt-12 mb-4 rounded-lg shadow-2xl ring-2 ring-black ml-1">
             <img src={movie.poster} alt={movie.title} className="w-full rounded-lg object-cover aspect-[2/3]" />
          </div>

          <div className="flex-1 space-y-4 md:space-y-6 pb-20 md:pb-12">
            <MovieDetailsHeader movie={movie} />
            
            <div className="flex items-center gap-3">
               <WatchlistButton inWatchlist={isInWatchlist} onClick={handleWatchlistClick} />
            </div>

            <MoviePlot plot={movie.plot} />
            <MovieDetailsGrid movie={movie} />
          </div>
        </div>
      </div>
    </div>
  );
}

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-black">
    <div className="w-full aspect-video bg-gray-900 animate-pulse" />
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="hidden md:block w-48 h-72 bg-gray-900 rounded-lg animate-pulse" />
        <div className="flex-1 space-y-4">
          <div className="h-8 bg-gray-900 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-gray-900 rounded w-1/2 animate-pulse" />
          <div className="h-24 bg-gray-900 rounded animate-pulse" />
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
