import React from 'react';

const Pagination = React.memo(({ count, current, goToSlide, duration }) => (
  <div 
    className="absolute bottom-4 left-1/2 -translate-x-1/2 md:left-auto md:right-12 md:translate-x-0 md:bottom-12 z-30 flex items-center justify-center gap-2"
    role="tablist"
    aria-label="Slideshow controls"
  >
    {Array.from({ length: count }).map((_, index) => {
      const isActive = index === current;
      return (
        <button
          key={index}
          onClick={() => goToSlide(index)}
          className="group flex items-center justify-center p-1 outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full"
          role="tab"
          aria-selected={isActive}
          aria-label={`Go to slide ${index + 1}`}
          tabIndex={0}
        >
          <div
            className={`pagination-dot ${isActive ? 'active' : ''}`}
            style={{ '--duration': `${duration}ms` }}
          >
            {isActive && <div className="progress-fill" />}
          </div>
        </button>
      );
    })}
  </div>
));

export default Pagination;
