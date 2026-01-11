import React, { useState, useEffect } from "react";
import { ChevronDown, Star, Search, User, LogOut, Film, Menu, X, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.jsx";
import { useWatchlist } from "../../contexts/WatchlistContext.jsx";
import { useSearch } from "../../hooks/useSearch.js";
import { useDebounce } from 'use-debounce';

const NavItem = ({ to, children }) => (
  <Link to={to} className="text-gray-300 hover:text-white transition-colors">{children}</Link>
);

function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { count } = useWatchlist() || { count: 0 };
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  
  const { searchResults, loading, error, searchMovies, clearResults } = useSearch();

  useEffect(() => {
    if (debouncedQuery) {
      searchMovies(debouncedQuery);
    } else {
      clearResults();
    }
  }, [debouncedQuery]);

  const handleMovieClick = (movie) => {
    navigate(`/movie/${movie.id}`);
    setSearchQuery('');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-morphism">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-2xl font-bold text-white">myFlix</Link>
            <nav className="hidden md:flex items-center gap-6">
              <NavItem to="/">Home</NavItem>
              <NavItem to="/browse">Browse</NavItem>
              <NavItem to="/watchlist">Watchlist</NavItem>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-48 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-full text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              {searchQuery && (
                <SearchResultsDropdown
                  results={searchResults}
                  loading={loading}
                  error={error}
                  onMovieClick={handleMovieClick}
                />
              )}
            </div>

            {user ? (
              <UserMenu user={user} count={count} onLogout={handleLogout} />
            ) : (
              <AuthButtons />
            )}
            
            <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && <MobileMenu onLinkClick={() => setIsMenuOpen(false)} />}
    </header>
  );
}

const SearchResultsDropdown = ({ results, loading, error, onMovieClick }) => (
  <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto">
    {loading && <div className="p-4 text-center text-gray-400">Loading...</div>}
    {error && <div className="p-4 text-center text-red-400">{error}</div>}
    {!loading && !error && results.length === 0 && <div className="p-4 text-center text-gray-400">No results found.</div>}
    {results.map((movie) => (
      <button key={movie.id} onClick={() => onMovieClick(movie)} className="w-full p-3 flex items-center gap-3 hover:bg-gray-800 transition-colors text-left">
        <img src={movie.poster} alt={movie.title} className="w-10 h-14 object-cover rounded" />
        <div className="flex-1">
          <p className="text-white text-sm font-semibold">{movie.title}</p>
          <p className="text-gray-400 text-xs">{movie.year}</p>
        </div>
      </button>
    ))}
  </div>
);

const UserMenu = ({ user, count, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-menu')) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);
  
  return (
    <div className="relative hidden md:block user-menu">
      <button className="flex items-center gap-2" onClick={() => setIsOpen(!isOpen)}>
        <div className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center font-bold text-white">
          {user.name.charAt(0)}
        </div>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-gray-900 rounded-md shadow-lg border border-gray-700">
          <div className="p-2">
            <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded">
              <User size={16} /> Profile
            </Link>
            <Link to="/watchlist" onClick={() => setIsOpen(false)} className="flex items-center justify-between px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded">
              <div className="flex items-center gap-2"><Heart size={16} /> Watchlist</div>
              {count > 0 && <span className="bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{count}</span>}
            </Link>
            <button onClick={onLogout} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 rounded">
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AuthButtons = () => (
  <div className="hidden md:flex items-center gap-2">
    <Link to="/login" className="px-4 py-2 text-sm text-gray-300 hover:text-white">Sign In</Link>
    <Link to="/signup" className="px-4 py-2 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-md">Sign Up</Link>
  </div>
);

const MobileMenu = ({ onLinkClick }) => (
  <div className="md:hidden bg-gray-900/95 border-t border-gray-700">
    <nav className="flex flex-col gap-2 p-4">
      <Link to="/" onClick={onLinkClick} className="px-4 py-2 hover:bg-gray-800 rounded">Home</Link>
      <Link to="/browse" onClick={onLinkClick} className="px-4 py-2 hover:bg-gray-800 rounded">Browse</Link>
      <Link to="/watchlist" onClick={onLinkClick} className="px-4 py-2 hover:bg-gray-800 rounded">Watchlist</Link>
      <Link to="/profile" onClick={onLinkClick} className="px-4 py-2 hover:bg-gray-800 rounded">Profile</Link>
    </nav>
  </div>
);

export default Header;