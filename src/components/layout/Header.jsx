import React, { useEffect, useState, useRef } from "react";
import { Search, User, X, Menu } from "lucide-react";

function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [isScrolled, setIsScrolled] = useState(false);
    const searchInputRef = useRef(null);
    const menuButtonRef = useRef(null);
    const menuPanelRef = useRef(null);
    const overlayRef = useRef(null);

    function handleSearch(e) {
        e?.preventDefault();
        if (!query.trim()) return;
        // TODO: Implement actual search functionality
        setQuery("");
        setMobileSearchOpen(false);
    }

    const handleUserMenu = () => {
        // TODO: Implement user menu functionality
        console.log('User menu clicked');
    };

    useEffect(() => {
        if (mobileSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [mobileSearchOpen]);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 0);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Escape key to close menus
    useEffect(() => {
        function onKey(e) {
            if (e.key !== "Escape") return;
            if (menuOpen) setMenuOpen(false);
            if (mobileSearchOpen) setMobileSearchOpen(false);
        }
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [menuOpen, mobileSearchOpen]);

    // iOS-safe body scroll lock
    useEffect(() => {
        const handleBodyLock = () => {
            if (menuOpen) {
                document.body.style.position = "fixed";
                document.body.style.width = "100%";
                document.body.style.overflow = "hidden";
            } else {
                document.body.style.position = "";
                document.body.style.width = "";
                document.body.style.overflow = "";
            }
        };
        handleBodyLock();
        return () => {
            document.body.style.position = "";
            document.body.style.width = "";
            document.body.style.overflow = "";
        };
    }, [menuOpen]);

    // Focus management with cleanup
    useEffect(() => {
        let timeoutId;
        if (menuOpen) {
            timeoutId = setTimeout(() => menuPanelRef.current?.focus(), 50);
        } else {
            menuButtonRef.current?.focus();
        }
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [menuOpen]);

    return (
        <nav
            aria-label="Primary navigation"
            className={`fixed top-0 w-full z-50 transition-all duration-300 ease-in-out ${
                isScrolled 
                    ? "bg-[#1f0942]/95 backdrop-blur-md shadow-lg py-2" 
                    : "bg-transparent py-3"
            }`}
        >
            <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 flex justify-between items-center h-12 sm:h-16">
                <div className={`flex gap-2 items-center ${mobileSearchOpen ? "hidden sm:flex" : "flex"}`}>
                    <button
                        ref={menuButtonRef}
                        className="md:hidden p-2 rounded-md text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#ff6f61] transition touch-manipulation"
                        onClick={() => setMenuOpen((s) => !s)}
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={menuOpen}
                        type="button"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <a href="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[#ff6f61] rounded-md">
                        <span className="text-xl font-bold text-white group-hover:text-rose-200 sm:text-2xl tracking-wide drop-shadow-md transition-colors">
                            myFlix
                        </span>
                    </a>
                </div>

                <div className="hidden md:flex gap-6 md:gap-8 items-center" role="navigation" aria-label="Main navigation">
                    <NavLink href="/">Home</NavLink>
                    <NavLink href="/movies">Movies</NavLink>
                    <NavLink href="/series">Series</NavLink>
                </div>

                <div className="flex gap-2 items-center justify-end flex-1 md:flex-none">
                    {/* Mobile Icons - Always visible on mobile */}
                    <div className="flex md:hidden items-center gap-3">
                        {mobileSearchOpen ? (
                            <form
                                onSubmit={handleSearch}
                                className="flex items-center w-full max-w-xs bg-white/10 rounded-full px-3 py-1.5 border border-white/20"
                            >
                                <Search className="w-4 h-4 text-white/60 mr-2" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search movies..."
                                    aria-label="Search movies and shows"
                                    className="bg-transparent border-none focus:outline-none text-white text-sm w-full placeholder:text-white/50"
                                />
                                <button
                                    type="button"
                                    onClick={() => setMobileSearchOpen(false)}
                                    className="ml-2 p-1 text-white/80 hover:text-white touch-manipulation"
                                    aria-label="Close search"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </form>
                        ) : (
                            <>
                                <button
                                    onClick={() => setMobileSearchOpen(true)}
                                    className="p-2 text-white hover:text-[#ff6f61] transition bg-white/10 rounded-full touch-manipulation focus:outline-none focus:ring-2 focus:ring-[#ff6f61]"
                                    aria-label="Open search"
                                    type="button"
                                >
                                    <Search className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={handleUserMenu}
                                    className="p-2 text-white hover:text-[#ff6f61] transition bg-white/10 rounded-full touch-manipulation focus:outline-none focus:ring-2 focus:ring-[#ff6f61]" 
                                    aria-label="Open user menu"
                                    type="button"
                                >
                                    <User className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>

                    <div className="hidden md:flex gap-3 items-center">
                        <form onSubmit={handleSearch} className="group relative" role="search">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 group-focus-within:text-[#ff6f61] transition-colors" />
                            <input
                                type="text"
                                value={query}
                                placeholder="Search..."
                                aria-label="Search movies and shows"
                                className={`
                                    w-32 sm:w-40 md:w-48 pl-9 pr-3 py-1.5 rounded-full 
                                    bg-white/10 text-sm text-white placeholder:text-white/70 
                                    border border-transparent focus:border-white/30 focus:bg-black/50 
                                    focus:w-56 focus:outline-none transition-all duration-300
                                `}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </form>
                        <button
                            className="px-4 py-1.5 rounded-full bg-[#ff6f61] text-white font-semibold text-sm hover:bg-[#ff523d] hover:scale-105 transition-all shadow-lg shadow-red-500/30 focus:outline-none focus:ring-2 focus:ring-[#ff6f61] touch-manipulation"
                            aria-label="Login to account"
                            type="button"
                        >
                            Login
                        </button>
                    </div>
                </div>
            </div>

            {/* Overlay */}
            <div
                ref={overlayRef}
                aria-hidden={!menuOpen}
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300 ${
                    menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setMenuOpen(false)}
                onBlur={() => {
                    const timeoutId = setTimeout(() => menuButtonRef.current?.focus(), 50);
                    return () => clearTimeout(timeoutId);
                }}
                tabIndex={-1}
            />

            {/* Mobile panel */}
            <aside
                ref={menuPanelRef}
                tabIndex={-1}
                aria-label="Mobile menu"
                className={`fixed top-0 left-0 h-full w-72 bg-[#15062d] z-50 transform transition-transform duration-300 ease-out md:hidden shadow-2xl border-r border-white/10 ${
                    menuOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex flex-col h-full pt-6 px-6 gap-6 relative">
                    <div className="flex items-center justify-between mb-4">
                        <a href="/" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#ff6f61] rounded-md">
                            <span className="text-xl font-bold text-white tracking-wide">myFlix</span>
                        </a>
                        <button 
                            onClick={() => setMenuOpen(false)} 
                            className="text-white/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#ff6f61] rounded-md p-1 touch-manipulation"
                            aria-label="Close menu"
                            type="button"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <nav className="flex flex-col gap-4" aria-label="Mobile primary navigation">
                        <MobileLink href="/" onClick={() => setMenuOpen(false)}>
                            Home
                        </MobileLink>
                        <MobileLink href="/movies" onClick={() => setMenuOpen(false)}>
                            Movies
                        </MobileLink>
                        <MobileLink href="/series" onClick={() => setMenuOpen(false)}>
                            Series
                        </MobileLink>
                        <MobileLink href="/new-popular" onClick={() => setMenuOpen(false)}>
                            New & Popular
                        </MobileLink>
                        <MobileLink href="/my-list" onClick={() => setMenuOpen(false)}>
                            My List
                        </MobileLink>
                    </nav>

                    <div className="mt-auto mb-8 border-t border-white/10 pt-6 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                className="w-full py-2.5 rounded-lg bg-[#ff6f61] text-white font-semibold hover:bg-[#ff523d] transition shadow-md focus:outline-none focus:ring-2 focus:ring-[#ff6f61] touch-manipulation"
                                aria-label="Login to account"
                            >
                                Login
                            </button>
                            <button
                                type="button"
                                className="w-full py-2.5 rounded-lg bg-white/10 border border-white/10 text-white font-semibold hover:bg-white/20 transition focus:outline-none focus:ring-2 focus:ring-white/50 touch-manipulation"
                                aria-label="Sign up for account"
                            >
                                Sign Up
                            </button>
                        </div>

                        <div className="space-y-1">
                            <button 
                                type="button"
                                className="w-full py-2 rounded text-white/70 hover:text-white hover:bg-white/5 text-left px-2 transition-colors focus:outline-none focus:ring-1 focus:ring-white/30 touch-manipulation"
                            >
                                Settings
                            </button>
                            <button 
                                type="button"
                                className="w-full py-2 rounded text-white/70 hover:text-white hover:bg-white/5 text-left px-2 transition-colors focus:outline-none focus:ring-1 focus:ring-white/30 touch-manipulation"
                            >
                                Help Center
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </nav>
    );
}

function NavLink({ href, children }) {
    return (
        <a
            href={href}
            className="text-white/90 text-lg font-medium hover:text-[#ff6f61] hover:scale-105 transition-all duration-200 px-2 drop-shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ff6f61] rounded-md"
        >
            {children}
        </a>
    );
}

function MobileLink({ href, children, onClick }) {
    const handleClick = (e) => {
        if (onClick) {
            onClick(e);
        }
        // Allow normal navigation to proceed
    };
    
    return (
        <a
            href={href}
            onClick={handleClick}
            className="block text-lg font-medium text-white/80 hover:text-[#ff6f61] hover:bg-white/5 p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#ff6f61] touch-manipulation"
        >
            {children}
        </a>
    );
}

export default Header;