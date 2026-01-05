import { useWatchlist } from './useWatchlist';

export function useMovieCardLogic(movie) {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  
  const handleWatchlistClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!movie?.id) return;
    toggleWatchlist(movie);
  };

  const inWatchlist = movie?.id ? isInWatchlist(movie.id) : false;

  return {
    inWatchlist,
    handleWatchlistClick
  };
}