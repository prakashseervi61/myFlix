import { useWatchlist } from './useWatchlist';
import { useAuth } from './useAuth.jsx';
import { useNavigate } from 'react-router-dom';

export function useMovieCardLogic(movie) {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleWatchlistClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!movie?.id) return;
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    toggleWatchlist(movie);
  };

  const inWatchlist = movie?.id ? isInWatchlist(movie.id) : false;

  return {
    inWatchlist,
    handleWatchlistClick
  };
}