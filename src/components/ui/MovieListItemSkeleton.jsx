import React from 'react';

const MovieListItemSkeleton = () => {
  return (
    <div className="flex bg-[#2A1F25]/40 border border-muted/10 rounded-xl overflow-hidden shadow-lg">
      <div className="w-24 sm:w-28 flex-shrink-0 skeleton-loader"></div>
      <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-5 skeleton-loader rounded w-3/4"></div>
          <div className="flex items-center space-x-3">
            <div className="h-4 skeleton-loader rounded w-12"></div>
            <div className="h-4 skeleton-loader rounded w-16"></div>
          </div>
          <div className="space-y-1 pt-2">
            <div className="h-3 skeleton-loader rounded w-full"></div>
            <div className="h-3 skeleton-loader rounded w-5/6"></div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 mt-4">
          <div className="h-7 skeleton-loader rounded-md w-24"></div>
          <div className="h-7 skeleton-loader rounded-md w-20"></div>
          <div className="h-7 skeleton-loader rounded-md w-20"></div>
        </div>
      </div>
    </div>
  );
};

export default MovieListItemSkeleton;
