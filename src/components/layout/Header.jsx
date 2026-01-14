import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Star, Search, User, LogOut, Film, Menu, X, Heart, Check } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.jsx";
import { useWatchlist } from "../../contexts/WatchlistContext.jsx";
import { useSearch } from "../../hooks/useSearch.js";
import { useDebounce } from 'use-debounce';

const NavItem = ({ to, children }) => (
  <Link 
    to={to} 
    className="relative px-2 py-1 text-sm font-medium text-gray-300 hover:text-white transition-colors group"
  >
    {children}
    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
  </Link>
);

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const watchlistContext = useWatchlist();
  const count = watchlistContext?.count || 0;
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  
  const { searchResults, loading, error, searchMovies, clearResults } = useSearch();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (debouncedQuery) {
      searchMovies(debouncedQuery);
    } else {
      clearResults();
    }
  }, [debouncedQuery]);

  useEffect(() => {
    setIsMenuOpen(false);
    setSearchExpanded(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const handleMovieClick = (movie) => {
    navigate(`/movie/${movie.id}`);
    setSearchQuery('');
    setSearchExpanded(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled || isMenuOpen ? 'bg-gray-900/98 backdrop-blur-md shadow-md border-b border-white/5' : 'bg-transparent bg-gradient-to-b from-black/80 to-transparent'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-20">
            
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2 group shrink-0">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
                  <Film className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <span className="text-lg md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 tracking-tight">
                  myFlix
                </span>
              </Link>

              <nav className="hidden md:flex items-center gap-6">
                <NavItem to="/">Home</NavItem>
                <NavItem to="/browse">Browse</NavItem>
                <NavItem to="/watchlist">Watchlist</NavItem>
              </nav>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end">
              <div className={`relative transition-all duration-300 ${searchExpanded ? 'absolute inset-x-0 top-0 h-16 z-50 px-4 flex items-center md:relative md:w-64 md:h-auto md:bg-transparent md:px-0' : ''}`}>
                
                {searchExpanded ? (
                  <div className="flex items-center w-full gap-4 md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex-1 flex items-center bg-transparent border-b border-gray-700 py-2 focus-within:border-cyan-500 transition-all">
                      <Search className="w-5 h-5 text-gray-500 shrink-0 mr-3" />
                      <input
                        type="search"
                        placeholder="Search movies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                        className="flex-1 bg-transparent border-none text-lg text-white placeholder-gray-600 focus:outline-none focus:ring-0 p-0 h-8 leading-8 w-full font-medium"
                      />
                      {searchQuery && (
                         <button 
                           onClick={() => setSearchQuery('')}
                           className="ml-2 p-1 text-gray-500 hover:text-white transition-colors"
                         >
                           <X size={18} />
                         </button>
                      )}
                    </div>
                    <button 
                      onClick={() => setSearchExpanded(false)}
                      className="p-1.5 text-gray-400 hover:text-white active:scale-90 transition-all"
                      aria-label="Close search"
                    >
                      <X size={26} strokeWidth={1.5} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setSearchExpanded(true)}
                    className="p-2 text-gray-300 hover:text-white md:hidden"
                    aria-label="Search"
                  >
                    <Search size={20} />
                  </button>
                )}

                {/* Desktop Input - Persistent */}
                <div className="hidden md:block w-64 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="search"
                    placeholder="Search movies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchExpanded(true)}
                    onBlur={(e) => {
                      if (!e.relatedTarget?.closest('.search-results')) {
                         setTimeout(() => setSearchExpanded(false), 200);
                      }
                    }}
                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:bg-gray-800 transition-all"
                  />
                </div>

                {searchExpanded && searchQuery && (
                  <SearchResultsDropdown
                    results={searchResults}
                    loading={loading}
                    error={error}
                    onMovieClick={handleMovieClick}
                    isInWatchlist={watchlistContext?.isInWatchlist}
                  />
                )}
              </div>

              {!searchExpanded && (
                <>
                  {user ? (
                    <UserMenu user={user} count={count} onLogout={handleLogout} />
                  ) : (
                    <div className="flex items-center gap-2">
                       <Link to="/login" className="px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white transition-colors md:text-sm">Sign In</Link>
                       <Link to="/signup" className="px-3 py-1.5 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-full md:px-5 md:py-2 md:text-sm shadow-md">Sign Up</Link>
                    </div>
                  )}
                  
                  <button 
                    className="md:hidden p-1.5 text-gray-300 hover:text-white"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                  >
                    {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay - Portalled to body to escape Header stacking context */}
      {createPortal(
        <div 
          className={`md:hidden fixed inset-0 z-[100] bg-gray-950 transition-transform duration-300 ease-in-out ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ top: '56px' }}
        >
          <nav className="flex flex-col p-6 space-y-4 h-full overflow-y-auto">
            <Link to="/" className="text-lg font-semibold text-white py-4 border-b border-gray-800 flex items-center justify-between" onClick={() => setIsMenuOpen(false)}>
              Home
              <ChevronDown size={18} className="-rotate-90 text-gray-500" />
            </Link>
            <Link to="/browse" className="text-lg font-semibold text-white py-4 border-b border-gray-800 flex items-center justify-between" onClick={() => setIsMenuOpen(false)}>
              Browse Movies
              <ChevronDown size={18} className="-rotate-90 text-gray-500" />
            </Link>
            <Link to="/watchlist" className="text-lg font-semibold text-white py-4 border-b border-gray-800 flex items-center justify-between" onClick={() => setIsMenuOpen(false)}>
              <div className="flex items-center gap-3">
                Watchlist
                {count > 0 && <span className="bg-cyan-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{count}</span>}
              </div>
              <ChevronDown size={18} className="-rotate-90 text-gray-500" />
            </Link>
            
            <div className="flex-1" />
            
            {user ? (
              <div className="mt-auto space-y-4 pb-8">
                <div className="flex items-center gap-4 p-4 bg-gray-900 rounded-2xl border border-gray-800">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center font-bold text-white text-xl">
                    {user.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-white font-bold text-base truncate">{user.name}</p>
                    <p className="text-gray-400 text-sm truncate">{user.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Link to="/profile" className="w-full py-4 text-center text-white bg-gray-900 hover:bg-gray-800 rounded-xl font-semibold border border-gray-800 transition-colors" onClick={() => setIsMenuOpen(false)}>Profile Settings</Link>
                  <button onClick={() => { setIsMenuOpen(false); handleLogout(); }} className="w-full py-4 text-center text-red-400 bg-red-500/5 hover:bg-red-500/10 rounded-xl font-semibold border border-red-500/20 transition-colors">Sign Out</button>
                </div>
              </div>
            ) : (
              <div className="mt-auto grid grid-cols-1 gap-3 pb-8">
                <Link to="/login" className="py-4 text-center text-white bg-gray-900 rounded-xl font-bold border border-gray-800" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                <Link to="/signup" className="py-4 text-center text-white bg-cyan-600 rounded-xl font-bold shadow-lg shadow-cyan-900/20" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
              </div>
            )}
          </nav>
        </div>,
        document.body
      )}
    </>
  );
}

const SearchResultsDropdown = ({ results, loading, error, onMovieClick, isInWatchlist }) => (
  <div className="search-results absolute top-full left-0 right-0 mt-1 md:mt-2 bg-gray-900 border-b border-x border-gray-800 md:border md:border-gray-700 rounded-b-2xl md:rounded-xl shadow-2xl overflow-hidden max-h-[75vh] md:max-h-[60vh] overflow-y-auto z-50 scrollbar-thin scrollbar-thumb-gray-800">
    {loading && (
      <div className="p-4 flex items-center justify-center gap-2 text-gray-400">
        <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Searching...</span>
      </div>
    )}
    {error && <div className="p-4 text-center text-red-400 text-sm bg-red-500/5">{error}</div>}
    {!loading && !error && results.length === 0 && <div className="p-6 text-center text-gray-500 text-sm">No movies found.</div>}
    
    <div className="divide-y divide-gray-800/50">
      {results.map((movie) => {
        const inList = isInWatchlist ? isInWatchlist(movie.id) : false;
        return (
          <button 
            key={movie.id} 
            onClick={() => onMovieClick(movie)} 
            className="w-full p-3 flex items-start gap-4 hover:bg-gray-800/50 transition-colors text-left group focus:outline-none focus:bg-gray-800"
          >
            <div className="relative w-10 h-14 bg-gray-800 rounded-md overflow-hidden shrink-0 shadow-sm">
               <img src={movie.poster} alt="" className="w-full h-full object-cover" />
               {inList && (
                 <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[1px]">
                   <Check size={14} className="text-green-500 font-bold" />
                 </div>
               )}
            </div>
            <div className="flex-1 min-w-0 py-0.5">
              <p className={`text-sm font-semibold truncate group-hover:text-cyan-400 transition-colors ${inList ? 'text-green-400' : 'text-gray-200'}`}>
                {movie.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-gray-500 text-xs">{movie.year || 'N/A'}</span>
                {inList && <span className="text-[10px] text-green-400 font-bold border border-green-500/20 px-1.5 py-0.5 rounded bg-green-500/5 uppercase tracking-wide">Added</span>}
                {movie.rating && <span className="text-[10px] text-yellow-500 flex items-center gap-0.5 font-medium"><Star size={10} fill="currentColor" /> {movie.rating}</span>}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

const UserMenu = ({ user, count, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = React.useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div className="relative hidden md:block" ref={menuRef}>
      <button 
        className="flex items-center gap-2 group p-0.5 rounded-full hover:bg-gray-800 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center font-bold text-white text-sm ring-2 ring-transparent group-hover:ring-gray-700 transition-all">
          {user.name.charAt(0)}
        </div>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-3 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-3 border-b border-gray-800 bg-gray-800/30">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
          <div className="p-1">
            <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg">
              <User size={16} /> Profile
            </Link>
            <Link to="/watchlist" onClick={() => setIsOpen(false)} className="flex items-center justify-between px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg">
              <div className="flex items-center gap-3"><Heart size={16} /> Watchlist</div>
              {count > 0 && <span className="bg-gray-800 text-cyan-400 text-xs font-bold px-2 py-0.5 rounded-full border border-gray-700">{count}</span>}
            </Link>
            <div className="h-px bg-gray-800 my-1 mx-2" />
            <button onClick={onLogout} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg">
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;