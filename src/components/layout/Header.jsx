import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, User, X, Menu } from "lucide-react";
import { useSearch } from "../../hooks/useSearch";
import SearchDropdown from "../ui/SearchDropdown";

function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const { query, setQuery, results, loading, error, clearResults } = useSearch();
    const searchInputRef = useRef(null);
    const searchContainerRef = useRef(null);

    // Show/hide search results
    useEffect(() => {
        setShowSearchResults(query.length > 0 && (results.length > 0 || loading || error));
    }, [query, results, loading, error]);

    // Click outside to close search results
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setShowSearchResults(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle escape key to close mobile menu
    useEffect(() => {
        function handleEscapeKey(event) {
            if (event.key === 'Escape') {
                if (menuOpen) setMenuOpen(false);
                if (mobileSearchOpen) setMobileSearchOpen(false);
                if (showSearchResults) setShowSearchResults(false);
            }
        }
        document.addEventListener('keydown', handleEscapeKey);
        return () => document.removeEventListener('keydown', handleEscapeKey);
    }, [menuOpen, mobileSearchOpen, showSearchResults]);

    const handleSearch = (e) => {
        e?.preventDefault();
        if (!query.trim()) return;
        clearResults();
        setMobileSearchOpen(false);
        setShowSearchResults(false);
    };

    const handleUserMenu = () => {
        // TODO: Implement user menu functionality
    };

    // Prevent background scrolling when mobile menu is open
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [menuOpen]);

    useEffect(() => {
        if (mobileSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [mobileSearchOpen]);

    return (
        <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                {/* Logo */}
                <div className={`flex gap-2 items-center ${mobileSearchOpen ? "hidden sm:flex" : "flex"}`}>
                    <button
                        className="md:hidden p-2 rounded-md text-white hover:bg-white/10 transition touch-manipulation"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                        aria-expanded={menuOpen}
                    >
                        {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>

                    <Link to="/" className="flex items-center">
                        <span className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                            myFlix
                        </span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex gap-8 items-center">
                    <Link to="/" className="text-white/90 hover:text-white transition-colors">Home</Link>
                    <Link to="/movies" className="text-white/90 hover:text-white transition-colors">Movies</Link>
                    <Link to="/series" className="text-white/90 hover:text-white transition-colors">Series</Link>
                </div>

                {/* Search & User Actions */}
                <div className="flex gap-2 items-center justify-end flex-1 md:flex-none">
                    {/* Mobile Search */}
                    <div className="flex md:hidden items-center gap-3 relative">
                        {mobileSearchOpen ? (
                            <div className="relative w-full">
                                <form onSubmit={handleSearch} className="flex items-center w-full max-w-xs bg-white/10 rounded-full px-3 py-2 border border-white/20">
                                    <Search className="w-4 h-4 text-white/60 mr-2" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Search movies..."
                                        className="bg-transparent border-none focus:outline-none text-white text-sm w-full placeholder:text-white/50"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMobileSearchOpen(false);
                                            setShowSearchResults(false);
                                            clearResults();
                                        }}
                                        className="ml-2 p-1 text-white/80 hover:text-white"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </form>
                                {showSearchResults && (
                                    <div className="absolute top-full left-0 right-0 mt-2 z-50">
                                        <SearchDropdown 
                                            results={results} 
                                            loading={loading}
                                            error={error}
                                            onClose={() => {
                                                setShowSearchResults(false);
                                                setMobileSearchOpen(false);
                                                clearResults();
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => setMobileSearchOpen(true)}
                                    className="p-2 text-white hover:text-[#ff6f61] transition bg-white/10 rounded-full"
                                >
                                    <Search className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={handleUserMenu}
                                    className="p-2 text-white hover:text-[#ff6f61] transition bg-white/10 rounded-full"
                                >
                                    <User className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Desktop Search */}
                    <div className="hidden md:flex gap-3 items-center">
                        <div ref={searchContainerRef} className="relative">
                            <form onSubmit={handleSearch} className="group relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 group-focus-within:text-[#ff6f61] transition-colors" />
                                <input
                                    type="text"
                                    value={query}
                                    placeholder="Search movies..."
                                    className="w-48 pl-9 pr-3 py-2 rounded-full bg-white/10 text-sm text-white placeholder:text-white/70 border border-transparent focus:border-white/30 focus:bg-black/50 focus:w-64 focus:outline-none transition-all duration-300"
                                    onChange={(e) => setQuery(e.target.value)}
                                    onFocus={() => setShowSearchResults(query.length > 0)}
                                />
                            </form>
                            {showSearchResults && (
                                <SearchDropdown 
                                    results={results} 
                                    loading={loading}
                                    error={error}
                                    onClose={() => setShowSearchResults(false)}
                                />
                            )}
                        </div>
                        <button className="px-4 py-2 rounded-full bg-[#ff6f61] text-white font-semibold text-sm hover:bg-[#ff523d] transition-colors">
                            Login
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <>
                {/* Backdrop */}
                {menuOpen && (
                    <div 
                        className="fixed inset-0 bg-black/60 z-40 md:hidden"
                        onClick={() => setMenuOpen(false)}
                        aria-hidden="true"
                    />
                )}
                
                {/* Mobile Menu - Slide in from left */}
                <div className={`fixed top-0 left-0 h-screen w-80 max-w-[85vw] bg-gray-800 z-50 md:hidden transform transition-transform duration-300 ease-out ${
                    menuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                    {/* Menu Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                        <span className="text-xl font-bold text-white">myFlix</span>
                        <button
                            onClick={() => setMenuOpen(false)}
                            className="p-2 rounded-md text-white hover:bg-white/10 transition touch-manipulation"
                            aria-label="Close menu"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    
                    {/* Menu Content */}
                    <div className="px-4 py-6 space-y-2">
                        <Link 
                            to="/" 
                            className="flex items-center py-3 px-4 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all touch-manipulation"
                            onClick={() => setMenuOpen(false)}
                        >
                            <span>Home</span>
                        </Link>
                        <Link 
                            to="/movies" 
                            className="flex items-center py-3 px-4 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all touch-manipulation"
                            onClick={() => setMenuOpen(false)}
                        >
                            <span>Movies</span>
                        </Link>
                        <Link 
                            to="/series" 
                            className="flex items-center py-3 px-4 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all touch-manipulation"
                            onClick={() => setMenuOpen(false)}
                        >
                            <span>Series</span>
                        </Link>
                        
                        {/* Search in mobile menu */}
                        <button
                            onClick={() => {
                                setMobileSearchOpen(true);
                                setMenuOpen(false);
                            }}
                            className="flex items-center w-full py-3 px-4 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all touch-manipulation"
                        >
                            <Search className="w-5 h-5 mr-3" />
                            <span>Search</span>
                        </button>
                        
                        <div className="pt-4 border-t border-white/10">
                            <button 
                                onClick={() => {
                                    handleUserMenu();
                                    setMenuOpen(false);
                                }}
                                className="flex items-center w-full py-3 px-4 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all touch-manipulation"
                            >
                                <User className="w-5 h-5 mr-3" />
                                <span>Login</span>
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Clickable area outside sidebar */}
                {menuOpen && (
                    <div 
                        className="fixed top-0 right-0 h-screen bg-transparent z-40 md:hidden"
                        style={{ left: '320px', width: 'calc(100vw - 320px)' }}
                        onClick={() => setMenuOpen(false)}
                    />
                )}
            </>
        </nav>
    );
}

export default Header;