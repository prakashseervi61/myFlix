import React from 'react';

function MovieCardSkeleton() {
  return (
    <div className="w-full aspect-[2/3] rounded-lg bg-gray-800 animate-pulse"></div>
  );
}

export default React.memo(MovieCardSkeleton);
