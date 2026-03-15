import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Star, Search, User, LogOut, Film, Menu, X, Heart, Check } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import * as Dialog from '@radix-ui/react-dialog';
import { useAuth } from "../../hooks/useAuth.jsx";
import { useWatchlist } from "../../contexts/WatchlistContext.jsx";
import { apiService } from "../../services/apiService.js";
import { useDebounce } from 'use-debounce';
import { useGlobalScrollLock } from "../../hooks/useGlobalScrollLock.js";
import SearchResultsDropdown from "./SearchResultsDropdown.jsx";
import UserMenu from "./UserMenu.jsx";
import "./Sidebar.css";

const NavItem = React.memo(({ to, state, children }) => (
  <Link 
    to={to} 
    state={state}
    className="relative px-3 py-2 text-sm font-semibold text-white/90 hover:text-primary transition-all duration-300 group focus-visible:outline-none focus-visible:text-primary hover:-translate-y-[1px]"
  >
    {children}
    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full rounded-full" />
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
  
  const {
    data: searchResults = [],
    isLoading: loading,
    error: queryError
  } = useQuery({
    queryKey: ['quickSearch', debouncedQuery],
    queryFn: ({ signal }) => apiService.searchMovies(debouncedQuery, 1, signal),
    enabled: debouncedQuery.trim().length > 0 && searchExpanded,
    staleTime: 1000 * 60 * 5,
  });

  const error = queryError?.message || null;

  const sentinelRef = useRef(null);

  useGlobalScrollLock(searchExpanded);

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
    setIsMenuOpen(false);
    setSearchExpanded(false);
  }, [location.pathname]);

  const handleMovieClick = (movie) => {
    if (movie.media_type === 'tv' || movie.number_of_seasons !== undefined || (!movie.release_date && movie.first_air_date)) {
       navigate(`/tv/${movie.id}`);
    } else {
       navigate(`/movie/${movie.id}`);
    }
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
          isScrolled || isMenuOpen ? 'bg-background md:bg-background/95 md:backdrop-blur-[10px] shadow-2xl' : 'bg-transparent'
        }`}
      >
        <div className="h-full px-6 md:px-10 lg:px-12">
          <div className="flex items-center h-full max-w-[1920px] mx-auto">
            
            {/* 1. Logo */}
            <Link to="/" state={{ reset: true }} className="flex items-center gap-2 shrink-0 mr-12 focus-visible:outline-none group active:scale-95 transition-transform" aria-label="MYFLIX Home">
              <span className="text-2xl font-black text-white px-2 py-1 tracking-[0.1em] uppercase">
                MY<span className="text-primary transition-colors group-hover:text-white">FLIX</span>
              </span>
            </Link>

            {/* 2. Navigation Links */}
            <nav className="hidden lg:flex items-center gap-4 xl:gap-8" aria-label="Main Navigation">
              <NavItem to="/" state={{ reset: true }}>Home</NavItem>
              <NavItem to="/movies" state={{ reset: true }}>Movies</NavItem>
              <NavItem to="/tv" state={{ reset: true }}>TV Shows</NavItem>
              <NavItem to="/browse" state={{ reset: true }}>Browse</NavItem>
              <NavItem to="/watchlist">Watchlist</NavItem>
            </nav>

            {/* 3. Right Section: Search + Profile */}
            <div className="flex items-center gap-2 md:gap-6 flex-1 justify-end">
              
              {/* Search Bar Container */}
              <div 
                className={`relative transition-all duration-500 ease-out flex justify-end ${
                  searchExpanded 
                    ? 'w-full max-w-md' 
                    : 'w-auto md:w-48 lg:w-64'
                }`}
                role="search"
              >
                
                {/* Expanded Search View (Mobile Overlay) */}
                {searchExpanded && (
                  <div className="fixed inset-x-0 top-0 h-[70px] z-[110] bg-background border-b border-white/5 flex items-center px-4 md:hidden animate-[fade-in_0.2s_ease-out_forwards]">
                    <div className="flex-1 flex items-center h-11 w-full bg-surface rounded-full border border-white/10 focus-within:border-primary transition-all px-4">
                      <Search className="w-5 h-5 text-white/40" />
                      <input
                        type="search"
                        placeholder="Title, genre, people..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                        className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none p-2"
                        onBlur={() => !searchQuery && setSearchExpanded(false)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && searchQuery.trim()) {
                            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                            setSearchExpanded(false);
                            setSearchQuery("");
                          }
                        }}
                      />
                    </div>
                    <button 
                      onClick={() => { setSearchExpanded(false); setSearchQuery(''); }}
                      className="ml-4 text-sm font-bold text-white hover:text-primary transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Desktop Search Bar */}
                <div className="hidden md:block group relative">
                  <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${searchExpanded ? 'text-primary' : 'text-white/40'}`} />
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchQuery.trim()) {
                        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                        setSearchExpanded(false);
                        setSearchQuery("");
                      }
                    }}
                    className={`w-full bg-surface border transition-all duration-300 rounded-[20px] pl-11 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none h-11 ${
                      searchExpanded ? 'border-primary shadow-[0_0_15px_rgba(193,55,44,0.3)] ring-1 ring-primary' : 'border-white/10 hover:border-white/20'
                    }`}
                  />
                </div>

                {!searchExpanded && !isMenuOpen && (
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

              <div className="flex items-center md:ml-2">
                <div className={`flex items-center gap-1 md:gap-4 transition-all duration-300 ${searchExpanded ? 'opacity-0 md:opacity-100 scale-95 md:scale-100 pointer-events-none md:pointer-events-auto' : 'opacity-100 scale-100'}`}>
                  {user ? (
                    <UserMenu user={user} count={count} onLogout={handleLogout} />
                  ) : (
                    <div className="hidden lg:flex items-center gap-4">
                       <Link to="/login" className="px-4 py-2 text-sm font-bold text-white hover:text-primary transition-colors focus-visible:outline-none">Sign In</Link>
                       <Link to="/signup" className="px-6 py-2.5 text-sm font-black text-white bg-primary rounded-full shadow-lg shadow-primary/20 hover:bg-[#a82e25] transition-all active:scale-95 focus-visible:outline-none border border-white/10">Sign Up</Link>
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

      {/* Mobile Menu Overlay - Radix UI Dialog */}
      <Dialog.Root open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="sidebar-overlay data-[state=open]:animate-[dialog-fade-in_0.3s_ease-out_forwards] data-[state=closed]:animate-[dialog-fade-out_0.3s_ease-out_forwards]" />
          <Dialog.Content 
            className="lg:hidden sidebar"
            aria-describedby={undefined}
          >
            <Dialog.Title className="sr-only">Mobile Navigation</Dialog.Title>
            
            <nav className="flex flex-col flex-1 min-h-[min-content] scrollbar-hide">
              <Link to="/" state={{ reset: true }} className="sidebar-menu-item" onClick={() => setIsMenuOpen(false)}>
                <span>Home</span>
                <ChevronDown size={18} className="-rotate-90 text-white/30" />
              </Link>
              <Link to="/movies" state={{ reset: true }} className="sidebar-menu-item" onClick={() => setIsMenuOpen(false)}>
                <span>Movies</span>
                <ChevronDown size={18} className="-rotate-90 text-white/30" />
              </Link>
              <Link to="/tv" state={{ reset: true }} className="sidebar-menu-item" onClick={() => setIsMenuOpen(false)}>
                <span>TV Shows</span>
                <ChevronDown size={18} className="-rotate-90 text-white/30" />
              </Link>
              <Link to="/browse" state={{ reset: true }} className="sidebar-menu-item" onClick={() => setIsMenuOpen(false)}>
                <span>Browse</span>
                <ChevronDown size={18} className="-rotate-90 text-white/30" />
              </Link>
              <Link to="/watchlist" className="sidebar-menu-item" onClick={() => setIsMenuOpen(false)}>
                <div className="flex items-center">
                  <span>Watchlist</span>
                  {count > 0 && <span className="watchlist-badge">{count}</span>}
                </div>
                <ChevronDown size={18} className="-rotate-90 text-white/30" />
              </Link>
              
              <div className="flex-1" />
              
              {user ? (
                <div className="sidebar-profile">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-surface to-primary rounded-full flex items-center justify-center font-bold text-white text-xl shadow-lg ring-2 ring-white/10">
                      {user.name.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-white font-bold text-base truncate">{user.name}</p>
                      <p className="text-muted/60 text-sm truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Link to="/profile" className="sidebar-button text-white bg-white/5 hover:bg-white/10 transition-colors" onClick={() => setIsMenuOpen(false)}>Profile Settings</Link>
                    <button onClick={() => { setIsMenuOpen(false); handleLogout(); }} className="sidebar-button text-[#ff3b3b] bg-[#ff3b3b]/10 hover:bg-[#ff3b3b]/20 transition-colors outline-none border-none">Sign Out</button>
                  </div>
                </div>
              ) : (
                <div className="sidebar-profile">
                  <div className="mt-2">
                    <Link to="/login" className="sidebar-button text-white bg-white/5 border border-white/10" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                    <Link to="/signup" className="sidebar-button text-white bg-primary shadow-lg shadow-black/30" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                  </div>
                </div>
              )}
            </nav>
            
            <Dialog.Close asChild>
              <button className="sr-only">Close</button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
