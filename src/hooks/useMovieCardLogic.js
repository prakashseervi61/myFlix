import { useWatchlist } from '../contexts/WatchlistContext.jsx';
import { useAuth } from './useAuth.jsx';
import { useNavigate } from 'react-router-dom';
import { usePreviewModal } from '../contexts/PreviewModalContext.jsx';

/**
 * Centralized movie card interaction logic.
 * Handles watchlist toggle with auth check and preview modal.
 * @param {Object} movie - Movie object with id
 * @returns {Object} { isMovieInWatchlist, handleToggleWatchlist, handleOpenPreview }
 */
export function useMovieCardLogic(movie) {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { openModal } = usePreviewModal();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  /** Redirects to login if not authenticated, otherwise toggles watchlist */
  const handleToggleWatchlist = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!movie?.id) return;
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    toggleWatchlist(movie);
  };

  const handleOpenPreview = (e) => {
    e.stopPropagation();
    e.preventDefault();
    openModal(movie);
  };

  const isMovieInWatchlist = movie?.id ? isInWatchlist(movie.id) : false;

  return {
    isMovieInWatchlist,
    handleToggleWatchlist,
    handleOpenPreview,
  };
}