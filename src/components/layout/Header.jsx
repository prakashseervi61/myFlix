import React, { useEffect, useState, useRef } from 'react'
import { Search, User, X, Menu } from 'lucide-react' 
import logo from '../../assets/logo.ico' 

function Header() {

    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [isScrolled, setIsScrolled] = useState(false);
    const searchInputRef = useRef(null);

    function handleSearch(e){
        e.preventDefault();
        console.log("Searching for:", query);
        setMobileSearchOpen(false); 
    }

    useEffect(() => {
        if (mobileSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [mobileSearchOpen]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() =>{
        function onKey(e) {
            if (e.key !== 'Escape') return
            if (menuOpen) setMenuOpen(false)
            if (mobileSearchOpen) setMobileSearchOpen(false)
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    },[menuOpen, mobileSearchOpen])

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : 'unset';
    }, [menuOpen]);

    return (
        <nav 
            className={`fixed top-0 w-full z-40 transition-all duration-300 ease-in-out bg-[#1f0942] text-white ${
                isScrolled 
                ? 'shadow-lg py-2' 
                : 'py-3'
            }`}
        >
            <div className='max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-10 sm:h-16'>

                <div className={`flex gap-2 items-center ${mobileSearchOpen ? 'hidden sm:flex' : 'flex'}`}>
                    <button
                        className="md:hidden p-2 rounded-md text-white hover:bg-white/10 focus:outline-none transition"
                        onClick={() => setMenuOpen((s) => !s)}
                        type='button'
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    
                    <a href="/" className="flex items-center gap-3">
                        <img src={logo} alt="logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-md" />
                        <span className="text-xl font-bold text-white hover:text-rose-200 sm:text-2xl tracking-wide drop-shadow-md transition-colors">
                            myFlix
                        </span>
                    </a>
                </div>

                <div className='hidden md:flex gap-6 md:gap-8 items-center'>
                    <NavLink href="#">Home</NavLink>
                    <NavLink href="#">Movies</NavLink>
                    <NavLink href="#">Series</NavLink>
                </div>

                <div className='flex gap-2 items-center justify-end flex-1 md:flex-none'>

                    <div className="md:hidden flex items-center justify-end w-full">
                        {mobileSearchOpen ? (
                            <form 
                                onSubmit={handleSearch} 
                                className="flex items-center w-full max-w-xs bg-white/10 rounded-full px-3 py-1.5 border border-white/20 animate-in fade-in slide-in-from-right-5"
                            >
                                <Search className="w-4 h-4 text-white/60 mr-2" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search..."
                                    className="bg-transparent border-none focus:outline-none text-white text-sm w-full placeholder:text-white/50"
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setMobileSearchOpen(false)}
                                    className="ml-2 p-1 text-white/80 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </form>
                        ) : (
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => setMobileSearchOpen(true)}
                                    className="text-white hover:text-[#ff6f61] transition"
                                >
                                    <Search className="w-6 h-6" />
                                </button>
                                <button 
                                    className="text-white hover:text-[#ff6f61] transition"
                                    aria-label="Login"
                                >
                                    <User className="w-6 h-6" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="hidden md:flex gap-3 items-center">
                        <form onSubmit={handleSearch} className="group relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 group-focus-within:text-[#ff6f61] transition-colors" />
                            <input
                                type='text'
                                name='q'
                                value={query}
                                placeholder='Search...'
                                className={`
                                    w-32 sm:w-40 md:w-48 pl-9 pr-3 py-1.5 rounded-full 
                                    bg-white/10 text-sm text-white placeholder:text-white/70 
                                    border border-transparent focus:border-white/30 focus:bg-black/50 
                                    focus:w-56 focus:outline-none transition-all duration-300
                                `}
                                onChange={(e)=> setQuery(e.target.value)}
                            />
                        </form>
                        <button className='px-4 py-1.5 rounded-full bg-[#ff6f61] text-white font-semibold text-sm hover:bg-[#ff523d] hover:scale-105 transition-all shadow-lg shadow-red-500/30'>
                            Login
                        </button>
                    </div>

                </div>
            </div>

            
            <div 
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300 ${menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                onClick={() => setMenuOpen(false)}
            ></div>

            <div className={`fixed top-0 left-0 h-full w-72 bg-[#15062d] z-50 transform transition-transform duration-300 ease-out md:hidden shadow-2xl border-r border-white/10 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className='flex flex-col h-full pt-6 px-6 gap-6 relative'>

                    <div className="flex items-center justify-between mb-4">
                        <a href="/" className="flex items-center gap-2">
                            <img src={logo} alt="logo" className="w-8 h-8 object-contain" />
                            <span className="text-xl font-bold text-white tracking-wide">myFlix</span>
                        </a>
                        <button onClick={() => setMenuOpen(false)} className="text-white/50 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <nav className="flex flex-col gap-4">
                        <MobileLink href="#" onClick={() => setMenuOpen(false)}>Home</MobileLink>
                        <MobileLink href="#" onClick={() => setMenuOpen(false)}>Movies</MobileLink>
                        <MobileLink href="#" onClick={() => setMenuOpen(false)}>Series</MobileLink>
                        <MobileLink href="#" onClick={() => setMenuOpen(false)}>New & Popular</MobileLink>
                        <MobileLink href="#" onClick={() => setMenuOpen(false)}>My List</MobileLink>
                    </nav>

                    <div className="mt-auto mb-8 border-t border-white/10 pt-6 space-y-4">
                        
                        <div className="grid grid-cols-2 gap-3">
                            <button className="w-full py-2.5 rounded-lg bg-[#ff6f61] text-white font-semibold hover:bg-[#ff523d] transition shadow-md">
                                Login
                            </button>
                            <button className="w-full py-2.5 rounded-lg bg-white/10 border border-white/10 text-white font-semibold hover:bg-white/20 transition">
                                Sign Up
                            </button>
                        </div>

                        <div className="space-y-1">
                            <button className="w-full py-2 rounded text-white/70 hover:text-white hover:bg-white/5 text-left px-2 transition-colors flex items-center justify-between">
                                Settings
                            </button>
                            <button className="w-full py-2 rounded text-white/70 hover:text-white hover:bg-white/5 text-left px-2 transition-colors">
                                Help Center
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}

function NavLink({ href, children }) {
    return (
        <a 
            href={href} 
            className="text-white/90 text-lg font-medium hover:text-[#ff6f61] hover:scale-105 transition-all duration-200 px-2 drop-shadow-sm"
        >
            {children}
        </a>
    )
}

function MobileLink({ href, children, onClick }) {
    return (
        <a 
            href={href} 
            onClick={onClick}
            className="block text-lg font-medium text-white/80 hover:text-[#ff6f61] hover:bg-white/5 p-2 rounded-lg transition-all duration-200"
        >
            {children}
        </a>
    )
}

export default Header