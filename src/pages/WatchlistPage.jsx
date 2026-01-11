import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWatchlist } from '../contexts/WatchlistContext.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import MovieCard from '../components/ui/MovieCard';
import { Film } from 'lucide-react';

function WatchlistPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const watchlistContext = useWatchlist();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { watchlist = [] } = watchlistContext || {};

  const handleMovieClick = (movie) => {
    if (movie?.id) {
      navigate(`/movie/${movie.id}`);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">My Watchlist</h1>
          <p className="text-lg text-gray-400 mt-1">{watchlist.length} {watchlist.length === 1 ? 'item' : 'items'}</p>
        </header>
        
        {watchlist.length === 0 ? (
          <div className="text-center py-16">
            <Film size={64} className="mx-auto text-gray-600 mb-4" />
            <h2 className="text-2xl font-semibold text-white">Your Watchlist is Empty</h2>
            <p className="text-gray-400 mt-2">Add movies to your watchlist to see them here.</p>
            <button
              onClick={() => navigate('/browse')}
              className="mt-6 px-6 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 transition-colors"
            >
              Browse Movies
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {watchlist.map((movie) => (
              <MovieCard key={movie.id} movie={movie} onClick={handleMovieClick} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WatchlistPage;