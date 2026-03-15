import React, { useEffect, useState } from 'react';

export default function LandingSkeleton({ isLoading }) {
  const [show, setShow] = useState(isLoading);

  useEffect(() => {
    if (!isLoading) {
      // Small delay before unmounting to allow fade out transition to complete
      const timer = setTimeout(() => setShow(false), 500); 
      return () => clearTimeout(timer);
    } else {
      setShow(true);
    }
  }, [isLoading]);

  if (!show) return null;

  return (
    <div 
      className={`fixed inset-0 z-[2000] bg-background transition-opacity duration-500 ease-in-out ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      aria-hidden="true"
    >
      <style>{`
        @keyframes shimmer-move {
          0% { background-position: 200vw 0; }
          100% { background-position: -200vw 0; }
        }
        .netflix-skeleton {
          background: linear-gradient(90deg, #1a1a1a 0%, #2a2a2a 30%, #3a3a3a 50%, #2a2a2a 70%, #1a1a1a 100%);
          background-size: 200vw 100%;
          animation: shimmer-move 1.5s infinite linear;
        }
      `}</style>
      
      {/* Navbar Skeleton */}
      <div className="absolute top-0 left-0 right-0 h-[70px] z-[2001] px-6 md:px-10 lg:px-12 flex items-center justify-between border-b border-white/5 bg-background">
        <div className="flex items-center h-full w-full max-w-[1920px] mx-auto">
          {/* Logo Placeholder */}
          <div className="flex items-center shrink-0 mr-12">
            <div className="netflix-skeleton h-8 w-28 rounded-md" />
          </div>
          
          {/* Menu Links Placeholder */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-8">
            <div className="netflix-skeleton h-5 w-14 rounded-md" />
            <div className="netflix-skeleton h-5 w-20 rounded-md" />
            <div className="netflix-skeleton h-5 w-24 rounded-md" />
          </div>
          
          <div className="flex-1" />
          
          {/* Search Bar + Profile Placeholder */}
          <div className="flex items-center gap-6 justify-end">
            <div className="hidden md:block netflix-skeleton h-11 w-48 lg:w-64 rounded-[20px]" />
            <div className="netflix-skeleton h-10 w-10 rounded-full hidden lg:block" />
            
            {/* Mobile Hamburger Placeholder */}
            <div className="lg:hidden netflix-skeleton h-8 w-8 rounded-md mr-2" />
          </div>
        </div>
      </div>

      {/* Hero Section Skeleton */}
      <div className="relative w-full h-[100vh] min-h-[100svh] overflow-hidden bg-background">
        {/* Large background skeleton */}
        <div className="absolute inset-0 netflix-skeleton opacity-40" />
        
        {/* Gradient overlays matching real hero */}
        <div 
          className="absolute inset-0 opacity-100"
          style={{
            background: 'radial-gradient(circle at center, transparent 0%, rgba(32, 21, 26, 0.4) 50%, rgba(32, 21, 26, 0.9) 100%), linear-gradient(to top, rgba(32, 21, 26, 1) 0%, rgba(32, 21, 26, 0.7) 40%, transparent 80%)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/20 to-transparent opacity-90" />
        
        {/* Content Positioned identically to real hero */}
        <div className="absolute inset-0 z-20 flex flex-col justify-end pb-16 sm:pb-20 md:pb-24 lg:pb-32 px-4 sm:px-8 md:px-12 lg:px-16 pointer-events-none">
          <div className="max-w-4xl w-full mx-auto md:mx-0">
            
            {/* Trending badge placeholder */}
            <div className="netflix-skeleton h-5 sm:h-6 w-28 sm:w-32 rounded mb-3 sm:mb-5" />
            
            {/* Big title placeholder */}
            <div className="netflix-skeleton h-16 sm:h-20 md:h-24 lg:h-28 w-3/4 max-w-2xl rounded-lg mb-3 sm:mb-6" />
            
            {/* Metadata row */}
            <div className="flex items-center gap-3 mb-4">
               <div className="netflix-skeleton h-5 w-20 rounded" />
               <div className="netflix-skeleton h-5 w-12 rounded" />
               <div className="netflix-skeleton h-5 w-8 rounded" />
            </div>
            
            {/* Two description text lines */}
            <div className="hidden xs:block space-y-3 mb-6 sm:mb-8">
              <div className="netflix-skeleton h-4 sm:h-5 w-full max-w-2xl rounded" />
              <div className="netflix-skeleton h-4 sm:h-5 w-5/6 max-w-xl rounded" />
            </div>
            
            {/* Button placeholders (rounded rectangle shapes) */}
            <div className="flex items-center gap-3 sm:gap-4 mt-2">
              <div className="netflix-skeleton h-12 sm:h-14 w-32 sm:w-40 rounded-lg" />
              <div className="netflix-skeleton h-12 sm:h-14 w-32 sm:w-40 rounded-lg" />
              <div className="hidden md:block netflix-skeleton h-14 w-14 rounded-full" />
            </div>
            
          </div>
        </div>
        
        {/* Pagination Skeleton */}
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-12 md:translate-x-0 md:bottom-12 z-30 flex gap-2">
           {Array.from({ length: 6 }).map((_, i) => (
             <div key={i} className="netflix-skeleton h-2 w-8 rounded-full opacity-60" />
           ))}
         </div>
      </div>
    </div>
  );
}
