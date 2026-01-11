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

  return (
    <div className="min-h-screen bg-black pt-16 md:pt-24">
      <div 
        className="absolute top-0 left-0 w-full h-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url(${movie.backdrop})`, maskImage: 'linear-gradient(to bottom, black, transparent)' }}
      />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-0 left-4 text-white bg-black/50 p-2 rounded-full hover:bg-black/80 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12">
          <div className="md:col-span-1 lg:col-span-1">
            <MoviePoster poster={movie.poster} title={movie.title} />
          </div>

          <div className="md:col-span-2 lg:col-span-3 space-y-6">
            <MovieDetailsHeader movie={movie} />
            <WatchlistButton inWatchlist={isInWatchlist} onClick={handleWatchlistClick} />
            <MoviePlot plot={movie.plot} />
            <MovieDetailsGrid movie={movie} />
          </div>
        </div>
      </div>
    </div>
  );
}

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-black pt-24">
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        <div className="md:col-span-1 lg:col-span-1">
          <div className="aspect-[2/3] bg-gray-800 rounded-lg"></div>
        </div>
        <div className="md:col-span-2 lg:col-span-3 space-y-6">
          <div className="h-10 bg-gray-800 rounded w-3/4"></div>
          <div className="h-6 bg-gray-800 rounded w-1/2"></div>
          <div className="h-24 bg-gray-800 rounded"></div>
          <div className="h-12 bg-gray-800 rounded-lg w-40"></div>
        </div>
      </div>
    </div>
  </div>
);

const ErrorDisplay = ({ error, navigate }) => (
  <div className="min-h-screen bg-black flex items-center justify-center text-center px-4">
    <div className="glass-morphism p-8 rounded-xl max-w-md">
      <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
      <h1 className="text-2xl font-bold text-white mb-2">Movie Not Found</h1>
      <p className="text-gray-400 mb-6">{typeof error === 'string' ? error : 'The requested movie could not be loaded.'}</p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-2 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 transition-colors"
      >
        Back to Home
      </button>
    </div>
  </div>
);

const MoviePoster = ({ poster, title }) => (
  <div className="sticky top-24">
    {poster ? (
      <img src={poster} alt={title} className="w-full aspect-[2/3] object-cover rounded-lg shadow-lg" />
    ) : (
      <div className="w-full aspect-[2/3] bg-gray-800 rounded-lg flex items-center justify-center">
        <Film className="text-gray-500" size={64} />
      </div>
    )}
  </div>
);

const MovieDetailsHeader = ({ movie }) => (
  <div>
    <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">{movie.title}</h1>
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-gray-400">
      {movie.year && <span className="flex items-center gap-1"><Calendar size={14} /> {movie.year}</span>}
      {movie.runtime && <span className="flex items-center gap-1"><Clock size={14} /> {movie.runtime}</span>}
      {movie.rating && <span className="flex items-center gap-1"><Star size={14} className="text-yellow-400" /> {movie.rating}/10</span>}
    </div>
    {movie.genre && <div className="mt-4 flex flex-wrap gap-2">{movie.genre.split(', ').map(g => <span key={g} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs">{g}</span>)}</div>}
  </div>
);

const WatchlistButton = ({ inWatchlist, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-3 rounded-lg font-semibold transition-all w-full sm:w-auto ${
      inWatchlist
        ? 'bg-green-600 text-white hover:bg-green-700'
        : 'bg-white/10 text-white hover:bg-white/20'
    }`}
  >
    {inWatchlist ? <Check size={20} /> : <Plus size={20} />}
    <span>{inWatchlist ? 'In My List' : 'Add to List'}</span>
  </button>
);

const MoviePlot = ({ plot }) => plot && (
  <div>
    <h2 className="text-xl font-bold text-white mb-2">Plot</h2>
    <p className="text-gray-300 leading-relaxed">{plot}</p>
  </div>
);

const MovieDetailsGrid = ({ movie }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-4 border-t border-gray-800">
    {movie.director && <div><h3 className="font-semibold text-white">Director</h3><p className="text-gray-400">{movie.director}</p></div>}
    {movie.actors && <div><h3 className="font-semibold text-white">Cast</h3><p className="text-gray-400">{movie.actors}</p></div>}
  </div>
);

export default MovieDetail;