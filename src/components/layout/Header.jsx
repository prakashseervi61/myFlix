import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Star, Search, User, LogOut, Film, Menu, X, Heart, Check } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.jsx";
import { useWatchlist } from "../../contexts/WatchlistContext.jsx";
import { useSearch } from "../../hooks/useSearch.js";
import { useDebounce } from 'use-debounce';
import { useGlobalScrollLock } from "../../hooks/useGlobalScrollLock.js";

const NavItem = React.memo(({ to, children }) => (
  <Link 
    to={to} 
    className="relative px-3 py-2 text-sm font-semibold text-white/90 hover:text-[#C1372C] transition-all duration-300 group focus-visible:outline-none focus-visible:text-[#C1372C] hover:-translate-y-[1px]"
  >
    {children}
    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-[#C1372C] transition-all duration-300 group-hover:w-full rounded-full" />
  </Link>
));

export default function Header() {
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
  const sentinelRef = useRef(null);

  useGlobalScrollLock(isMenuOpen || searchExpanded);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsScrolled(!entry.isIntersecting);
    }, { rootMargin: '10px 0px 0px 0px', threshold: 0 });

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (debouncedQuery) {
      searchMovies(debouncedQuery);
    } else {
      clearResults();
    }
  }, [debouncedQuery, searchMovies, clearResults]);

  useEffect(() => {
    setIsMenuOpen(false);
    setSearchExpanded(false);
  }, [location.pathname]);

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
      <div ref={sentinelRef} className="absolute top-0 w-full h-1 pointer-events-none opacity-0 z-0" aria-hidden="true" />
      <header 
        className={`fixed top-0 left-0 right-0 z-[1000] h-[70px] transition-all duration-500 border-b border-white/5 ${
          isScrolled ? 'bg-[#20151A] md:bg-[#20151A]/95 md:backdrop-blur-[10px] shadow-2xl' : 'bg-transparent'
        }`}
      >
        <div className="h-full px-6 md:px-10 lg:px-12">
          <div className="flex items-center h-full max-w-[1920px] mx-auto">
            
            {/* 1. Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0 mr-12 focus-visible:outline-none group active:scale-95 transition-transform" aria-label="MYFLIX Home">
              <span className="text-2xl font-black text-white px-2 py-1 tracking-[0.1em] uppercase">
                MY<span className="text-[#C1372C] transition-colors group-hover:text-white">FLIX</span>
              </span>
            </Link>

            {/* 2. Navigation Links */}
            <nav className="hidden lg:flex items-center gap-4 xl:gap-8" aria-label="Main Navigation">
              <NavItem to="/">Home</NavItem>
              <NavItem to="/browse">Movies</NavItem>
              <NavItem to="/watchlist">Watchlist</NavItem>
            </nav>

            {/* 3. Right Section: Search + Profile */}
            <div className="flex items-center gap-6 flex-1 justify-end">
              
              {/* Search Bar Container */}
              <div 
                className={`relative transition-all duration-500 ease-out ${
                  searchExpanded 
                    ? 'w-full max-w-md' 
                    : 'w-10 md:w-48 lg:w-64'
                }`}
                role="search"
              >
                
                {/* Expanded Search View (Mobile Overlay) */}
                {searchExpanded && (
                  <div className="absolute inset-0 z-[60] bg-[#20151A] flex items-center px-4 -mx-4 md:hidden animate-in fade-in slide-in-from-right-10 duration-300">
                    <div className="flex-1 flex items-center h-11 bg-[#5E4A65] rounded-full border border-white/10 focus-within:border-[#C1372C] transition-all px-4">
                      <Search className="w-5 h-5 text-white/40" />
                      <input
                        type="search"
                        placeholder="Title, genre, people..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                        className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none p-2"
                        onBlur={() => !searchQuery && setSearchExpanded(false)}
                      />
                    </div>
                    <button 
                      onClick={() => { setSearchExpanded(false); setSearchQuery(''); }}
                      className="ml-4 text-sm font-bold text-white hover:text-[#C1372C] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Desktop Search Bar */}
                <div className="hidden md:block group relative">
                  <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${searchExpanded ? 'text-[#C1372C]' : 'text-white/40'}`} />
                  <input
                    type="search"
                    placeholder="Quick search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchExpanded(true)}
                    onBlur={(e) => {
                      if (!e.relatedTarget?.closest('.search-results')) {
                         setTimeout(() => setSearchExpanded(false), 200);
                      }
                    }}
                    className={`w-full bg-[#5E4A65] border transition-all duration-300 rounded-[20px] pl-11 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none h-11 ${
                      searchExpanded ? 'border-[#C1372C] shadow-[0_0_15px_rgba(193,55,44,0.3)] ring-1 ring-[#C1372C]' : 'border-white/10 hover:border-white/20'
                    }`}
                  />
                </div>

                {!searchExpanded && (
                  <button 
                    onClick={() => setSearchExpanded(true)}
                    className="p-2 text-white/60 hover:text-white md:hidden transition-colors"
                  >
                    <Search size={20} />
                  </button>
                )}

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

              <div className="flex items-center ml-2">
                <div className={`flex items-center gap-4 transition-all duration-300 ${searchExpanded ? 'opacity-0 md:opacity-100 scale-95 md:scale-100 pointer-events-none md:pointer-events-auto' : 'opacity-100 scale-100'}`}>
                  {user ? (
                    <UserMenu user={user} count={count} onLogout={handleLogout} />
                  ) : (
                    <div className="flex items-center gap-4">
                       <Link to="/login" className="px-4 py-2 text-sm font-bold text-white hover:text-[#C1372C] transition-colors focus-visible:outline-none">Sign In</Link>
                       <Link to="/signup" className="px-6 py-2.5 text-sm font-black text-white bg-[#C1372C] rounded-full shadow-lg shadow-[#C1372C]/20 hover:bg-[#a82e25] transition-all active:scale-95 focus-visible:outline-none border border-white/10">Sign Up</Link>
                    </div>
                  )}
                  
                  <button 
                    className="lg:hidden p-2.5 text-white/80 hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                  >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay - Portalled to body to escape Header stacking context */}
      {createPortal(
        <div 
          className={`md:hidden fixed inset-0 z-[100] bg-[#20151A] transition-transform duration-300 ease-in-out ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ top: '64px' }}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
        >
          <nav className="flex flex-col p-6 space-y-4 h-full overflow-y-auto">
            <Link to="/" className="text-lg font-semibold text-white py-4 border-b border-[#C0927C]/10 flex items-center justify-between focus-visible:outline-none focus-visible:text-[#C1372C]" onClick={() => setIsMenuOpen(false)}>
              Home
              <ChevronDown size={18} className="-rotate-90 text-[#C0927C]/30" />
            </Link>
            <Link to="/browse" className="text-lg font-semibold text-white py-4 border-b border-[#C0927C]/10 flex items-center justify-between focus-visible:outline-none focus-visible:text-[#C1372C]" onClick={() => setIsMenuOpen(false)}>
              Browse Movies
              <ChevronDown size={18} className="-rotate-90 text-gray-500" />
            </Link>
            <Link to="/watchlist" className="text-lg font-semibold text-white py-4 border-b border-[#C0927C]/10 flex items-center justify-between focus-visible:outline-none focus-visible:text-[#C1372C]" onClick={() => setIsMenuOpen(false)}>
              <div className="flex items-center gap-3">
                Watchlist
                {count > 0 && <span className="bg-[#C1372C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{count}</span>}
              </div>
              <ChevronDown size={18} className="-rotate-90 text-[#C0927C]/30" />
            </Link>
            
            <div className="flex-1" />
            
            {user ? (
              <div className="mt-auto space-y-4 pb-8">
                <div className="flex items-center gap-4 p-4 bg-[#5E4A65]/30 rounded-2xl border border-white/5">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#5E4A65] to-[#C1372C] rounded-full flex items-center justify-center font-bold text-white text-xl shadow-lg ring-2 ring-white/10">
                    {user.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-white font-bold text-base truncate">{user.name}</p>
                    <p className="text-[#C0927C]/60 text-sm truncate">{user.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Link to="/profile" className="w-full py-4 text-center text-white bg-white/5 hover:bg-white/10 rounded-xl font-semibold border border-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C1372C]" onClick={() => setIsMenuOpen(false)}>Profile Settings</Link>
                  <button onClick={() => { setIsMenuOpen(false); handleLogout(); }} className="w-full py-4 text-center text-[#C1372C] bg-[#C1372C]/5 hover:bg-[#C1372C]/10 rounded-xl font-semibold border border-[#C1372C]/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C1372C]">Sign Out</button>
                </div>
              </div>
            ) : (
              <div className="mt-auto grid grid-cols-1 gap-3 pb-8">
                <Link to="/login" className="py-4 text-center text-white bg-white/5 rounded-xl font-bold border border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C1372C]" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                <Link to="/signup" className="py-4 text-center text-white bg-[#C1372C] rounded-xl font-bold shadow-lg shadow-black/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C1372C]" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
              </div>
            )}
          </nav>
        </div>,
        document.body
      )}
    </>
  );
}

const SearchResultsDropdown = React.memo(({ results, loading, error, onMovieClick, isInWatchlist }) => (
  <div className="search-results absolute top-full left-0 right-0 mt-1 md:mt-2 bg-[#20151A] border border-[#C0927C]/20 rounded-b-2xl md:rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden max-h-[75vh] md:max-h-[60vh] overflow-y-auto z-50 scrollbar-thin scrollbar-thumb-[#7B3A3C]">
    {loading && (
      <div className="p-4 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="w-10 h-14 skeleton-loader rounded-md shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 w-3/4 skeleton-loader rounded" />
              <div className="h-3 w-1/4 skeleton-loader rounded" />
            </div>
          </div>
        ))}
      </div>
    )}
    {error && <div className="p-4 text-center text-[#C1372C] text-sm bg-[#C1372C]/5 rounded-xl border border-[#C1372C]/10 mx-2 mb-2">{error}</div>}
    {!loading && !error && results.length === 0 && <div className="p-6 text-center text-[#C0927C] text-sm font-medium">No movies found.</div>}
    
    <div className="divide-y divide-[#C0927C]/10">
      {results.map((movie) => {
        const inList = isInWatchlist ? isInWatchlist(movie.id) : false;
        return (
          <button 
            key={movie.id} 
            onClick={() => onMovieClick(movie)} 
            className="w-full p-3 flex items-start gap-4 hover:bg-[#5E4A65]/40 transition-colors text-left group focus:outline-none focus:bg-[#5E4A65]/60"
          >
            <div className="relative w-10 h-14 bg-[#2A1F25] rounded-md overflow-hidden shrink-0 shadow-sm border border-white/5">
               <img src={movie.poster} alt="" className="w-full h-full object-cover" width="40" height="56" loading="lazy" />
               {inList && (
                 <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[1px]">
                   <Check size={14} className="text-green-500 font-bold" />
                 </div>
               )}
            </div>
            <div className="flex-1 min-w-0 py-0.5">
              <p className={`text-sm font-semibold truncate group-hover:text-[#C1372C] transition-colors ${inList ? 'text-green-400' : 'text-white'}`}>
                {movie.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[#C0927C] text-xs font-medium">{movie.year || 'N/A'}</span>
                {inList && <span className="text-[10px] text-green-400 font-bold border border-green-500/20 px-1.5 py-0.5 rounded bg-green-500/5 uppercase tracking-wide">Added</span>}
                {movie.rating && <span className="text-[10px] text-yellow-500 flex items-center gap-0.5 font-medium"><Star size={10} fill="currentColor" /> {movie.rating}</span>}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  </div>
));

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
  
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setIsOpen(false);
  };
  
  return (
    <div className="relative hidden lg:block" ref={menuRef} onKeyDown={handleKeyDown}>
      <button 
        className="flex items-center gap-2 group p-0.5 rounded-full hover:scale-105 transition-transform focus-visible:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className="w-10 h-10 bg-[#C1372C] rounded-full flex items-center justify-center font-black text-white text-sm shadow-[0_5px_15px_rgba(193,55,44,0.4)] border-2 border-white/10 overflow-hidden ring-offset-2 ring-offset-[#20151A] group-hover:ring-2 ring-[#C1372C]/50 transition-all">
          {user.name.charAt(0)}
        </div>
      </button>
      
      {isOpen && (
        <div 
          className="absolute top-full right-0 mt-3 w-56 bg-[#20151A] border border-[#C0927C]/20 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden"
          role="menu"
        >
          <div className="p-3 border-b border-[#C0927C]/10 bg-[#5E4A65]/20">
            <p className="text-sm font-bold text-white truncate">{user.name}</p>
            <p className="text-xs text-[#C0927C]/70 truncate">{user.email}</p>
          </div>
          <div className="p-1">
            <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-[#C0927C] hover:bg-white/5 hover:text-white rounded-lg focus-visible:outline-none focus-visible:bg-white/5 focus-visible:text-white" role="menuitem">
              <User size={16} /> Profile
            </Link>
            <Link to="/watchlist" onClick={() => setIsOpen(false)} className="flex items-center justify-between px-3 py-2 text-sm text-[#C0927C] hover:bg-white/10 hover:text-white rounded-lg focus-visible:outline-none focus-visible:bg-white/10 focus-visible:text-white" role="menuitem">
              <div className="flex items-center gap-3"><Heart size={16} /> Watchlist</div>
              {count > 0 && <span className="bg-[#C1372C] text-white text-xs font-bold px-2 py-0.5 rounded-full border border-white/10">{count}</span>}
            </Link>
            <div className="h-px bg-[#C0927C]/10 my-1 mx-2" />
            <button onClick={onLogout} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-[#C1372C] hover:bg-[#C1372C]/5 hover:text-red-300 rounded-lg focus-visible:outline-none focus-visible:bg-red-500/10 focus-visible:text-red-300" role="menuitem">
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
