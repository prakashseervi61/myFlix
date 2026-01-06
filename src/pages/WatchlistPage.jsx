import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWatchlist } from '../contexts/WatchlistContext.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import MovieCard from '../components/ui/MovieCard';

function WatchlistPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Scroll to top when page loads
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Show loading while auth is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black pt-20 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // Redirect if not authenticated after loading is complete
  if (!user) {
    React.useEffect(() => {
      navigate('/login');
    }, [navigate]);
    return null;
  }

  return <WatchlistContent />;
}

function WatchlistContent() {
  const navigate = useNavigate();
  const { watchlist } = useWatchlist();

  const handleMovieClick = (movie) => {
    if (!movie?.id) return;
    navigate(`/movie/${movie.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8">My Watchlist</h1>
        
        {!watchlist || watchlist.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📺</div>
            <h2 className="text-2xl font-bold text-white mb-4">Your watchlist is empty</h2>
            <p className="text-gray-400 mb-8">Start adding movies you want to watch later</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-[#ff6f61] text-white rounded-lg hover:bg-[#ff523d] transition-colors"
            >
              Browse Movies
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {watchlist && watchlist.map((movie) => (
              <MovieCard key={movie.id} movie={movie} onClick={handleMovieClick} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WatchlistPage;