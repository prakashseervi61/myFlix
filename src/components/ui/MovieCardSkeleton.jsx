import React from 'react';

function MovieCardSkeleton() {
  return (
    <div className="min-w-[140px] sm:min-w-[200px] md:min-w-[280px] animate-pulse">
      <div className="aspect-[2/3] sm:aspect-[16/9] bg-gray-700 rounded-xl mb-2">
        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center">
          <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
        </div>
      </div>
      <div className="space-y-2 px-1">
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-800 rounded w-1/2"></div>
      </div>
    </div>
  );
}

export default MovieCardSkeleton;