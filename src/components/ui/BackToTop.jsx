import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

/**
 * BackToTop button that appears after scrolling down.
 * Provides a smooth scroll to the top of the page.
 */
const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  /** Toggle visibility based on scroll position */
  const toggleVisibility = () => {
    if (window.scrollY > 400) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  /** Scroll to top with ease-in-out effect */
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-[100] p-3 rounded-full bg-[#C1372C] text-white shadow-[0_10px_25px_rgba(193,55,44,0.4)] border border-white/20 transition-all duration-300 transform hover:scale-110 active:scale-95 group ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
      aria-label="Back to top"
    >
      <ChevronUp 
        size={24} 
        className="transition-transform duration-300 group-hover:-translate-y-1" 
      />
      
      {/* Subtle glow effect */}
       <div className="absolute inset-0 rounded-full bg-[#C1372C] blur-md -z-10 opacity-30 group-hover:opacity-60 transition-opacity" />
    </button>
  );
};

export default BackToTop;
